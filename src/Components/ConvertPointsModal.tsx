import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { convertPointsToUSDC, getConversionInfo } from '../api/convert-points';
import { useRewards } from '../hooks/useRewards';

interface ConvertPointsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ConvertPointsModal: React.FC<ConvertPointsModalProps> = ({
  isVisible,
  onClose,
  onSuccess,
}) => {
  const { points, refresh } = useRewards();
  const [pointsAmount, setPointsAmount] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionInfo] = useState(getConversionInfo());

  useEffect(() => {
    if (isVisible) {
      setPointsAmount('');
    }
  }, [isVisible]);

  const availablePoints = points?.balance || 0;
  const usdcAmount = pointsAmount
    ? (parseFloat(pointsAmount) / conversionInfo.rate).toFixed(2)
    : '0.00';

  const handleMax = () => {
    if (availablePoints > 0) {
      setPointsAmount(availablePoints.toString());
    }
  };

  const handleConvert = async () => {
    const amount = parseFloat(pointsAmount);
    
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid points amount');
      return;
    }

    if (amount > availablePoints) {
      Alert.alert('Insufficient Points', `You only have ${availablePoints} points available`);
      return;
    }

    if (amount < conversionInfo.minAmount) {
      Alert.alert(
        'Minimum Amount',
        `Minimum ${conversionInfo.minAmount} points required to convert`
      );
      return;
    }

    setIsConverting(true);
    try {
      const result = await convertPointsToUSDC(amount);
      
      if (result.success) {
        // Refresh points balance
        await refresh();
        
        Alert.alert(
          'Conversion Successful',
          `Converted ${amount} points to $${result.usdcAmount} USDC`,
          [
            {
              text: 'OK',
              onPress: () => {
                onSuccess?.();
                onClose();
              },
            },
          ]
        );
      } else {
        Alert.alert('Conversion Failed', result.error || 'Unable to convert points');
      }
    } catch (error) {
      console.error('[ConvertPointsModal] Error:', error);
      Alert.alert('Error', 'Failed to convert points. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Convert Points to USDC</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Available Points */}
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Available Points</Text>
              <Text style={styles.infoValue}>{availablePoints.toLocaleString()}</Text>
            </View>

            {/* Conversion Rate */}
            <View style={styles.rateCard}>
              <Ionicons name="information-circle-outline" size={20} color="#6366F1" />
              <Text style={styles.rateText}>
                {conversionInfo.rate} points = $1.00 USDC
              </Text>
            </View>

            {/* Points Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Points to Convert</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={pointsAmount}
                  onChangeText={setPointsAmount}
                  placeholder="0"
                  keyboardType="numeric"
                  editable={!isConverting}
                />
                <TouchableOpacity
                  style={styles.maxButton}
                  onPress={handleMax}
                  disabled={availablePoints === 0 || isConverting}
                >
                  <Text style={styles.maxButtonText}>MAX</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* USDC Amount */}
            <View style={styles.outputContainer}>
              <Text style={styles.outputLabel}>You'll Receive</Text>
              <Text style={styles.outputValue}>${usdcAmount} USDC</Text>
            </View>

            {/* Minimum Notice */}
            {parseFloat(pointsAmount) > 0 && parseFloat(pointsAmount) < conversionInfo.minAmount && (
              <View style={styles.warningCard}>
                <Ionicons name="warning-outline" size={20} color="#F59E0B" />
                <Text style={styles.warningText}>
                  Minimum {conversionInfo.minAmount} points required
                </Text>
              </View>
            )}

            {/* Convert Button */}
            <TouchableOpacity
              style={[
                styles.convertButton,
                (isConverting || !pointsAmount || parseFloat(pointsAmount) <= 0 || parseFloat(pointsAmount) < conversionInfo.minAmount) &&
                  styles.convertButtonDisabled,
              ]}
              onPress={handleConvert}
              disabled={
                isConverting ||
                !pointsAmount ||
                parseFloat(pointsAmount) <= 0 ||
                parseFloat(pointsAmount) < conversionInfo.minAmount
              }
            >
              {isConverting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.convertButtonText}>Convert to USDC</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6366F1',
  },
  rateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    gap: 8,
  },
  rateText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  maxButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  maxButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  outputContainer: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  outputLabel: {
    fontSize: 14,
    color: '#065F46',
    marginBottom: 8,
    fontWeight: '500',
  },
  outputValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#065F46',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#92400E',
    flex: 1,
  },
  convertButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  convertButtonDisabled: {
    opacity: 0.5,
  },
  convertButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


