import { Platform } from "react-native";

export const createFormData = (photo, body = {}) => {
  const data = new FormData();

  data.append("image", {
    name: photo.fileName,
    type: photo.type,
    uri: Platform.OS === "ios" ? photo.uri.replace("file://", "") : photo.uri,
  });

  Object.keys(body).forEach((key) => {
    data.append(key, body[key]);
  });

  return data;
};
