import * as React from 'react';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

export interface AudioPlayerContextType {
    isPlaying: boolean;
    currentUri?: string;
    sound?: Audio.Sound;
    playSound: (uri: string) => void;
    stopSound: () => void;
    elapsedTime: number;
}

export const AudioPlayerContext = React.createContext<AudioPlayerContextType>({
    isPlaying: false,
    currentUri: undefined,
    playSound: async (uri: string) => {
        return null;
    },
    stopSound: () => {
        return null;
    },
    elapsedTime: 0
});

export const AudioPlayerProvider = (props: { children: React.ReactElement }) => {

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentUri, setCurrentUri] = React.useState<string>();
  const [currentSound, setCurrentSound] = React.useState<Audio.Sound>();
  const [elapsedTime, setElapsedTime] = React.useState<number>(0);  // Time in seconds
  const intervalRef = React.useRef(null);

//   // Update elapsed time every second
//   React.useEffect(() => {
//       if (isPlaying) {
//           intervalRef.current = setInterval(() => {
//               setElapsedTime((prevTime) => prevTime + 1);
//           }, 1000);
//       } else {
//           clearInterval(intervalRef.current ?? 0);
//       }

//       return () => clearInterval(intervalRef.current ?? 0);
//   }, [isPlaying]);


  const defaultTheme = {
    // Chaning color schemes according to theme
    isPlaying,
    currentUri,
    sound: currentSound,
    elapsedTime,
    playSound: async (uri: string) => {

        if (isPlaying && currentSound) {
            await currentSound.stopAsync();
            await currentSound.unloadAsync();
        }

        setIsPlaying(true);
        setCurrentUri(uri);
        setElapsedTime(0);

        const { sound } = await Audio.Sound.createAsync({ uri });
        setCurrentSound(sound);

        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: true,
            playsInSilentModeIOS: true,
            interruptionModeIOS: InterruptionModeIOS.DuckOthers,
            interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: true,
        });

        await sound.setVolumeAsync(1);

        console.log('Playing Sound');
        await sound.playAsync();

        sound.setOnPlaybackStatusUpdate((status) => {
            // console.log("PlaybackStatusUpdate", status);
            setElapsedTime(status.positionMillis / 1000);
            if(status.didJustFinish) {
                setIsPlaying(false);
            }
        });
    },
    stopSound: async () => {
        setIsPlaying(false);
        setElapsedTime(0);
        await currentSound?.stopAsync();
    }
  };
  return <AudioPlayerContext.Provider value={defaultTheme}>{props.children}</AudioPlayerContext.Provider>;
};

// Custom hook to get the theme object returns {isDark, colors, setScheme}
export const useAudioPlayer = () => React.useContext(AudioPlayerContext);