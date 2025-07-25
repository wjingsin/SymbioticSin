import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

import corgi_sniffwalk_1 from '../assets/corgi_sniffwalk/corgi_sniffwalk_1.png';
import corgi_sniffwalk_2 from '../assets/corgi_sniffwalk/corgi_sniffwalk_2.png';
import corgi_sniffwalk_3 from '../assets/corgi_sniffwalk/corgi_sniffwalk_3.png';
import corgi_sniffwalk_4 from '../assets/corgi_sniffwalk/corgi_sniffwalk_4.png';
import corgi_sniffwalk_5 from '../assets/corgi_sniffwalk/corgi_sniffwalk_5.png';
import corgi_sniffwalk_6 from '../assets/corgi_sniffwalk/corgi_sniffwalk_6.png';
import corgi_sniffwalk_7 from '../assets/corgi_sniffwalk/corgi_sniffwalk_7.png';
import corgi_sniffwalk_8 from '../assets/corgi_sniffwalk/corgi_sniffwalk_8.png';
import corgi_sniffwalk_9 from '../assets/corgi_sniffwalk/corgi_sniffwalk_9.png';
import corgi_sniffwalk_10 from '../assets/corgi_sniffwalk/corgi_sniffwalk_10.png';
import corgi_sniffwalk_11 from '../assets/corgi_sniffwalk/corgi_sniffwalk_11.png';
import corgi_sniffwalk_12 from '../assets/corgi_sniffwalk/corgi_sniffwalk_12.png';
import corgi_sniffwalk_13 from '../assets/corgi_sniffwalk/corgi_sniffwalk_13.png';
import corgi_sniffwalk_14 from '../assets/corgi_sniffwalk/corgi_sniffwalk_14.png';
import corgi_sniffwalk_15 from '../assets/corgi_sniffwalk/corgi_sniffwalk_15.png';
import corgi_sniffwalk_16 from '../assets/corgi_sniffwalk/corgi_sniffwalk_16.png';

import Spacer from "./Spacer";

const AnimatedImage = () => {
    const images = [corgi_sniffwalk_1, corgi_sniffwalk_2, corgi_sniffwalk_3, corgi_sniffwalk_4, corgi_sniffwalk_5,
    corgi_sniffwalk_6, corgi_sniffwalk_7, corgi_sniffwalk_8, corgi_sniffwalk_9, corgi_sniffwalk_10, corgi_sniffwalk_11,
    corgi_sniffwalk_12, corgi_sniffwalk_13, corgi_sniffwalk_14, corgi_sniffwalk_15, corgi_sniffwalk_16,];

    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 350);

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
const x = 0.265;
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