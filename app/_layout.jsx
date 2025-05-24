import { Slot, Stack, usePathname, Link } from 'expo-router'
import {StyleSheet, Text, useColorScheme, View, Pressable, TouchableOpacity} from 'react-native'
import { ClerkProvider } from '@clerk/clerk-expo'
import { PetProvider } from '../contexts/PetContext';

const RootLayout = () => {
    const pathname = usePathname();

    return (
        <ClerkProvider>
            <PetProvider>
            <View style={{flex: 1}}>
                <Slot />
            </View>
            </PetProvider>
        </ClerkProvider>
    )
}

export default RootLayout

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontWeight: 'bold',
        fontSize: 36
    },
    img: {
        width: 200,
        height: 200,
        margin: 20
    },
    card: {
        backgroundColor: '#eee',
        padding: 20,
        borderRadius: 5,
        boxShadow: '4px 4px rgba(0, 0, 0, 0.1)'
    },
    link: {
        marginVertical: 20
    },
    layoutTop: {
        marginTop: 60,
        alignItems: 'center',
    },
    header: {
        fontSize: 28,
    },
    layoutBottom: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Or 'space-between'
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#ffffff',
    },

    footerButton: {
        padding: 10,
    },

    footerText: {
        fontSize: 28,
        color: 'blue',
    },
})