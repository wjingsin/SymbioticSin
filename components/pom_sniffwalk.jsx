import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

import pom_sniffwalk_1 from '../assets/pom_sniffwalk/pom_sniffwalk_1.png';
import pom_sniffwalk_2 from '../assets/pom_sniffwalk/pom_sniffwalk_2.png';
import pom_sniffwalk_3 from '../assets/pom_sniffwalk/pom_sniffwalk_3.png';
import pom_sniffwalk_4 from '../assets/pom_sniffwalk/pom_sniffwalk_4.png';
import pom_sniffwalk_5 from '../assets/pom_sniffwalk/pom_sniffwalk_5.png';
import pom_sniffwalk_6 from '../assets/pom_sniffwalk/pom_sniffwalk_6.png';
import pom_sniffwalk_7 from '../assets/pom_sniffwalk/pom_sniffwalk_7.png';
import pom_sniffwalk_8 from '../assets/pom_sniffwalk/pom_sniffwalk_8.png';
import pom_sniffwalk_9 from '../assets/pom_sniffwalk/pom_sniffwalk_9.png';
import pom_sniffwalk_10 from '../assets/pom_sniffwalk/pom_sniffwalk_10.png';
import pom_sniffwalk_11 from '../assets/pom_sniffwalk/pom_sniffwalk_11.png';
import pom_sniffwalk_12 from '../assets/pom_sniffwalk/pom_sniffwalk_12.png';
import pom_sniffwalk_13 from '../assets/pom_sniffwalk/pom_sniffwalk_13.png';
import pom_sniffwalk_14 from '../assets/pom_sniffwalk/pom_sniffwalk_14.png';
import pom_sniffwalk_15 from '../assets/pom_sniffwalk/pom_sniffwalk_15.png';
import pom_sniffwalk_16 from '../assets/pom_sniffwalk/pom_sniffwalk_16.png';

import Spacer from "./Spacer";

const AnimatedImage = () => {
    const images = [pom_sniffwalk_1, pom_sniffwalk_2, pom_sniffwalk_3, pom_sniffwalk_4, pom_sniffwalk_5,
    pom_sniffwalk_6, pom_sniffwalk_7, pom_sniffwalk_8, pom_sniffwalk_9, pom_sniffwalk_10, pom_sniffwalk_11,
    pom_sniffwalk_12, pom_sniffwalk_13, pom_sniffwalk_14, pom_sniffwalk_15, pom_sniffwalk_16];

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