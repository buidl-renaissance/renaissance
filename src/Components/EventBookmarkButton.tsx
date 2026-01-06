import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Icon, { IconTypes } from "../Components/Icon";
import { DAEvent } from "../interfaces";
import { getBookmarkStatus, toggleBookmark } from "../utils/bookmarks";
import { EventRegister } from "react-native-event-listeners";

type ButtonType = "normal" | "large";

interface EventBookmarkButtonProps {
  event: DAEvent;
  type?: ButtonType;
  initialBookmarkStatus?: boolean;
}

export const EventBookmarkButton = ({
  event,
  type = "normal",
  initialBookmarkStatus,
}: EventBookmarkButtonProps) => {
  const [isBookmarked, setIsBookmarked] = React.useState<boolean>(initialBookmarkStatus ?? false);

  React.useEffect(() => {
    const listener = EventRegister.addEventListener("BookmarkEvent", (data) => {
      if (event.id === data.event?.id) {
        console.log("DID UPDATE BOOKMARK: ", data.event.id, data.isBookmarked);
        setIsBookmarked(data.isBookmarked);
      }
    });
    return () => {
      if (typeof listener === "string")
        EventRegister.removeEventListener(listener);
    };
  });

  // Load bookmark status (skip if initialBookmarkStatus was provided)
  React.useEffect(() => {
    if (initialBookmarkStatus !== undefined) return;
    (async () => {
      const isBookmarked = await getBookmarkStatus(event);
      setIsBookmarked(isBookmarked);
    })();
  }, [initialBookmarkStatus]);

  const handleBookmarkPress = React.useCallback(() => {
    (async () => {
      await toggleBookmark(event);
      EventRegister.emitEvent("BookmarkEvent", {
        event,
        isBookmarked: !isBookmarked,
      });
    })();
    setIsBookmarked(!isBookmarked);
  }, [isBookmarked]);

  return (
    <TouchableOpacity
      style={{
        opacity: 1,
        borderColor: isBookmarked
          ? "blue"
          : type === "large"
          ? "white"
          : "#999",
        borderRadius: type === "large" ? 20 : 14,
        borderWidth: 1,
        padding: type === "large" ? 8 : 6,
        marginRight: type === "large" ? 16 : 8,
      }}
      onPress={handleBookmarkPress}
    >
      <Icon
        type={IconTypes.Ionicons}
        size={type === "large" ? 20 : 14}
        color={isBookmarked ? "blue" : type === "large" ? "white" : "#999"}
        name={isBookmarked ? "bookmark-sharp" : "bookmark-outline"}
      />
    </TouchableOpacity>
  );
};
