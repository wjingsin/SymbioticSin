// import { useEffect, useCallback } from 'react';
// import { useUser, useAuth } from '@clerk/clerk-expo';
// import { doc, setDoc, updateDoc, serverTimestamp, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
// import { db } from '../firebaseConfig';
// import { usePetData } from '../contexts/PetContext';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { auth } from '../firebaseConfig';
// import { signInWithCustomToken } from 'firebase/auth';
//
// export default function useClerkFirebaseSync() {
//     const { user, isLoaded, isSignedIn } = useUser();
//     const petContext = usePetData();
//     const { getToken } = useAuth(); // Add this line
//
//     const authenticateWithFirebase = useCallback(async () => {
//         if (isLoaded && isSignedIn && user) {
//             try {
//                 // Get Firebase token from Clerk with the correct method
//                 const firebaseToken = await getToken({ template: 'integration_firebase' });
//
//                 // Sign in to Firebase with the token
//                 if (firebaseToken) {
//                     await signInWithCustomToken(auth, firebaseToken);
//                     return true;
//                 }
//                 return false;
//             } catch (error) {
//                 console.error('Error authenticating with Firebase:', error);
//                 return false;
//             }
//         }
//         return false;
//     }, [isLoaded, isSignedIn, user, getToken]);
//
//     // Function to update hasPet status in Firebase
//     const updateHasPetStatus = useCallback(async (hasPetValue) => {
//         if (isLoaded && isSignedIn && user) {
//             try {
//                 // Authenticate with Firebase first
//                 await authenticateWithFirebase();
//
//                 const userRef = doc(db, 'users', user.id);
//                 await updateDoc(userRef, {
//                     hasPet: hasPetValue,
//                     updatedAt: serverTimestamp()
//                 });
//
//                 // Also update in context if available
//                 if (petContext && petContext.setPetData) {
//                     petContext.setPetData({
//                         ...petContext.petData,
//                         hasPet: hasPetValue
//                     });
//                 }
//             } catch (error) {
//                 console.error('Error updating hasPet status:', error);
//             }
//         }
//     }, [isLoaded, isSignedIn, user, petContext, authenticateWithFirebase]);
//
//     // Function to create a study group
//     const createStudyGroup = useCallback(async (groupName) => {
//         if (isLoaded && isSignedIn && user) {
//             try {
//                 // Authenticate with Firebase first
//                 await authenticateWithFirebase();
//
//                 // Create a new study group document
//                 const groupsRef = collection(db, 'studyGroups');
//                 const newGroupRef = doc(groupsRef);
//                 await setDoc(newGroupRef, {
//                     name: groupName,
//                     createdBy: user.id,
//                     creatorName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Anonymous',
//                     members: [user.id],
//                     memberNames: [{
//                         id: user.id,
//                         name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Anonymous'
//                     }],
//                     createdAt: serverTimestamp(),
//                     updatedAt: serverTimestamp()
//                 });
//
//                 return newGroupRef.id;
//             } catch (error) {
//                 console.error('Error creating study group:', error);
//                 throw error;
//             }
//         }
//     }, [isLoaded, isSignedIn, user, authenticateWithFirebase]);
//
//     // Function to invite a user to a study group
//     const inviteToStudyGroup = useCallback(async (groupId, inviteeId) => {
//         if (isLoaded && isSignedIn && user) {
//             try {
//                 // Authenticate with Firebase first
//                 await authenticateWithFirebase();
//
//                 // Get group info
//                 const groupRef = doc(db, 'studyGroups', groupId);
//                 const groupSnap = await getDoc(groupRef);
//
//                 if (!groupSnap.exists()) {
//                     throw new Error('Study group not found');
//                 }
//
//                 const groupData = groupSnap.data();
//
//                 // Check if user is already a member
//                 if (groupData.members.includes(inviteeId)) {
//                     throw new Error('User is already a member of this group');
//                 }
//
//                 // Get invitee info
//                 const inviteeRef = doc(db, 'users', inviteeId);
//                 const inviteeSnap = await getDoc(inviteeRef);
//
//                 if (!inviteeSnap.exists()) {
//                     throw new Error('Invitee not found');
//                 }
//
//                 // Create invitation
//                 const invitesRef = collection(db, 'groupInvites');
//                 const newInviteRef = doc(invitesRef);
//                 await setDoc(newInviteRef, {
//                     groupId,
//                     groupName: groupData.name,
//                     inviterId: user.id,
//                     inviterName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Anonymous',
//                     inviteeId,
//                     inviteeName: inviteeSnap.data().displayName || 'Unknown',
//                     status: 'pending',
//                     createdAt: serverTimestamp()
//                 });
//
//                 return newInviteRef.id;
//             } catch (error) {
//                 console.error('Error inviting to study group:', error);
//                 throw error;
//             }
//         }
//     }, [isLoaded, isSignedIn, user, authenticateWithFirebase]);
//
//     // Function to accept a study group invitation
//     const acceptStudyGroupInvite = useCallback(async (inviteId) => {
//         if (isLoaded && isSignedIn && user) {
//             try {
//                 // Authenticate with Firebase first
//                 await authenticateWithFirebase();
//
//                 // Get invitation
//                 const inviteRef = doc(db, 'groupInvites', inviteId);
//                 const inviteSnap = await getDoc(inviteRef);
//
//                 if (!inviteSnap.exists()) {
//                     throw new Error('Invitation not found');
//                 }
//
//                 const inviteData = inviteSnap.data();
//
//                 // Check if this invitation is for the current user
//                 if (inviteData.inviteeId !== user.id) {
//                     throw new Error('This invitation is not for you');
//                 }
//
//                 // Update invitation status
//                 await updateDoc(inviteRef, {
//                     status: 'accepted',
//                     respondedAt: serverTimestamp()
//                 });
//
//                 // Add user to group
//                 const groupRef = doc(db, 'studyGroups', inviteData.groupId);
//                 const groupSnap = await getDoc(groupRef);
//
//                 if (!groupSnap.exists()) {
//                     throw new Error('Study group not found');
//                 }
//
//                 const groupData = groupSnap.data();
//                 const newMembers = [...groupData.members, user.id];
//                 const newMemberNames = [...(groupData.memberNames || []), {
//                     id: user.id,
//                     name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Anonymous'
//                 }];
//
//                 await updateDoc(groupRef, {
//                     members: newMembers,
//                     memberNames: newMemberNames,
//                     updatedAt: serverTimestamp()
//                 });
//
//                 return true;
//             } catch (error) {
//                 console.error('Error accepting study group invitation:', error);
//                 throw error;
//             }
//         }
//     }, [isLoaded, isSignedIn, user, authenticateWithFirebase]);
//
//     // Function to decline a study group invitation
//     const declineStudyGroupInvite = useCallback(async (inviteId) => {
//         if (isLoaded && isSignedIn && user) {
//             try {
//                 // Authenticate with Firebase first
//                 await authenticateWithFirebase();
//
//                 // Get invitation
//                 const inviteRef = doc(db, 'groupInvites', inviteId);
//                 const inviteSnap = await getDoc(inviteRef);
//
//                 if (!inviteSnap.exists()) {
//                     throw new Error('Invitation not found');
//                 }
//
//                 const inviteData = inviteSnap.data();
//
//                 // Check if this invitation is for the current user
//                 if (inviteData.inviteeId !== user.id) {
//                     throw new Error('This invitation is not for you');
//                 }
//
//                 // Update invitation status
//                 await updateDoc(inviteRef, {
//                     status: 'declined',
//                     respondedAt: serverTimestamp()
//                 });
//
//                 return true;
//             } catch (error) {
//                 console.error('Error declining study group invitation:', error);
//                 throw error;
//             }
//         }
//     }, [isLoaded, isSignedIn, user, authenticateWithFirebase]);
//
//     // Function to get user's study groups
//     const getUserStudyGroups = useCallback(async () => {
//         if (isLoaded && isSignedIn && user) {
//             try {
//                 // Authenticate with Firebase first
//                 await authenticateWithFirebase();
//
//                 const groupsRef = collection(db, 'studyGroups');
//                 const q = query(groupsRef, where('members', 'array-contains', user.id));
//                 const querySnapshot = await getDocs(q);
//
//                 const groups = [];
//                 querySnapshot.forEach((doc) => {
//                     groups.push({
//                         id: doc.id,
//                         ...doc.data()
//                     });
//                 });
//
//                 return groups;
//             } catch (error) {
//                 console.error('Error getting user study groups:', error);
//                 throw error;
//             }
//         }
//         return [];
//     }, [isLoaded, isSignedIn, user, authenticateWithFirebase]);
//
//     // Function to get user's pending study group invitations
//     const getStudyGroupInvites = useCallback(async () => {
//         if (isLoaded && isSignedIn && user) {
//             try {
//                 // Authenticate with Firebase first
//                 await authenticateWithFirebase();
//
//                 const invitesRef = collection(db, 'groupInvites');
//                 const q = query(
//                     invitesRef,
//                     where('inviteeId', '==', user.id),
//                     where('status', '==', 'pending')
//                 );
//
//                 const querySnapshot = await getDocs(q);
//                 const invites = [];
//
//                 querySnapshot.forEach((doc) => {
//                     invites.push({
//                         id: doc.id,
//                         ...doc.data()
//                     });
//                 });
//
//                 return invites;
//             } catch (error) {
//                 console.error('Error getting study group invites:', error);
//                 throw error;
//             }
//         }
//         return [];
//     }, [isLoaded, isSignedIn, user, authenticateWithFirebase]);
//
//     useEffect(() => {
//         const syncUserToFirebase = async () => {
//             if (isLoaded && isSignedIn && user) {
//                 try {
//                     // Authenticate with Firebase first
//                     await authenticateWithFirebase();
//
//                     const userRef = doc(db, 'users', user.id);
//
//                     // Get pet data from context
//                     let petSelection = 0;
//                     let petName = 'Pet';
//                     let hasPet = true; // Default value
//
//                     if (petContext && petContext.petData) {
//                         petSelection = petContext.petData.selectedPet;
//                         petName = petContext.petData.petName;
//                         hasPet = petContext.petData.hasPet !== undefined ? petContext.petData.hasPet : true;
//                     } else {
//                         try {
//                             const storedPetData = await AsyncStorage.getItem('@pet_data');
//                             if (storedPetData) {
//                                 const parsedPetData = JSON.parse(storedPetData);
//                                 petSelection = parsedPetData.selectedPet || 0;
//                                 petName = parsedPetData.petName || 'Pet';
//                                 hasPet = parsedPetData.hasPet !== undefined ? parsedPetData.hasPet : true;
//                             }
//                         } catch (error) {
//                             console.error('Error reading pet data from AsyncStorage:', error);
//                         }
//                     }
//
//                     // Get background data from AsyncStorage
//                     let backgroundData = null;
//                     try {
//                         const savedBackground = await AsyncStorage.getItem('selectedBackground');
//                         if (savedBackground) {
//                             backgroundData = JSON.parse(savedBackground);
//                         }
//                     } catch (error) {
//                         console.error('Error reading background data from AsyncStorage:', error);
//                     }
//
//                     // Check if user doc exists
//                     const userSnap = await getDoc(userRef);
//                     const isNewUser = !userSnap.exists();
//
//                     // If user exists and has background data in Firebase but not in AsyncStorage,
//                     // update AsyncStorage with Firebase data
//                     if (!isNewUser && !backgroundData && userSnap.data()?.backgroundData) {
//                         try {
//                             await AsyncStorage.setItem(
//                                 'selectedBackground',
//                                 JSON.stringify(userSnap.data().backgroundData)
//                             );
//                         } catch (error) {
//                             console.error('Error saving background data to AsyncStorage:', error);
//                         }
//                     }
//
//                     // Prepare data to update
//                     const data = {
//                         userId: user.id,
//                         displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Anonymous',
//                         email: user.primaryEmailAddress?.emailAddress,
//                         photoUrl: user.imageUrl,
//                         status: 'online',
//                         lastActive: serverTimestamp(),
//                         updatedAt: serverTimestamp(),
//                         petSelection,
//                         petName,
//                         hasPet, // Added hasPet boolean to the data
//                         studyGroups: [], // Initialize empty array for study groups
//                     };
//
//                     // Include background data if available
//                     if (backgroundData) {
//                         data.backgroundData = backgroundData;
//                     }
//
//                     // Only set createdAt and tokens if new user
//                     if (isNewUser) {
//                         data.createdAt = serverTimestamp();
//                         data.tokens = 0;
//                     }
//
//                     await setDoc(userRef, data, { merge: true });
//                 } catch (error) {
//                     console.error('Error initializing user:', error);
//                 }
//             }
//         };
//
//         syncUserToFirebase();
//     }, [isLoaded, isSignedIn, user, petContext, authenticateWithFirebase]);
//
//     // Add a second effect to handle background changes
//     useEffect(() => {
//         const syncBackgroundChanges = async () => {
//             if (isLoaded && isSignedIn && user) {
//                 const handleBackgroundChange = async () => {
//                     try {
//                         // Authenticate with Firebase first
//                         await authenticateWithFirebase();
//
//                         const savedBackground = await AsyncStorage.getItem('selectedBackground');
//                         if (savedBackground) {
//                             const backgroundData = JSON.parse(savedBackground);
//                             const userRef = doc(db, 'users', user.id);
//                             await setDoc(userRef, { backgroundData }, { merge: true });
//                         }
//                     } catch (error) {
//                         console.error('Error syncing background to Firebase:', error);
//                     }
//                 };
//
//                 // Initial sync
//                 handleBackgroundChange();
//                 // You could set up a listener here if needed for real-time updates
//             }
//         };
//
//         syncBackgroundChanges();
//     }, [isLoaded, isSignedIn, user, authenticateWithFirebase]);
//
//     // Return all the functions so they can be used by components
//     return {
//         updateHasPetStatus,
//         createStudyGroup,
//         inviteToStudyGroup,
//         acceptStudyGroupInvite,
//         declineStudyGroupInvite,
//         getUserStudyGroups,
//         getStudyGroupInvites,
//         authenticateWithFirebase,
//     };
// }

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
                    status: 'online',
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

