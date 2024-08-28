import React from 'react';
import { StyleSheet, Image, ImageSourcePropType, Text, View, TouchableOpacity } from 'react-native';


interface ArtworkViewProps {
    name: string;
    description: string;
    image: ImageSourcePropType;
}

export const ArtworkView: React.FC<ArtworkViewProps>= ({
    name,
    description,
    image,
}) => {
  return (
    <View>
        <View style={{ padding: 8 }}>
            <View>
                <Text style={styles.title}>{name}</Text>
            </View>
            <View>
                <Text style={styles.subtitle}>{description}</Text>
            </View>
        </View>
        <Image
            source={image}
            style={{
                height: 500,
                width: 'auto',
                // borderRadius: 40,
            }}
        />
    </View>
  );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 24, 
    },
    subtitle: {
        fontSize: 14, 
    },
});

// borderColor: '#ddd', borderWidth: 1, borderRadius: 4,
