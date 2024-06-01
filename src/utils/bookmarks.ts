import moment from 'moment';
import { DAEvent } from "../interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { schedulePushNotification } from "./notifications";

export const getBookmarkStatus = async (event: DAEvent): Promise<boolean> => {
    const result = await AsyncStorage.getItem(`Bookmark-${event.id}`);
    return result ? true : false;
};

export const getBookmarks = async (): Promise<number[]> => {
    const bookmarksData = (await AsyncStorage.getItem(`Bookmarks`)) as string;
    return JSON.parse(bookmarksData) ?? ([] as number[]);
}

export const toggleBookmark = async (event: DAEvent) => {
    const bookmarks = await getBookmarks();
    const isBookmarked = await getBookmarkStatus(event);
    // console.log("BOOKMARKS: ", bookmarks);
    if (isBookmarked) {
      const result = bookmarks.filter((event_id: number) => {
        return event_id !== event.id;
      });
      await AsyncStorage.setItem("Bookmarks", JSON.stringify(result));
      await AsyncStorage.removeItem(`Bookmark-${event.id}`);
    } else {
      bookmarks.push(event.id);
      await AsyncStorage.setItem("Bookmarks", JSON.stringify(bookmarks));
      await AsyncStorage.setItem(`Bookmark-${event.id}`, "1");
      try {
        await schedulePushNotification({
          content: {
            title: "Event Starts in 1 Hour",
            body: event.title,
            data: {
              event,
            },
          },
          trigger: {
            date: moment(event.start_date).subtract(1, "hour").toDate(),
          },
        });
      } catch (error) {
        
      }
    }
};
