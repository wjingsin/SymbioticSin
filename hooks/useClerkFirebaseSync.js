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

    const MAX_AUTH_ATTEMPTS = 3;


    const authenticateWithFirebase = useCallback(async (force = false) => {
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

    useEffect(() => {
        if (isLoaded && isSignedIn && user && !isAuthenticated && authAttempts < MAX_AUTH_ATTEMPTS) {
            authenticateWithFirebase();
        }
    }, [isLoaded, isSignedIn, user, isAuthenticated, authenticateWithFirebase, authAttempts]);


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
                const userSnap = await getDoc(userRef);
                const isNewUser = !userSnap.exists();
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
                let backgroundData = null;
                try {
                    const savedBackground = await AsyncStorage.getItem('selectedBackground');
                    if (savedBackground) {
                        backgroundData = JSON.parse(savedBackground);
                    } else if (!isNewUser && userSnap.data()?.backgroundData) {
                        backgroundData = userSnap.data().backgroundData;
                        await AsyncStorage.setItem(
                            'selectedBackground',
                            JSON.stringify(backgroundData)
                        );
                    }
                } catch (error) {
                    console.error('Error handling background data:', error);
                }

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
                if (backgroundData) {
                    data.backgroundData = backgroundData;
                }
                if (isNewUser) {
                    data.createdAt = serverTimestamp();
                    data.tokens = 0;
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

    return {
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

