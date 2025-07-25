import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

import corgi_running_1 from '../assets/corgi_run/corgi_run_1.png';
import corgi_running_2 from '../assets/corgi_run/corgi_run_2.png';
import corgi_running_3 from '../assets/corgi_run/corgi_run_3.png';
import corgi_running_4 from '../assets/corgi_run/corgi_run_4.png';
import corgi_running_5 from '../assets/corgi_run/corgi_run_5.png';
import corgi_running_6 from '../assets/corgi_run/corgi_run_6.png';
import corgi_running_7 from '../assets/corgi_run/corgi_run_7.png';
import corgi_running_8 from '../assets/corgi_run/corgi_run_8.png';


import Spacer from "./Spacer";

const AnimatedImage = () => {
    const images = [corgi_running_1, corgi_running_2, corgi_running_3, corgi_running_4, corgi_running_5,
        corgi_running_6, corgi_running_7, corgi_running_8,];

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