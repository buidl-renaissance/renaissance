// ffmpeg-kit-react-native has been retired - video generation disabled
// TODO: Consider alternative like react-native-video-processing or server-side processing

export async function generateVideo(imageUri: string, audioUri: string, outputPath: string): Promise<string> {
  console.warn('generateVideo: ffmpeg-kit has been retired, video generation is not available');
  throw new Error('Video generation is not available - ffmpeg-kit has been retired');
}
