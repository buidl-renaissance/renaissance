import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../interfaces/rewards';

interface BadgeDisplayProps {
  badge: Badge;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  onPress?: () => void;
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badge,
  size = 'medium',
  showName = false,
  onPress,
}) => {
  const isUnlocked = !!badge.unlockedAt;
  const sizeMap = {
    small: 40,
    medium: 60,
    large: 80,
  };
  const iconSize = sizeMap[size];

  const rarityColors = {
    common: '#9CA3AF',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B',
  };

  const rarityBorders = {
    common: '#D1D5DB',
    rare: '#60A5FA',
    epic: '#A78BFA',
    legendary: '#FBBF24',
  };

  const content = (
    <View style={styles.badgeContainer}>
      <View
        style={[
          styles.badgeIcon,
          {
            width: iconSize,
            height: iconSize,
            borderRadius: iconSize / 2,
            borderWidth: isUnlocked ? 3 : 2,
            borderColor: isUnlocked
              ? rarityBorders[badge.rarity]
              : '#E5E7EB',
            backgroundColor: isUnlocked
              ? `${rarityColors[badge.rarity]}20`
              : '#F3F4F6',
          },
        ]}
      >
        {isUnlocked ? (
          <Ionicons
            name={badge.icon as any}
            size={iconSize * 0.5}
            color={rarityColors[badge.rarity]}
          />
        ) : (
          <Ionicons name="lock-closed" size={iconSize * 0.4} color="#9CA3AF" />
        )}
      </View>
      {showName && (
        <Text style={styles.badgeName} numberOfLines={1}>
          {badge.name}
        </Text>
      )}
      {badge.progress !== undefined && badge.maxProgress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(badge.progress / badge.maxProgress) * 100}%`,
                  backgroundColor: rarityColors[badge.rarity],
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {badge.progress}/{badge.maxProgress}
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
};

interface BadgeGridProps {
  badges: Badge[];
  onBadgePress?: (badge: Badge) => void;
}

export const BadgeGrid: React.FC<BadgeGridProps> = ({
  badges,
  onBadgePress,
}) => {
  return (
    <View style={styles.grid}>
      {badges.map((badge) => (
        <BadgeDisplay
          key={badge.id}
          badge={badge}
          size="medium"
          showName={true}
          onPress={() => onBadgePress?.(badge)}
        />
      ))}
    </View>
  );
};

interface BadgeDetailModalProps {
  badge: Badge | null;
  isVisible: boolean;
  onClose: () => void;
}

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({
  badge,
  isVisible,
  onClose,
}) => {
  if (!badge) return null;

  const rarityColors = {
    common: '#9CA3AF',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B',
  };

  const isUnlocked = !!badge.unlockedAt;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Badge Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalBadgeContainer}>
              <View
                style={[
                  styles.modalBadgeIcon,
                  {
                    borderColor: isUnlocked
                      ? rarityColors[badge.rarity]
                      : '#E5E7EB',
                    backgroundColor: isUnlocked
                      ? `${rarityColors[badge.rarity]}20`
                      : '#F3F4F6',
                  },
                ]}
              >
                {isUnlocked ? (
                  <Ionicons
                    name={badge.icon as any}
                    size={60}
                    color={rarityColors[badge.rarity]}
                  />
                ) : (
                  <Ionicons name="lock-closed" size={50} color="#9CA3AF" />
                )}
              </View>
            </View>

            <Text style={styles.modalBadgeName}>{badge.name}</Text>
            <Text style={styles.modalBadgeDescription}>{badge.description}</Text>

            <View
              style={[
                styles.modalRarityBadge,
                { backgroundColor: `${rarityColors[badge.rarity]}20` },
              ]}
            >
              <Text
                style={[
                  styles.modalRarityText,
                  { color: rarityColors[badge.rarity] },
                ]}
              >
                {badge.rarity.toUpperCase()}
              </Text>
            </View>

            {isUnlocked && badge.unlockedAt && (
              <View style={styles.modalUnlockedInfo}>
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                <Text style={styles.modalUnlockedText}>
                  Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                </Text>
              </View>
            )}

            {badge.progress !== undefined && badge.maxProgress && (
              <View style={styles.modalProgressContainer}>
                <Text style={styles.modalProgressLabel}>Progress</Text>
                <View style={styles.modalProgressBar}>
                  <View
                    style={[
                      styles.modalProgressFill,
                      {
                        width: `${(badge.progress / badge.maxProgress) * 100}%`,
                        backgroundColor: rarityColors[badge.rarity],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.modalProgressText}>
                  {badge.progress} / {badge.maxProgress}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    alignItems: 'center',
    width: 100,
  },
  badgeIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'flex-start',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalContent: {
    padding: 20,
  },
  modalBadgeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalBadgeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBadgeName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBadgeDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalRarityBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 20,
  },
  modalRarityText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  modalUnlockedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  modalUnlockedText: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '500',
  },
  modalProgressContainer: {
    marginTop: 20,
  },
  modalProgressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalProgressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  modalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  modalProgressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

