import React from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

const ProposalCreationScreen = () => {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [budget, setBudget] = React.useState("");

  const handleCreateProposal = () => {
    // Implement logic to handle the creation of the proposal
    // You may send this data to your backend or use it in the smart contract interactions
    console.log("Proposal Created:", { title, description, budget });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}> Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={(text) => setTitle(text)}
      />

      <Text style={styles.label}> Description</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={(text) => setDescription(text)}
        multiline
      />

      <Text style={styles.label}> Budget (USD)</Text>
      <TextInput
        style={styles.input}
        value={budget}
        onChangeText={(text) => setBudget(text)}
        keyboardType="numeric"
      />

      <Button title="Create Proposal" onPress={handleCreateProposal} />

      {/* Add additional UI components as needed */}
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
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});

export default ProposalCreationScreen;
