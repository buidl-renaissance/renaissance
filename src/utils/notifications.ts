import * as Notifications from "expo-notifications";
import { NotificationRequestInput } from "expo-notifications";

export const schedulePushNotification = async (input: NotificationRequestInput) => {
  await Notifications.scheduleNotificationAsync(input);
};
