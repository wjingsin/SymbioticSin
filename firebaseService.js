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

// User Management



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


// NEW: Get all users (online and offline)
export const getAllUsers = async (limitCount = 50) => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('lastActive', 'desc'), limit(limitCount));
        const querySnapshot = await getDocs(q);
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        return users;
    } catch (error) {
        console.error('Error getting all users:', error);
        throw error;
    }
};

// Real-time listener for online users who are in the same study group
export const subscribeToOnlineUsers = (currentUserId, callback) => {
    try {
        // First get the current user's study group
        const userRef = doc(db, 'users', currentUserId);

        return onSnapshot(userRef, async (userDoc) => {
            if (userDoc.exists()) {
                const userData = userDoc.data();

                // Get the user's study groups
                const groupsRef = collection(db, 'studyGroups');
                const groupQuery = query(groupsRef, where('members', 'array-contains', currentUserId));
                const groupSnapshot = await getDocs(groupQuery);

                // If user is in a group, get other online members
                if (!groupSnapshot.empty) {
                    const groupDoc = groupSnapshot.docs[0]; // Get the first group (users can only be in one)
                    const groupData = groupDoc.data();
                    const groupMembers = groupData.members || [];

                    // Query for online users who are also in this group
                    const usersRef = collection(db, 'users');
                    const q = query(
                        usersRef,
                        where('status', '==', 'online'),
                        limit(20), // Add this limit
                        where('userId', '!=', currentUserId)
                    );


                    const unsubscribeUsers = onSnapshot(q, (querySnapshot) => {
                        const onlineUsers = [];

                        querySnapshot.forEach((doc) => {
                            // Only include users who are in the same group
                            if (groupMembers.includes(doc.id) || groupMembers.includes(doc.data().userId)) {
                                onlineUsers.push({ id: doc.id, ...doc.data() });
                            }
                        });

                        callback(onlineUsers);
                    });

                    return unsubscribeUsers;
                } else {
                    // User is not in any group, return empty array
                    callback([]);
                    return () => {};
                }
            }
        });
    } catch (error) {
        console.error('Error subscribing to online users:', error);
        throw error;
    }
};

//
// // NEW: Real-time listener for all users (online and offline)
// export const subscribeToUserStatusChanges = (callback) => {
//     try {
//         const usersRef = collection(db, 'users');
//         return onSnapshot(usersRef, (snapshot) => {
//             const users = [];
//             snapshot.forEach((doc) => {
//                 users.push({ id: doc.id, ...doc.data() });
//             });
//             callback(users);
//         });
//     } catch (error) {
//         console.error('Error subscribing to user status changes:', error);
//         throw error;
//     }
// };

