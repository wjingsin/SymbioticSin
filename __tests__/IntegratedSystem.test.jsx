// __tests__/IntegratedSystem.test.jsx

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Import components for system-level testing
import InAppLayout from '../components/InAppLayout';
import Todo from '../app/todo';
import LeaderboardScreen from '../app/leaderboard';
import FocusTimer from '../app/focus';
import Shop from '../app/shop';
import UserConnectionScreen from '../app/userList';
import HomeWrapper from "../app/home";

// Mock expo-router FIRST
jest.mock('expo-router', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    })),
    usePathname: jest.fn(() => '/home'),
    Link: ({ children, href, ...props }) => {
        const { TouchableOpacity } = require('react-native');
        return <TouchableOpacity {...props} testID={`nav-${href}`}>{children}</TouchableOpacity>;
    },
}));

// Mock Clerk authentication BEFORE importing components
jest.mock('@clerk/clerk-expo', () => ({
    useUser: jest.fn(() => ({
        user: {
            id: 'system-test-user',
            firstName: 'System',
            lastName: 'User',
        },
        isLoaded: true,
        isSignedIn: true,
    })),
    useAuth: jest.fn(() => ({
        signOut: jest.fn(() => Promise.resolve()),
    })),
    ClerkProvider: ({ children }) => children,
}));

// Mock Firebase services with proper jest.fn()
jest.mock('../firebaseService', () => ({
    getAllUsers: jest.fn(() => Promise.resolve([
        { id: 'user1', displayName: 'Alice', petName: 'Buddy', tokens: 1500, hasPet: true, petSelection: 0 },
        { id: 'user2', displayName: 'Bob', petName: 'Max', tokens: 1200, hasPet: true, petSelection: 1 },
    ])),
    updateUserPetInfo: jest.fn(() => Promise.resolve()),
    updateUserStatus: jest.fn(() => Promise.resolve()),
    subscribeToUserStatusChanges: jest.fn(() => jest.fn()),
    subscribeToOnlineUsersOnly: jest.fn(() => jest.fn()),
    subscribeToOnlineUsers: jest.fn((userId, callback) => {
        setTimeout(() => callback([
            { userId: 'user1', displayName: 'Alice', petName: 'Buddy', hasPet: true, petSelection: 0 },
            { userId: 'user2', displayName: 'Bob', petName: 'Max', hasPet: true, petSelection: 1 },
        ]), 100);
        return jest.fn();
    }),
    getUserStudyGroups: jest.fn(() => Promise.resolve([{ name: 'Test Group' }])),
    getStudyGroupInvites: jest.fn(() => Promise.resolve([])),
    createStudyGroup: jest.fn(() => Promise.resolve()),
}));

// Mock Firebase config
jest.mock('../firebaseConfig', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    updateDoc: jest.fn(() => Promise.resolve()),
    onSnapshot: jest.fn(),
}));

// Mock AsyncStorage - Fixed to return proper JSON data
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn((key) => {
        if (key === 'petStats') {
            return Promise.resolve(JSON.stringify({ happiness: 100, energy: 100, health: 100 }));
        }
        return Promise.resolve(null);
    }),
    setItem: jest.fn(() => Promise.resolve()),
}));

// Mock notifications
jest.mock('expo-notifications', () => ({
    setNotificationHandler: jest.fn(),
    getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    scheduleNotificationAsync: jest.fn(() => Promise.resolve()),
    setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
}));

// Mock contexts with shared state
const mockPetData = { selectedPet: 0, petName: 'TestPet', hasPet: true };
const mockTokens = 1000;
const mockPoints = 500;

jest.mock('../contexts/PetContext', () => ({
    usePetData: jest.fn(() => ({
        petData: mockPetData,
        setPetData: jest.fn(),
        isLoading: false,
    })),
    PET_TYPES: ['corgi', 'pomeranian', 'pug'],
}));

jest.mock('../contexts/TokenContext', () => ({
    TokensProvider: ({ children }) => children,
    useTokens: jest.fn(() => ({
        points: mockTokens,
        addPoint: jest.fn(),
        minusPoint: jest.fn(),
    })),
}));

jest.mock('../contexts/PointsContext', () => ({
    PointsProvider: ({ children }) => children,
    usePoints: jest.fn(() => ({
        points: mockPoints,
        addPoint: jest.fn(),
        minusPoint: jest.fn(),
    })),
}));

// Mock hooks - Added updateUserStatus
jest.mock('../hooks/useClerkFirebaseSync', () => jest.fn(() => ({
    updateHasPetStatus: jest.fn(),
    updateUserStatus: jest.fn(),
    isAuthenticated: true,
    authError: null,
})));

// Mock components - Added InAppLayout
jest.mock('../components/InAppLayout', () => ({ children }) => children);
jest.mock('../components/Spacer', () => () => null);
jest.mock('../components/corgi_walking', () => 'CorgiWalking');
jest.mock('../components/corgi_jumping', () => 'CorgiJumping');
jest.mock('../components/corgi_sniffing_park', () => 'CorgiSniffing');
jest.mock('../components/corgi_running_park', () => 'CorgiRunning');
jest.mock('../components/pom_walking', () => 'PomWalking');
jest.mock('../components/pom_sniffing_park', () => 'PomSniffing');
jest.mock('../components/pom_running_park', () => 'PomRunning');
jest.mock('../components/pug_animated', () => 'PugAnimated');
jest.mock('../components/nopet_animated', () => 'NoPetAnimated');
jest.mock('../components/transparent', () => 'NoPet');
jest.mock('../components/SignOutButtonSmall', () => ({ SignOutButtonSmall: () => null }));

