import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

import pom_walk_1 from '../assets/pom_walk/pom_walk_1.png';
import pom_walk_2 from '../assets/pom_walk/pom_walk_2.png';
import pom_walk_3 from '../assets/pom_walk/pom_walk_3.png';
import pom_walk_4 from '../assets/pom_walk/pom_walk_4.png';
import pom_walk_5 from '../assets/pom_walk/pom_walk_5.png';
import pom_walk_6 from '../assets/pom_walk/pom_walk_6.png';
import pom_walk_7 from '../assets/pom_walk/pom_walk_7.png';
import pom_walk_8 from '../assets/pom_walk/pom_walk_8.png';
import pom_walk_9 from '../assets/pom_walk/pom_walk_9.png';
import pom_walk_10 from '../assets/pom_walk/pom_walk_10.png';
import pom_walk_11 from '../assets/pom_walk/pom_walk_11.png';
import pom_walk_12 from '../assets/pom_walk/pom_walk_12.png';
import pom_walk_13 from '../assets/pom_walk/pom_walk_13.png';
import pom_walk_14 from '../assets/pom_walk/pom_walk_14.png';
import pom_walk_15 from '../assets/pom_walk/pom_walk_15.png';
import pom_walk_16 from '../assets/pom_walk/pom_walk_16.png';
import pom_walk_17 from '../assets/pom_walk/pom_walk_17.png';
import pom_walk_18 from '../assets/pom_walk/pom_walk_18.png';
import pom_walk_19 from '../assets/pom_walk/pom_walk_19.png';
import pom_walk_20 from '../assets/pom_walk/pom_walk_20.png';
import pom_walk_21 from '../assets/pom_walk/pom_walk_21.png';
import pom_walk_22 from '../assets/pom_walk/pom_walk_22.png';
import pom_walk_23 from '../assets/pom_walk/pom_walk_23.png';
import pom_walk_24 from '../assets/pom_reverse_walk/pom_walk_1.png'
import pom_walk_25 from '../assets/pom_reverse_walk/pom_walk_2.png'
import pom_walk_26 from '../assets/pom_reverse_walk/pom_walk_3.png'
import pom_walk_27 from '../assets/pom_reverse_walk/pom_walk_4.png'
import pom_walk_28 from '../assets/pom_reverse_walk/pom_walk_5.png'
import pom_walk_29 from '../assets/pom_reverse_walk/pom_walk_6.png'
import pom_walk_30 from '../assets/pom_reverse_walk/pom_walk_7.png'
import pom_walk_31 from '../assets/pom_reverse_walk/pom_walk_8.png'
import pom_walk_32 from '../assets/pom_reverse_walk/pom_walk_9.png'
import pom_walk_33 from '../assets/pom_reverse_walk/pom_walk_10.png'
import pom_walk_34 from '../assets/pom_reverse_walk/pom_walk_11.png'
import pom_walk_35 from '../assets/pom_reverse_walk/pom_walk_12.png'
import pom_walk_36 from '../assets/pom_reverse_walk/pom_walk_13.png'
import pom_walk_37 from '../assets/pom_reverse_walk/pom_walk_14.png'
import pom_walk_38 from '../assets/pom_reverse_walk/pom_walk_15.png'
import pom_walk_39 from '../assets/pom_reverse_walk/pom_walk_16.png'
import pom_walk_40 from '../assets/pom_reverse_walk/pom_walk_17.png'
import pom_walk_41 from '../assets/pom_reverse_walk/pom_walk_18.png'
import pom_walk_42 from '../assets/pom_reverse_walk/pom_walk_19.png'
import pom_walk_43 from '../assets/pom_reverse_walk/pom_walk_20.png'
import pom_walk_44 from '../assets/pom_reverse_walk/pom_walk_21.png'
import pom_walk_45 from '../assets/pom_reverse_walk/pom_walk_22.png'
import pom_walk_46 from '../assets/pom_reverse_walk/pom_walk_23.png'





import Spacer from "./Spacer";

const AnimatedImage = () => {
    const images = [pom_walk_1, pom_walk_2, pom_walk_3, pom_walk_4, pom_walk_5, pom_walk_6, pom_walk_7,
    pom_walk_8, pom_walk_9, pom_walk_10, pom_walk_11, pom_walk_12, pom_walk_13, pom_walk_14, pom_walk_15, pom_walk_16, pom_walk_17, pom_walk_18,
    pom_walk_19, pom_walk_20, pom_walk_21, pom_walk_22, pom_walk_23, pom_walk_24, pom_walk_25,
    pom_walk_26, pom_walk_27, pom_walk_28, pom_walk_29, pom_walk_30, pom_walk_31, pom_walk_32,
    pom_walk_33, pom_walk_34, pom_walk_35, pom_walk_36, pom_walk_37, pom_walk_38, pom_walk_39,
    pom_walk_40, pom_walk_41, pom_walk_42,  pom_walk_43, pom_walk_44, pom_walk_45, pom_walk_46];

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