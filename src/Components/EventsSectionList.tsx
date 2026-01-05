import React from "react";
import { SectionList, SectionListProps, StyleSheet, View, Text } from "react-native";
import { EventRenderer, EventRendererProps } from "./EventRenderer";
import { SectionHeader } from "./SectionHeader";
import { getEventKey } from "../utils/eventKeys";
import { EventGroup } from "../utils/eventGrouping";

export interface EventsSectionListProps {
  eventsGroup: EventGroup[];
  renderEvent?: (item: any) => React.ReactElement;
  eventRendererProps?: Partial<EventRendererProps>;
  emptyText?: string;
  containerStyle?: any;
  listStyle?: any;
  contentContainerStyle?: any;
  stickySectionHeadersEnabled?: boolean;
  showSectionHeaders?: boolean;
  onScroll?: (event: any) => void;
  scrollEnabled?: boolean;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  removeClippedSubviews?: boolean;
  maxToRenderPerBatch?: number;
  updateCellsBatchingPeriod?: number;
  initialNumToRender?: number;
  windowSize?: number;
}

/**
 * Reusable SectionList component for displaying grouped events
 */
export const EventsSectionList = React.forwardRef<SectionList, EventsSectionListProps>(({
  eventsGroup,
  renderEvent,
  eventRendererProps = {},
  emptyText = "No events found",
  containerStyle,
  listStyle,
  contentContainerStyle,
  stickySectionHeadersEnabled = false,
  showSectionHeaders = true,
  onScroll,
  scrollEnabled = true,
  ListHeaderComponent,
  removeClippedSubviews,
  maxToRenderPerBatch,
  updateCellsBatchingPeriod,
  initialNumToRender,
  windowSize,
}, ref) => {
  const defaultRenderItem = React.useCallback(
    ({ item }: { item: any }) => {
      if (renderEvent) {
        return renderEvent(item);
      }
      return <EventRenderer item={item} {...eventRendererProps} />;
    },
    [renderEvent, eventRendererProps]
  );

  const defaultKeyExtractor = React.useCallback((item: any, index: number) => {
    return getEventKey(item, index);
  }, []);

  const defaultRenderSectionHeader = React.useCallback(
    ({ section }: { section: any }) => {
      if (!showSectionHeaders) {
        return null;
      }
      const eventGroup = section as EventGroup;
      return <SectionHeader title={eventGroup.title} subtitle={eventGroup.subtitle} />;
    },
    [showSectionHeaders]
  );

  const handleScrollToIndexFailed = React.useCallback((info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
    // Wait a bit and try again, or just handle the failure gracefully
    setTimeout(() => {
      // Optionally retry scrolling, but for now we'll just silently handle the failure
      // as the user can manually scroll if needed
    }, 100);
  }, []);

  return (
    <View style={[styles.container, containerStyle]}>
      <SectionList
        ref={ref}
        sections={eventsGroup}
        style={[styles.list, listStyle]}
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        stickySectionHeadersEnabled={stickySectionHeadersEnabled}
        renderSectionHeader={defaultRenderSectionHeader}
        renderItem={defaultRenderItem}
        keyExtractor={defaultKeyExtractor}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{emptyText}</Text>
          </View>
        }
        ListHeaderComponent={ListHeaderComponent}
        onScroll={onScroll}
        scrollEnabled={scrollEnabled}
        removeClippedSubviews={removeClippedSubviews}
        maxToRenderPerBatch={maxToRenderPerBatch}
        updateCellsBatchingPeriod={updateCellsBatchingPeriod}
        initialNumToRender={initialNumToRender}
        windowSize={windowSize}
        onScrollToIndexFailed={handleScrollToIndexFailed}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
});

