import React from 'react';
import { StyleSheet, Image, Text, View } from 'react-native';


interface ArtworkCardProps {
    name: string;
    description: string;
    image: string;
}

export const ArtworkCard: React.FC<ArtworkCardProps>= ({
    name,
    description,
    image,
}) => {
  return (
    <View style={{ width: 150 }}>
        <View style={{ overflow: 'hidden' }}>
            <Image
                source={{ uri: image }}
                style={{
                    height: 150,
                    width: 150,
                    resizeMode: 'cover',
                    borderRadius: 4,
                }}
            />
        </View>
        <View style={{ paddingVertical: 8 }}>
            <View>
                <Text style={styles.title} numberOfLines={2}>{name}</Text>
            </View>
            <View>
                <Text style={styles.subtitle} numberOfLines={2}>{description}</Text>
            </View>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 16, 
    },
    subtitle: {
        fontSize: 10,
    },
});

// borderColor: '#ddd', borderWidth: 1, borderRadius: 4,
