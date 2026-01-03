import React from "react";
import { View, StyleSheet, ImageSourcePropType } from "react-native";
import { MiniAppButton } from "./MiniAppButton";

export interface MiniAppConfig {
  emoji?: string;
  label: string;
  backgroundColor: string;
  onPress: () => void;
  image?: ImageSourcePropType;
}

interface MiniAppsGridProps {
  apps: MiniAppConfig[];
  itemsPerRow?: number;
  rowPaddingVertical?: number;
}

export const MiniAppsGrid: React.FC<MiniAppsGridProps> = ({
  apps,
  itemsPerRow = 5,
  rowPaddingVertical = 12,
}) => {
  // Split apps into rows
  const rows: MiniAppConfig[][] = [];
  for (let i = 0; i < apps.length; i += itemsPerRow) {
    rows.push(apps.slice(i, i + itemsPerRow));
  }

  return (
    <>
      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={[
            styles.row,
            {
              paddingVertical: rowIndex === 0 ? rowPaddingVertical : rowPaddingVertical / 2,
            },
          ]}
        >
          {row.map((app, appIndex) => (
            <MiniAppButton
              key={`${rowIndex}-${appIndex}-${app.label}`}
              emoji={app.emoji}
              label={app.label}
              backgroundColor={app.backgroundColor}
              onPress={app.onPress}
              image={app.image}
            />
          ))}
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
});
