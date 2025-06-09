// __tests__/Shop.test.jsx
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import Shop from '../app/shop';

// Mock expo-router
jest.mock('expo-router', () => ({
    router: {
        back: jest.fn(),
        replace: jest.fn(),
    },
    Link: ({ children }) => children,
}));

// Mock contexts
jest.mock('../contexts/TokenContext', () => ({
    useTokens: jest.fn(() => ({
        points: 2500,
        minusPoint: jest.fn(),
    })),
}));

jest.mock('../contexts/PetContext', () => ({
    usePetData: jest.fn(() => ({
        petData: { hasPet: false },
    })),
}));

// Mock Clerk
jest.mock('@clerk/clerk-expo', () => ({
    useUser: jest.fn(() => ({ user: { id: 'test-user' } })),
}));

// Mock Firebase
jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    updateDoc: jest.fn(),
}));

jest.mock('../firebaseConfig', () => ({ db: {} }));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
}));

// Mock components
jest.mock('../components/InAppLayout', () => ({ children }) => children);

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('Shop', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        const { getByText } = render(<Shop />);
        expect(getByText('Shop')).toBeTruthy();
    });

    it('displays token count', () => {
        const { getByText } = render(<Shop />);
        expect(getByText('2500')).toBeTruthy();
    });

    it('shows adopt button when no pet', () => {
        const { getByText } = render(<Shop />);
        expect(getByText('Adopt')).toBeTruthy();
    });

    it('allows background purchase with sufficient tokens', async () => {
        const mockMinusPoint = jest.fn();
        const { useTokens } = require('../contexts/TokenContext');
        useTokens.mockReturnValue({
            points: 2500,
            minusPoint: mockMinusPoint,
        });

        const { getByText, getAllByText } = render(<Shop />);

        await act(async () => {
            // Get the first Purchase button (Living Room background)
            const purchaseButtons = getAllByText('Purchase');
            fireEvent.press(purchaseButtons[0]);
        });

        expect(mockMinusPoint).toHaveBeenCalledWith(1000);
        expect(Alert.alert).toHaveBeenCalledWith(
            'Success',
            'Living Room background purchased and applied!'
        );
    });

    it('shows insufficient tokens alert', async () => {
        const { useTokens } = require('../contexts/TokenContext');
        useTokens.mockReturnValue({
            points: 500,
            minusPoint: jest.fn(),
        });

        const { getAllByText } = render(<Shop />);

        await act(async () => {
            // Get the first Purchase button (Living Room background)
            const purchaseButtons = getAllByText('Purchase');
            fireEvent.press(purchaseButtons[0]);
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Insufficient Tokens',
            'You need 500 more tokens to purchase this background.'
        );
    });
});
