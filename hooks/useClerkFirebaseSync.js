import { useEffect, useCallback, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-expo';
import {
    doc, setDoc, updateDoc, serverTimestamp, getDoc,
    collection, query, where, getDocs
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { usePetData } from '../contexts/PetContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebaseConfig';
import { signInWithCustomToken } from 'firebase/auth';

export default function useClerkFirebaseSync() {
    const { user, isLoaded, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const petContext = usePetData();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [authAttempts, setAuthAttempts] = useState(0);

    // Only attempt authentication a limited number of times to prevent quota issues
    const MAX_AUTH_ATTEMPTS = 3;

    // Cache for study groups to reduce reads
    const [cachedStudyGroups, setCachedStudyGroups] = useState(null);
    const [lastGroupsFetch, setLastGroupsFetch] = useState(0);
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Authenticate with Firebase once when user signs in
    const authenticateWithFirebase = useCallback(async (force = false) => {
        // Skip if already authenticated or too many attempts
        if (isAuthenticated && !force) return true;
        if (authAttempts >= MAX_AUTH_ATTEMPTS && !force) {
            console.log('Max authentication attempts reached. Skipping.');
            return false;
        }

        if (isLoaded && isSignedIn && user) {
            try {
                setAuthAttempts(prev => prev + 1);
                const firebaseToken = await getToken({ template: 'integration_firebase' });

                if (firebaseToken) {
                    await signInWithCustomToken(auth, firebaseToken);
                    setIsAuthenticated(true);
                    setAuthError(null);
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Error authenticating with Firebase:', error);
                setAuthError(error);
                return false;
            }
        }
        return false;
    }, [isLoaded, isSignedIn, user, getToken, isAuthenticated, authAttempts]);

    // Initialize authentication when user signs in
    useEffect(() => {
        if (isLoaded && isSignedIn && user && !isAuthenticated && authAttempts < MAX_AUTH_ATTEMPTS) {
            authenticateWithFirebase();
        }
    }, [isLoaded, isSignedIn, user, isAuthenticated, authenticateWithFirebase, authAttempts]);

    // Function to update hasPet status in Firebase
    const updateHasPetStatus = useCallback(async (hasPetValue) => {
        if (!isLoaded || !isSignedIn || !user) return;
        if (!isAuthenticated) {
            const success = await authenticateWithFirebase();
            if (!success) return;
        }

        try {
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, {
                hasPet: hasPetValue,
                updatedAt: serverTimestamp()
            });

            if (petContext && petContext.setPetData) {
                petContext.setPetData({
                    ...petContext.petData,
                    hasPet: hasPetValue
                });
            }

            // Update local cache
            try {
                const storedPetData = await AsyncStorage.getItem('@pet_data');
                if (storedPetData) {
                    const parsedPetData = JSON.parse(storedPetData);
                    await AsyncStorage.setItem('@pet_data', JSON.stringify({
                        ...parsedPetData,
                        hasPet: hasPetValue
                    }));
                }
            } catch (error) {
                console.error('Error updating pet data in AsyncStorage:', error);
            }
        } catch (error) {
            console.error('Error updating hasPet status:', error);
        }
    }, [isLoaded, isSignedIn, user, petContext, authenticateWithFirebase, isAuthenticated]);

    // Function to create a study group
    const createStudyGroup = useCallback(async (groupName) => {
        if (!isLoaded || !isSignedIn || !user) return null;
        if (!isAuthenticated) {
            const success = await authenticateWithFirebase();
            if (!success) return null;
        }

        try {
            const groupsRef = collection(db, 'studyGroups');
            const newGroupRef = doc(groupsRef);
            const userData = {
                id: user.id,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Anonymous'
            };

            await setDoc(newGroupRef, {
                name: groupName,
                createdBy: user.id,
                creatorName: userData.name,
                members: [user.id],
                memberNames: [userData],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // Invalidate cache
            setCachedStudyGroups(null);

            return newGroupRef.id;
        } catch (error) {
            console.error('Error creating study group:', error);
            throw error;
        }
    }, [isLoaded, isSignedIn, user, authenticateWithFirebase, isAuthenticated]);

    // Function to invite a user to a study group
    const inviteToStudyGroup = useCallback(async (groupId, inviteeId) => {
        if (!isLoaded || !isSignedIn || !user) return null;
        if (!isAuthenticated) {
            const success = await authenticateWithFirebase();
            if (!success) return null;
        }

        try {
            // Get group info
            const groupRef = doc(db, 'studyGroups', groupId);
            const groupSnap = await getDoc(groupRef);

            if (!groupSnap.exists()) {
                throw new Error('Study group not found');
            }

            const groupData = groupSnap.data();

            // Check if user is already a member
            if (groupData.members.includes(inviteeId)) {
                throw new Error('User is already a member of this group');
            }

            // Get invitee info
            const inviteeRef = doc(db, 'users', inviteeId);
            const inviteeSnap = await getDoc(inviteeRef);

            if (!inviteeSnap.exists()) {
                throw new Error('Invitee not found');
            }

            // Create invitation
            const invitesRef = collection(db, 'groupInvites');
            const newInviteRef = doc(invitesRef);
            await setDoc(newInviteRef, {
                groupId,
                groupName: groupData.name,
                inviterId: user.id,
                inviterName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Anonymous',
                inviteeId,
                inviteeName: inviteeSnap.data().displayName || 'Unknown',
                status: 'pending',
                createdAt: serverTimestamp()
            });

            return newInviteRef.id;
        } catch (error) {
            console.error('Error inviting to study group:', error);
            throw error;
        }
    }, [isLoaded, isSignedIn, user, authenticateWithFirebase, isAuthenticated]);

    // Function to get user's study groups with caching
    const getUserStudyGroups = useCallback(async (forceRefresh = false) => {
        if (!isLoaded || !isSignedIn || !user) return [];

        // Return cached data if available and not expired
        const now = Date.now();
        if (
            !forceRefresh &&
            cachedStudyGroups &&
            now - lastGroupsFetch < CACHE_DURATION
        ) {
            return cachedStudyGroups;
        }

        if (!isAuthenticated) {
            const success = await authenticateWithFirebase();
            if (!success) return [];
        }

        try {
            const groupsRef = collection(db, 'studyGroups');
            const q = query(groupsRef, where('members', 'array-contains', user.id));
            const querySnapshot = await getDocs(q);

            const groups = [];
            querySnapshot.forEach((doc) => {
                groups.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Update cache
            setCachedStudyGroups(groups);
            setLastGroupsFetch(now);

            return groups;
        } catch (error) {
            console.error('Error getting user study groups:', error);
            // Return cached data if available, even if expired
            if (cachedStudyGroups) {
                return cachedStudyGroups;
            }
            throw error;
        }
    }, [
        isLoaded,
        isSignedIn,
        user,
        authenticateWithFirebase,
        isAuthenticated,
        cachedStudyGroups,
        lastGroupsFetch
    ]);

    // Sync user data to Firebase only once when signed in
    useEffect(() => {
        let isMounted = true;

        const syncUserToFirebase = async () => {
            if (!isLoaded || !isSignedIn || !user) return;
            if (!isAuthenticated) {
                const success = await authenticateWithFirebase();
                if (!success) return;
            }

            try {
                const userRef = doc(db, 'users', user.id);

                // Check if user doc exists first to avoid unnecessary writes
                const userSnap = await getDoc(userRef);
                const isNewUser = !userSnap.exists();

                // Get pet data from context or storage
                let petData = { selectedPet: 0, petName: 'Pet', hasPet: true };
                if (petContext && petContext.petData) {
                    petData = petContext.petData;
                } else {
                    try {
                        const storedPetData = await AsyncStorage.getItem('@pet_data');
                        if (storedPetData) {
                            petData = JSON.parse(storedPetData);
                        }
                    } catch (error) {
                        console.error('Error reading pet data from AsyncStorage:', error);
                    }
                }

                // Get background data from AsyncStorage
                let backgroundData = null;
                try {
                    const savedBackground = await AsyncStorage.getItem('selectedBackground');
                    if (savedBackground) {
                        backgroundData = JSON.parse(savedBackground);
                    } else if (!isNewUser && userSnap.data()?.backgroundData) {
                        // If user exists and has background data in Firebase but not in AsyncStorage,
                        // update AsyncStorage with Firebase data
                        backgroundData = userSnap.data().backgroundData;
                        await AsyncStorage.setItem(
                            'selectedBackground',
                            JSON.stringify(backgroundData)
                        );
                    }
                } catch (error) {
                    console.error('Error handling background data:', error);
                }

                // Prepare data to update
                const data = {
                    userId: user.id,
                    displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Anonymous',
                    email: user.primaryEmailAddress?.emailAddress,
                    photoUrl: user.imageUrl,
                    lastActive: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    petSelection: petData.selectedPet || 0,
                    petName: petData.petName || 'Pet',
                    hasPet: petData.hasPet !== undefined ? petData.hasPet : true,
                };

                // Include background data if available
                if (backgroundData) {
                    data.backgroundData = backgroundData;
                }

                // Only set createdAt and tokens if new user
                if (isNewUser) {
                    data.createdAt = serverTimestamp();
                    data.tokens = 0;
                    data.studyGroups = []; // Initialize empty array for study groups
                }

                if (isMounted) {
                    await setDoc(userRef, data, { merge: true });
                }
            } catch (error) {
                console.error('Error initializing user:', error);
            }
        };

        syncUserToFirebase();

        return () => {
            isMounted = false;
        };
    }, [isLoaded, isSignedIn, user, isAuthenticated]);

    // Return all the functions so they can be used by components
    return {
        updateHasPetStatus,
        createStudyGroup,
        inviteToStudyGroup,
        getUserStudyGroups,
        authenticateWithFirebase,
        isAuthenticated,
        authError,
        resetAuth: () => {
            setAuthAttempts(0);
            setIsAuthenticated(false);
            setAuthError(null);
        }
    };
}

