import React from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { ScrollView } from "react-native-gesture-handler";
import { theme } from "../colors";

const ProposalCreationScreen = ({
  navigation
}) => {

  navigation.setOptions({
    headerTitle: "Create Proposal",
  });

  // const [title, setTitle] = React.useState(
  //   "East Side Community Garden Development "
  // );
  // const [description, setDescription] = React.useState(
  //   "Join a group artists from Detroit's east side beautifying their community garden."
  // );
  // const [body, setBody] = React.useState(
  //   "To enhance the beauty and vibrancy of the East Side Community Garden through the installation of a fountain and sculptures, creating an inviting and inspiring space for community members."
  // );
  // const [budget, setBudget] = React.useState("$5,000");
  // const [selectedCategory, setSelectedCategory] =
  //   React.useState("Community Project");
  // const [customCategory, setCustomCategory] = React.useState("");

  const [title, setTitle] = React.useState("Blender for Beginners");
  const [description, setDescription] = React.useState("This Hands on workshop will teach you all you need to know to get started with Blender.");
  const [body, setBody] = React.useState("Join us every Tuesday evening for the month of April. Sessions will last approximately two hours. Snacks will be served.");
  const [budget, setBudget] = React.useState("$250");
  const [selectedCategory, setSelectedCategory] = React.useState("Workshop");
  const [customCategory, setCustomCategory] = React.useState("");

  // East Side Community Garden Development
  // Join a group artists from Detroit's east side beautifying their community garden.
  // To enhance the beauty and vibrancy of the East Side Community Garden through the installation of a fountain and sculptures, creating an inviting and inspiring space for community members.

  const bottomSheetRef = React.useRef<BottomSheet>(null);

  const categories = [
    "Public Art Installation",
    "Workshop",
    "Mural",
    "Exhibition",
    "Community Project",
    "Digital Arts",
    "Street Art Beautification",
    "Cultural Project",
    "Public Music Performance",
    "Photography Project",
    "Arts Festival",
    "Other",
  ];

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    bottomSheetRef.current?.close();
  };

  const handleCustomCategoryChange = (text: string) => {
    setCustomCategory(text);
  };

  const handleCreateProposal = () => {
    // Implement logic to handle the creation of the proposal
    // You may send this data to your backend or use it in the smart contract interactions
    console.log("Proposal Created:", { title, description, budget });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={(text) => setTitle(text)}
      />

      <Text style={styles.label}>Select Category:</Text>
      <TextInput
        value={selectedCategory}
        onTouchStart={() => bottomSheetRef.current?.expand()}
        style={styles.input}
        placeholder="Select category..."
        editable={false}
      />
      {selectedCategory === "Other" && (
        <TextInput
          value={customCategory}
          onChangeText={handleCustomCategoryChange}
          style={styles.input}
          placeholder="Enter custom category..."
        />
      )}

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 120 }]}
        value={description}
        onChangeText={(text) => setDescription(text)}
        multiline
      />

      <Text style={styles.label}>Estimated Budget (USD)</Text>
      <TextInput
        style={styles.input}
        value={budget}
        onChangeText={(text) => setBudget(text)}
        keyboardType="numeric"
      />

      <Button title="Create Proposal" onPress={handleCreateProposal} />

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["25%", "50%"]}
        backgroundComponent={({ style }) => (
          <View style={[style, styles.bottomSheetBackground]} />
        )}
      >
        <ScrollView
          style={styles.bottomSheetContainer}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={styles.bottomSheetItem}
              onPress={() => handleCategoryChange(category)}
            >
              <Text>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: "#999",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  bottomSheetBackground: {
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bottomSheetContainer: {
    backgroundColor: theme.background,
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
});

export default ProposalCreationScreen;
