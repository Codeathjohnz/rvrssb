import React, { useEffect, useState } from "react";

import { View, StyleSheet, ActivityIndicator, Pressable } from "react-native";

import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { AdminShell } from "@/components/admin-shell";
import { useTheme } from "@/hooks/use-theme";
import { Palette } from "@/constants/theme";

import API from "../api/api";


type Analytics = {
  totalFarmers: number;
  totalFarms: number;
  totalVarieties: number;
  totalRecommendations: number;
  topVarieties: { variety_name: string; count: number }[];
};

type AccuracyRow = {
  id: number;
  farm_id: number;
  season: string;
  year: number;
  seedlings: string | null;
  yield_amount: string | number;
  yield_unit: string | null;
  barangay: string | null;
  recommended_variety: string | null;
  matched: boolean | null;
};

type Accuracy = {
  totalReported: number;
  comparable: number;
  matched: number;
  matchRate: number | null;
  rows: AccuracyRow[];
};

type SoilSuitabilityRow = {
  barangay: string;
  sampleCount: number;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  ph: number | null;
};


export default function SystemAnalytics() {

  const theme = useTheme();
  const router = useRouter();

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [accuracy, setAccuracy] = useState<Accuracy | null>(null);
  const [soilSuitability, setSoilSuitability] = useState<SoilSuitabilityRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);


  const load = () => {

    setError(null);

    API.get("/api/admin/analytics")
      .then((response) => setAnalytics(response.data))
      .catch((err) => {

        console.log("ANALYTICS ERROR:", err);

        if (err?.response?.status === 401 || err?.response?.status === 403) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Could not load analytics. Check your connection and try again.");
        }

      });

    API.get("/api/admin/accuracy")
      .then((response) => setAccuracy(response.data))
      .catch((err) => console.log("ACCURACY ERROR:", err));

    API.get("/api/admin/soil-suitability")
      .then((response) => setSoilSuitability(response.data))
      .catch((err) => console.log("SOIL SUITABILITY ERROR:", err));

  };


  useEffect(() => {

    load();

  }, []);


  const retry = () => {

    if (error?.includes("session")) {
      router.replace("/login");
      return;
    }

    load();

  };


  const maxCount = analytics?.topVarieties.reduce((max, v) => Math.max(max, v.count), 0) || 1;


  return (

    <AdminShell>

      <ThemedText type="subtitle">
        📈 System Analytics
      </ThemedText>

      <ThemedText themeColor="textSecondary" style={styles.subtitle}>
        Usage overview across all registered farmers and recommendations.
      </ThemedText>


      {error ? (

        <View style={[styles.errorState, { backgroundColor: Palette.surface }]}>

          <ThemedText themeColor="textSecondary" style={styles.errorText}>
            {error}
          </ThemedText>

          <Pressable style={styles.retryButton} onPress={retry}>

            <ThemedText style={styles.retryButtonText}>
              {error.includes("session") ? "Go to Login" : "Retry"}
            </ThemedText>

          </Pressable>

        </View>

      ) : !analytics ? (

        <ActivityIndicator style={styles.loader} color={Palette.admin} />

      ) : (

        <>

          <View style={styles.statRow}>

            <View style={[styles.statCard, { backgroundColor: "#E8F5E9" }]}>
              <ThemedText style={styles.statIcon}>👨‍🌾</ThemedText>
              <ThemedText type="subtitle" style={styles.statValue}>{analytics.totalFarmers}</ThemedText>
              <ThemedText themeColor="textSecondary" type="small">Registered farmers</ThemedText>
            </View>

            <View style={[styles.statCard, { backgroundColor: "#EFEBE9" }]}>
              <ThemedText style={styles.statIcon}>🗺️</ThemedText>
              <ThemedText type="subtitle" style={styles.statValue}>{analytics.totalFarms}</ThemedText>
              <ThemedText themeColor="textSecondary" type="small">Farms on record</ThemedText>
            </View>

            <View style={[styles.statCard, { backgroundColor: "#FFF8E1" }]}>
              <ThemedText style={styles.statIcon}>🌾</ThemedText>
              <ThemedText type="subtitle" style={styles.statValue}>{analytics.totalVarieties}</ThemedText>
              <ThemedText themeColor="textSecondary" type="small">Tracked varieties</ThemedText>
            </View>

            <View style={[styles.statCard, { backgroundColor: "#E3F2FD" }]}>
              <ThemedText style={styles.statIcon}>📊</ThemedText>
              <ThemedText type="subtitle" style={styles.statValue}>{analytics.totalRecommendations}</ThemedText>
              <ThemedText themeColor="textSecondary" type="small">Recommendations run</ThemedText>
            </View>

          </View>


          <View style={[styles.chartCard, { backgroundColor: Palette.surface }]}>

            <ThemedText type="smallBold" style={styles.chartTitle}>
              Most Recommended Varieties
            </ThemedText>

            {analytics.topVarieties.length === 0 ? (

              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                No recommendations have been generated yet.
              </ThemedText>

            ) : (

              analytics.topVarieties.map((variety) => (

                <View key={variety.variety_name} style={styles.barRow}>

                  <ThemedText type="small" style={styles.barLabel} numberOfLines={1}>
                    {variety.variety_name}
                  </ThemedText>

                  <View style={[styles.barTrack, { backgroundColor: theme.background }]}>

                    <View
                      style={[
                        styles.barFill,
                        { width: `${(variety.count / maxCount) * 100}%` },
                      ]}
                    />

                  </View>

                  <ThemedText type="small" style={styles.barCount}>
                    {variety.count}
                  </ThemedText>

                </View>

              ))

            )}

          </View>


          <View style={[styles.chartCard, { backgroundColor: Palette.surface, marginTop: 20, maxWidth: 720 }]}>

            <ThemedText type="smallBold" style={styles.chartTitle}>
              Soil Suitability by Barangay
            </ThemedText>

            <ThemedText themeColor="textSecondary" type="small" style={styles.emptyText}>
              Nitrogen, phosphorus, and potassium levels from submitted DA
              Soil Test Kit results, averaged per barangay (Low = 33%,
              Medium = 66%, High = 100%).
            </ThemedText>

            {!soilSuitability || soilSuitability.every((row) => row.sampleCount === 0) ? (

              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                No soil test records on file yet.
              </ThemedText>

            ) : (

              soilSuitability.map((row) => (

                <View key={row.barangay} style={styles.barangayGroup}>

                  <View style={styles.barangayHeader}>

                    <ThemedText type="smallBold">{row.barangay}</ThemedText>

                    <ThemedText themeColor="textSecondary" type="small">
                      {row.sampleCount} soil test{row.sampleCount === 1 ? "" : "s"}
                    </ThemedText>

                  </View>

                  {row.sampleCount === 0 ? (

                    <ThemedText themeColor="textSecondary" type="small" style={{ marginBottom: 10 }}>
                      No data submitted yet.
                    </ThemedText>

                  ) : (

                    ([
                      { label: "N", value: row.nitrogen, color: Palette.primary },
                      { label: "P", value: row.phosphorus, color: Palette.sky },
                      { label: "K", value: row.potassium, color: Palette.grain },
                    ] as const).map((metric) => (

                      <View key={metric.label} style={styles.groupedBarRow}>

                        <ThemedText type="small" style={styles.groupedBarLabel}>{metric.label}</ThemedText>

                        <View style={[styles.barTrack, { backgroundColor: theme.background }]}>

                          <View
                            style={[
                              styles.barFill,
                              { width: `${metric.value ?? 0}%`, backgroundColor: metric.color },
                            ]}
                          />

                        </View>

                        <ThemedText type="small" style={styles.barCount}>
                          {metric.value !== null ? `${metric.value}%` : "—"}
                        </ThemedText>

                      </View>

                    ))

                  )}

                </View>

              ))

            )}

          </View>


          <View style={[styles.chartCard, { backgroundColor: Palette.surface, marginTop: 20 }]}>

            <ThemedText type="smallBold" style={styles.chartTitle}>
              Recommendation Accuracy
            </ThemedText>

            <ThemedText themeColor="textSecondary" type="small" style={styles.emptyText}>
              Compares each ELECTRE #1 pick against the variety the farmer
              actually reported planting, for every season with a reported
              yield.
            </ThemedText>

            {!accuracy || accuracy.comparable === 0 ? (

              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                Not enough seasons with both a reported yield and a prior
                recommendation to measure accuracy yet.
              </ThemedText>

            ) : (

              <>

                <View style={styles.accuracyHeadline}>

                  <ThemedText type="subtitle" style={styles.statValue}>
                    {Math.round((accuracy.matchRate ?? 0) * 100)}%
                  </ThemedText>

                  <ThemedText themeColor="textSecondary" type="small">
                    {accuracy.matched} of {accuracy.comparable} reported seasons planted
                    the variety ELECTRE ranked #1
                  </ThemedText>

                </View>


                {accuracy.rows.filter((row) => row.matched !== null).map((row) => (

                  <View key={row.id} style={[styles.accuracyRow, { borderColor: Palette.border }]}>

                    <ThemedText style={{ fontSize: 16 }}>
                      {row.matched ? "✅" : "⚠️"}
                    </ThemedText>

                    <View style={{ flex: 1 }}>

                      <ThemedText type="small">
                        {row.barangay || "—"} · {row.season} {row.year}
                      </ThemedText>

                      <ThemedText themeColor="textSecondary" type="small">
                        Recommended: {row.recommended_variety} · Planted: {row.seedlings}
                      </ThemedText>

                    </View>

                    <ThemedText themeColor="textSecondary" type="small">
                      {row.yield_amount} {row.yield_unit}
                    </ThemedText>

                  </View>

                ))}

              </>

            )}

          </View>

        </>

      )}

    </AdminShell>

  );

}


