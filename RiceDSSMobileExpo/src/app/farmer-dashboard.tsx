import React from "react";

import {
  View,
  Pressable,
  StyleSheet,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { useRouter, useLocalSearchParams } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { GradientHero } from "@/components/gradient-hero";
import { FadeInView } from "@/components/fade-in-view";
import { SwayIcon } from "@/components/sway-icon";
import { FarmerShell } from "@/components/farmer-shell";
import { useTheme } from "@/hooks/use-theme";
import { Palette } from "@/constants/theme";


const NAV_ITEMS = [

  { href: "/farm-data", icon: "🌱", label: "Enter Farm Data", desc: "Soil type, pH, NPK, and rainfall", color: "#EFEBE9" },
  { href: "/recommendation", icon: "🌾", label: "Rice Recommendation", desc: "View your ranked varieties", color: "#FFF8E1" },
  { href: "/history", icon: "📊", label: "Recommendation History", desc: "Review your past results", color: "#E3F2FD" },

] as const;


const FACTS = [

  { icon: "🌦️", color: "#E3F2FD", value: "Wet Season", label: "Growing season focus" },
  { icon: "🌾", color: "#FFF8E1", value: "8 Varieties", label: "NSIC varieties tracked" },
  { icon: "📍", color: "#EFEBE9", value: "4 Barangays", label: "Covered in Bunawan" },

] as const;


export default function FarmerDashboard() {

  const router = useRouter();
  const theme = useTheme();

  const { username } = useLocalSearchParams<{ username?: string }>();


  return (

    <FarmerShell>

      {(isWide) => isWide ? (

        <>

          <FadeInView delay={0}>

            <ThemedText type="subtitle">
              Good day, {username || "Farmer"} 👋
            </ThemedText>

            <ThemedText themeColor="textSecondary" style={styles.mainSubtitle}>
              Bunawan, Agusan del Sur — here&apos;s your rice variety workspace.
            </ThemedText>

          </FadeInView>


          <FadeInView delay={90}>

            <LinearGradient
              colors={[Palette.primaryDark, Palette.primary, "#E6B800"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaBanner}
            >

              <View style={styles.ctaSwayRow}>
                <SwayIcon icon="🌾" size={22} delay={0} />
                <SwayIcon icon="🌾" size={30} delay={250} />
                <SwayIcon icon="🌾" size={24} delay={500} />
              </View>

              <ThemedText style={styles.ctaTitle}>
                Ready for this season&apos;s recommendation?
              </ThemedText>

              <ThemedText style={styles.ctaText}>
                Enter your latest soil and field data to get a fresh
                ELECTRE-ranked variety list for your farm.
              </ThemedText>

              <Pressable
                style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]}
                onPress={() => router.push({ pathname: "/farm-data", params: { username } })}
              >

                <ThemedText style={styles.ctaButtonText}>
                  🌱 Start New Recommendation
                </ThemedText>

              </Pressable>

            </LinearGradient>

          </FadeInView>


          <FadeInView delay={180}>

            <View style={styles.factRow}>

              {FACTS.map((fact) => (

                <View
                  key={fact.label}
                  style={[styles.factCard, { backgroundColor: fact.color }]}
                >

                  <ThemedText style={styles.factIcon}>{fact.icon}</ThemedText>

                  <ThemedText type="smallBold">{fact.value}</ThemedText>

                  <ThemedText themeColor="textSecondary" type="small">
                    {fact.label}
                  </ThemedText>

                </View>

              ))}

            </View>

          </FadeInView>


          <FadeInView delay={260}>

            <View style={[styles.tipCard, { backgroundColor: Palette.surface }]}>

              <SwayIcon icon="🌱" size={30} />

              <View style={styles.tipTextWrap}>

                <ThemedText type="smallBold">
                  Did you know?
                </ThemedText>

                <ThemedText themeColor="textSecondary" style={styles.tipText}>
                  Matching rice varieties to local soil and climate conditions
                  can help prevent yield losses of up to 2 tons per hectare
                  (DA-Caraga, 2023).
                </ThemedText>

              </View>

            </View>

          </FadeInView>

        </>

      ) : (

        <>

          <GradientHero
            icon="👨‍🌾"
            title={username || "Farmer"}
            subtitle="Welcome back"
            compact
          />


          <View style={[styles.sheet, { backgroundColor: theme.background }]}>

            <View style={[styles.heroCard, { backgroundColor: Palette.primarySoft }]}>

              <View style={styles.heroCardHeader}>

                <ThemedText type="smallBold" style={{ color: Palette.primaryDark }}>
                  RVRSSB
                </ThemedText>

                <SwayIcon icon="🌾" size={22} />

              </View>

              <ThemedText style={styles.heroText}>
                Get the best rice variety for your field using the ELECTRE
                decision method, based on your soil, climate, and field data.
              </ThemedText>

            </View>


            <View style={styles.grid}>

              {NAV_ITEMS.map((item) => (

                <Pressable
                  key={item.href}
                  style={({ pressed }) => [
                    styles.featureCard,
                    { backgroundColor: Palette.surface },
                    pressed && styles.pressed,
                  ]}
                  onPress={() => router.push({ pathname: item.href, params: { username } })}
                >

                  <View style={[styles.featureIconCircle, { backgroundColor: item.color }]}>
                    <ThemedText style={styles.icon}>{item.icon}</ThemedText>
                  </View>

                  <ThemedText type="smallBold" style={styles.featureTitle}>
                    {item.label}
                  </ThemedText>

                  <ThemedText themeColor="textSecondary" type="small" style={styles.featureDescription}>
                    {item.desc}
                  </ThemedText>

                </Pressable>

              ))}

            </View>

          </View>

        </>

      )}

    </FarmerShell>

  );

}


const styles = StyleSheet.create({

  pressed: {
    opacity: 0.65,
  },

  sheet: {
    marginTop: -24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 28,
    flexGrow: 1,
  },

  heroCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    gap: 8,
  },

  heroCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroText: {
    lineHeight: 22,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

  featureCard: {
    flexBasis: "48%",
    flexGrow: 1,
    borderRadius: 16,
    padding: 18,
    gap: 6,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: "0px 2px 6px rgba(15,23,42,0.06)",
  },

  featureIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },

  icon: {
    fontSize: 22,
  },

  featureTitle: {
    marginTop: 4,
  },

  featureDescription: {
    lineHeight: 18,
  },

  mainSubtitle: {
    marginTop: 6,
    marginBottom: 28,
  },

  ctaBanner: {
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    overflow: "hidden",
  },

  ctaSwayRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },

  ctaTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    maxWidth: 420,
  },

  ctaText: {
    marginTop: 8,
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    maxWidth: 420,
    lineHeight: 20,
  },

  ctaButton: {
    marginTop: 20,
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 30,
  },

  ctaButtonText: {
    color: Palette.primaryDark,
    fontWeight: "bold",
    fontSize: 15,
  },

  factRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 24,
  },

  factCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },

  factIcon: {
    fontSize: 22,
    marginBottom: 4,
  },

  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: "0px 2px 6px rgba(15,23,42,0.06)",
  },

  tipTextWrap: {
    flex: 1,
  },

  tipText: {
    marginTop: 4,
    lineHeight: 20,
  },

});
