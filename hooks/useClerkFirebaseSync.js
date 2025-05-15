import { useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { doc, setDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { usePetData } from '../contexts/PetContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useClerkFirebaseSync() {
    const { user, isLoaded, isSignedIn } = useUser();
    const petContext = usePetData();

    // Function to update hasPet status in Firebase
    const updateHasPetStatus = useCallback(async (hasPetValue) => {
        if (isLoaded && isSignedIn && user) {
            try {
                const userRef = doc(db, 'users', user.id);
                await updateDoc(userRef, {
                    hasPet: hasPetValue,
                    updatedAt: serverTimestamp()
                });

                // Also update in context if available
                if (petContext && petContext.setPetData) {
                    petContext.setPetData({
                        ...petContext.petData,
                        hasPet: hasPetValue
                    });
                }
            } catch (error) {
                console.error('Error updating hasPet status:', error);
            }
        }
    }, [isLoaded, isSignedIn, user, petContext]);

    useEffect(() => {
        const syncUserToFirebase = async () => {
            if (isLoaded && isSignedIn && user) {
                const userRef = doc(db, 'users', user.id);

                // Get pet data from context
                let petSelection = 0;
                let petName = 'Pet';
                let hasPet = true; // Default value

                if (petContext && petContext.petData) {
                    petSelection = petContext.petData.selectedPet;
                    petName = petContext.petData.petName;
                    hasPet = petContext.petData.hasPet !== undefined ? petContext.petData.hasPet : true;
                } else {
                    try {
                        const storedPetData = await AsyncStorage.getItem('@pet_data');
                        if (storedPetData) {
                            const parsedPetData = JSON.parse(storedPetData);
                            petSelection = parsedPetData.selectedPet || 0;
                            petName = parsedPetData.petName || 'Pet';
                            hasPet = parsedPetData.hasPet !== undefined ? parsedPetData.hasPet : true;
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
                    }
                } catch (error) {
                    console.error('Error reading background data from AsyncStorage:', error);
                }

                // Check if user doc exists
                const userSnap = await getDoc(userRef);
                const isNewUser = !userSnap.exists();

                // If user exists and has background data in Firebase but not in AsyncStorage,
                // update AsyncStorage with Firebase data
                if (!isNewUser && !backgroundData && userSnap.data()?.backgroundData) {
                    try {
                        await AsyncStorage.setItem(
                            'selectedBackground',
                            JSON.stringify(userSnap.data().backgroundData)
                        );
                    } catch (error) {
                        console.error('Error saving background data to AsyncStorage:', error);
                    }
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
                    petSelection,
                    petName,
                    hasPet, // Added hasPet boolean to the data
                };

                // Include background data if available
                if (backgroundData) {
                    data.backgroundData = backgroundData;
                }

                // Only set createdAt and tokens if new user
                if (isNewUser) {
                    data.createdAt = serverTimestamp();
                    data.tokens = 0;
                }

                await setDoc(userRef, data, { merge: true });
            }
        };

        syncUserToFirebase();
    }, [isLoaded, isSignedIn, user, petContext]);

    // Add a second effect to handle background changes
    useEffect(() => {
        const syncBackgroundChanges = async () => {
            if (isLoaded && isSignedIn && user) {
                const handleBackgroundChange = async () => {
                    try {
                        const savedBackground = await AsyncStorage.getItem('selectedBackground');
                        if (savedBackground) {
                            const backgroundData = JSON.parse(savedBackground);
                            const userRef = doc(db, 'users', user.id);
                            await setDoc(userRef, { backgroundData }, { merge: true });
                        }
                    } catch (error) {
                        console.error('Error syncing background to Firebase:', error);
                    }
                };

                // Initial sync
                handleBackgroundChange();

                // You could set up a listener here if needed for real-time updates
                // This would require additional implementation
            }
        };

        syncBackgroundChanges();
    }, [isLoaded, isSignedIn, user]);

    // Return the update function so it can be used by components
    return { updateHasPetStatus };
}
