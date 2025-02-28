import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Appbar, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNavigationContainerRef, NavigationProp, useNavigation } from '@react-navigation/native';

type RootStackParamList = {
    Home: undefined;
    Login: undefined;
    Feedback: undefined;
    // Add other screens here
};

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const navigationRef = createNavigationContainerRef();


    // Check authentication status when component mounts
    useEffect(() => {
        // Replace this with your actual authentication check
        const checkAuthStatus = async () => {
            try {
                const token = await AsyncStorage.getItem('token'); // or your auth token
                setIsLoggedIn(!!token);
            } catch (error) {
                console.error('Error checking auth status:', error);
            }
        };

        checkAuthStatus();
    }, []);

    const handleLogout = async () => {
        try {
            // Add your logout logic here
            await AsyncStorage.removeItem('token');
            setIsLoggedIn(false);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };


    const navigateTo = (name: any) => {
        if (navigationRef.isReady()) {
            console.log(":::::::", name)
            // Perform navigation if the react navigation is ready to handle actions
            navigationRef.navigate(name as never);
        } else {
            // You can decide what to do if react navigation is not ready
            // You can ignore this, or add these actions to a queue you can call later
        }
    }

    return (
        <Appbar.Header style={styles.navbar}>
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={() => navigateTo('Home')}
                    style={styles.logoContainer}
                >
                    <Text style={styles.logoText}>My-Hospital</Text>
                </TouchableOpacity>

                <View style={styles.navLinks}>
                    <Button
                        mode="text"
                        textColor="white"
                        onPress={() => navigateTo('Home')}
                        style={styles.navButton}
                    >
                        Home
                    </Button>

                    {isLoggedIn ? (
                        <>
                            <Button
                                mode="text"
                                textColor="white"
                                onPress={() => navigateTo('Feedback')}
                                style={styles.navButton}
                            >
                                Your Feedback
                            </Button>
                            <Button
                                mode="text"
                                textColor="white"
                                onPress={handleLogout}
                                style={styles.navButton}
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                mode="text"
                                textColor="white"
                                style={[styles.navButton, styles.disabledButton]}
                                disabled={true}
                            >
                                Feedback
                            </Button>
                            <Button
                                mode="text"
                                textColor="white"
                                onPress={() => navigateTo('Login')}
                                style={styles.navButton}
                            >
                                Login/Register
                            </Button>
                        </>
                    )}
                </View>
            </View>
        </Appbar.Header>
    );
};

const styles = StyleSheet.create({
    navbar: {
        backgroundColor: 'black',
        elevation: 4,
        height: 64,
        justifyContent: 'center',
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 16,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2563eb', // blue-600
    },
    navLinks: {
        flexDirection: 'row',
    },
    navButton: {
        borderRadius: 4,
        marginHorizontal: 4,
    },
    disabledButton: {
        opacity: 0.6,
    },
});

export default Navbar;