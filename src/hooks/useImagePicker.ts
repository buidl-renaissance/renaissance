import React from "react";

import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "../dpop";

interface ImagePickerProps {
  aspect?: [number, number];
  allowsEditing?: boolean;
}

export const useImagePicker = ({
  allowsEditing = true,
  aspect = [4, 3],
}: ImagePickerProps) => {
  const [image, setImage] = React.useState<ImagePicker.ImagePickerAsset[]>();
  const [uploadedImageUrl, setUploadedImageUrl] = React.useState<string>();

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: allowsEditing ?? true,
      aspect: aspect ?? [4, 3],
      exif: true,
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets);
    }
  };

  return { pickImage, image, uploadedImageUrl };
};
