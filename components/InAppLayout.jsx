import { usePathname, Link } from 'expo-router'
import { StyleSheet, useColorScheme, Pressable } from 'react-native'
import { Colors } from '../constants/Colors'
import ThemedView from "../components/ThemedView";
import {FontAwesome, MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';

const RootLayout = ({ children }) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    const pathname = usePathname();
    const activeColor = '#dc8d51'; // Orange
    const inactiveColor = theme.tabIconDefault || '#cac8c3';

    return (
        <ThemedView style={{ flex: 1 }}>
            {children}

            <ThemedView style={styles.layoutBottom}>
                <Link href="/todo" asChild>
                    <Pressable style={styles.footerItem}>
                        <MaterialCommunityIcons
                            name="format-list-bulleted"
                            size={23}
                            color={pathname === "/todo" ? activeColor : inactiveColor}
                        />
                    </Pressable>
                </Link>

                <Link href="/home" asChild>
                    <Pressable style={styles.footerItem}>
                        <MaterialCommunityIcons
                            name="dog"
                            size={26}
                            color={pathname === "/home" ? activeColor : inactiveColor}
                        />
                    </Pressable>
                </Link>

                <Link href="/userList" asChild>
                    <Pressable style={styles.footerItem}>
                        <MaterialIcons
                            name="groups"
                            size={26}
                            color={pathname === "/userList" ? activeColor : inactiveColor}
                        />
                    </Pressable>
                </Link>
            </ThemedView>
        </ThemedView>
    )
}

export default RootLayout

const styles = StyleSheet.create({
    layoutBottom: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 12,
        paddingBottom: 25,
        backgroundColor: '#fafafa',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    footerItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        flex: 1,
    }
})
