import React, { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Chip, Text } from "react-native-paper";
import SearchableDropdown from "react-native-searchable-dropdown";
import { Button } from "../Components/Button";
import { skillsList } from "../mocks/skills";

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
  // onSave: (profile: UserProfile) => void;
  navigation: any;
}

const AccountScreen: React.FC<AccountScreenProps> = ({ navigation }) => {

  navigation.setOptions({
    headerTitle: "Profile",
  });

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [selectedAttributions, setSelectedAttributions] = useState<
    UserAttribution[]
  >([]);
  const [availableSkills, setAvailableSkills] = useState<UserAttribution[]>([]);

  React.useEffect(() => {
    const ids = selectedAttributions.map((s) => s.id);
    const skills = skillsList.filter((ua: UserAttribution) => {
      return !ids.includes(ua.id);
    });
    setAvailableSkills(skills);
  }, [selectedAttributions]);

  const handleSave = () => {
    const profile: UserProfile = {
      name,
      bio,
      portfolio,
      attributions: selectedAttributions,
    };
    // onSave(profile);

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
        placeholder="Enter Name..."
        value={name}
        onChangeText={(text) => setName(text)}
        style={styles.input}
      />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        placeholder="Enter Bio..."
        value={bio}
        onChangeText={(text) => setBio(text)}
        multiline
        style={[styles.input, { height: 80 }]}
      />

      <Text style={styles.label}>Portfolio Link</Text>
      <TextInput
        placeholder="Enter Portfolio Link..."
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
      <View style={{ zIndex: 10 }}>
        <SearchableDropdown
          onTextChange={(text) => console.log(text)} // Handle search input
          onItemSelect={handleAddAttribution}
          textInputStyle={styles.input}
          itemStyle={styles.item}
          itemTextStyle={styles.itemText}
          itemsContainerStyle={styles.itemsContainer}
          items={availableSkills}
          defaultIndex={0}
          placeholder="Select Attributes..."
          resetValue={false}
          underlineColorAndroid="transparent"
        />
      </View>

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
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    borderColor: '#bbb',
  },
  item: {
    padding: 8,
    marginTop: 2,
    backgroundColor: "#fff",
    borderColor: "#bbb",
    borderWidth: 1,
    borderRadius: 5,
  },
  itemText: {
    color: "#222",
  },
  itemsContainer: {
    position: "absolute",
    borderWidth: 1,
    backgroundColor: "#ddd",
    borderColor: '#bbb',
    padding: 4,
    maxHeight: 140,
    top: 39,
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
    marginTop: 4,
  },
});

export default AccountScreen;
