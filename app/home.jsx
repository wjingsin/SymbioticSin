import {StyleSheet, Text, View, TouchableOpacity, Pressable} from 'react-native'
import React from 'react'
import Corgi from "../components/corgi_animated"
import InAppLayout from "../components/InAppLayout"
import Spacer from "../components/Spacer"
import Pom from "../components/pom_animated"
import Pug from "../components/pug_animated"
import { usePetData } from "../contexts/PetContext"
import {usePathname,Link} from "expo-router";
import {MaterialCommunityIcons} from "@expo/vector-icons";

const PetDisplay = ({ petType }) => {
    switch (petType) {
        case 0: // Corgi
            return <Corgi />;
        case 1: // Pomeranian
            return <Pom />;
        case 2: // Pug
            return <Pug />;
        default:
            return <Corgi />; // Default to Corgi if something goes wrong
    }
};

const Home = () => {
    const { petData, isLoading } = usePetData()
    const pathname = usePathname();

    return (
        <View style={styles.container}>
            {/* Pet Display */}
            <Spacer height={30}/>
            <View style={styles.petContainer}>
                <View style={styles.petNameContainer}>
                    <Text style={styles.petName}>{petData.petName}</Text>
                </View>

                <View style={styles.petDisplayArea}>
                    <View style={styles.petBackground}>
                        <PetDisplay petType={petData.selectedPet} />
                    </View>
                </View>

                {/* Space for pet health, status, energy */}
                <View style={styles.petStatusContainer}>
                    <Text style={styles.statusPlaceholder}>Pet health, status, energy here</Text>
                </View>
            </View>

            {/* Button to navigate to Pet Selection */}
            <Link href="/petSelection" asChild>
                <TouchableOpacity style={styles.petSelectionButton}>
                    <Text style={styles.buttonText}>Customise Pet</Text>
                </TouchableOpacity>
            </Link>

        </View>
    )
}

export default function HomeWrapper() {
    return (
        <InAppLayout>
            <Home />
        </InAppLayout>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingTop: 20,
    },
    petContainer: {
        flex: 1,
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 20,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
        padding: 16,
        justifyContent: 'space-between',
    },
    petNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    petName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    petDisplayArea: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 0,
    },
    petBackground: {
        backgroundColor: '#f9f9f9',
        width: '100%',
        borderRadius: 16,
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#f0f0f0',
        overflow: 'hidden',
    },
    petStatusContainer: {
        padding: 15,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        alignItems: 'center',
        height: '40%'
    },
    statusPlaceholder: {
        fontSize: 16,
        color: '#888',
        fontStyle: 'italic'
    },
    petSelectionButton: {
        backgroundColor: '#eb7d42',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
})
