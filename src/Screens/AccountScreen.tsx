import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { darkGrey } from '../colors';

const AccountScreen = ({
    navigation,
    route
}) => {
    return (
        <View style={styles.container}>
            <Text>Enter a username</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#d2e4dd',
        flexDirection: 'column',
        borderTopWidth: 1,
        borderColor: '#999',
    },
    buttonContainer: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 32,
        borderColor: '#999',
        borderTopWidth: 1,
        // backgroundColor: lightGreen,
        backgroundColor: darkGrey,
    },
});
    
export default AccountScreen;