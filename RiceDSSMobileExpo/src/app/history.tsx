import React, { useEffect, useState } from "react";

import { View, StyleSheet, Pressable, ActivityIndicator } from "react-native";

import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { FarmerShell } from "@/components/farmer-shell";
import { Palette } from "@/constants/theme";

import API from "../api/api";


type RecommendationRow = {
  id: number;
  farm_id: number | null;
  rice_variety_id: number;
  variety_name: string;
  score: string;
  rank_position: number;
  created_at: string;
};

type Run = {
  key: string;
  created_at: string;
  items: RecommendationRow[];
};


function groupIntoRuns(rows: RecommendationRow[]): Run[] {

  const map = new Map<string, RecommendationRow[]>();

  rows.forEach((row) => {

    const list = map.get(row.created_at) ?? [];
    list.push(row);
    map.set(row.created_at, list);

  });

  return Array.from(map.entries()).map(([key, items]) => ({
    key,
    created_at: key,
    items: items.slice().sort((a, b) => a.rank_position - b.rank_position),
  }));

}


function formatDate(iso: string): string {

  return new Date(iso).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

}


export default function History() {

  const router = useRouter();

  const [runs, setRuns] = useState<Run[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});


  const load = () => {

    setError(null);

    API.get("/api/farmer/recommendations")
      .then((response) => setRuns(groupIntoRuns(response.data)))
      .catch((err) => {

        console.log("HISTORY ERROR:", err);

        if (err?.response?.status === 401 || err?.response?.status === 403) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Could not load recommendation history. Check your connection and try again.");
        }

      });

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


  const toggle = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };


  return (

    <FarmerShell>

      <ThemedText type="subtitle">
        📊 Recommendation History
      </ThemedText>

      <ThemedText themeColor="textSecondary" style={styles.subtitle}>
        Your past ELECTRE results — tap a card to see the full ranking.
      </ThemedText>


      {error ? (

        <View style={[styles.emptyState, { backgroundColor: Palette.surface }]}>

          <ThemedText themeColor="textSecondary" style={styles.emptyText}>
            {error}
          </ThemedText>

          <Pressable style={styles.retryButton} onPress={retry}>

            <ThemedText style={styles.retryButtonText}>
              {error.includes("session") ? "Go to Login" : "Retry"}
            </ThemedText>

          </Pressable>

        </View>

      ) : !runs ? (

        <ActivityIndicator color={Palette.primary} style={{ marginTop: 40 }} />

      ) : runs.length === 0 ? (

        <View style={[styles.emptyState, { backgroundColor: Palette.surface }]}>

          <ThemedText style={styles.emptyIcon}>🌾</ThemedText>

          <ThemedText type="smallBold">
            No recommendations yet
          </ThemedText>

          <ThemedText themeColor="textSecondary" style={styles.emptyText}>
            Enter your farm data to generate your first recommendation.
          </ThemedText>

        </View>

      ) : (

        <View style={styles.list}>

          {runs.map((run) => {

            const top = run.items[0];
            const isOpen = !!expanded[run.key];

            return (

              <Pressable
                key={run.key}
                style={[styles.card, { backgroundColor: Palette.surface }]}
                onPress={() => toggle(run.key)}
              >

                <View style={styles.cardHeader}>

                  <View style={styles.cardHeaderText}>

                    <ThemedText themeColor="textSecondary" type="small">
                      {formatDate(run.created_at)}
                    </ThemedText>

                    <ThemedText type="smallBold" style={styles.topVariety}>
                      🏆 {top.variety_name}
                    </ThemedText>

                    <ThemedText themeColor="textSecondary" type="small">
                      Top match · score {Number(top.score).toFixed(3)}
                    </ThemedText>

                  </View>

                  <ThemedText themeColor="textSecondary" style={styles.chevron}>
                    {isOpen ? "▲" : "▼"}
                  </ThemedText>

                </View>


                {isOpen && (

                  <View style={[styles.rankList, { borderTopColor: Palette.border }]}>

                    {run.items.map((item) => (

                      <View key={item.id} style={styles.rankRow}>

                        <ThemedText type="small" style={[styles.rankBadge, { color: Palette.primary }]}>
                          #{item.rank_position}
                        </ThemedText>

                        <ThemedText type="small" style={styles.rankName}>
                          {item.variety_name}
                        </ThemedText>

                        <ThemedText themeColor="textSecondary" type="small">
                          {Number(item.score).toFixed(3)}
                        </ThemedText>

                      </View>

                    ))}

                  </View>

                )}

              </Pressable>

            );

          })}

        </View>

      )}

    </FarmerShell>

  );

}


const styles = StyleSheet.create({

  subtitle: {
    marginTop: 6,
    marginBottom: 24,
  },

  emptyState: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Palette.border,
  },

  emptyIcon: {
    fontSize: 36,
    marginBottom: 6,
  },

  emptyText: {
    textAlign: "center",
    lineHeight: 20,
  },

  retryButton: {
    backgroundColor: Palette.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginTop: 10,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  list: {
    gap: 14,
  },

  card: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: "0px 2px 6px rgba(15,23,42,0.06)",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  cardHeaderText: {
    flex: 1,
    gap: 3,
  },

  topVariety: {
    fontSize: 16,
  },

  chevron: {
    fontSize: 14,
  },

  rankList: {
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 12,
    gap: 8,
  },

  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  rankBadge: {
    fontWeight: "700",
    width: 32,
  },

  rankName: {
    flex: 1,
  },

});
