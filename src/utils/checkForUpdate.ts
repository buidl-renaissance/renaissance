import * as Updates from 'expo-updates';
import { Alert, Platform } from 'react-native';

export const updateApp = async () => {
  await Updates.reloadAsync();
  global.Analytics.event(`App Update Action`, `Manual Update`, Platform.OS === 'android' ? 'Android' : 'iOS');
};

export const checkForUpdates = async (silentUpdate = true) => {
  if (!__DEV__) {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        const updated = await Updates.fetchUpdateAsync();
        if (updated.isNew) {
          Alert.alert(
            'Update Available',
            'A new version of the app is available',
            [
              {
                text: 'Load Update',
                onPress: () => {
                  global.Analytics.event(
                    `App Update Action`,
                    `Updating`,
                    Platform.OS === 'android' ? 'Android' : 'iOS',
                  );
                  updateApp();
                },
              },
              {
                text: 'Dismiss',
                onPress: () => {
                  global.Analytics.event(
                    `App Update Action`,
                    `Dismissed Update`,
                    Platform.OS === 'android' ? 'Android' : 'iOS',
                  );
                },
              },
            ],
            { cancelable: false },
          );
        } else if (!silentUpdate) {
          Alert.alert('Update Alert', 'Already up-to-date.');
        }
      } else if (!silentUpdate) {
        Alert.alert('Update Alert', 'Already up-to-date .');
      }
    } catch (error) {
      console.log(error);
      if (!silentUpdate && error instanceof Error) {
        Alert.alert('Update error', error.message);
      }
    }
  } else if (!silentUpdate) {
    Alert.alert('Update error', 'Update can not be checked in DEV mode');
  }
};
