import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

import corgi_sniffing_1 from '../assets/pom_sniff_grass/pom_sniff_1.png';
import corgi_sniffing_2 from '../assets/pom_sniff_grass/pom_sniff_2.png';
import corgi_sniffing_3 from '../assets/pom_sniff_grass/pom_sniff_3.png';
import corgi_sniffing_4 from '../assets/pom_sniff_grass/pom_sniff_4.png';
import corgi_sniffing_5 from '../assets/pom_sniff_grass/pom_sniff_5.png';
import corgi_sniffing_6 from '../assets/pom_sniff_grass/pom_sniff_6.png';
import corgi_sniffing_7 from '../assets/pom_sniff_grass/pom_sniff_7.png';
import corgi_sniffing_8 from '../assets/pom_sniff_grass/pom_sniff_8.png';


import Spacer from "./Spacer";

const AnimatedImage = () => {
    const images = [corgi_sniffing_1, corgi_sniffing_2, corgi_sniffing_3, corgi_sniffing_4, corgi_sniffing_5,
        corgi_sniffing_6, corgi_sniffing_7, corgi_sniffing_8,];

    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 250);

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
        opacity: 0.6
    },
});