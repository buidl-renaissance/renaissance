import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { Chip, Text } from "react-native-paper";
import SearchableDropdown from "react-native-searchable-dropdown";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../Components/Button";
import { skillsList } from "../mocks/skills";
import { Contact, createUser, getContact, saveContact } from "../dpop";
import { useAuth } from "../context/Auth";

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

interface AccountScreenProps {
  // onSave: (profile: UserProfile) => void;
  navigation: any;
}

const AccountScreen: React.FC<AccountScreenProps> = ({ navigation }) => {
  navigation.setOptions({
    headerTitle: "Profile",
  });

  const { state: authState, signOut, postCast } = useAuth();
  
  const [name, setName] = useState("");
  const [publicName, setPublicName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [organization, setOrganization] = useState("");
  const [portfolio, setPortfolio] = useState("");
  // const [selectedAttributions, setSelectedAttributions] = useState<
  //   UserAttribution[]
  // >([]);
  // const [availableSkills, setAvailableSkills] = useState<UserAttribution[]>([]);

  // React.useEffect(() => {
  //   const ids = selectedAttributions.map((s) => s.id);
  //   const skills = skillsList.filter((ua: UserAttribution) => {
  //     return !ids.includes(ua.id);
  //   });
  //   setAvailableSkills(skills);
  // }, [selectedAttributions]);

  React.useEffect(() => {
    if (!name) {
      (async () => {
        const contact = await getContact();
        setName(contact.name);
        setEmail(contact.email ?? "");
        setPublicName(contact.public_name ?? "");
        setPhone(contact.phone);
        setBio(contact.bio ?? "");
        setPortfolio(contact.portfolio ?? "");
      })();
    }
  });

  const handleSave = async () => {
    const contact: Contact = {
      name,
      email,
      bio,
      portfolio,
      phone,
      organization,
      public_name: publicName,
      // attributions: selectedAttributions,
    };
    // onSave(profile);
    saveContact(contact);
    try {
      const user = await createUser(contact);
      user.bio = bio;
      user.email = email;
      user.phone = phone;
      user.organization = organization;
      saveContact(user);
    } catch (error) {
      console.log("USER error: ", error);
    }

    navigation.goBack();

    // Optionally, reset the form fields after saving
    // setName("");
    // setPublicName("");
    // setPhone("");
    // setBio("");
    // setPortfolio("");
    // setSelectedAttributions([]);
  };

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut();
            navigation.goBack();
          },
        },
      ]
    );
  };

  // const handleAddAttribution = (attribution: UserAttribution) => {
  //   setSelectedAttributions([...selectedAttributions, attribution]);
  // };

  // const handleRemoveAttribution = (attribution: UserAttribution) => {
  //   const updatedAttributions = selectedAttributions.filter(
  //     (item) => item !== attribution
  //   );
  //   setSelectedAttributions(updatedAttributions);
  // };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        placeholder="Enter Name..."
        value={name}
        onChangeText={(text) => setName(text)}
        style={styles.input}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        placeholder="Enter Email..."
        value={email}
        onChangeText={(text) => setEmail(text)}
        style={styles.input}
      />

      <Text style={styles.label}>Phone</Text>
      <TextInput
        placeholder="Enter Phone..."
        value={phone}
        onChangeText={(text) => setPhone(text)}
        style={styles.input}
      />

      <Text style={styles.label}>Public Name (optional)</Text>
      <TextInput
        placeholder="Enter Public Name..."
        value={publicName}
        onChangeText={(text) => setPhone(text)}
        style={styles.input}
      />

      {/* <Text style={styles.label}>Bio</Text>
      <TextInput
        placeholder="Enter Bio..."
        value={bio}
        onChangeText={(text) => setBio(text)}
        multiline
        style={[styles.input, { height: 80 }]}
      /> */}

      {/* <Text style={styles.label}>Portfolio Link</Text>
      <TextInput
        placeholder="Enter Portfolio Link..."
        value={portfolio}
        onChangeText={(text) => setPortfolio(text)}
        style={styles.input}
      /> */}

      {/* <Text style={styles.label}>Attributions</Text>
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
      </View> */}

      {/* Farcaster Section - Always visible */}
      <View style={styles.farcasterSection}>
        <Text style={styles.sectionTitle}>Farcaster Integration</Text>
        
        {authState.isAuthenticated && authState.user?.type === "farcaster" ? (
          <>
            {/* Connected Account Info */}
            <View style={styles.farcasterInfo}>
              <Ionicons name="person-circle" size={40} color="#8B5CF6" />
              <View style={styles.farcasterDetails}>
                <Text style={styles.farcasterUsername}>
                  @{authState.user.username}
                </Text>
                <Text style={styles.farcasterFid}>
                  FID: {authState.user.fid}
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color="#22C55E" style={{ marginLeft: 'auto' }} />
            </View>

            {/* Status - All permissions included with Neynar sign-in */}
            <View style={styles.signerStatus}>
              <Text style={styles.label}>Permissions</Text>
              <View style={styles.statusRow}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.statusText}>Post casts</Text>
              </View>
              <View style={styles.statusRow}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.statusText}>Use mini apps</Text>
              </View>
              <View style={styles.statusRow}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.statusText}>Social features</Text>
              </View>
            </View>

            <Text style={styles.helpText}>
              You have full access to Farcaster features in this app.
            </Text>
          </>
        ) : (
          <>
            {/* Not Connected State */}
            <View style={styles.notConnectedInfo}>
              <Ionicons name="logo-buffer" size={48} color="#8B5CF6" />
              <Text style={styles.notConnectedTitle}>Connect Farcaster</Text>
              <Text style={styles.notConnectedText}>
                Sign in with Farcaster to enable posting, mini apps, and social features.
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.requestButton}
              onPress={() => navigation.navigate("Login")}
            >
              <Ionicons name="log-in-outline" size={18} color="#fff" />
              <Text style={styles.requestButtonText}>
                Sign in with Farcaster
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Sign Out Button */}
      {authState.isAuthenticated && (
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      )}

      <Button title="Save Profile" onPress={handleSave} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
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
    borderColor: "#bbb",
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
    borderColor: "#bbb",
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
  // Farcaster section styles
  farcasterSection: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1F2937",
  },
  farcasterInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  farcasterDetails: {
    marginLeft: 12,
  },
  farcasterUsername: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B5CF6",
  },
  farcasterFid: {
    fontSize: 12,
    color: "#6B7280",
  },
  signerStatus: {
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#4B5563",
  },
  requestButton: {
    backgroundColor: "#8B5CF6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  requestButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  revokeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
    marginTop: 8,
  },
  revokeButtonText: {
    color: "#EF4444",
    fontWeight: "600",
    marginLeft: 8,
  },
  helpText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 12,
    textAlign: "center",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
    marginBottom: 20,
  },
  signOutButtonText: {
    color: "#EF4444",
    fontWeight: "600",
    marginLeft: 8,
  },
  notConnectedInfo: {
    alignItems: "center",
    paddingVertical: 20,
  },
  notConnectedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 12,
  },
  notConnectedText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
  },
});

export default AccountScreen;
