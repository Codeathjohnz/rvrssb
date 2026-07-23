import React, { useEffect, useState } from "react";

import {
  View,
  Pressable,
  StyleSheet,
} from "react-native";

import { useRouter, useLocalSearchParams } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { FadeInView } from "@/components/fade-in-view";
import { AdminShell, ADMIN_NAV_ITEMS } from "@/components/admin-shell";
import { Palette } from "@/constants/theme";

import API from "../api/api";


type Analytics = {
  totalFarmers: number;
  totalFarms: number;
  totalVarieties: number;
  totalRecommendations: number;
  topVarieties: { variety_name: string; count: number }[];
};


export default function AdminDashboard() {

  const router = useRouter();

  const { username } = useLocalSearchParams<{ username?: string }>();

  const [analytics, setAnalytics] = useState<Analytics | null>(null);


  useEffect(() => {

    API.get("/api/admin/analytics")
      .then((response) => setAnalytics(response.data))
      .catch((error) => console.log("ANALYTICS ERROR:", error));

  }, []);


  const cards = ADMIN_NAV_ITEMS.filter((item) => item.href !== "/admin-dashboard");


  return (

    <AdminShell>

      <FadeInView delay={0}>

        <ThemedText type="subtitle">
          Welcome, {username || "Admin"} 🛡️
        </ThemedText>

        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          RVRSSB Admin Console — manage farmer records, rice varieties, and
          the ELECTRE evaluation criteria used to generate recommendations.
        </ThemedText>

      </FadeInView>


      <FadeInView delay={90}>

        <View style={styles.statRow}>

          <View style={[styles.statCard, { backgroundColor: "#E8F5E9" }]}>
            <ThemedText style={styles.statIcon}>👨‍🌾</ThemedText>
            <ThemedText type="smallBold">{analytics?.totalFarmers ?? "—"}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">Registered farmers</ThemedText>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#FFF8E1" }]}>
            <ThemedText style={styles.statIcon}>🌾</ThemedText>
            <ThemedText type="smallBold">{analytics?.totalVarieties ?? "—"}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">Rice varieties</ThemedText>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#E3F2FD" }]}>
            <ThemedText style={styles.statIcon}>📊</ThemedText>
            <ThemedText type="smallBold">{analytics?.totalRecommendations ?? "—"}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">Recommendations run</ThemedText>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#EFEBE9" }]}>
            <ThemedText style={styles.statIcon}>🗺️</ThemedText>
            <ThemedText type="smallBold">{analytics?.totalFarms ?? "—"}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">Farms on record</ThemedText>
          </View>

        </View>

      </FadeInView>


      <FadeInView delay={180}>

        <View style={styles.grid}>

          {cards.map((item) => (

            <Pressable
              key={String(item.href)}
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

            </Pressable>

          ))}

        </View>

      </FadeInView>

    </AdminShell>

  );

}


const styles = StyleSheet.create({

  pressed: {
    opacity: 0.65,
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 20,
  },

  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 28,
  },

  statCard: {
    flexBasis: "22%",
    flexGrow: 1,
    borderRadius: 16,
    padding: 16,
    gap: 4,
    boxShadow: "0px 2px 6px rgba(15,23,42,0.05)",
  },

  statIcon: {
    fontSize: 22,
    marginBottom: 2,
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
    gap: 8,
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
  },

  icon: {
    fontSize: 22,
  },

  featureTitle: {
    marginTop: 2,
  },

});
