import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Corgi from "../components/corgi_sniffing_park";
import CorgiJump from "../components/corgi_running_park";
import Pom from "../components/pom_animated";
import PomJump from "../components/pom_animated";
import Pug from "../components/pug_animated";
import PugJump from "../components/pug_animated";
import InAppLayout from "../components/InAppLayout";
import { usePetData } from "../contexts/PetContext";
import { useTokens } from "../contexts/TokenContext";
import Spacer from "../components/Spacer";

const FocusTimer = () => {
    // Timer state
    const [timeRemaining, setTimeRemaining] = useState(60 * 60); // 25 minutes default
    const [selectedTime, setSelectedTime] = useState(60); // in minutes
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [petAnimation, setPetAnimation] = useState('walk'); // 'walk' or 'run'
    const [earnedThisSession, setEarnedThisSession] = useState(0);
    const [tokenRate, setTokenRate] = useState(1); // Tokens per second

    // Animation for timer pulse effect
    const pulseAnimation = useRef(new Animated.Value(1)).current;
    const timerRef = useRef(null);

    // Token animation values
    const tokenPulse = useRef(new Animated.Value(1)).current;
    const tokenEarnedAnim = useRef(new Animated.Value(0)).current;
    const tokenEarnedOpacity = useRef(new Animated.Value(0)).current;

    // Get pet data from context
    const { petData } = usePetData();

    // Get token functions from context
    const { points, addPoint } = useTokens();

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

    // Update pet animation based on timer state
    useEffect(() => {
        if (isRunning && !isPaused) {
            setPetAnimation('run');
        } else {
            // Use walk animation when paused OR not running
            setPetAnimation('walk');
        }
    }, [isRunning, isPaused]);

    // Animation functions for tokens
    const pulseTokenIcon = () => {
        Animated.sequence([
            Animated.timing(tokenPulse, {
                toValue: 1.2,
                duration: 200,
                useNativeDriver: true
            }),
            Animated.timing(tokenPulse, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true
            })
        ]).start();
    };

    const showEarnedAnimation = (amount) => {
        // Reset position
        tokenEarnedAnim.setValue(0);
        tokenEarnedOpacity.setValue(1);

        // Animate floating up and fading
        Animated.parallel([
            Animated.timing(tokenEarnedAnim, {
                toValue: -50,
                duration: 1000,
                useNativeDriver: true
            }),
            Animated.timing(tokenEarnedOpacity, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true
            })
        ]).start();
    };

    useEffect(() => {
        if (isRunning && !isPaused) {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setIsRunning(false);
                        setPetAnimation('walk'); // Change back to walking when timer ends

                        // Show alert with token information
                        Alert.alert(
                            "Focus Session Complete!",
                            `You earned ${earnedThisSession} tokens in this session.\nYour total tokens: ${points}`,
                            [{ text: "OK", onPress: () => console.log("Session complete acknowledged") }]
                        );

                        return 0;
                    }
                    return prev - 1;
                });

                // Add tokens per second of focus time
                addPoint(tokenRate);
                setEarnedThisSession(prev => prev + tokenRate);

                // Trigger animations every second
                if (timeRemaining % 1 === 0) {
                    pulseTokenIcon();
                    showEarnedAnimation(tokenRate);
                }
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRunning, isPaused, addPoint, tokenRate, timeRemaining, earnedThisSession, points]);


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
        setPetAnimation('run'); // Change to running when timer starts
        setEarnedThisSession(0); // Reset earned tokens for new session
    };

    // Pause timer
    const pauseTimer = () => {
        setIsPaused(true);
        setPetAnimation('walk'); // Explicitly set to walk when paused
    };

    // Resume timer
    const resumeTimer = () => {
        setIsPaused(false);
        setPetAnimation('run'); // Set back to run when resumed
    };

    // Quit current session
    const quitSession = () => {
        Alert.alert(
            "Quit Session",
            "Are you sure you want to quit your current focus session?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Quit",
                    onPress: () => {
                        clearInterval(timerRef.current);
                        setIsRunning(false);
                        setIsPaused(false);
                        setTimeRemaining(selectedTime * 60);
                        setPetAnimation('walk');
                        setEarnedThisSession(0); // Reset earned tokens when quitting
                    },
                    style: "destructive"
                }
            ]
        );
    };

    // Determine which pet component to render
    let PetComponent;
    let PetRunningComponent;

    switch (petData?.selectedPet) {
        case 0: // Corgi
            PetComponent = Corgi;
            PetRunningComponent = CorgiJump;
            break;
        case 1: // Pomeranian
            PetComponent = Pom;
            PetRunningComponent = PomJump;
            break;
        case 2: // Pug
            PetComponent = Pug;
            PetRunningComponent = PugJump;
            break;
        default:
            PetComponent = Corgi;
            PetRunningComponent = CorgiJump;
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
                        {petAnimation === 'walk' ? <PetComponent /> : <PetRunningComponent />}
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
                                    <View style={styles.buttonRow}>
                                        <TouchableOpacity
                                            style={styles.resumeButton}
                                            onPress={resumeTimer}
                                        >
                                            <Text style={styles.buttonText}>RESUME</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.quitButton}
                                            onPress={quitSession}
                                        >
                                            <Text style={styles.buttonText}>QUIT</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={styles.buttonRow}>
                                        <TouchableOpacity
                                            style={styles.pauseButton}
                                            onPress={pauseTimer}
                                        >
                                            <Text style={styles.buttonText}>PAUSE</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.quitButton}
                                            onPress={quitSession}
                                        >
                                            <Text style={styles.buttonText}>QUIT</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                    </View>
                </View>

                {/* Time Selection Slider (only visible when timer is not running) */}
                {!isRunning && (
                    <View style={styles.tokenContainer}>
                        <Text style={styles.sliderLabel}>
                            Focus Time: {selectedTime} min
                        </Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={1}
                            maximumValue={120} // Extended to 2 hours
                            step={1}
                            value={selectedTime}
                            onValueChange={handleTimeChange}
                            minimumTrackTintColor="#eb7d42"
                            maximumTrackTintColor="#d3d3d3"
                            thumbTintColor="#eb7d42"
                        />
                    </View>
                )}


                {/* Token counter (visible when timer is running) - Using the same style as in playground */}
                {isRunning && (
                    <View style={styles.tokenContainer}>
                        <View style={styles.totalTokensContainer}>
                            <Animated.View style={{ transform: [{ scale: tokenPulse }] }}>
                                <MaterialCommunityIcons name="paw" size={24} color="#505a98" />
                            </Animated.View>
                            <Text style={styles.totalTokens}>{points}</Text>

                            {/* Animated earned tokens */}
                            <Animated.Text
                                style={[
                                    styles.earnedTokens,
                                    {
                                        opacity: tokenEarnedOpacity,
                                        transform: [{ translateY: tokenEarnedAnim }]
                                    }
                                ]}
                            >
                                +{tokenRate}
                            </Animated.Text>
                        </View>

                        <View style={styles.tokenRateContainer}>
                            <Text style={styles.tokenRateText}>
                                {tokenRate} <MaterialCommunityIcons name="paw" size={14} color="#505a98" /> / sec
                            </Text>
                        </View>

                        <View style={styles.sessionStatsContainer}>
                            <Text style={styles.sessionStatsText}>
                                Earned this session: {earnedThisSession}
                            </Text>
                        </View>
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
        bottom: 300,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    timerCircle: {
        width: 220,
        height: 180,
        borderRadius: 30,
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
        width: 200,
        height: 200,
        borderRadius: 100,
        // backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#343a40',
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
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
        paddingHorizontal: 20,
        borderRadius: 25,
        marginRight: 10,
    },
    resumeButton: {
        backgroundColor: '#eb7d42',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginRight: 10,
    },
    quitButton: {
        backgroundColor: '#6c757d',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
// In your StyleSheet
    sliderContainer: {
        backgroundColor: '#fafcff',
        borderRadius: 15,
        padding: 15,
        marginHorizontal: 20,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
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


    // Token UI styles copied from userConnection.js
    tokenContainer: {
        backgroundColor: '#fafcff',
        borderRadius: 15,
        padding: 5,
        marginHorizontal: 0,
        marginTop: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    totalTokensContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    totalTokens: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    earnedTokens: {
        position: 'absolute',
        right: -20,
        color: '#505a98',
        fontWeight: 'bold',
        fontSize: 16,
    },
    tokenRateContainer: {
        alignItems: 'center',
        marginTop: 5,
    },
    tokenRateText: {
        fontSize: 16,
        color: '#555',
        fontWeight: '600',
    },
    sessionStatsContainer: {
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#eaeaea',
    },
    sessionStatsText: {
        fontSize: 12,
        color: '#888',
    },
});

export default FocusTimer;
