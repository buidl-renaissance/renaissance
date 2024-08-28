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

export const createFormDataForVideo = (video, body = {}) => {
  const data = new FormData();

  data.append("image", {
    name: video.fileName,
    type: video.type,
    uri: Platform.OS === "ios" ? video.uri.replace("file://", "") : video.uri,
  });

  Object.keys(body).forEach((key) => {
    data.append(key, body[key]);
  });

  console.log("DATA: ", data);

  return data;
};

// ptduLeYfb5SHwkBg8875kM1yKdcaTbg2DbruqO6R
// cvTs7BJfRkhrFiyMXuRatqfFfQZlbFwzzYelVsv6