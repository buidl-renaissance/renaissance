import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { HeaderTitleImage } from '../Components/HeaderTitleImage';
import { EventCard } from '../Components/EventCard';
// import { RenderHTML } from '../Components/RenderHTML';
import { darkGrey, lightGreen } from '../colors';
import { Chat } from '../Components/Chat';

const ChatScreen = ({
    navigation,
    route,
}) => {

    const [event,] = React.useState(route?.params?.event ?? null)

    navigation.setOptions({
        headerTitle: () => <HeaderTitleImage />,
    });

    return (
        <View style={styles.container}>
            <Chat />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#d2e4dd',
        flexDirection: 'column',
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
    errorContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    }
});

export default ChatScreen;