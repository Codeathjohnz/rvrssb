import React, { useState } from "react";

import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { AdminShell } from "@/components/admin-shell";
import { useTheme } from "@/hooks/use-theme";
import { Palette } from "@/constants/theme";

import API from "../api/api";
import { alert } from "../utils/alert";


const SOIL_TYPES = ["Loam", "Clay", "Silty Clay Loam", "Clay Loam"] as const;
const LEVELS = ["Low", "Medium", "High"] as const;

type RankedItem = { id: number; variety: string; score: number };

type CompareResult = {
  electre: { ranking: RankedItem[]; timeMs: number };
  saw: { ranking: RankedItem[]; timeMs: number };
  agreement: { top1Match: boolean; top3Overlap: number; spearmanRho: number };
  weightsUsed: number[];
};


export default function MethodComparison() {

  const theme = useTheme();

  const [soilType, setSoilType] = useState<string>("Loam");
  const [ph, setPh] = useState("6.5");
  const [rainfall, setRainfall] = useState("1800");
  const [pestLevel, setPestLevel] = useState<string>("Medium");

  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);


  const runComparison = async () => {

    setComparing(true);
    setResult(null);

    try {

      const response = await API.post("/api/admin/mcdm-compare", {
        soilType,
        ph: Number(ph),
        rainfall: Number(rainfall),
        pest_level: pestLevel,
      });

      setResult(response.data);

    } catch (err) {

      console.log("MCDM COMPARE ERROR:", err);
      alert("Error", "Could not run the method comparison");

    } finally {

      setComparing(false);

    }

  };


  const renderChips = (options: readonly string[], value: string, onSelect: (v: string) => void, color: string) => (

    <View style={styles.chipRow}>

      {options.map((option) => {

        const selected = value === option;

        return (

          <Pressable
            key={option}
            style={[
              styles.chip,
              { borderColor: Palette.border },
              selected && { backgroundColor: color, borderColor: color },
            ]}
            onPress={() => onSelect(option)}
          >
            <ThemedText type="small" style={selected ? { color: "#FFFFFF", fontWeight: "700" } : undefined}>
              {option}
            </ThemedText>
          </Pressable>

        );

      })}

    </View>

  );


  const renderRankedList = (items: RankedItem[], accentColor: string) => (

    <View style={styles.rankedList}>

      {items.map((item, index) => (

        <View key={item.id} style={styles.rankRow}>

          <ThemedText type="small" style={[styles.rankBadge, { color: accentColor }]}>
            #{index + 1}
          </ThemedText>

          <ThemedText type="small" style={{ flex: 1 }} numberOfLines={1}>
            {item.variety}
          </ThemedText>

          <ThemedText themeColor="textSecondary" type="small">
            {item.score.toFixed(4)}
          </ThemedText>

        </View>

      ))}

    </View>

  );


  return (

    <AdminShell>

      <ThemedText type="subtitle">
        🧮 Method Comparison
      </ThemedText>

      <ThemedText themeColor="textSecondary" style={styles.subtitle}>
        Validates ELECTRE by running the same farm scenario and criteria
        weights through a second MCDM technique — Simple Additive Weighting
        (SAW / Weighted Sum Model) — and measuring how closely they agree
        and how fast each runs. Nothing here is saved to recommendation
        history.
      </ThemedText>


      <View style={[styles.card, { backgroundColor: Palette.surface }]}>

        <ThemedText type="smallBold" style={styles.label}>Soil Type</ThemedText>

        {renderChips(SOIL_TYPES, soilType, setSoilType, Palette.primary)}

        <View style={styles.fieldRow}>

          <View style={styles.fieldHalf}>

            <ThemedText type="smallBold" style={styles.label}>Soil pH</ThemedText>

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
              keyboardType="numeric"
              value={ph}
              onChangeText={setPh}
            />

          </View>

          <View style={styles.fieldHalf}>

            <ThemedText type="smallBold" style={styles.label}>Rainfall (mm/yr)</ThemedText>

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
              keyboardType="numeric"
              value={rainfall}
              onChangeText={setRainfall}
            />

          </View>

        </View>

        <ThemedText type="smallBold" style={styles.label}>Pest Pressure</ThemedText>

        {renderChips(LEVELS, pestLevel, setPestLevel, Palette.danger)}

        <Pressable
          style={[styles.compareButton, comparing && styles.buttonDisabled]}
          onPress={runComparison}
          disabled={comparing}
        >

          {comparing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.compareButtonText}>Run Comparison</ThemedText>
          )}

        </Pressable>

      </View>


      {result && (

        <>

          <View style={[styles.agreementCard, { backgroundColor: Palette.primarySoft }]}>

            <View style={styles.agreementItem}>
              <ThemedText type="subtitle" style={styles.agreementValue}>
                {result.agreement.top1Match ? "✅" : "⚠️"}
              </ThemedText>
              <ThemedText themeColor="textSecondary" type="small">Top pick agrees</ThemedText>
            </View>

            <View style={styles.agreementItem}>
              <ThemedText type="subtitle" style={styles.agreementValue}>
                {result.agreement.top3Overlap}/3
              </ThemedText>
              <ThemedText themeColor="textSecondary" type="small">Top-3 overlap</ThemedText>
            </View>

            <View style={styles.agreementItem}>
              <ThemedText type="subtitle" style={styles.agreementValue}>
                {result.agreement.spearmanRho.toFixed(2)}
              </ThemedText>
              <ThemedText themeColor="textSecondary" type="small">Rank correlation (ρ)</ThemedText>
            </View>

          </View>


          <View style={styles.compareGrid}>

            <View style={[styles.resultCard, { backgroundColor: Palette.surface }]}>

              <View style={styles.resultHeader}>
                <ThemedText type="smallBold">ELECTRE I</ThemedText>
                <ThemedText themeColor="textSecondary" type="small">{result.electre.timeMs}ms</ThemedText>
              </View>

              <ThemedText themeColor="textSecondary" type="small" style={styles.resultDesc}>
                Outranking method — pairwise concordance/discordance
              </ThemedText>

              {renderRankedList(result.electre.ranking, Palette.admin)}

            </View>


            <View style={[styles.resultCard, { backgroundColor: Palette.surface }]}>

              <View style={styles.resultHeader}>
                <ThemedText type="smallBold">SAW (Weighted Sum)</ThemedText>
                <ThemedText themeColor="textSecondary" type="small">{result.saw.timeMs}ms</ThemedText>
              </View>

              <ThemedText themeColor="textSecondary" type="small" style={styles.resultDesc}>
                Normalizes against the best value, then sums weighted scores
              </ThemedText>

              {renderRankedList(result.saw.ranking, Palette.grain)}

            </View>

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
    lineHeight: 20,
    maxWidth: 640,
  },

  card: {
    borderRadius: 20,
    padding: 24,
    maxWidth: 520,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: "0px 2px 6px rgba(15,23,42,0.06)",
    marginBottom: 24,
  },

  label: {
    marginBottom: 8,
    marginTop: 4,
  },

  fieldRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },

  fieldHalf: {
    flex: 1,
  },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  chip: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },

  compareButton: {
    backgroundColor: Palette.admin,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 22,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  compareButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  agreementCard: {
    flexDirection: "row",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    maxWidth: 720,
    gap: 20,
  },

  agreementItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },

  agreementValue: {
    fontSize: 22,
    color: Palette.primaryDark,
  },

  compareGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    maxWidth: 900,
  },

  resultCard: {
    flexBasis: "45%",
    flexGrow: 1,
    minWidth: 300,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: "0px 2px 6px rgba(15,23,42,0.06)",
  },

  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  resultDesc: {
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 17,
  },

  rankedList: {
    gap: 6,
  },

  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  rankBadge: {
    fontWeight: "700",
    width: 30,
  },

});
