import React from "react";

import {
  View,
  StyleSheet,
} from "react-native";

import { useLocalSearchParams } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { FarmerShell } from "@/components/farmer-shell";
import { useTheme } from "@/hooks/use-theme";
import { Palette } from "@/constants/theme";
import { PSA_REGIONAL_CONTEXT } from "@/constants/psa-context";


export default function Recommendation() {

  const theme = useTheme();

  const params = useLocalSearchParams();

  let result: any = null;

  try {

    result = params.result ? JSON.parse(params.result as string) : null;

  } catch (error) {

    console.log(error);

  }


  // Sample data if no result was passed in yet (e.g. direct navigation)
  const recommendations = result?.ranking || [

    { variety: "NSIC Rc 402", score: 0.92, explanation: "High yield potential and suitable for lowland farming" },
    { variety: "NSIC Rc 436", score: 0.87, explanation: "Good pest resistance and climate adaptability" },
    { variety: "NSIC Rc 222", score: 0.82, explanation: "Stable performance in different environments" },

  ];

  const conditionedOn = result?.conditionedOn;

  const top3 = recommendations.slice(0, 3);

  const maxScore = top3.reduce((max: number, r: any) => Math.max(max, r.score), 0) || 1;


  return (

    <FarmerShell>

      <ThemedText type="subtitle">
        🌾 ELECTRE Rice Recommendation
      </ThemedText>

      <ThemedText themeColor="textSecondary" style={styles.subtitle}>
        Ranked from highest to lowest ELECTRE suitability score.
      </ThemedText>


      {conditionedOn && (

        <View style={[styles.basisBanner, { backgroundColor: Palette.primarySoft }]}>

          <ThemedText type="smallBold" style={{ color: Palette.primaryDark }}>
            Based on your submitted farm data
          </ThemedText>

          <ThemedText style={{ color: Palette.primaryDark, marginTop: 4, lineHeight: 19 }}>
            Soil: {conditionedOn.soilType || "—"} · pH: {conditionedOn.ph ?? "—"} ·
            {" "}Rainfall: {conditionedOn.rainfall ?? "—"}mm · Pest pressure: {conditionedOn.pest_level || "—"}
          </ThemedText>

        </View>

      )}


      <View style={[styles.psaBanner, { backgroundColor: Palette.skySoft }]}>

        <ThemedText type="smallBold" style={{ color: Palette.adminDark }}>
          📊 Regional Context — {PSA_REGIONAL_CONTEXT.region}
        </ThemedText>

        <ThemedText style={{ color: Palette.adminDark, marginTop: 4, lineHeight: 19 }}>
          Average palay yield was {PSA_REGIONAL_CONTEXT.regionalAvgYieldTonsPerHa} t/ha in{" "}
          {PSA_REGIONAL_CONTEXT.quarter} (up from {PSA_REGIONAL_CONTEXT.regionalAvgYieldPriorYear} t/ha
          the year before). {PSA_REGIONAL_CONTEXT.province} produced{" "}
          {PSA_REGIONAL_CONTEXT.provinceProductionMT.toLocaleString()} MT of palay in the same
          period, {PSA_REGIONAL_CONTEXT.provinceIrrigatedSharePercent}% of it irrigated.
        </ThemedText>

        <ThemedText themeColor="textSecondary" type="small" style={{ marginTop: 6 }}>
          Source: {PSA_REGIONAL_CONTEXT.source}
        </ThemedText>

      </View>


      <View style={[styles.chartCard, { backgroundColor: Palette.surface }]}>

        <ThemedText type="smallBold" style={styles.chartTitle}>
          Top 3 Most Suitable Varieties
        </ThemedText>

        {top3.map((item: any, index: number) => (

          <View key={item.variety} style={styles.barRow}>

            <ThemedText type="small" style={styles.barLabel} numberOfLines={1}>
              {index + 1}. {item.variety}
            </ThemedText>

            <View style={[styles.barTrack, { backgroundColor: theme.background }]}>

              <View
                style={[
                  styles.barFill,
                  { width: `${(item.score / maxScore) * 100}%`, backgroundColor: index === 0 ? Palette.grain : Palette.primary },
                ]}
              />

            </View>

            <ThemedText type="small" style={styles.barScore}>
              {item.score.toFixed(3)}
            </ThemedText>

          </View>

        ))}

      </View>


      <ThemedText type="smallBold" style={styles.fullRankingTitle}>
        Full Ranking ({recommendations.length} varieties)
      </ThemedText>

      {recommendations.map((item: any, index: number) => (

        <View
          key={index}
          style={[styles.card, { backgroundColor: Palette.surface, borderColor: Palette.border }]}
        >

          <ThemedText type="smallBold" style={{ color: index === 0 ? Palette.grain : Palette.primaryDark }}>
            {index === 0 ? "🏆 Top Pick — Rank #1" : `Rank #${index + 1}`}
          </ThemedText>

          <ThemedText type="subtitle" style={styles.variety}>
            {item.variety}
          </ThemedText>

          <ThemedText type="smallBold" style={styles.score}>
            ELECTRE Score: {typeof item.score === "number" ? item.score.toFixed(4) : item.score}
          </ThemedText>

          {(item.explanation || item.description) ? (
            <ThemedText themeColor="textSecondary" style={styles.description}>
              {item.explanation || item.description}
            </ThemedText>
          ) : null}

        </View>

      ))}

    </FarmerShell>

  );

}


const styles = StyleSheet.create({

  subtitle: {
    marginTop: 6,
    marginBottom: 20,
  },

  basisBanner: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },

  psaBanner: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
  },

  chartCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: "0px 2px 6px rgba(15,23,42,0.06)",
  },

  chartTitle: {
    marginBottom: 16,
  },

  fullRankingTitle: {
    marginBottom: 12,
  },

  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  barLabel: {
    width: 130,
  },

  barTrack: {
    flex: 1,
    height: 14,
    borderRadius: 8,
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    borderRadius: 8,
  },

  barScore: {
    width: 48,
    textAlign: "right",
  },

  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
  },

  variety: {
    fontSize: 22,
    marginTop: 4,
  },

  score: {
    marginTop: 10,
  },

  description: {
    marginTop: 10,
    lineHeight: 20,
  },

});
