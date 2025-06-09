// __tests__/Todo.test.jsx
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Todo from '../app/todo';
import { format, startOfWeek } from 'date-fns';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
}));

// Mock notifications
jest.mock('expo-notifications', () => ({
    setNotificationHandler: jest.fn(),
    getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    scheduleNotificationAsync: jest.fn(() => Promise.resolve()),
    cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
    setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
}));

// Mock contexts
jest.mock('../contexts/PointsContext', () => ({
    PointsProvider: ({ children }) => children,
    usePoints: jest.fn(() => ({
        points: 100,
        addPoint: jest.fn(),
    })),
}));

// Mock components
jest.mock('../components/InAppLayout', () => ({ children }) => children);
jest.mock('../components/Spacer', () => () => null);

// Mock date picker
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Mock gesture handler
jest.mock('react-native-gesture-handler', () => ({
    GestureHandlerRootView: ({ children }) => children,
    Swipeable: ({ children }) => children,
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('Todo Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        const { getByText } = render(<Todo />);
        expect(getByText('Tasks')).toBeTruthy();
    });

    it('displays points counter', () => {
        const { getByText } = render(<Todo />);
        expect(getByText('100')).toBeTruthy();
    });

    it('shows add task button', () => {
        const { getByText } = render(<Todo />);
        expect(getByText('+ Add New Task')).toBeTruthy();
    });

    it('opens add task form', async () => {
        const { getByText } = render(<Todo />);

        await act(async () => {
            fireEvent.press(getByText('+ Add New Task'));
        });

        expect(getByText('Add New Task')).toBeTruthy();
    });

    it('toggles task completion', async () => {
        // Mock existing tasks with the correct date format
        const currentDate = new Date();
        const weekStart = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');

        const mockTasks = {
            [weekStart]: {
                Monday: [{
                    id: '1',
                    name: 'Test Task',
                    completed: false,
                    pointAwarded: false,
                    dateTime: currentDate.toISOString(),
                    color: '#ff6b6b',
                    reminderMinutes: 60
                }]
            }
        };

        // Mock AsyncStorage to return the tasks
        AsyncStorage.getItem.mockImplementation((key) => {
            if (key === 'allTasks') {
                return Promise.resolve(JSON.stringify(mockTasks));
            }
            return Promise.resolve(null);
        });

        const { getByText } = render(<Todo />);

        // Wait for the component to load the tasks from AsyncStorage
        await waitFor(() => {
            expect(getByText('Test Task')).toBeTruthy();
        });

        // Now test the task completion toggle
        await act(async () => {
            fireEvent.press(getByText('Test Task'));
        });

        expect(AsyncStorage.setItem).toHaveBeenCalled();
    });


    it('navigates between weeks', async () => {
        const { getByText } = render(<Todo />);

        await act(async () => {
            fireEvent.press(getByText('◀'));
        });

        expect(getByText('▶')).toBeTruthy();
    });

});
