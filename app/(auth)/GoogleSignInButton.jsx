import React from 'react'
import * as WebBrowser from 'expo-web-browser'
import { Alert, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useOAuth } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import { AntDesign } from "@expo/vector-icons"

// Browser warm-up hook
export const useWarmUpBrowser = () => {
    React.useEffect(() => {
        void WebBrowser.warmUpAsync()
        return () => {
            void WebBrowser.coolDownAsync()
        }
    }, [])
}

WebBrowser.maybeCompleteAuthSession()

export default function GoogleSignInButton() {
    useWarmUpBrowser()

    const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" })
    const router = useRouter()

    const onGoogleSignIn = React.useCallback(async () => {
        try {
            // Remove the redirectUrl to let Clerk handle the flow naturally
            const { createdSessionId, setActive, signIn, signUp } = await startOAuthFlow()

            if (createdSessionId) {
                await setActive({ session: createdSessionId })

                // Log the objects to see what we get
                console.log("signUp object:", signUp)
                console.log("signIn object:", signIn)

                // Check if this was a sign-up (new user)
                if (signUp && signUp.status === 'complete') {
                    console.log("New user detected via signUp - redirecting to pet selection")
                    router.replace('/petSelection')
                }
                // Check if this was a sign-in (existing user)
                else if (signIn && signIn.status === 'complete') {
                    console.log("Existing user detected via signIn - checking onboarding status")

                    // For existing users, check if they've completed onboarding
                    // We'll need to get the user data after setActive
                    setTimeout(() => {
                        // Check user metadata for onboarding completion
                        // This will be handled by checking the user object after session is set
                        router.replace('/afterAugment') // Default for existing users
                    }, 100)
                }
                else {
                    // Handle incomplete authentication
                    console.log("Authentication incomplete, defaulting to pet selection")
                    router.replace('/petSelection')
                }
            } else {
                Alert.alert("Login Failed", "Unable to create a session.")
            }
        } catch (err) {
            console.error("OAuth Error:", JSON.stringify(err, null, 2))
            Alert.alert("Error", "An error occurred during Google sign in.")
        }
    }, [router])

    return (
        <TouchableOpacity style={styles.googleButton} onPress={onGoogleSignIn}>
            <AntDesign name="google" size={20} color="#528dd3" style={{ marginRight: 8 }} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    googleButton: {
        backgroundColor: '#ffffff',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#538ed5',
    },
    googleButtonText: {
        color: '#528dd3',
        fontSize: 16,
    },
})
