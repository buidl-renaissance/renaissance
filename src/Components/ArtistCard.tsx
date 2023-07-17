import React from 'react';
import { StyleSheet, Image, ImageSourcePropType, Text, View, TouchableOpacity } from 'react-native';

const CollectionCard = ({
    onPress
}) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={{ margin: 2, width: 44, height: 44, borderRadius: 4, borderColor: '#999', borderWidth: 1, backgroundColor: '#fff', alignContent: 'center', justifyContent: 'center' }}>
                <Text style={{ textAlign: 'center' }}>?</Text>
            </View>
        </TouchableOpacity>
    );
}

interface ArtistCardProps {
    name: string;
    description: string;
    image: ImageSourcePropType;
    onPress?: any;
    onArtworkCollectionPress?: any;
    showCollection?: boolean;
}

export const ArtistCard: React.FC<ArtistCardProps>= ({
    name,
    description,
    image,
    showCollection,
    onPress,
    onArtworkCollectionPress,
}) => {
  return (
    <View style={{ flexDirection: "column", alignItems: 'center', padding: 12, paddingVertical: 24 }}>
        <TouchableOpacity style={{ alignItems: 'center' }} onPress={onPress}>
            <Image
                source={image}
                style={{
                    resizeMode: 'contain',
                    height: 80,
                    width: 80,
                    borderRadius: 40,
                }}
            />
            <View style={{ padding: 8 }}>
                <View>
                    <Text style={styles.title}>{name}</Text>
                </View>
                <View>
                    <Text style={styles.subtitle}>{description}</Text>
                </View>
            </View>
        </TouchableOpacity>
        {showCollection && (
            <View style={styles.collection}>
                <CollectionCard onPress={onArtworkCollectionPress} />
                <CollectionCard onPress={onArtworkCollectionPress} />
                <CollectionCard onPress={onArtworkCollectionPress} />
                <CollectionCard onPress={onArtworkCollectionPress} />
                <CollectionCard onPress={onArtworkCollectionPress} />
            </View>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 24, 
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14, 
        textAlign: 'center',
    },
    collection: {
        flexDirection: 'row',
        gap: 4,
    }
});

// borderColor: '#ddd', borderWidth: 1, borderRadius: 4,
