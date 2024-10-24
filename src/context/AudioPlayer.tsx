import * as React from 'react';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

export interface AudioPlayerContextType {
    isPlaying: boolean;
    currentUri?: string;
    sound?: Audio.Sound;
    playSound: (uri: string, time?: number) => void;
    stopSound: () => void;
    elapsedTime: number;
    seekToTime: (uri: string, time: number) => void;
    duration: number;
}

export const AudioPlayerContext = React.createContext<AudioPlayerContextType>({
    isPlaying: false,
    currentUri: undefined,
    playSound: async (uri: string, time?: number) => {
        return null;
    },
    stopSound: () => {
        return null;
    },
    elapsedTime: 0,
    seekToTime: (uri: string, time: number) => {
        return null;
    },
    duration: 0
});

export const AudioPlayerProvider = (props: { children: React.ReactElement }) => {

    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentUri, setCurrentUri] = React.useState<string>();
    const [currentSound, setCurrentSound] = React.useState<Audio.Sound>();
    const [elapsedTime, setElapsedTime] = React.useState<number>(0);  // Time in seconds
    const [duration, setDuration] = React.useState<number>(0);
    const [seekPosition, setSeekPosition] = React.useState<number>(0);

    const intervalRef = React.useRef(null);

    const seekToTime = async (time: number) => {
        await currentSound?.setPositionAsync(time * 1000);
    }

    React.useEffect(() => {
        currentSound?.setOnPlaybackStatusUpdate(setPlaybackStatusUpdate);
    }, [currentUri, seekPosition]);

    const setPlaybackStatusUpdate = async (status: Audio.PlaybackStatus) => {
        if (status.isLoaded) {
            setElapsedTime(status.positionMillis / 1000);
            setDuration(status.durationMillis ?? 0 / 1000);
            if (status.didJustFinish) {
                setIsPlaying(false);
            }
        }
        if (seekPosition && status.positionMillis < ((seekPosition - 1) * 1000)) {
            await seekToTime(seekPosition);
        }
    }

    const playSound = async (uri: string, time?: number) => {

        await stopSound();

        const { sound } = await Audio.Sound.createAsync({ uri });
        setCurrentSound(sound);

        setIsPlaying(true);
        setCurrentUri(uri);
        setElapsedTime(0);
        setSeekPosition(time ?? 0);

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

    }

    const stopSound = async () => {
        setIsPlaying(false);
        setElapsedTime(0);
        await currentSound?.stopAsync();
    }

    const defaultTheme = {
        isPlaying,
        currentUri,
        sound: currentSound,
        elapsedTime,
        duration,
        playSound: playSound,
        stopSound: stopSound,
        seekToTime: async (uri: string, time: number) => {
            if (currentUri === uri) {
                setSeekPosition(time);
                await currentSound?.setPositionAsync(time * 1000);
                setElapsedTime(time);
            } else {
                await playSound(uri, time);
            }
        }
    };
    return <AudioPlayerContext.Provider value={defaultTheme}>{props.children}</AudioPlayerContext.Provider>;
};

// Custom hook to get the theme object returns {isDark, colors, setScheme}
export const useAudioPlayer = () => React.useContext(AudioPlayerContext);