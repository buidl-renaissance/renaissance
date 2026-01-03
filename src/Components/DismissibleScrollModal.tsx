import React, { useRef, useState, useCallback, ReactNode } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  PanResponder,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import Modal from "react-native-modal";
import Icon, { IconTypes } from "./Icon";
import { theme } from "../colors";

interface DismissibleScrollModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children: (scrollHandlers: {
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    scrollEnabled?: boolean;
  }) => ReactNode;
  height?: string | number;
  showDragHandle?: boolean;
  headerRight?: ReactNode;
}

export const DismissibleScrollModal: React.FC<DismissibleScrollModalProps> = ({
  isVisible,
  onClose,
  title,
  children,
  height = "90%",
  showDragHandle = true,
  headerRight,
  onScroll,
  scrollViewRef,
  contentContainerStyle,
}) => {
  const [isDismissing, setIsDismissing] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isDraggingDown, setIsDraggingDown] = useState(false);
  const isAtTopRef = useRef(true);
  
  const translateY = useRef(new Animated.Value(0)).current;

  // Pan responder for content area when at top
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isAtTopRef.current,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward swipes when at top
        return isAtTopRef.current && gestureState.dy > 5;
      },
      onPanResponderGrant: () => {
        setIsDraggingDown(true);
        translateY.setOffset(0);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement when at top
        if (isAtTopRef.current && gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDraggingDown(false);
        translateY.flattenOffset();
        
        // If dragged down more than 100px, dismiss the modal
        if (gestureState.dy > 100) {
          setIsDismissing(true);
          onClose();
          Animated.timing(translateY, {
            toValue: 1000,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            setIsDismissing(false);
          });
        } else {
          // Spring back to original position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        setIsDraggingDown(false);
        translateY.flattenOffset();
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      },
    })
  ).current;

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const wasAtTop = offsetY <= 0;
    setIsAtTop(wasAtTop);
    isAtTopRef.current = wasAtTop;
    
    // Call custom onScroll if provided
    if (onScroll) {
      onScroll(event);
    }
  }, [onScroll]);

  React.useEffect(() => {
    if (isVisible) {
      translateY.setValue(0);
      setIsDismissing(false);
      setIsAtTop(true);
      isAtTopRef.current = true;
    }
  }, [isVisible, translateY]);

  return (
    <Modal
      isVisible={isVisible && !isDismissing}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
      hideModalContentWhileAnimating
      backdropOpacity={0.5}
    >
      <Animated.View 
        style={[
          styles.container,
          {
            height,
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Drag handle */}
        {showDragHandle && (
          <View style={styles.dragHandle} {...panResponder.panHandlers}>
            <View style={styles.dragHandleBar} />
          </View>
        )}
        
        {/* Title header */}
        <View style={styles.titleHeader} {...panResponder.panHandlers}>
          <Text style={styles.titleHeaderText}>{title}</Text>
          <View style={styles.headerRight}>
            {headerRight}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon type={IconTypes.Ionicons} name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content wrapper with PanResponder for dismiss when at top */}
        <View 
          style={styles.contentWrapper}
          {...(isAtTop ? panResponder.panHandlers : {})}
          collapsable={false}
        >
          {children({
            onScroll: handleScroll,
            scrollEnabled: !isDraggingDown,
          })}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  dragHandle: {
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  dragHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.borderLight,
  },
  titleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  titleHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  closeButton: {
    padding: 4,
  },
  contentWrapper: {
    flex: 1,
  },
});

