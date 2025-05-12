import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import Slider from '@react-native-community/slider';
import Corgi from "../components/corgi_running_park";
import CorgiJump from "../components/corgi_jumping";
import Pom from "../components/pom_animated";
import PomJump from "../components/pom_animated";
import Pug from "../components/pug_animated";
import PugJump from "../components/pug_animated";
import InAppLayout from "../components/InAppLayout";
import { usePetData } from "../contexts/PetContext";
import Spacer from "../components/Spacer";

const FocusTimer = () => {
    // Timer state
    const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes default
    const [selectedTime, setSelectedTime] = useState(25); // in minutes
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Animation for timer pulse effect
    const pulseAnimation = useRef(new Animated.Value(1)).current;
    const timerRef = useRef(null);

    // Get pet data from context
    const { petData } = usePetData();

    // Start/stop pulse animation based on timer state
    useEffect(() => {
        if (isRunning && !isPaused) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnimation, {
                        toValue: 1.05,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnimation, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnimation.setValue(1);
        }
    }, [isRunning, isPaused]);

    // Handle timer countdown
    useEffect(() => {
        if (isRunning && !isPaused) {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setIsRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRunning, isPaused]);

    // Format time for display (MM:SS)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle time selection
    const handleTimeChange = (value) => {
        const minutes = Math.round(value);
        setSelectedTime(minutes);
        setTimeRemaining(minutes * 60);
    };

    // Start timer
    const startTimer = () => {
        setTimeRemaining(selectedTime * 60);
        setIsRunning(true);
        setIsPaused(false);
    };

    // Pause timer
    const pauseTimer = () => {
        setIsPaused(true);
    };

    // Resume timer
    const resumeTimer = () => {
        setIsPaused(false);
    };

    // Determine which pet component to render
    let PetComponent;
    switch (petData?.selectedPet) {
        case 0: // Corgi
            PetComponent = Corgi;
            break;
        case 1: // Pomeranian
            PetComponent = Pom;
            break;
        case 2: // Pug
            PetComponent = Pug;
            break;
        default:
            PetComponent = Corgi;
    }

    return (
        <InAppLayout>
            <View style={styles.container}>
                {/* Header */}
                <Spacer height={20}/>
                <Text style={styles.header}>Focus</Text>

                {/* Pet Background and Timer Overlay */}
                <View style={styles.petBackgroundContainer}>
                    {/* Pet as background */}
                    <View style={styles.petBackground}>
                        <PetComponent />
                    </View>

                    {/* Timer Overlay */}
                    <View style={styles.timerOverlay}>
                        <Animated.View
                            style={[
                                styles.timerCircle,
                                { transform: [{ scale: pulseAnimation }] }
                            ]}
                        >
                            <View style={styles.timerInnerCircle}>
                                <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>

                                {!isRunning ? (
                                    <TouchableOpacity
                                        style={styles.startButton}
                                        onPress={startTimer}
                                    >
                                        <Text style={styles.buttonText}>START</Text>
                                    </TouchableOpacity>
                                ) : isPaused ? (
                                    <TouchableOpacity
                                        style={styles.resumeButton}
                                        onPress={resumeTimer}
                                    >
                                        <Text style={styles.buttonText}>RESUME</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.pauseButton}
                                        onPress={pauseTimer}
                                    >
                                        <Text style={styles.buttonText}>PAUSE</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </Animated.View>
                        <Spacer height={300}/>
                    </View>

                </View>

                {/* Time Selection Slider (only visible when timer is not running) */}
                {!isRunning && (
                    <View style={styles.sliderContainer}>
                        <Text style={styles.sliderLabel}>
                            Focus Time: {selectedTime} min
                        </Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={5}
                            maximumValue={60}
                            step={5}
                            value={selectedTime}
                            onValueChange={handleTimeChange}
                            minimumTrackTintColor="#eb7d42"
                            maximumTrackTintColor="#d3d3d3"
                            thumbTintColor="#eb7d42"
                        />
                    </View>
                )}
            </View>
        </InAppLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 40,
        marginBottom: 20,
        color: '#343a40',
    },
    petBackgroundContainer: {
        position: 'relative',
        width: '100%',
        height: 600, // Adjust as needed
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
    },
    petBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
    timerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    timerCircle: {
        width: 180,
        height: 180,
        borderRadius: 110,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
    },
    timerInnerCircle: {
        width: 160,
        height: 160,
        borderRadius: 100,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#343a40',
        marginBottom: 10,
    },
    startButton: {
        backgroundColor: '#eb7d42',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    pauseButton: {
        backgroundColor: '#ff6b6b',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    resumeButton: {
        backgroundColor: '#eb7d42',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    sliderContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    sliderLabel: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginBottom: 10,
    },
    slider: {
        width: '100%',
        height: 40,
    },
});

export default FocusTimer;
