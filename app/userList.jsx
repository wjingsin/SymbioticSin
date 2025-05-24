import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import InAppLayout from "../components/InAppLayout";

export default function UserConnectionScreen() {
    // Mock data
    const mockUsers = [
        { id: '1', petName: 'canon', ownerName: 'John' },
        { id: '2', petName: 'can', ownerName: 'Mike' },
    ];

    return (
        <InAppLayout>
            <View style={styles.container}>
                <Text style={styles.headerText}>Online Users</Text>

                {/* Pet Display Area */}
                <View style={styles.petDisplayArea}>
                    <View style={styles.petCircle1} />
                    <View style={styles.petCircle2} />
                    <View style={styles.petCircle3} />
                </View>

                <View style={styles.listContainer}>
                    <Text style={styles.listHeaderText}>List of users (2 online)</Text>

                    <FlatList
                        data={mockUsers}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.userCard}>
                                <View style={styles.avatar} />
                                <View>
                                    <Text style={styles.petName}>{item.petName}</Text>
                                    <Text style={styles.userName}>Owner: {item.ownerName}</Text>
                                    <View style={styles.statusContainer}>
                                        <View style={styles.statusIndicator} />
                                        <Text>Online</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    />
                </View>
            </View>
        </InAppLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        padding: 20,
        paddingTop: 60,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    petDisplayArea: {
        height: 200,
        backgroundColor: '#e0f7e0',
        borderRadius: 10,
        marginBottom: 20,
        position: 'relative',
    },
    petCircle1: {
        width: 60,
        height: 60,
        backgroundColor: '#f9c784',
        borderRadius: 30,
        position: 'absolute',
        bottom: 20,
        left: 30,
    },
    petCircle2: {
        width: 60,
        height: 60,
        backgroundColor: '#f8a978',
        borderRadius: 30,
        position: 'absolute',
        bottom: 40,
        left: 100,
    },
    petCircle3: {
        width: 60,
        height: 60,
        backgroundColor: '#b6b8a6',
        borderRadius: 30,
        position: 'absolute',
        bottom: 20,
        left: 170,
    },
    listContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
    },
    listHeaderText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    userCard: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#ddd',
        marginRight: 15,
    },
    petName: {
        fontSize: 18,
        fontWeight: '600',
    },
    userName: {
        fontSize: 14,
        color: '#666',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'green',
        marginRight: 5,
    },
});
