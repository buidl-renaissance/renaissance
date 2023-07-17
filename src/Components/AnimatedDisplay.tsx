import React from 'react';
import { Animated } from 'react-native';

interface AnimatedDisplayProps {
    delay?: number;
    duration?: number;
    style?: any;
}

export const FadeOutView: React.FC<AnimatedDisplayProps> = ({ children, delay = 0, duration = 3000, style } ) => {
    const fadeAnim = React.useRef(new Animated.Value(1)).current  // Initial value for opacity: 0

    React.useEffect(() => {
      Animated.timing(fadeAnim, {
          toValue: 0, 
          duration,
          delay,
          useNativeDriver: false
      })
              .start();
    }, [fadeAnim]);
    
    return (
        <Animated.View                 // Special animatable View
            style={{
                ...style,
                opacity: fadeAnim,         // Bind opacity to animated value
            }}
        >
            {children}
        </Animated.View>
    )
}

export const FadeInView: React.FC<AnimatedDisplayProps> = ({ children, delay = 0, duration = 3000, style } ) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current  // Initial value for opacity: 0

    React.useEffect(() => {
      Animated.timing(fadeAnim, {
          toValue: 1, 
          duration,
          delay,
          useNativeDriver: false
      })
              .start();
    }, [fadeAnim]);
    
    return (
        <Animated.View                 // Special animatable View
            style={{
                ...style,
                opacity: fadeAnim,         // Bind opacity to animated value
            }}
        >
            {children}
        </Animated.View>
    )
}