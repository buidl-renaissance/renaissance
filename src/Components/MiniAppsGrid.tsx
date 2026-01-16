import React from "react";
import { View, StyleSheet } from "react-native";
import { MiniAppButton } from "./MiniAppButton";
import { MiniApp } from "../interfaces";

interface MiniAppsGridProps {
  apps: MiniApp[];
  onPress: (app: MiniApp) => void;
  itemsPerRow?: number;
  rowPaddingVertical?: number;
}

export const MiniAppsGrid: React.FC<MiniAppsGridProps> = ({
  apps,
  onPress,
  itemsPerRow = 5,
  rowPaddingVertical = 12,
}) => {
  // Split apps into rows
  const rows: MiniApp[][] = [];
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
              key={`${rowIndex}-${appIndex}-${app.name}`}
              emoji={app.emoji}
              label={app.title}
              backgroundColor={app.backgroundColor}
              onPress={() => onPress(app)}
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
    justifyContent: "space-evenly",
  },
});
