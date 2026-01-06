import React, { useState, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { BookmarksContent } from "../Components/BookmarksContent";
import { theme } from "../colors";

interface BookmarksScreenProps {
  navigation: any;
  route: any;
}

const BookmarksScreen: React.FC<BookmarksScreenProps> = ({ navigation, route }) => {
  const [isScreenFocused, setIsScreenFocused] = useState(false);

  // Set header options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Bookmarked Events",
    });
  }, [navigation]);

  // Track screen focus for data loading
  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => {
        setIsScreenFocused(false);
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <BookmarksContent
        navigation={navigation}
        isVisible={isScreenFocused}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
});

export default BookmarksScreen;
