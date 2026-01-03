import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BucketList, Restaurant } from "../interfaces";
import { theme } from "../colors";

interface BucketListModalProps {
  visible: boolean;
  bucketList?: BucketList | null;
  restaurants: Restaurant[];
  onClose: () => void;
  onSave: (name: string, restaurantIds: string[]) => void;
  onAddCollaborator?: (userId: string) => void;
}

export const BucketListModal: React.FC<BucketListModalProps> = ({
  visible,
  bucketList,
  restaurants,
  onClose,
  onSave,
  onAddCollaborator,
}) => {
  const [name, setName] = useState("");
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [collaboratorId, setCollaboratorId] = useState("");

  useEffect(() => {
    if (bucketList) {
      setName(bucketList.name);
      setSelectedRestaurants(bucketList.restaurants);
    } else {
      setName("");
      setSelectedRestaurants([]);
    }
  }, [bucketList, visible]);

  const toggleRestaurant = (restaurantId: string) => {
    if (selectedRestaurants.includes(restaurantId)) {
      setSelectedRestaurants(
        selectedRestaurants.filter((id) => id !== restaurantId)
      );
    } else {
      setSelectedRestaurants([...selectedRestaurants, restaurantId]);
    }
  };

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), selectedRestaurants);
      onClose();
    }
  };

  const handleAddCollaborator = () => {
    if (collaboratorId.trim() && onAddCollaborator) {
      onAddCollaborator(collaboratorId.trim());
      setCollaboratorId("");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {bucketList ? "Edit Bucket List" : "Create Bucket List"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter bucket list name"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>
                Restaurants ({selectedRestaurants.length} selected)
              </Text>
              <ScrollView style={styles.restaurantsList}>
                {restaurants.map((restaurant) => {
                  const isSelected = selectedRestaurants.includes(
                    restaurant.id
                  );
                  return (
                    <TouchableOpacity
                      key={restaurant.id}
                      style={[
                        styles.restaurantItem,
                        isSelected && styles.restaurantItemSelected,
                      ]}
                      onPress={() => toggleRestaurant(restaurant.id)}
                    >
                      <Ionicons
                        name={
                          isSelected
                            ? "checkbox-outline"
                            : "square-outline"
                        }
                        size={20}
                        color={isSelected ? "#3449ff" : "#ccc"}
                      />
                      <Text style={styles.restaurantName}>
                        {restaurant.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {bucketList && onAddCollaborator && (
              <View style={styles.section}>
                <Text style={styles.label}>Add Collaborator</Text>
                <View style={styles.collaboratorInput}>
                  <TextInput
                    style={styles.input}
                    value={collaboratorId}
                    onChangeText={setCollaboratorId}
                    placeholder="Enter user ID"
                  />
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddCollaborator}
                  >
                    <Ionicons name="add" size={20} color="#3449ff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={onClose}
            >
              <Text style={styles.footerButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, styles.footerButtonPrimary]}
              onPress={handleSave}
            >
              <Text style={[styles.footerButtonText, styles.footerButtonTextPrimary]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.text,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  restaurantsList: {
    maxHeight: 300,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 8,
  },
  restaurantItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  restaurantItemSelected: {
    backgroundColor: "#f0f0ff",
  },
  restaurantName: {
    fontSize: 14,
    color: theme.text,
    marginLeft: 12,
  },
  collaboratorInput: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButton: {
    marginLeft: 8,
    padding: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  footerButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.border,
    minWidth: 100,
    alignItems: "center",
  },
  footerButtonPrimary: {
    backgroundColor: "#3449ff",
    borderColor: "#3449ff",
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
  },
  footerButtonTextPrimary: {
    color: "#fff",
  },
});

