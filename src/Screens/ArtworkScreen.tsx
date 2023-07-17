import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { ArtworkView } from '../Components/ArtworkView';
import { Button } from '../Components/Button';
import { HeaderTitleImage } from '../Components/HeaderTitleImage';

import { darkGrey, lightGreen } from '../colors';

const ArtworkScreen = ({
    navigation
}) => {

    navigation.setOptions({
        headerTitle: () => <HeaderTitleImage />,
    });

    const handleShowCamera = React.useCallback(() => {
        navigation.push('Camera');
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView>
                <ArtworkView 
                    image={require('../../assets/shingy-1.jpeg')}
                    name={"SHIИGY POP™"}
                    description={"International AAPI Artist+Designer+Organizer"}
                />
            </ScrollView>
            <View style={styles.buttonContainer}>
                <Button title="SCAN TO COLLECT" variant='solid' onPress={handleShowCamera} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: '#d2e4dd',
        borderColor: '#999',
        borderTopWidth: 1,
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
    
export default ArtworkScreen;