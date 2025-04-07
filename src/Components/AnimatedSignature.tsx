import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface AnimatedSignatureProps {
  width?: number;
  height?: number;
  color?: string;
  duration?: number;
}

const AnimatedSignature: React.FC<AnimatedSignatureProps> = ({
  width = 300,
  height = 100,
  color = '#fff',
  duration = 3000,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: duration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();
  }, [animatedValue, duration]);

  // More granular SVG path for the signature "WIREDINSAMURAI"
  const signaturePath = 
    // W
    "M10,50 L15,20 L20,35 L25,20 L30,50 " +
    // I
    "M40,20 L40,50 " +
    // R
    "M50,20 L50,50 " + // Vertical line
    "M50,20 L70,20 " + // Top horizontal line
    "M50,35 L70,35 " + // Middle horizontal line
    "M70,20 C70,25 70,30 65,35 " + // Curve from top right to middle
    "M50,35 L65,50 " + // Diagonal line from middle to bottom
    // E
    "M80,20 C80,25 80,30 80,35 C80,40 80,45 80,50 " +
    "M90,20 C95,20 100,20 105,20 C110,20 110,20 110,20 " +
    "M90,35 C95,35 100,35 105,35 C110,35 110,35 110,35 " +
    "M90,50 C95,50 100,50 105,50 C110,50 110,50 110,50 " +
    // D
    "M120,20 C120,25 120,30 120,35 C120,40 120,45 120,50 " +
    // I
    "M130,20 C132,23 134,26 136,30 C138,33 140,35 140,35 " +
    "C140,35 142,33 144,30 C146,26 148,23 150,20 " +
    "C150,20 150,25 150,30 C150,35 150,40 150,45 C150,50 150,50 150,50 " +
    // N
    "M160,35 C160,30 162,25 165,23 C168,21 172,20 175,20 " +
    "C178,20 182,21 185,23 C188,25 190,30 190,35 " +
    "C190,40 188,45 185,47 C182,49 178,50 175,50 " +
    "C172,50 168,49 165,47 C162,45 160,40 160,35 " +
    // S
    "M190,20 C190,25 190,30 190,35 C190,40 190,45 190,50 " +
    "M190,50 C195,50 200,50 205,50 C210,50 210,50 210,50 " +
    // A
    "M220,20 C220,25 220,30 220,35 C220,40 220,45 220,50 " +
    // M
    "M230,20 C232,23 234,26 236,30 C238,33 240,35 240,35 " +
    "C240,35 242,33 244,30 C246,26 248,23 250,20 " +
    "C250,20 250,25 250,30 C250,35 250,40 250,45 C250,50 250,50 250,50 " +
    // U
    "M260,20 C260,25 260,30 260,35 C260,40 260,45 260,50 " +
    "M260,50 C265,50 270,50 275,50 C280,50 280,50 280,50 " +
    "M280,20 C280,25 280,30 280,35 C280,40 280,45 280,50 " +
    // R
    "M290,20 C290,25 290,30 290,35 C290,40 290,45 290,50 " +
    "M290,50 C295,50 300,50 305,50 C310,50 310,50 310,50 " +
    // A
    "M320,20 C325,20 330,20 335,20 C340,20 340,20 340,20 " +
    "M320,35 C325,35 330,35 335,35 C340,35 340,35 340,35 " +
    "M320,20 C320,25 320,30 320,35 C320,40 320,45 320,50 " +
    "M340,20 C340,25 340,30 340,35 C340,40 340,45 340,50 " +
    // I
    "M350,20 C350,25 350,30 350,35 C350,40 350,45 350,50 " +
    "M360,20 C360,25 360,30 360,35 C360,40 360,45 360,50 " +
    // I
    "M370,20 C370,25 370,30 370,35 C370,40 370,45 370,50 " +
    "M370,50 C375,50 380,50 385,50 C390,50 390,50 390,50";

  const AnimatedPath = Animated.createAnimatedComponent(Path);
  
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [3000, 0], // Increased dash array to account for longer path
  });

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 400 70">
        <AnimatedPath
          d={signaturePath}
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeDasharray={3000}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnimatedSignature;
