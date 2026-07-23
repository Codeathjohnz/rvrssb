import React, { ReactNode } from "react";
import { StyleSheet, View, StyleProp, ViewStyle } from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/themed-text";
import { Palette } from "@/constants/theme";


type Props = {
  icon: string;
  title: string;
  subtitle?: string;
  colors?: readonly [string, string, ...string[]];
  compact?: boolean;
  illustration?: ReactNode;
  style?: StyleProp<ViewStyle>;
};


export function GradientHero({ icon, title, subtitle, colors, compact, illustration, style }: Props) {

  return (

    <LinearGradient
      colors={colors ?? [Palette.primaryDark, Palette.primary, "#43A047"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, compact && styles.heroCompact, style]}
    >

      <View style={[styles.blob, styles.blobOne]} />
      <View style={[styles.blob, styles.blobTwo]} />

      {illustration ? (
        <View style={styles.illustration}>
          {illustration}
        </View>
      ) : (
        <View style={[styles.badge, compact && styles.badgeCompact]}>
          <ThemedText style={[styles.icon, compact && styles.iconCompact]}>
            {icon}
          </ThemedText>
        </View>
      )}

      <ThemedText style={[styles.title, compact && styles.titleCompact]}>
        {title}
      </ThemedText>

      {subtitle ? (
        <ThemedText style={[styles.subtitle, compact && styles.subtitleCompact]}>
          {subtitle}
        </ThemedText>
      ) : null}

    </LinearGradient>

  );

}


const styles = StyleSheet.create({

  hero: {
    paddingTop: 56,
    paddingBottom: 64,
    paddingHorizontal: 25,
    alignItems: "center",
    overflow: "hidden",
  },

  heroCompact: {
    paddingTop: 20,
    paddingBottom: 44,
    alignItems: "flex-start",
  },

  blob: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  blobOne: {
    width: 180,
    height: 180,
    top: -60,
    right: -50,
  },

  blobTwo: {
    width: 120,
    height: 120,
    bottom: -30,
    left: -30,
  },

  illustration: {
    marginBottom: 12,
  },

  badge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  badgeCompact: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 10,
  },

  icon: {
    fontSize: 38,
  },

  iconCompact: {
    fontSize: 26,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  titleCompact: {
    fontSize: 24,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
    color: "rgba(255,255,255,0.9)",
    maxWidth: 320,
  },

  subtitleCompact: {
    textAlign: "left",
    maxWidth: undefined,
    fontSize: 14,
  },

});
