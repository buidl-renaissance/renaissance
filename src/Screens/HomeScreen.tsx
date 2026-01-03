import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { Button } from '../Components/Button';
import { HeaderTitleImage } from '../Components/HeaderTitleImage';
import { LocationCard } from '../Components/LocationCard';

import { darkGrey, lightGreen, theme } from '../colors';

const HomeScreen = ({
    navigation
}) => {

    const [event, setEvent] = React.useState(null);
    
    React.useEffect(() => {
        (async () => {
            const eventsRes = await fetch('https://detroitartdao.com/wp-json/tribe/events/v1/events/123');
            const event = await eventsRes.json();
            // console.log("event: ", event)
            setEvent(event);
        })();
    }, []);

    navigation.setOptions({
        headerTitle: () => <HeaderTitleImage />,
    });

    const handleGetStarted = React.useCallback(() => {
        navigation.push('Collect', {
            event,
        });
    }, [ event ]);

    const handleShowCalendar = React.useCallback(() => {
        navigation.push('Calendar');
        // navigation.push('Map');
    }, []);

    const handleShowCamera = React.useCallback(() => {
        navigation.push('Camera');
    }, []);

    return (
        <View style={styles.container}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {/* <Text>Next Event</Text> */}
                <TouchableOpacity onPress={handleGetStarted}>
                    <LocationCard />
                </TouchableOpacity>
                <Button title="START COLLECTING" onPress={handleGetStarted} />
            </View>
            <View style={styles.buttonContainer}>
                <Button title="VIEW CALENDAR" onPress={handleShowCalendar} />
                <Button title="SCAN TO COLLECT" onPress={handleShowCamera} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
        borderColor: theme.border,
        borderTopWidth: 1,
    },
    buttonContainer: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 32,
        borderColor: theme.border,
        borderTopWidth: 1,
    },
});
    
export default HomeScreen;