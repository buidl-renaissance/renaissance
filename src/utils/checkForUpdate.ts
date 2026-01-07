import * as Updates from 'expo-updates';
import { Alert, Platform } from 'react-native';

export const updateApp = async () => {
  await Updates.reloadAsync();
  global.Analytics?.event?.(`App Update Action`, `Manual Update`, Platform.OS === 'android' ? 'Android' : 'iOS');
};

/**
 * Check for updates and optionally auto-reload
 * @param options.silent - If true, don't show alerts for "up to date" or errors (default: true)
 * @param options.autoReload - If true, automatically reload the app when update is available (default: false)
 */
export const checkForUpdates = async (options: { silent?: boolean; autoReload?: boolean } = {}) => {
  const { silent = true, autoReload = false } = options;
  
  if (!__DEV__) {
    try {
      console.log('[Updates] Checking for updates...');
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        console.log('[Updates] Update available, fetching...');
        const updated = await Updates.fetchUpdateAsync();
        
        if (updated.isNew) {
          console.log('[Updates] New update fetched successfully');
          global.Analytics?.event?.(
            `App Update Action`,
            autoReload ? `Auto Updating` : `Update Available`,
            Platform.OS === 'android' ? 'Android' : 'iOS',
          );
          
          if (autoReload) {
            // Auto-reload without prompting
            console.log('[Updates] Auto-reloading with new update...');
            await Updates.reloadAsync();
          } else {
            // Show alert for manual confirmation
            Alert.alert(
              'Update Available',
              'A new version of the app is available',
              [
                {
                  text: 'Load Update',
                  onPress: () => {
                    global.Analytics?.event?.(
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
                    global.Analytics?.event?.(
                      `App Update Action`,
                      `Dismissed Update`,
                      Platform.OS === 'android' ? 'Android' : 'iOS',
                    );
                  },
                },
              ],
              { cancelable: false },
            );
          }
        } else if (!silent) {
          Alert.alert('Update Alert', 'Already up-to-date.');
        }
      } else {
        console.log('[Updates] No update available');
        if (!silent) {
          Alert.alert('Update Alert', 'Already up-to-date.');
        }
      }
    } catch (error) {
      console.log('[Updates] Error checking for updates:', error);
      if (!silent && error instanceof Error) {
        Alert.alert('Update error', error.message);
      }
    }
  } else if (!silent) {
    Alert.alert('Update error', 'Update can not be checked in DEV mode');
  }
};
