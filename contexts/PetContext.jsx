import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create context to store and access pet data throughout the app
export const PetContext = createContext(null);

// Key for storing pet data in AsyncStorage
const PET_STORAGE_KEY = '@pet_data';

// Available pet types
export const PET_TYPES = ['corgi', 'pomeranian', 'pug'];

// Provider component to wrap your app and make pet data available
export const PetProvider = ({ children }) => {
    const [petData, setPetData] = useState({
        hasPet: false, // New field to track if user has a pet
        selectedPet: null, // Will store 0 (corgi), 1 (pomeranian), or 2 (pug)
        petName: '',
        isConfirmed: false,
    });
    const [isLoading, setIsLoading] = useState(true);

    // Load pet data from AsyncStorage when the app starts
    useEffect(() => {
        const loadPetData = async () => {
            try {
                const savedPetData = await AsyncStorage.getItem(PET_STORAGE_KEY);
                if (savedPetData !== null) {
                    setPetData(JSON.parse(savedPetData));
                }
            } catch (error) {
                console.error('Failed to load pet data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPetData();
    }, []);

    // Update pet data and save to AsyncStorage
    const updatePetData = async (newPetData) => {
        try {
            await AsyncStorage.setItem(PET_STORAGE_KEY, JSON.stringify(newPetData));
            setPetData(newPetData);
        } catch (error) {
            console.error('Failed to save pet data:', error);
        }
    };

    // Convenience method to set whether user has a pet
    const setHasPet = async (hasPet) => {
        const updatedData = { ...petData, hasPet };
        // If user doesn't have a pet, reset other pet-related fields
        if (!hasPet) {
            updatedData.selectedPet = null;
            updatedData.petName = '';
            updatedData.isConfirmed = false;
        }
        await updatePetData(updatedData);
    };

    return (
        <PetContext.Provider
            value={{
                petData,
                setPetData: updatePetData,
                setHasPet,
                isLoading
            }}
        >
            {children}
        </PetContext.Provider>
    );
};

// Custom hook to access pet data from any component
export const usePetData = () => useContext(PetContext);