const styles = StyleSheet.create({

  subtitle: {
    marginTop: 6,
    marginBottom: 24,
  },

  loader: {
    marginTop: 40,
  },

  errorState: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    gap: 14,
    maxWidth: 480,
    borderWidth: 1,
    borderColor: Palette.border,
  },

  errorText: {
    textAlign: "center",
  },

  retryButton: {
    backgroundColor: Palette.admin,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 24,
  },

  statCard: {
    flexBasis: "22%",
    flexGrow: 1,
    borderRadius: 16,
    padding: 18,
    gap: 4,
    boxShadow: "0px 2px 6px rgba(15,23,42,0.05)",
  },

  statIcon: {
    fontSize: 22,
  },

  statValue: {
    fontSize: 26,
  },

  chartCard: {
    borderRadius: 20,
    padding: 24,
    maxWidth: 560,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: "0px 2px 6px rgba(15,23,42,0.06)",
  },

  chartTitle: {
    marginBottom: 16,
  },

  emptyText: {
    paddingVertical: 10,
  },

  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  barLabel: {
    width: 110,
  },

  barTrack: {
    flex: 1,
    height: 14,
    borderRadius: 8,
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    backgroundColor: Palette.admin,
    borderRadius: 8,
  },

  barCount: {
    width: 24,
    textAlign: "right",
  },

  accuracyHeadline: {
    marginBottom: 16,
    gap: 2,
  },

  accuracyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
  },

  barangayGroup: {
    marginTop: 16,
  },

  barangayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  groupedBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },

  groupedBarLabel: {
    width: 16,
    fontWeight: "700",
  },

});
