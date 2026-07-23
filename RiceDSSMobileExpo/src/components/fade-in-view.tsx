import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";


type Props = {
  delay?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};


// Simple fade + rise-in entrance, used to stagger dashboard sections on mount.
export function FadeInView({ delay = 0, children, style }: Props) {

  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 420,
      delay,
      useNativeDriver: true,
    });

    animation.start();

    return () => animation.stop();

  }, [progress, delay]);

  return (

    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
          ],
        },
      ]}
    >

      {children}

    </Animated.View>

  );

}