export const createStudyGroup = async (userId, groupName) => {
    try {
        // Get user info
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error('User not found');
        }

        const userData = userSnap.data();

        // Create a new study group document
        const groupsRef = collection(db, 'studyGroups');
        const newGroupRef = await addDoc(groupsRef, {
            name: groupName,
            createdBy: userId,
            creatorName: userData.displayName || 'Anonymous',
            members: [userId],
            memberNames: [{
                id: userId,
                name: userData.displayName || 'Anonymous'
            }],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return newGroupRef.id;
    } catch (error) {
        console.error('Error creating study group:', error);
        throw error;
    }
};
export const inviteToStudyGroup = async (groupId, inviteeId, currentUser) => {
    try {
        if (!currentUser) {
            throw new Error('User not authenticated');
        }

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
        const newInviteRef = await addDoc(invitesRef, {
            groupId,
            groupName: groupData.name,
            inviterId: currentUser.id,
            inviterName: currentUser.displayName || currentUser.firstName || 'Anonymous',
            inviteeId,
            inviteeName: inviteeSnap.data().displayName || 'Unknown',
            status: 'pending',
            createdAt: serverTimestamp()
        });

        return newInviteRef.id;
    } catch (error) {
        throw error;
    }
};



// Accept a study group invitation
export const acceptStudyGroupInvite = async (inviteId, userId, groupId) => {
    try {
        // Get invitation
        const inviteRef = doc(db, 'groupInvites', inviteId);
        const inviteSnap = await getDoc(inviteRef);

        if (!inviteSnap.exists()) {
            throw new Error('Invitation not found');
        }

        const inviteData = inviteSnap.data();

        // Check if this invitation is for the current user
        if (inviteData.inviteeId !== userId) {
            throw new Error('This invitation is not for you');
        }

        // Update invitation status
        await updateDoc(inviteRef, {
            status: 'accepted',
            respondedAt: serverTimestamp()
        });

        // Add user to group
        const groupRef = doc(db, 'studyGroups', groupId);
        const groupSnap = await getDoc(groupRef);

        if (!groupSnap.exists()) {
            throw new Error('Study group not found');
        }

        // Get user info
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error('User not found');
        }

        const userData = userSnap.data();
        const groupData = groupSnap.data();

        const newMembers = [...groupData.members, userId];
        const newMemberNames = [...(groupData.memberNames || []), {
            id: userId,
            name: userData.displayName || 'Anonymous'
        }];

        await updateDoc(groupRef, {
            members: newMembers,
            memberNames: newMemberNames,
            updatedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error accepting study group invitation:', error);
        throw error;
    }
};

// Decline a study group invitation
export const declineStudyGroupInvite = async (inviteId) => {
    try {
        const inviteRef = doc(db, 'groupInvites', inviteId);
        await updateDoc(inviteRef, {
            status: 'declined',
            respondedAt: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error declining study group invitation:', error);
        throw error;
    }
};

// Get user's study groups
export const getUserStudyGroups = async (userId) => {
    try {
        const groupsRef = collection(db, 'studyGroups');
        const q = query(groupsRef, where('members', 'array-contains', userId));
        const querySnapshot = await getDocs(q);

        const groups = [];
        querySnapshot.forEach((doc) => {
            groups.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return groups;
    } catch (error) {
        console.error('Error getting user study groups:', error);
        throw error;
    }
};

// Get user's pending study group invitations
export const getStudyGroupInvites = async (userId) => {
    try {
        const invitesRef = collection(db, 'groupInvites');
        const q = query(
            invitesRef,
            where('inviteeId', '==', userId),
            where('status', '==', 'pending')
        );
        const querySnapshot = await getDocs(q);

        const invites = [];
        querySnapshot.forEach((doc) => {
            invites.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return invites;
    } catch (error) {
        console.error('Error getting study group invites:', error);
        throw error;
    }
};

// Add this function to your firebaseService.js file
export const leaveStudyGroup = async (userId, groupId) => {
    try {
        const groupRef = doc(db, 'studyGroups', groupId);
        const groupSnap = await getDoc(groupRef);

        if (!groupSnap.exists()) {
            throw new Error('Study group not found');
        }

        const groupData = groupSnap.data();

        // Check if user is a member
        if (!groupData.members.includes(userId)) {
            throw new Error('You are not a member of this group');
        }

        // Remove user from group
        const newMembers = groupData.members.filter(id => id !== userId);
        const newMemberNames = (groupData.memberNames || []).filter(member => member.id !== userId);

        // If this is the last member, delete the group
        if (newMembers.length === 0) {
            await deleteDoc(groupRef);
            return { deleted: true };
        }

        // Otherwise update the group
        await updateDoc(groupRef, {
            members: newMembers,
            memberNames: newMemberNames,
            updatedAt: serverTimestamp()
        });

        return { deleted: false };
    } catch (error) {
        console.error('Error leaving study group:', error);
        throw error;
    }
};
// Add this to your firebaseService.js file
export const subscribeToGroupMemberChanges = (groupId, callback) => {
    const groupRef = doc(db, 'studyGroups', groupId);

    return onSnapshot(groupRef, async (docSnapshot) => {
        if (docSnapshot.exists()) {
            const groupData = docSnapshot.data();
            if (groupData.members && Array.isArray(groupData.members)) {
                // Get full user data for each member
                const memberPromises = groupData.members.map(async (memberId) => {
                    try {
                        const userDoc = await getDoc(doc(db, 'users', memberId));
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            return {
                                id: memberId,
                                userId: memberId,
                                displayName: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
                                petName: userData.petName || 'Pet',
                                petSelection: userData.petSelection || 0,
                                hasPet: userData.hasPet !== false,
                                isOwner: memberId === groupData.ownerId
                            };
                        }
                        return { id: memberId, displayName: 'Unknown User', hasPet: false };
                    } catch (error) {
                        console.error('Error fetching user data:', error);
                        return { id: memberId, displayName: 'Unknown User', hasPet: false };
                    }
                });

                const memberData = await Promise.all(memberPromises);
                callback(memberData);
            }
        }
    });
};

export const subscribeToOnlineUsersOnly = (callback) => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(
            usersRef,
            where('status', '==', 'online'),
            orderBy('lastActive', 'desc'),
            limit(20)
        );
        return onSnapshot(q, callback, (error) => {
            console.error('Error in online users subscription:', error);
            callback({ forEach: () => {} }); // Return empty result on error
        });
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


