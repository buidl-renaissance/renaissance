import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTenant } from "../context/TenantContext";
import { TENANTS } from "../context/TenantContext";
import { theme } from "../colors";

export default function TenantSelectScreen({
  navigation,
}: {
  navigation: any;
}) {
  const { tenantId, setTenant } = useTenant();

  const handleSelectTenant = async (id: string) => {
    await setTenant(id);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Select location</Text>
        <Text style={styles.subtitle}>
          Choose which community you're viewing.
        </Text>
        {TENANTS.map((tenant) => {
          const isSelected = tenant.id === tenantId;
          return (
            <TouchableOpacity
              key={tenant.id}
              style={[styles.row, isSelected && styles.rowSelected]}
              onPress={() => handleSelectTenant(tenant.id)}
              activeOpacity={0.7}
            >
              <Image source={tenant.image} style={styles.rowImage} />
              <Text style={styles.rowText}>{tenant.displayName}</Text>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={theme.primary}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: theme.textSecondary,
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.surface,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  rowSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.surfaceElevated,
  },
  rowImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 14,
  },
  rowText: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: theme.text,
  },
});
