import React, { useState } from 'react';
import { Animated, Button, StyleSheet, Text, Image, Dimensions, View } from 'react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { createContent, DAUpload, uploadAudioUri, uploadImage } from '../dpop';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import moment from 'moment';
import { updateContent } from '../hooks/useArtwork';
import { useAudioPlayer } from '../context/AudioPlayer';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon, { IconTypes } from "../Components/Icon";

export const AudioRecorder = () => {
    const { playSound, stopSound } = useAudioPlayer();
    const [recording, setRecording] = useState<Audio.Recording>();
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [facing, setFacing] = useState<CameraType>('back');
    const [audioLevel, setAudioLevel] = useState<number>(0);  // Represents the input level of audio
    const [elapsedTime, setElapsedTime] = useState<number>(0);  // Time in seconds
    const intervalRef = React.useRef(null);
    const animation = React.useRef(new Animated.Value(0)).current;  // For the visual animation

    const [permission, requestPermission] = useCameraPermissions();

    const [photo, setPhoto] = useState();
    const [upload, setUpload] = useState<DAUpload>();
    const [sound, setSound] = useState();

    const [camera, setCamera] = React.useState();

    // Update elapsed time every second
    React.useEffect(() => {
        if (isRecording) {
            intervalRef.current = setInterval(() => {
                setElapsedTime((prevTime) => prevTime + 1);
            }, 1000);
        } else {
            clearInterval(intervalRef.current ?? 0);
        }

        return () => clearInterval(intervalRef.current ?? 0);
    }, [isRecording]);

    const play = React.useCallback(async () => {
        const uri = recording?.getURI();
        if (!uri) return;
        await playSound(uri);
    }, [recording, playSound]);

    const flipCamera = React.useCallback(() => {
        setFacing(facing === 'back' ? 'front' : 'back');
    }, [facing]);

    async function startRecording() {
        try {

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log('Requesting permissions..');
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                interruptionModeIOS: InterruptionModeIOS.DuckOthers,
                interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: true,
            });
            console.log('Starting recording..');
            const { recording } = await Audio.Recording.createAsync(
                Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
            );
            setRecording(recording);

            setIsRecording(true);
            setElapsedTime(0);

            recording.setProgressUpdateInterval(100);

            // Monitor input levels for the visualization
            recording.setOnRecordingStatusUpdate((status) => {
                setAudioLevel(status.metering ?? 0);
                if (status.metering) {
                    animatePulse(status.metering);
                }
            });

            console.log('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }

    async function stopRecording() {
        console.log('Stopping recording..');
        setIsRecording(false);
        setRecording(undefined)
        setElapsedTime(0);
        await recording?.stopAndUnloadAsync();
        const uri = recording?.getURI();
        console.log('Recording stopped and stored at', uri);

        // Send the recorded audio to the server
        const result = await uploadAudioUri(uri);
        await play();
        await createContent({
            artwork: 1,
            caption: "text",
            data: {
                height: photo?.height ?? 1920,
                type: 'audio',
                image: upload?.url,
                audio: result.url,
                width: photo?.width ?? 1080,
            },
            timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
        });
        updateContent();
        setPhoto(undefined);
    }

    // Animate the pulsing circle based on audio level
    function animatePulse(level) {
        console.log('LEVEL: ', level)
        const scale = Math.max(0, 1 - (Math.abs(level) / 80));  // Normalize dB values to a usable scale
        Animated.timing(animation, {
            toValue: scale,
            duration: 100,
            useNativeDriver: false,  // Set to true if you’re not modifying layout properties
        }).start();
    }
    const takePicture = React.useCallback(() => {
        console.log("TAKE Picture", camera);
        if (camera) {
            camera.takePictureAsync({ onPictureSaved: onPictureSaved });
        }
    }, [camera]);

    async function onPictureSaved(photo) {
        console.log(photo);
        photo.fileName = 'cover.jpeg';
        photo.type = 'image';
        setPhoto(photo);
        startRecording();
        const upload = await uploadImage(photo);
        setUpload(upload);
        console.log("image upload: ", upload);
    }

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    return (
        <View style={styles.container}>

            <View style={{ width: '100%', height: Dimensions.get('window').height - 200 }}>
                {!photo && <CameraView autofocus='on' facing={facing} style={styles.camera} ref={(ref) => { setCamera(ref) }}>
                    <View style={{ position: 'absolute', top: 10, left: 10 }}>
                        <TouchableOpacity onPress={flipCamera}>
                            <Icon
                                type={IconTypes.Ionicons}
                                size={36}
                                color="white"
                                name="camera-reverse"
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={{ position: 'absolute', bottom: 15, flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                        <TouchableOpacity onPress={takePicture}>
                            <View style={{ padding: 10, borderRadius: 100, borderWidth: 2, borderColor: 'white' }}>
                                <Icon
                                    type={IconTypes.Ionicons}
                                    size={36}
                                    color="white"
                                    name="camera"
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                </CameraView>}
                {photo && (
                    <Image
                        source={{ uri: photo.uri }}
                        style={{
                            height:
                                photo.height *
                                (Dimensions.get("window").width / photo.width),
                            width: "100%",
                            backgroundColor: "#ddd",
                            marginBottom: 32,
                        }}
                    />
                )}
            </View>

            {photo && (
                <View>
                    <Animated.View
                        style={[
                            styles.pulsingCircle,
                            {
                                transform: [{ scale: animation }],  // Scale animation for pulse effect
                            },
                        ]}
                    />

                    <Button
                        title={recording ? 'Stop Recording' : 'Start Recording'}
                        onPress={recording ? stopRecording : startRecording}
                    />
                </View>
            )
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    timer: {
        fontSize: 18,
        marginBottom: 20,
    },
    visualizer: {
        width: 100,
        backgroundColor: '#FF6347',  // Customize color
        marginBottom: 20,
    },
    pulsingCircle: {
        width: 100,
        height: 100,
        borderRadius: 75,  // Makes the shape a circle
        backgroundColor: '#FF6347',  // Customize your circle color
        marginBottom: 20,
        padding: 20,
    },
});