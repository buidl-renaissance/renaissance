import * as React from 'react';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

export interface AudioPlayerContextType {
    isPlaying: boolean;
    currentUri?: string;
    sound?: Audio.Sound;
    playSound: (uri: string) => void;
    stopSound: () => void;
}

export const AudioPlayerContext = React.createContext<AudioPlayerContextType>({
    isPlaying: false,
    currentUri: undefined,
    playSound: async (uri: string) => {
        return null;
    },
    stopSound: () => {
        return null;
    }
});

export const AudioPlayerProvider = (props: { children: React.ReactElement }) => {

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentUri, setCurrentUri] = React.useState<string>();
  const [currentSound, setCurrentSound] = React.useState<Audio.Sound>();

  const defaultTheme = {
    // Chaning color schemes according to theme
    isPlaying,
    currentUri,
    sound: currentSound,
    playSound: async (uri: string) => {

        if (isPlaying && currentSound) {
            await currentSound.stopAsync();
            await currentSound.unloadAsync();
        }

        setIsPlaying(true);
        setCurrentUri(uri);

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
    },
    stopSound: async () => {
        setIsPlaying(false);
        await currentSound?.stopAsync();
    }
  };
  return <AudioPlayerContext.Provider value={defaultTheme}>{props.children}</AudioPlayerContext.Provider>;
};

// Custom hook to get the theme object returns {isDark, colors, setScheme}
export const useAudioPlayer = () => React.useContext(AudioPlayerContext);