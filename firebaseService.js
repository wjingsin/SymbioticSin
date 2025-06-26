import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    addDoc,
    updateDoc,
    onSnapshot,
    orderBy,
    serverTimestamp,
    limit,
    deleteDoc
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export const updateUserStatus = async (userId, status) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            status,
            lastActive: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error updating user status:', error);
        throw error;
    }
};

export const subscribeToOnlineUsers = (currentUserId, callback) => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(
            usersRef,
            where('status', '==', 'online'),
            orderBy('lastActive', 'desc'),
            limit(50) // Increased limit for more users
        );

        return onSnapshot(q,
            (querySnapshot) => {
                const onlineUsers = [];

                querySnapshot.forEach((doc) => {
                    const userData = doc.data();
                    onlineUsers.push({
                        userId: doc.id,
                        displayName: userData.displayName || 'Unknown User',
                        petSelection: userData.petSelection,
                        petName: userData.petName || '',
                        lastActive: userData.lastActive,
                        status: userData.status,
                        ...userData
                    });
                });

                callback(onlineUsers);
            },
            (error) => {
                console.error('Error in online users subscription:', error);
                callback([]); // Return empty array on error
            }
        );
    } catch (error) {
        console.error('Error subscribing to online users:', error);
        throw error;
    }
};

export const updateUserPetInfo = async (userId, petData) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            petSelection: petData.selectedPet,
            petName: petData.petName.trim(),
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error updating pet info:', error);
        throw error;
    }
};


