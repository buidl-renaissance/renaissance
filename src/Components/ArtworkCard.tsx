import React from 'react';
import { StyleSheet, Image, ImageSourcePropType, Text, View, TouchableOpacity } from 'react-native';


interface ArtworkCardProps {
    name: string;
    description: string;
    image: ImageSourcePropType;
}

export const ArtworkCard: React.FC<ArtworkCardProps>= ({
    name,
    description,
    image,
}) => {
  return (
    <View>
        <View style={{ overflow: 'hidden' }}>
            <Image
                source={image}
                style={{
                    height: 120,
                    width: '100%',
                    resizeMode: 'cover',
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
