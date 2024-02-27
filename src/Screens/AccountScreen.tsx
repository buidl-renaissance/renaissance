import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import { Chip, Text } from "react-native-paper";

interface UserProfile {
  name: string;
  bio: string;
  portfolio: string;
  attributions: string[];
}

interface AccountScreenProps {
  onSave: (profile: UserProfile) => void;
}

const AccountScreen: React.FC<AccountScreenProps> = ({ onSave }) => {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [selectedAttributions, setSelectedAttributions] = useState<string[]>(
    []
  );

  const handleSave = () => {
    const profile: UserProfile = {
      name,
      bio,
      portfolio,
      attributions: selectedAttributions,
    };
    onSave(profile);

    // Optionally, reset the form fields after saving
    setName("");
    setBio("");
    setPortfolio("");
    setSelectedAttributions([]);
  };

  const handleAddAttribution = (attribution: string) => {
    setSelectedAttributions([...selectedAttributions, attribution]);
  };

  const handleRemoveAttribution = (attribution: string) => {
    const updatedAttributions = selectedAttributions.filter(
      (item) => item !== attribution
    );
    setSelectedAttributions(updatedAttributions);
  };

  return (
    <View style={styles.container}>

      <Text style={styles.label}>Name</Text>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={(text) => setName(text)}
        style={styles.input}
      />

      <Text style={styles.label}>Name</Text>
      <TextInput
        placeholder="Bio"
        value={bio}
        onChangeText={(text) => setBio(text)}
        multiline
        style={styles.input}
      />

      <Text style={styles.label}>Portfolio Link</Text>
      <TextInput
        placeholder="Portfolio Link"
        value={portfolio}
        onChangeText={(text) => setPortfolio(text)}
        style={styles.input}
      />

      <Text style={styles.label}>Attributions</Text>
      <View style={styles.chipsContainer}>
        {selectedAttributions.map((attribution) => (
          <Chip
            key={attribution}
            mode="outlined"
            onClose={() => handleRemoveAttribution(attribution)}
            style={styles.chip}
          >
            {attribution}
          </Chip>
        ))}
      </View>

      <Button title="Save Profile" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  chip: {
    margin: 4,
  },
});

export default AccountScreen;
