import AsyncStorage from '@react-native-async-storage/async-storage';
import { BucketList } from '../interfaces';

const BUCKET_LISTS_KEY = 'BucketLists';

export const getBucketLists = async (): Promise<BucketList[]> => {
  try {
    const data = await AsyncStorage.getItem(BUCKET_LISTS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading bucket lists:', error);
    return [];
  }
};

export const saveBucketLists = async (lists: BucketList[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(BUCKET_LISTS_KEY, JSON.stringify(lists));
  } catch (error) {
    console.error('Error saving bucket lists:', error);
  }
};

export const createBucketList = async (
  name: string,
  ownerId: string
): Promise<BucketList> => {
  const lists = await getBucketLists();
  const newList: BucketList = {
    id: Date.now().toString(),
    name,
    ownerId,
    collaborators: [],
    restaurants: [],
    isShared: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  lists.push(newList);
  await saveBucketLists(lists);
  return newList;
};

export const updateBucketList = async (
  listId: string,
  updates: Partial<BucketList>
): Promise<BucketList | null> => {
  const lists = await getBucketLists();
  const index = lists.findIndex((list) => list.id === listId);
  if (index === -1) return null;

  const updatedList = {
    ...lists[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  lists[index] = updatedList;
  await saveBucketLists(lists);
  return updatedList;
};

export const deleteBucketList = async (listId: string): Promise<boolean> => {
  const lists = await getBucketLists();
  const filtered = lists.filter((list) => list.id !== listId);
  await saveBucketLists(filtered);
  return filtered.length < lists.length;
};

export const shareBucketList = async (
  listId: string
): Promise<string | null> => {
  const list = await getBucketListById(listId);
  if (!list) return null;

  const updatedList = await updateBucketList(listId, { isShared: true });
  // In a real app, this would generate a shareable link/code
  return `bucketlist-${listId}`;
};

export const addCollaborator = async (
  listId: string,
  userId: string
): Promise<BucketList | null> => {
  const list = await getBucketListById(listId);
  if (!list) return null;

  if (list.collaborators.includes(userId)) {
    return list;
  }

  return await updateBucketList(listId, {
    collaborators: [...list.collaborators, userId],
  });
};

export const removeCollaborator = async (
  listId: string,
  userId: string
): Promise<BucketList | null> => {
  const list = await getBucketListById(listId);
  if (!list) return null;

  return await updateBucketList(listId, {
    collaborators: list.collaborators.filter((id) => id !== userId),
  });
};

export const addRestaurantToList = async (
  listId: string,
  restaurantId: string
): Promise<BucketList | null> => {
  const list = await getBucketListById(listId);
  if (!list) return null;

  if (list.restaurants.includes(restaurantId)) {
    return list;
  }

  return await updateBucketList(listId, {
    restaurants: [...list.restaurants, restaurantId],
  });
};

export const removeRestaurantFromList = async (
  listId: string,
  restaurantId: string
): Promise<BucketList | null> => {
  const list = await getBucketListById(listId);
  if (!list) return null;

  return await updateBucketList(listId, {
    restaurants: list.restaurants.filter((id) => id !== restaurantId),
  });
};

export const getBucketListById = async (
  listId: string
): Promise<BucketList | null> => {
  const lists = await getBucketLists();
  return lists.find((list) => list.id === listId) || null;
};