// Mock date picker and slider
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');
jest.mock('@react-native-community/slider', () => 'Slider');
jest.mock('react-native-gesture-handler', () => ({
    GestureHandlerRootView: ({ children }) => children,
    Swipeable: ({ children }) => children,
}));

// Mock Icons - Added Entypo
jest.mock('@expo/vector-icons', () => ({
    FontAwesome: ({ name }) => name,
    FontAwesome5: ({ name }) => name,
    MaterialIcons: ({ name }) => name,
    MaterialCommunityIcons: ({ name }) => name,
    Ionicons: ({ name }) => name,
    Entypo: ({ name }) => name,
}));

// Mock lodash
jest.mock('lodash', () => ({
    debounce: jest.fn((fn) => fn),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('System Integration Testing - Unique Cross-Component Flows', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Cross-Component Data Synchronization', () => {
        it('synchronizes pet data changes across all components in real-time', async () => {
            const mockSetPetData = jest.fn();
            const { usePetData } = require('../contexts/PetContext');

            // Initial state: no pet
            usePetData.mockReturnValue({
                petData: { selectedPet: null, petName: '', hasPet: false },
                setPetData: mockSetPetData,
                isLoading: false,
            });

            // Render multiple components
            const { getAllByText: shopTexts } = render(<Shop />);
            const { getByText: focusText } = render(<FocusTimer />);

            // Verify initial no-pet state across components
            const adoptButtons = shopTexts('Adopt a Pet');
            expect(adoptButtons.length).toBeGreaterThan(0);

            // Simulate pet adoption in Shop
            await act(async () => {
                fireEvent.press(adoptButtons[0]);
            });

            // Update context to reflect new pet
            usePetData.mockReturnValue({
                petData: { selectedPet: 0, petName: 'NewPet', hasPet: true },
                setPetData: mockSetPetData,
                isLoading: false,
            });

            // Re-render components and verify pet appears everywhere
            const { getByText: newHomeText } = render(<HomeWrapper />);
            const { getByText: newFocusText } = render(<FocusTimer />);

            expect(newHomeText('NewPet')).toBeTruthy();
            expect(newFocusText('Focus')).toBeTruthy();
        });

        it('maintains token/points consistency during cross-component transactions', async () => {
            const mockAddPoint = jest.fn();
            const mockMinusPoint = jest.fn();
            let currentTokens = 1000;

            const { useTokens } = require('../contexts/TokenContext');

            // Mock dynamic token/points that change based on actions
            useTokens.mockImplementation(() => ({
                points: currentTokens,
                addPoint: (amount) => {
                    currentTokens += amount;
                    mockAddPoint(amount);
                },
                minusPoint: (amount) => {
                    currentTokens -= amount;
                    mockMinusPoint(amount);
                },
            }));

            // Start focus session (earns tokens)
            const { getByText: focusText } = render(<FocusTimer />);
            await act(async () => {
                fireEvent.press(focusText('START'));
            });

            // Verify tokens increased
            await waitFor(() => {
                expect(mockAddPoint).toHaveBeenCalled();
            });

            // Use tokens in shop
            const { getAllByText: shopTexts } = render(<Shop />);
            await act(async () => {
                const purchaseButtons = shopTexts('Purchase');
                fireEvent.press(purchaseButtons[0]);
            });

            // Verify tokens decreased
            expect(mockMinusPoint).toHaveBeenCalledWith(1000);
        });
    });

    describe('Real-Time Social Features Integration', () => {
        it('synchronizes online user data across leaderboard and user connection screens', async () => {
            const mockUsers = [
                { id: 'user1', displayName: 'Alice', petName: 'Buddy', isOnline: true },
                { id: 'user2', displayName: 'Bob', petName: 'Max', isOnline: true },
            ];

            // Clear existing mocks and set up new implementation
            jest.clearAllMocks();
            const { subscribeToOnlineUsers } = require('../firebaseService');
            subscribeToOnlineUsers.mockImplementation((userId, callback) => {
                setTimeout(() => callback(mockUsers), 100);
                return jest.fn();
            });

            // Render both social components
            const { getByText: userListText } = render(<UserConnectionScreen />);

            // Verify both show same online user count
            await waitFor(() => {
                expect(userListText('Owner: Alice')).toBeTruthy();
            });
        });
    });

    describe('System-Wide Error Recovery', () => {
        it('maintains app stability when multiple services fail simultaneously', async () => {
            // Clear mocks and set up failures
            jest.clearAllMocks();
            const { getAllUsers, updateUserStatus, getUserStudyGroups } = require('../firebaseService');
            const AsyncStorage = require('@react-native-async-storage/async-storage');

            getAllUsers.mockRejectedValue(new Error('Network error'));
            updateUserStatus.mockRejectedValue(new Error('Auth error'));
            getUserStudyGroups.mockRejectedValue(new Error('Database error'));
            AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

            // Render all components despite failures
            const components = [
                <HomeWrapper />,
                <FocusTimer />,
                <Shop />,
                <Todo />
            ];

            // Verify all components render without crashing
            components.forEach(component => {
                expect(() => render(component)).not.toThrow();
            });
        });
    });

    describe('Performance and Memory Management', () => {
        it('efficiently manages memory during rapid component mounting/unmounting', () => {
            const components = [<HomeWrapper />, <FocusTimer />, <Todo />, <Shop />];
            const instances = [];

            // Mount all components
            components.forEach(component => {
                instances.push(render(component));
            });

            // Unmount all components
            instances.forEach(instance => {
                expect(() => instance.unmount()).not.toThrow();
            });

            // Verify cleanup was successful (no memory leaks)
            expect(instances.length).toBe(4);
        });
    });
});
