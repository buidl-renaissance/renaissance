import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';

export async function fetchMediaFromTimeRange(startDate: Date, endDate: Date) {
  try {
    // Request permissions
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Media Library permission not granted');
    }

    // Prepare the asset query
    const query: MediaLibrary.AssetsOptions = {
      mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
      sortBy: [MediaLibrary.SortBy.creationTime],
      createdAfter: startDate,
      createdBefore: endDate,
    };

    // On Android, we need to use getAssetsAsync for pagination
    if (Platform.OS === 'android') {
      let allAssets: MediaLibrary.Asset[] = [];
      let hasNextPage = true;
      let endCursor: string | undefined;

      while (hasNextPage) {
        const { assets, endCursor: newEndCursor, hasNextPage: morePages } = await MediaLibrary.getAssetsAsync({
          ...query,
          after: endCursor,
        });

        allAssets = [...allAssets, ...assets];
        hasNextPage = morePages;
        endCursor = newEndCursor;
      }

      return allAssets;
    } else {
      // On iOS, we can use getPagesInfoAsync and getAssetsAsync
      const { assets } = await MediaLibrary.getAssetsAsync(query);
      return assets;
    }
  } catch (error) {
    console.error('Error fetching media:', error);
    throw error;
  }
}
