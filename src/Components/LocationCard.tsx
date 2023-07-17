import React from 'react';
import { StyleSheet, Image, Text, View } from 'react-native';

export const LocationCard = () => {
  return (
    <View style={{ flexDirection: "column", alignItems: 'center' }}>
        <Image
            source={require('../../assets/hunt-street-station.png')}
            style={{
                resizeMode: 'contain',
                height: 240,
            }}
        />
        <View style={{ padding: 8 }}>
            <View>
                <Text style={styles.title}>Evening of Arts</Text>
            </View>
            <View>
                <Text style={styles.subtitle}>at Hunt Street Station</Text>
            </View>
            <View style={{ padding: 8 }}>
                <Text style={{ marginBottom: 32, textAlign: 'center' }}>September 30 @ 5:30 pm - 9:00 pm</Text>
                <Text style={{ marginBottom: 8, textAlign: 'center' }}>5 course dinner at 5:30pm, for dinner ticket holders.</Text>
                {/* <Text style={{ marginBottom: 8, textAlign: 'center' }}>Plated 5 course dinner by Amy Hang at 5:30pm. Limited seating is available for the dinner.</Text> */}
                <Text style={{ textAlign: 'center' }}>Evening of Arts viewing to begin at 7pm.</Text>
            </View>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 32, 
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18, 
        textAlign: 'center',
    },
});

// borderColor: '#ddd', borderWidth: 1, borderRadius: 4,
