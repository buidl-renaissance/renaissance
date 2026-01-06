import React from "react";
import { View, Image, TouchableOpacity, Dimensions } from "react-native";
import { EventCard, EventCardOptions } from "./EventCard";
import { LumaEventCard } from "./LumaEventCard";
import { RAEventCard } from "./RAEventCard";
import { MeetupEventCard } from "./MeetupEventCard";
import { FlyerEventCard } from "./FlyerEventCard";
import { SportsGameCard } from "./SportsGameCard";
import { InstagramEventCard } from "./InstagramEventCard";
import {
  DAEvent,
  LumaEvent,
  RAEvent,
  MeetupEvent,
  InstagramEvent,
} from "../interfaces";
import { SportsGame } from "../api/sports-games";

const { width } = Dimensions.get("window");

export interface EventRendererProps {
  item: any; // Event item with eventType property
  onSelectDAEvent?: (event: DAEvent) => void;
  onSelectLumaEvent?: (event: LumaEvent) => void;
  onSelectRAEvent?: (event: RAEvent) => void;
  onSelectMeetupEvent?: (event: MeetupEvent) => void;
  onSelectSportsEvent?: (game: SportsGame) => void;
  onSelectInstagramEvent?: (event: InstagramEvent) => void;
  onSelectFlyerEvent?: (event: any) => void;
  containerStyle?: any;
  showFeaturedImage?: boolean; // Whether to show featured image for DA events (default: false)
  // EventCard specific options
  eventCardOptions?: EventCardOptions;
  // Skip fetching bookmark status - use this initial value instead
  initialBookmarkStatus?: boolean;
}

/**
 * Reusable component for rendering event cards consistently across screens.
 * Matches the rendering pattern used in CalendarScreen.
 */
export const EventRenderer: React.FC<EventRendererProps> = ({
  item,
  onSelectDAEvent,
  onSelectLumaEvent,
  onSelectRAEvent,
  onSelectMeetupEvent,
  onSelectSportsEvent,
  onSelectInstagramEvent,
  onSelectFlyerEvent,
  containerStyle = { paddingHorizontal: 16 },
  showFeaturedImage = false,
  eventCardOptions,
  initialBookmarkStatus,
}) => {
  // Default event card options - merge with provided options
  const defaultEventCardOptions = { showVenue: true, showImage: true };
  const mergedEventCardOptions = { ...defaultEventCardOptions, ...(eventCardOptions || {}) };
  const eventType = (item as any).eventType;

  // Flyer event
  if (eventType === "flyer") {
    return (
      <FlyerEventCard
        event={item}
        onSelectEvent={() => {
          if (onSelectFlyerEvent) {
            onSelectFlyerEvent(item);
          }
        }}
      />
    );
  }

  // Luma event
  if (eventType === "luma") {
    const lumaEvent = item as LumaEvent;
    return (
      <View style={containerStyle}>
        <LumaEventCard
          event={lumaEvent}
          options={{
            showLocation: true,
            showImage: true,
            showHosts: true,
          }}
          initialBookmarkStatus={initialBookmarkStatus}
          onSelectEvent={() => {
            if (onSelectLumaEvent) {
              onSelectLumaEvent(lumaEvent);
            }
          }}
        />
      </View>
    );
  }

  // RA event
  if (eventType === "ra") {
    const raEvent = item as RAEvent & { isFeatured?: boolean };
    return (
      <View style={containerStyle}>
        <RAEventCard
          event={raEvent}
          options={{
            showVenue: true,
            showImage: true,
            showArtists: true,
          }}
          isFeatured={raEvent.isFeatured}
          initialBookmarkStatus={initialBookmarkStatus}
          onSelectEvent={() => {
            if (onSelectRAEvent) {
              onSelectRAEvent(raEvent);
            }
          }}
        />
      </View>
    );
  }

  // Meetup event
  if (eventType === "meetup") {
    const meetupEvent = item as MeetupEvent;
    return (
      <View style={containerStyle}>
        <MeetupEventCard
          event={meetupEvent}
          options={{
            showLocation: true,
            showImage: true,
            showGroup: true,
          }}
          initialBookmarkStatus={initialBookmarkStatus}
          onSelectEvent={() => {
            if (onSelectMeetupEvent) {
              onSelectMeetupEvent(meetupEvent);
            }
          }}
        />
      </View>
    );
  }

  // Sports game
  if (eventType === "sports") {
    const sportsGame = item as SportsGame;
    return (
      <View style={containerStyle}>
        <SportsGameCard
          game={sportsGame}
          options={{
            showVenue: true,
            showImage: true,
          }}
          initialBookmarkStatus={initialBookmarkStatus}
          onSelectEvent={() => {
            if (onSelectSportsEvent) {
              onSelectSportsEvent(sportsGame);
            }
          }}
        />
      </View>
    );
  }

  // Instagram event
  if (eventType === "instagram") {
    const instagramEvent = item as InstagramEvent;
    return (
      <View style={containerStyle}>
        <InstagramEventCard
          event={instagramEvent}
          options={{
            showVenue: true,
            showImage: true,
            showArtists: true,
          }}
          initialBookmarkStatus={initialBookmarkStatus}
          onSelectEvent={() => {
            if (onSelectInstagramEvent) {
              onSelectInstagramEvent(instagramEvent);
            }
          }}
        />
      </View>
    );
  }

  // Default: DA event
  const daEvent = item as DAEvent;
  const imageHeight = daEvent.image_data?.width
    ? (daEvent.image_data?.height / daEvent.image_data?.width) *
        Dimensions.get("window").width -
      54
    : 360;

  return (
    <View>
      <View style={containerStyle}>
        <EventCard
          event={daEvent}
          options={mergedEventCardOptions}
          initialBookmarkStatus={initialBookmarkStatus}
          onSelectEvent={() => {
            if (onSelectDAEvent) {
              onSelectDAEvent(daEvent);
            }
          }}
        />
      </View>
      {showFeaturedImage && daEvent.featured && daEvent.image && (
        <TouchableOpacity
          onPress={() => {
            if (onSelectDAEvent) {
              onSelectDAEvent(daEvent);
            }
          }}
          style={{ paddingVertical: 16 }}
        >
          <Image
            source={{
              uri: daEvent.image,
            }}
            style={{
              height: imageHeight,
              width: "100%",
              resizeMode: "cover",
              backgroundColor: "#E5E7EB",
            }}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

