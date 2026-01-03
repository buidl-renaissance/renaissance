import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../interfaces/rewards';
import { theme } from '../colors';

interface RewardNotificationProps {
  visible: boolean;
  points?: number;
  badge?: Badge;
  onDismiss: () => void;
  autoHideDuration?: number;
}

export const RewardNotification: React.FC<RewardNotificationProps> = ({
  visible,
  points,
  badge,
  onDismiss,
  autoHideDuration = 3000,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      const timer = setTimeout(() => {
        hideNotification();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    } else {
      hideNotification();
    }
  }, [visible]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible && !points && !badge) return null;

  const rarityColors = {
    common: '#9CA3AF',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B',
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={hideNotification}
        activeOpacity={0.9}
      >
        {points !== undefined && (
          <View style={styles.pointsContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="star" size={24} color="#F59E0B" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Points Earned!</Text>
              <Text style={styles.amount}>+{points} points</Text>
            </View>
          </View>
        )}

        {badge && (
          <View
            style={[
              styles.badgeContainer,
              { borderColor: rarityColors[badge.rarity] },
            ]}
          >
            <View
              style={[
                styles.badgeIconContainer,
                { backgroundColor: `${rarityColors[badge.rarity]}20` },
              ]}
            >
              <Ionicons
                name={badge.icon as any}
                size={32}
                color={rarityColors[badge.rarity]}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.badgeTitle}>Badge Unlocked!</Text>
              <Text style={styles.badgeName}>{badge.name}</Text>
            </View>
            <View
              style={[
                styles.rarityBadge,
                { backgroundColor: rarityColors[badge.rarity] },
              ]}
            >
              <Text style={styles.rarityText}>{badge.rarity.toUpperCase()}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 2,
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
  },
  badgeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 2,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  rarityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
});


