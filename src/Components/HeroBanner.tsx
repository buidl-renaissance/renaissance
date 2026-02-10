import React from "react";
import { Animated, ImageBackground, StyleSheet, Text, View } from "react-native";
import { useTenant } from "../context/TenantContext";
import { TENANTS } from "../context/TenantContext";
import { theme } from "../colors";

const HERO_MIN_HEIGHT = 260;

const DEFAULT_HERO_BACKGROUND = require("../../assets/renaissance-right.png");
const DEFAULT_HERO_TITLE = "Welcome to the Renaissance City";
const DEFAULT_HERO_SUBTITLE = "Discover and shape Detroit's living culture.";

const ETH_DENVER_TENANT_ID = "eth-denver";

export const HeroBanner = ({ children }) => {
  const { tenantId } = useTenant();
  const tenant = TENANTS.find((t) => t.id === tenantId);

  const isEthDenver = tenantId === ETH_DENVER_TENANT_ID;
  const background = tenant?.heroBackground ?? DEFAULT_HERO_BACKGROUND;
  const showText = !isEthDenver && !tenant?.heroHideText;
  const title = showText ? (tenant?.heroTitle ?? DEFAULT_HERO_TITLE) : null;
  const subtitle = showText ? (tenant?.heroSubtitle ?? DEFAULT_HERO_SUBTITLE) : null;
  const hideOverlay = isEthDenver || tenant?.heroHideOverlay === true;

  return (
    <View key={tenantId} style={styles.container}>
      <ImageBackground
        source={background}
        resizeMode="cover"
        style={styles.background}
      >
        <Animated.View
          key={`hero-${tenantId}-${String(hideOverlay)}`}
          style={{
            paddingTop: 108,
            paddingHorizontal: 16,
            paddingVertical: hideOverlay ? 12 : 16,
            backgroundColor: hideOverlay ? "transparent" : theme.overlay,
            borderBottomColor: hideOverlay ? "transparent" : theme.border,
            borderBottomWidth: hideOverlay ? 0 : 1,
          }}
        >
          {title != null && title !== "" && (
            <Text
              style={{
                color: theme.textOnDark,
                fontSize: 32,
                fontWeight: "bold",
                textAlign: "left",
                marginTop: 8,
              }}
            >
              {title}
            </Text>
          )}
          {subtitle != null && subtitle !== "" && (
            <Text
              style={{
                color: theme.textOnDark,
                fontSize: 16,
                textAlign: "left",
                marginVertical: 4,
                marginBottom: 8,
              }}
            >
              {subtitle}
            </Text>
          )}
          {children}
        </Animated.View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: HERO_MIN_HEIGHT,
  },
  background: {
    flex: 1,
    minHeight: HERO_MIN_HEIGHT,
  },
});
