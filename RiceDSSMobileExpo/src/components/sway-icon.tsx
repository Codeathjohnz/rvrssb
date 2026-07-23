import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleProp, TextStyle } from "react-native";

import { ThemedText } from "@/components/themed-text";


type Props = {
  icon: string;
  size?: number;
  delay?: number;
  style?: StyleProp<TextStyle>;
};


// Continuous gentle rotation, like rice stalks swaying in the wind.
export function SwayIcon({ icon, size = 22, delay = 0, style }: Props) {

  const sway = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    const loop = Animated.loop(

      Animated.sequence([

        Animated.timing(sway, {
          toValue: 1,
          duration: 1600,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),

        Animated.timing(sway, {
          toValue: -1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),

        Animated.timing(sway, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),

      ])

    );

    loop.start();

    return () => loop.stop();

  }, [sway, delay]);

  const rotate = sway.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-8deg", "8deg"],
  });

  return (

    <Animated.View style={{ transform: [{ rotate }] }}>

      <ThemedText style={[{ fontSize: size }, style]}>
        {icon}
      </ThemedText>

    </Animated.View>

  );

}
