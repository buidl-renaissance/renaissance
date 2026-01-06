import { useEffect, useState } from 'react';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import type { CameraDevice } from 'react-native-vision-camera';

export const useVisionCamera = (facing: 'front' | 'back' = 'back') => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(facing);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  return {
    device,
    hasPermission,
    requestPermission,
    isActive,
    setIsActive,
  };
};

export { Camera };



