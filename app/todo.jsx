import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InAppLayout from "../components/InAppLayout";
import Spacer from "../components/Spacer";

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function App() {
    const [tasks, setTasks] = useState({});
    const [taskName, setTaskName] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const storedTasks = await AsyncStorage.getItem('tasks');
            if (storedTasks !== null) {
                setTasks(JSON.parse(storedTasks));
            } else {
                const initialTasks = {};
                weekdays.forEach(day => {
                    initialTasks[day] = [];
                });
                setTasks(initialTasks);
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    };

    useEffect(() => {
        if (Object.keys(tasks).length > 0) {
            AsyncStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }, [tasks]);

    const addTask = () => {
        if (taskName.trim() === '') {
            Alert.alert('Error', 'Task name cannot be empty');
            return;
        }

        const taskDate = new Date(date);
        const dayIndex = taskDate.getDay();
        const weekdayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
        const weekday = weekdays[weekdayIndex];

        const newTask = {
            id: Date.now().toString(),
            name: taskName,
            dateTime: taskDate.toISOString(),
            completed: false,
        };

        setTasks(prevTasks => ({
            ...prevTasks,
            [weekday]: [...(prevTasks[weekday] || []), newTask]
        }));

        setTaskName('');
        setDate(new Date());
    };

    const toggleTaskCompletion = (weekday, taskId) => {
        setTasks(prevTasks => {
            const updatedWeekdayTasks = prevTasks[weekday].map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            );
            return {
                ...prevTasks,
                [weekday]: updatedWeekdayTasks
            };
        });
    };

    const deleteTask = (weekday, taskId) => {
        setTasks(prevTasks => ({
            ...prevTasks,
            [weekday]: prevTasks[weekday].filter(task => task.id !== taskId)
        }));
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        setDate(selectedDate || date);
    };

    return (
        <InAppLayout>
        <View style={styles.container}>
            <Spacer height={20} />
            <Text style={styles.header}>Weekly To-Do List</Text>

            <View style={styles.addTaskContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Task Name"
                    value={taskName}
                    onChangeText={setTaskName}
                />

                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text>{date.toLocaleString()}</Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="datetime"
                        display="default"
                        onChange={onDateChange}
                    />
                )}

                <TouchableOpacity style={styles.addButton} onPress={addTask}>
                    <Text style={styles.addButtonText}>Add Task</Text>
                </TouchableOpacity>
            </View>

            <ScrollView>
                {weekdays.map(weekday => (
                    <View key={weekday} style={styles.weekdayContainer}>
                        <Text style={styles.weekdayHeader}>{weekday}</Text>

                        {tasks[weekday]?.length > 0 ? (
                            tasks[weekday].map(task => (
                                <View key={task.id} style={styles.taskItem}>
                                    <TouchableOpacity
                                        onPress={() => toggleTaskCompletion(weekday, task.id)}
                                        style={{flex: 1}}
                                    >
                                        <Text style={task.completed ? styles.completedTaskText : null}>
                                            {task.name} - {new Date(task.dateTime).toLocaleString()}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => deleteTask(weekday, task.id)}>
                                        <Text style={styles.deleteText}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <Text>No tasks for {weekday}</Text>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
        </InAppLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 50,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    addTaskContainer: {
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
    },
    dateButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: '#eb7d42',
        padding: 10,
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
    },
    weekdayContainer: {
        marginBottom: 15,
    },
    weekdayHeader: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    taskItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    completedTaskText: {
        textDecorationLine: 'line-through',
        color: '#999',
    },
    deleteText: {
        color: 'red',
    }
});
