import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { DAEvent, LumaEvent, RAEvent } from '../interfaces';
import { checkInToEvent, hasCheckedIn, generateEventQRCode } from '../utils/event-checkin';
import { useRewards } from '../hooks/useRewards';
import { getRewardConfig } from '../utils/rewards-storage';
import { useAuth } from '../context/Auth';

interface EventCheckInButtonProps {
  event: DAEvent | LumaEvent | RAEvent;
  eventType: 'da' | 'luma' | 'ra';
  onCheckInSuccess?: () => void;
}

export const EventCheckInButton: React.FC<EventCheckInButtonProps> = ({
  event,
  eventType,
  onCheckInSuccess,
}) => {
  const { state: authState } = useAuth();
  const { addPoints, refresh } = useRewards();
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState<Location.LocationPermissionResponse | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Get event ID based on type
  const eventId = eventType === 'da' && 'id' in event
    ? event.id.toString()
    : eventType === 'luma' && 'apiId' in event
    ? event.apiId
    : eventType === 'ra' && 'id' in event
    ? event.id.toString()
    : '';

  // Check if already checked in
  React.useEffect(() => {
    const checkStatus = async () => {
      if (eventId) {
        const checkedIn = await hasCheckedIn(eventId);
        setIsCheckedIn(checkedIn);
      }
      setCheckingStatus(false);
    };
    checkStatus();
  }, [eventId]);

  // Request location permission
  React.useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission({ status } as Location.LocationPermissionResponse);
    };
    requestLocationPermission();
  }, []);

  const handleCheckIn = async (skipLocation = false) => {
    if (!authState.isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to check in to events');
      return;
    }

    setIsCheckingIn(true);
    try {
      // Get current location if permission granted
      let location: { latitude: number; longitude: number } | undefined;
      if (!skipLocation && locationPermission?.status === 'granted') {
        try {
          const currentLocation = await Location.getCurrentPositionAsync({});
          location = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          };
        } catch (error) {
          console.warn('[EventCheckIn] Could not get location:', error);
        }
      }

      const result = await checkInToEvent(eventId, eventType, event, {
        location,
        skipLocationVerification: skipLocation || !location,
      });

      if (result.success) {
        // Award points
        const config = getRewardConfig();
        await addPoints(config.pointValues.event_checkin, 'event_checkin', {
          eventId,
        });

        // Check for badge unlocks
        await refresh();

        setIsCheckedIn(true);
        Alert.alert('Success', 'Checked in successfully! You earned points!');
        onCheckInSuccess?.();
      } else {
        Alert.alert('Check-in Failed', result.error || 'Unable to check in');
      }
    } catch (error) {
      console.error('[EventCheckIn] Error:', error);
      Alert.alert('Error', 'Failed to check in. Please try again.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleQRCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    // Verify QR code
    const qrValid = checkInToEvent(eventId, eventType, event, {
      qrData: data,
      skipLocationVerification: false,
    }).then(result => {
      if (result.success) {
        setShowQRScanner(false);
        setScanned(false);
        handleCheckIn(true); // Check in with QR verification
      } else {
        setScanned(false);
        Alert.alert('Invalid QR Code', result.error || 'This QR code is not valid for this event');
      }
    });
  };

  const handleManualCheckIn = () => {
    Alert.alert(
      'Check In',
      'Would you like to check in using QR code or location?',
      [
        {
          text: 'QR Code',
          onPress: () => {
            if (!permission?.granted) {
              requestPermission();
            } else {
              setShowQRScanner(true);
            }
          },
        },
        {
          text: 'Location',
          onPress: () => handleCheckIn(false),
        },
        {
          text: 'Skip Verification',
          onPress: () => handleCheckIn(true),
          style: 'destructive',
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (checkingStatus) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#6366F1" />
      </View>
    );
  }

  if (isCheckedIn) {
    return (
      <View style={[styles.container, styles.checkedInContainer]}>
        <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
        <Text style={styles.checkedInText}>Checked In</Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.button, isCheckingIn && styles.buttonDisabled]}
        onPress={handleManualCheckIn}
        disabled={isCheckingIn}
      >
        {isCheckingIn ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>Check In</Text>
          </>
        )}
      </TouchableOpacity>

      {/* QR Scanner Modal */}
      <Modal
        visible={showQRScanner}
        animationType="slide"
        onRequestClose={() => setShowQRScanner(false)}
      >
        <View style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowQRScanner(false);
                setScanned(false);
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.scannerTitle}>Scan QR Code</Text>
            <View style={{ width: 24 }} />
          </View>
          {permission?.granted ? (
            <CameraView
              style={styles.camera}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleQRCodeScanned}
            >
              <View style={styles.scannerOverlay}>
                <View style={styles.scannerFrame} />
                <Text style={styles.scannerHint}>
                  Position the QR code within the frame
                </Text>
              </View>
            </CameraView>
          ) : (
            <View style={styles.permissionContainer}>
              <Ionicons name="camera-outline" size={64} color="#999" />
              <Text style={styles.permissionText}>Camera permission required</Text>
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={requestPermission}
              >
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  checkedInContainer: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  checkedInText: {
    color: '#065F46',
    fontSize: 14,
    fontWeight: '600',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  scannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 4,
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#6366F1',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scannerHint: {
    color: '#fff',
    marginTop: 24,
    fontSize: 16,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionText: {
    color: '#999',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  permissionButton: {
    marginTop: 24,
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


