// __tests__/Leaderboard.test.jsx
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LeaderboardScreen from '../app/leaderboard';

// Mock expo-router
jest.mock('expo-router', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        back: jest.fn(),
    })),
}));

// Mock Clerk
jest.mock('@clerk/clerk-expo', () => ({
    useUser: jest.fn(() => ({
        user: {
            id: 'test-user-id',
            firstName: 'John',
            lastName: 'Doe',
        },
    })),
}));

// Mock Firebase services
jest.mock('../firebaseService', () => ({
    getAllUsers: jest.fn(() => Promise.resolve([
        {
            id: 'user1',
            displayName: 'Alice Smith',
            petName: 'Buddy',
            petSelection: 0,
            tokens: 1500,
            hasPet: true,
        },
        {
            id: 'user2',
            displayName: 'Bob Johnson',
            petName: 'Max',
            petSelection: 1,
            tokens: 1200,
            hasPet: true,
        },
    ])),
    subscribeToUserStatusChanges: jest.fn(() => jest.fn()),
    createStudyGroup: jest.fn(() => Promise.resolve()),
    inviteToStudyGroup: jest.fn(() => Promise.resolve()),
    getStudyGroupInvites: jest.fn(() => Promise.resolve([])),
    acceptStudyGroupInvite: jest.fn(() => Promise.resolve()),
    declineStudyGroupInvite: jest.fn(() => Promise.resolve()),
    getUserStudyGroups: jest.fn(() => Promise.resolve([])),
    leaveStudyGroup: jest.fn(() => Promise.resolve({ deleted: false })),
    subscribeToGroupMemberChanges: jest.fn(() => jest.fn()),
    subscribeToOnlineUsersOnly: jest.fn(() => jest.fn()),
}));

// Mock Firebase config
jest.mock('../firebaseConfig', () => ({
    db: {},
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    updateDoc: jest.fn(() => Promise.resolve()),
    onSnapshot: jest.fn(),
}));

// Mock contexts
jest.mock('../contexts/TokenContext', () => ({
    useTokens: jest.fn(() => ({
        points: 1000,
    })),
}));

jest.mock('../contexts/PetContext', () => ({
    PET_TYPES: ['corgi', 'pomeranian', 'pug'],
}));

// Mock components
jest.mock('../components/InAppLayout', () => ({ children }) => children);
jest.mock('../components/Spacer', () => () => null);

// Mock Icons
jest.mock('@expo/vector-icons', () => ({
    FontAwesome: ({ name, ...props }) => {
        const { Text } = require('react-native');
        return <Text {...props}>{name}</Text>;
    },
    FontAwesome5: ({ name, ...props }) => {
        const { Text } = require('react-native');
        return <Text {...props}>{name}</Text>;
    },
    MaterialIcons: ({ name, ...props }) => {
        const { Text } = require('react-native');
        return <Text {...props}>{name}</Text>;
    },
}));

// Mock lodash debounce
jest.mock('lodash', () => ({
    debounce: jest.fn((fn) => fn),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('LeaderboardScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing and loads content', async () => {
        const { getByText } = render(<LeaderboardScreen />);

        // Wait for loading to complete and content to appear
        await waitFor(() => {
            expect(getByText('Community')).toBeTruthy();
        });
    });

    it('displays tab navigation after loading', async () => {
        const { getByText } = render(<LeaderboardScreen />);

        await waitFor(() => {
            expect(getByText('Leaderboard')).toBeTruthy();
            expect(getByText('Study Group')).toBeTruthy();
        });
    });

    it('displays invites button with count after loading', async () => {
        const { getByText } = render(<LeaderboardScreen />);

        await waitFor(() => {
            expect(getByText('(0)')).toBeTruthy();
        });
    });

    it('displays user list when loaded', async () => {
        const { getByText } = render(<LeaderboardScreen />);

        await waitFor(() => {
            expect(getByText('Owner: Alice Smith')).toBeTruthy();
            expect(getByText('Owner: Bob Johnson')).toBeTruthy();
        });
    });

    it('navigates to user profile when user card is pressed', async () => {
        const mockPush = jest.fn();
        const { useRouter } = require('expo-router');
        useRouter.mockReturnValue({ push: mockPush });

        const { getByText } = render(<LeaderboardScreen />);

        await waitFor(() => {
            const ownerText = getByText('Owner: Alice Smith');
            const userCard = ownerText.parent.parent; // Navigate up to the touchable card
            fireEvent.press(userCard);
        });

        expect(mockPush).toHaveBeenCalledWith({
            pathname: '/otherUsersProfile',
            params: { userId: 'user1' }
        });
    });
});
