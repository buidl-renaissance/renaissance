import React from 'react';
import { StyleSheet, ScrollView, Text, View, Touchable } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { FlatGrid } from 'react-native-super-grid';

// import { HeaderTitleImage } from '../Components/HeaderTitleImage';
import { Button } from '../Components/Button';
import { ArtistCard } from '../Components/ArtistCard';
import { ArtworkCard } from '../Components/ArtworkCard';

import { darkGrey, lightGreen, theme } from '../colors';

const ArtistScreen = ({
    navigation,
    route
}) => {

    const [artist, setArtist] = React.useState(route?.params?.artist ?? null)

    navigation.setOptions({
        headerTitle: () => <Text>{artist.name}</Text>, // <HeaderTitleImage />,
    });

    const handlePressArtwork = React.useCallback(() => {
        navigation.push('Artwork');
    }, []);
    
    const handleShowCamera = React.useCallback(() => {
        navigation.push('Camera');
    }, []);

    return (
        <View style={styles.container}>
            <FlatGrid
                ListHeaderComponent={(
                    <ArtistCard 
                        image={artist.image}
                        name={artist.name}
                        description={artist.description}
                    />
                )}
                contentInset={{ bottom: 32 }}
                itemDimension={130}
                data={[1,2,3,4,5,6]}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={handlePressArtwork}>
                        <ArtworkCard 
                            image={require('../../assets/shingy-1.jpeg')}
                            name={artist.name}
                            description={artist.description}
                        />
                    </TouchableOpacity>
                )}
            />
            <View style={styles.buttonContainer}>
                <Button title="SCAN TO COLLECT" variant='solid' onPress={handleShowCamera} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#d2e4dd',
        flexDirection: 'column',
        borderTopWidth: 1,
        borderColor: theme.border,
    },
    buttonContainer: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 32,
        borderColor: theme.border,
        borderTopWidth: 1,
        // backgroundColor: lightGreen,
        backgroundColor: darkGrey,
    },
});
    
export default ArtistScreen;