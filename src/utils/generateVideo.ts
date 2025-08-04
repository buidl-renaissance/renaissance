// import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
// import * as FileSystem from 'expo-file-system';

// export async function generateVideo(imageUri: string, audioUri: string, outputPath: string): Promise<string> {
//   try {
//     // Ensure the output directory exists
//     const outputDir = outputPath.substring(0, outputPath.lastIndexOf('/'));
//     await FileSystem.makeDirectoryAsync(outputDir, { intermediates: true });

//     // Construct the FFmpeg command
//     const command = `-loop 1 -i "${imageUri}" -i "${audioUri}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "${outputPath}"`;

//     // Execute the FFmpeg command
//     const session = await FFmpegKit.execute(command);
//     const returnCode = await session.getReturnCode();

//     if (ReturnCode.isSuccess(returnCode)) {
//       console.log('Video generated successfully');
//       return outputPath;
//     } else {
//       console.error('Error generating video');
//       const logs = await session.getLogs();
//       console.error(logs);
//       throw new Error('Failed to generate video');
//     }
//   } catch (error) {
//     console.error('Error in generateVideo:', error);
//     throw error;
//   }
// }
