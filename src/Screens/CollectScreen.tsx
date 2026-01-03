import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { HeaderTitleImage } from '../Components/HeaderTitleImage';
import { ArtistCard } from '../Components/ArtistCard';
import { Button } from '../Components/Button';
import { EventCard } from '../Components/EventCard';
// import { RenderHTML } from '../Components/RenderHTML';
import { darkGrey, lightGreen, theme } from '../colors';

const ScavengerHunt = () => {
    return (
        <View style={{ padding: 8 }}>
            <Text style={{ fontSize: 24 }}>Discover Art at Hunt Street Station</Text>
            <View style={{ paddingVertical: 12, paddingTop: 4, borderColor: '#999', borderBottomWidth: 1 }}>
                <Text style={{ marginBottom: 0 }}>
                    During this "Evening of Arts" at Hunt Street Station, we encourage you to have conversations with the artists.
                </Text>
            </View>
        </View>
    )
}

const CollectScreen = ({
    navigation,
    route,
}) => {

    const [event,] = React.useState(route?.params?.event ?? null)

    navigation.setOptions({
        headerTitle: () => <HeaderTitleImage />,
    });

    const handlePressArtist = React.useCallback((artist) => {
        navigation.push('Artist', { artist });
    }, []);

    const handlePressArtworkCollection = React.useCallback(() => {
        navigation.push('Artwork');
    }, []);

    const handleShowCamera = React.useCallback(() => {
        navigation.push('Camera');
    }, []);

    if (!event) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={{ textAlign: 'center', fontSize: 24 }}>An Error Occured</Text>
                </View>
            </View>
        )
    }

    const artists = [{
        image: require('../../assets/shingypop.jpeg'),
        name: "SHIИGY POP™",
        description: "International AAPI Artist+Designer+Organizer",
    },
    {
        image: require('../../assets/mazysuzan.jpeg'),
        name: "mazysuzan",
        description: "Tangling shapes & squiggling mazes; juggling, giggling, & scribbling phrases",
    },
    {
        image: require('../../assets/marty.jpeg'),
        name: "martyna_alexander",
        description: "Painter and designer living in Detroit.",
    },
    {
        image: require('../../assets/lurkanddestroy.jpeg'),
        name: "lurkanddestroy",
        description: "Illustrator, Painter, Printmaker, muralist. Detroit, MI",
    },
    {
        image: require('../../assets/keith.jpeg'),
        name: "keithbynum_",
        description: "Builder/designer/artist, HGTV @bargainblock, Affordable housing advocate",
    },
    {
        image: require('../../assets/meara.jpeg'),
        name: "mearkittyart",
        description: "VIBRANCY for the heart / mind / soul, @mearkittty, michigan based ~",
    },
    {
        image: require('../../assets/allison107.jpeg'),
        name: "allison107",
        description: '"The idea is not to live forever. It is to create something that will." -Andy Warhol, founder of: @10_7apparel, 1/4 of: @yoursimsters',
    },
    {
        image: require('../../assets/daniel.ribar.jpeg'),
        name: "daniel.ribar",
        description: 'Photographer, Detroit',
    }, {
        image: require('../../assets/amy.jpeg'),
        name: "amy",
        description: '@KXPRMT',
    }];

    return (
        <View style={styles.container}>
            <ScrollView>
                {/* <EventCard event={event} /> */}
                <ScavengerHunt />
                <View style={{ padding: 8 }}>
                    <Text style={{ marginBottom: 6 }}>
                        Collect "Relics" to win prizes at the end of the evening!
                    </Text>
                </View>
                {artists.map((artist) => 
                    <ArtistCard
                        image={artist.image}
                        name={artist.name}
                        description={artist.description}
                        onPress={() => handlePressArtist(artist)}
                        showCollection={true}
                        onArtworkCollectionPress={handlePressArtworkCollection}
                    />
                )}
                {/* <ArtistCard
                    image={require('../../assets/mazysuzan.jpeg')}
                    name={"mazysuzan"}
                    description={"Tangling shapes & squiggling mazes; juggling, giggling, & scribbling phrases"}
                    onPress={handlePressArtist}
                    showCollection={true}
                    onArtworkCollectionPress={handlePressArtworkCollection}
                />
                <ArtistCard
                    image={require('../../assets/marty.jpeg')}
                    name={"martyna_alexander"}
                    description={"Painter and designer living in Detroit."}
                    onPress={handlePressArtist}
                    showCollection={true}
                    onArtworkCollectionPress={handlePressArtworkCollection}
                />
                <ArtistCard
                    image={require('../../assets/lurkanddestroy.jpeg')}
                    name={"lurkanddestroy"}
                    description={"Illustrator, Painter, Printmaker, muralist. Detroit, MI"}
                    onPress={handlePressArtist}
                    showCollection={true}
                    onArtworkCollectionPress={handlePressArtworkCollection}
                />
                <ArtistCard
                    image={require('../../assets/keith.jpeg')}
                    name={"keithbynum_"}
                    description={"Builder/designer/artist, HGTV @bargainblock, Affordable housing advocate"}
                    onPress={handlePressArtist}
                    showCollection={true}
                    onArtworkCollectionPress={handlePressArtworkCollection}
                />
                <ArtistCard
                    image={require('../../assets/meara.jpeg')}
                    name={"mearkittyart"}
                    description={"VIBRANCY for the heart / mind / soul, @mearkittty, michigan based ~"}
                    onPress={handlePressArtist}
                    showCollection={true}
                    onArtworkCollectionPress={handlePressArtworkCollection}
                />
                <ArtistCard
                    image={require('../../assets/allison107.jpeg')}
                    name={"allison107"}
                    description={'"The idea is not to live forever. It is to create something that will." -Andy Warhol, founder of: @10_7apparel, 1/4 of: @yoursimsters'}
                    onPress={handlePressArtist}
                    showCollection={true}
                    onArtworkCollectionPress={handlePressArtworkCollection}
                />
                <ArtistCard
                    image={require('../../assets/daniel.ribar.jpeg')}
                    name={"daniel.ribar"}
                    description={'Photographer, Detroit'}
                    onPress={handlePressArtist}
                    showCollection={true}
                    onArtworkCollectionPress={handlePressArtworkCollection}
                />
                <ArtistCard
                    image={require('../../assets/amy.jpeg')}
                    name={"amy"}
                    description={'@KXPRMT'}
                    onPress={handlePressArtist}
                    showCollection={true}
                    onArtworkCollectionPress={handlePressArtworkCollection}
                /> */}
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
        backgroundColor: '#d2e4dd',
        flexDirection: 'column',
        borderColor: theme.border,
        borderTopWidth: 1,
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
    errorContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    }
});

export default CollectScreen;