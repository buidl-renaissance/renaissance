import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { MiniAppButton } from "./MiniAppButton";
import { MiniApp } from "../interfaces";

const ITEM_WIDTH = 66; // Width of each MiniAppButton
const screenWidth = Dimensions.get("window").width;

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
  // Calculate gap so that items are evenly spaced with equal gaps on edges
  // Total gaps = itemsPerRow + 1 (gaps between items + left edge + right edge)
  const totalItemsWidth = ITEM_WIDTH * itemsPerRow;
  const remainingSpace = screenWidth - totalItemsWidth;
  const gap = remainingSpace / (itemsPerRow + 1);

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
              paddingHorizontal: gap,
              gap: gap,
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
    justifyContent: "flex-start",
  },
});
