import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

import corgi_walk_1 from '../assets/corgi_walk/corgi_walk_1.png';
import corgi_walk_2 from '../assets/corgi_walk/corgi_walk_2.png';
import corgi_walk_3 from '../assets/corgi_walk/corgi_walk_3.png';
import corgi_walk_4 from '../assets/corgi_walk/corgi_walk_4.png';
import corgi_walk_5 from '../assets/corgi_walk/corgi_walk_5.png';
import corgi_walk_6 from '../assets/corgi_walk/corgi_walk_6.png';
import corgi_walk_7 from '../assets/corgi_walk/corgi_walk_7.png';
import corgi_walk_8 from '../assets/corgi_walk/corgi_walk_8.png';
import corgi_walk_9 from '../assets/corgi_walk/corgi_walk_9.png';
import corgi_walk_10 from '../assets/corgi_walk/corgi_walk_10.png';
import corgi_walk_11 from '../assets/corgi_walk/corgi_walk_11.png';
import corgi_walk_12 from '../assets/corgi_walk/corgi_walk_12.png';
import corgi_walk_13 from '../assets/corgi_walk/corgi_walk_13.png';
import corgi_walk_14 from '../assets/corgi_walk/corgi_walk_14.png';
import corgi_walk_15 from '../assets/corgi_walk/corgi_walk_15.png';
import corgi_walk_16 from '../assets/corgi_walk/corgi_walk_16.png';
import corgi_walk_17 from '../assets/corgi_walk/corgi_walk_17.png';
import corgi_walk_18 from '../assets/corgi_walk/corgi_walk_18.png';
import corgi_walk_19 from '../assets/corgi_walk/corgi_walk_19.png';
import corgi_walk_20 from '../assets/corgi_walk/corgi_walk_20.png';

import corgi_walk_21 from '../assets/corgi_walk/corgi_reverse_walk/corgi_walk_1.png';
import corgi_walk_22 from '../assets/corgi_walk/corgi_reverse_walk/corgi_walk_2.png';
import corgi_walk_23 from '../assets/corgi_walk/corgi_reverse_walk/corgi_walk_3.png';
import corgi_walk_24 from '../assets/corgi_walk/corgi_reverse_walk/corgi_walk_4.png';
import corgi_walk_25 from '../assets/corgi_walk/corgi_reverse_walk/corgi_walk_5.png';
import corgi_walk_26 from '../assets/corgi_walk/corgi_reverse_walk/corgi_walk_6.png';
import corgi_walk_27 from '../assets/corgi_walk/corgi_reverse_walk/corgi_walk_7.png';
import corgi_walk_28 from '../assets/corgi_walk/corgi_reverse_walk/corgi_walk_8.png';
import corgi_walk_29 from '../assets/corgi_walk/corgi_reverse_walk/corgi_walk_9.png';
import corgi_walk_30 from '../assets/corgi_walk/corgi_reverse_walk/corgi_walk_10.png';
import corgi_walk_31 from '../assets/corgi_walk/corgi_reverse_walk/corgi_walk_11.png';
import corgi_walk_32 from '../assets/corgi_walk/corgi_reverse_walk/corgi_walk_12.png';
import corgi_walk_33 from '../assets/corgi_walk/corgi_reverse_walk/corgi_walk_13.png';
import corgi_walk_34 from '../assets/corgi_walk/corgi_reverse_walk/corgi_walk_14.png';
import corgi_walk_35 from '../assets/corgi_walk/corgi_reverse_walk/corgi_walk_15.png';
import corgi_walk_36 from '../assets/corgi_walk/corgi_reverse_walk/corgi_walk_16.png';
import corgi_walk_37 from '../assets/corgi_walk/corgi_reverse_walk/corgi_walk_17.png';
import corgi_walk_38 from '../assets/corgi_walk/corgi_reverse_walk/corgi_walk_18.png';
import corgi_walk_39 from '../assets/corgi_walk/corgi_reverse_walk/corgi_walk_19.png';
import corgi_walk_40 from '../assets/corgi_walk/corgi_reverse_walk/corgi_walk_20.png';


import Spacer from "./Spacer";

const AnimatedImage = () => {
    const images = [corgi_walk_1, corgi_walk_2, corgi_walk_3, corgi_walk_4, corgi_walk_5, corgi_walk_6, corgi_walk_7,
    corgi_walk_8, corgi_walk_9, corgi_walk_10, corgi_walk_11, corgi_walk_12, corgi_walk_13, corgi_walk_14, corgi_walk_15,
    corgi_walk_16, corgi_walk_17, corgi_walk_18, corgi_walk_19, corgi_walk_20, corgi_walk_21, corgi_walk_22, corgi_walk_23,
    corgi_walk_24, corgi_walk_25, corgi_walk_26, corgi_walk_27, corgi_walk_28, corgi_walk_29, corgi_walk_30, corgi_walk_31,
    corgi_walk_32, corgi_walk_33, corgi_walk_34, corgi_walk_35, corgi_walk_36, corgi_walk_37, corgi_walk_38, corgi_walk_39,
    corgi_walk_40,];

    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 150);

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