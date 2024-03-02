import React from "react";
import { useState } from "react";
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
import { createProposal, getProposal } from "../utils/proposal";
import { voteProposal } from "../utils/vote";

const ProposalCreationScreen = ({ navigation }) => {
  navigation.setOptions({
    headerTitle: "Create Proposal",
  });

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [body, setBody] = React.useState("");
  const [budget, setBudget] = React.useState("");

  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [customCategory, setCustomCategory] = React.useState("");
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
    console.log("Proposal Created:", { title, description, budget });
    (async () => {
      const category = customCategory.length ? customCategory : selectedCategory;
      const proposal = await createProposal({
        title,
        description,
        category,
        body,
        budget,
      });
      const to = proposal.to;
      const fetched = await getProposal(to);
      console.log("created proposal: ", fetched);
    })();
  };

  // const handleVote = () => {
  //   // Implement logic to handle the creation of the proposal
  //   // You may send this data to your backend or use it in the smart contract interactions
  //   console.log("Vote:", { title, description, budget });
  //   (async () => {
  //     await vote({proposalId, inFavor});
  //   })();
  // };

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

      <Text style={styles.label}>Details</Text>
      <TextInput
        style={[styles.input, { height: 220 }]}
        value={body}
        onChangeText={(text) => setBody(text)}
        multiline
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
    backgroundColor: "white",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

export default ProposalCreationScreen;
