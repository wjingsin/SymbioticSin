import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

import pom_running_1 from '../assets/pom_run/pom_run_1.png'
import pom_running_2 from '../assets/pom_run/pom_run_2.png'
import pom_running_3 from '../assets/pom_run/pom_run_3.png'
import pom_running_4 from '../assets/pom_run/pom_run_4.png'
import pom_running_5 from '../assets/pom_run/pom_run_5.png'
import pom_running_6 from '../assets/pom_run/pom_run_6.png'
import pom_running_7 from '../assets/pom_run/pom_run_7.png'
import pom_running_8 from '../assets/pom_run/pom_run_8.png'





import Spacer from "./Spacer";

const AnimatedImage = () => {
    const images = [pom_running_1, pom_running_2, pom_running_3, pom_running_4, pom_running_5, pom_running_6
    , pom_running_7, pom_running_8];

    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.container}>
            <Image source={images[index]} style={styles.img} />
            <Spacer height={20} />
        </View>
    );
};

export default AnimatedImage;
const x = 0.55;
const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    img: {
        width: 1395 * x,
        height: 1134 * x,

    },
});