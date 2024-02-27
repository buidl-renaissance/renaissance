import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import { Chip, Text } from "react-native-paper";
import SearchableDropdown from "react-native-searchable-dropdown";
import { skillsList } from '../mocks/skills';


// const artistAttributes = [
//   { id: 1, name: 'Username', value: 'username' },
//   { id: 2, name: 'Full Name', value: 'fullName' },
//   { id: 3, name: 'Email', value: 'email' },
//   { id: 4, name: 'Bio', value: 'bio' },
//   { id: 5, name: 'Artistic Medium', value: 'artisticMedium' },
//   { id: 6, name: 'Art Style', value: 'artStyle' },
//   { id: 7, name: 'Portfolio URL', value: 'portfolioURL' },
//   { id: 8, name: 'Social Media Links', value: 'socialMediaLinks' },
//   { id: 9, name: 'Location', value: 'location' },
//   { id: 10, name: 'Skills', value: 'skills' },
//   { id: 11, name: 'Availability', value: 'availability' },
//   { id: 12, name: 'Education', value: 'education' },
//   // Add more attributes as needed
// ];

interface UserAttribution {
  id: number;
  name: string;
  value: string;
}

interface UserProfile {
  name: string;
  bio: string;
  portfolio: string;
  attributions: UserAttribution[];
}

interface AccountScreenProps {
  onSave: (profile: UserProfile) => void;
}

const AccountScreen: React.FC<AccountScreenProps> = ({ onSave }) => {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [selectedAttributions, setSelectedAttributions] = useState<UserAttribution[]>(
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

  const handleAddAttribution = (attribution: UserAttribution) => {
    setSelectedAttributions([...selectedAttributions, attribution]);
  };

  const handleRemoveAttribution = (attribution: UserAttribution) => {
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

      <Text style={styles.label}>Bio</Text>
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
        {selectedAttributions.map((attribution: UserAttribution) => (
          <Chip
            key={attribution.value}
            mode="outlined"
            onClose={() => handleRemoveAttribution(attribution)}
            style={styles.chip}
          >
            {attribution.name}
          </Chip>
        ))}
      </View>
      <SearchableDropdown
        onTextChange={(text) => console.log(text)} // Handle search input
        onItemSelect={handleAddAttribution}
        containerStyle={{ padding: 5 }}
        textInputStyle={styles.input}
        itemStyle={styles.item}
        itemTextStyle={styles.itemText}
        itemsContainerStyle={styles.itemsContainer}
        items={skillsList}
        defaultIndex={0}
        placeholder="Select attribute..."
        resetValue={false}
        underlineColorAndroid="transparent"
      />

      <Button title="Save Profile" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
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
  item: {
    padding: 10,
    marginTop: 2,
    backgroundColor: "#ddd",
    borderColor: "#bbb",
    borderWidth: 1,
    borderRadius: 5,
  },
  itemText: {
    color: "#222",
  },
  itemsContainer: {
    maxHeight: 140,
  },
  selectedAttributeContainer: {
    marginTop: 20,
  },
  selectedAttributeLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedAttributeValue: {
    fontSize: 16,
    marginTop: 5,
  },
});

export default AccountScreen;
