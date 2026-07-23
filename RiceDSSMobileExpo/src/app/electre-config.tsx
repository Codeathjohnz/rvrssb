import React, { useEffect, useState } from "react";

import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { AdminShell } from "@/components/admin-shell";
import { useTheme } from "@/hooks/use-theme";
import { Palette } from "@/constants/theme";

import API from "../api/api";
import { alert } from "../utils/alert";


const CRITERIA = [

  { key: "soil_weight", icon: "🌱", label: "Soil Suitability" },
  { key: "yield_weight", icon: "🌾", label: "Yield Potential" },
  { key: "pest_weight", icon: "🐛", label: "Pest & Disease Resistance" },
  { key: "climate_weight", icon: "🌦️", label: "Climate Adaptability" },
  { key: "market_weight", icon: "💰", label: "Market Demand" },

] as const;

type WeightKey = typeof CRITERIA[number]["key"];
type Weights = Record<WeightKey, string>;

const SOIL_TYPES = ["Loam", "Clay", "Silty Clay Loam", "Clay Loam"] as const;
const LEVELS = ["Low", "Medium", "High"] as const;

type PreviewResult = {
  ranking: { id: number; variety: string; score: number; explanation: string }[];
  weightsUsed: number[];
};


export default function ElectreConfig() {

  const theme = useTheme();
  const router = useRouter();

  const [weights, setWeights] = useState<Weights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [scenarioSoil, setScenarioSoil] = useState<string>("Loam");
  const [scenarioPh, setScenarioPh] = useState("6.5");
  const [scenarioRainfall, setScenarioRainfall] = useState("1800");
  const [scenarioPest, setScenarioPest] = useState<string>("Medium");
  const [previewing, setPreviewing] = useState(false);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);


  const load = () => {

    setError(null);

    API.get("/api/admin/electre-config")
      .then((response) => {

        const data = response.data;

        setWeights({
          soil_weight: String(data.soil_weight),
          yield_weight: String(data.yield_weight),
          pest_weight: String(data.pest_weight),
          climate_weight: String(data.climate_weight),
          market_weight: String(data.market_weight),
        });

      })
      .catch((err) => {

        console.log("ELECTRE CONFIG ERROR:", err);

        if (err?.response?.status === 401 || err?.response?.status === 403) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Could not load ELECTRE configuration. Check your connection and try again.");
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


  const setField = (key: WeightKey, value: string) => {
    setWeights((prev) => prev ? { ...prev, [key]: value } : prev);
  };


  const total = weights
    ? CRITERIA.reduce((sum, c) => sum + (Number(weights[c.key]) || 0), 0)
    : 0;

  const totalIsValid = Math.abs(total - 1) < 0.01;


  const save = async () => {

    if (!weights) return;

    if (!totalIsValid) {

      alert("Weights must total 1.0", `Current total is ${total.toFixed(2)}. Adjust the values so they add up to exactly 1.0.`);
      return;

    }

    setSaving(true);

    try {

      await API.put("/api/admin/electre-config", {
        soil_weight: Number(weights.soil_weight),
        yield_weight: Number(weights.yield_weight),
        pest_weight: Number(weights.pest_weight),
        climate_weight: Number(weights.climate_weight),
        market_weight: Number(weights.market_weight),
      });

      alert("Saved", "ELECTRE criteria weights updated. New recommendations will use these weights.");

    } catch (err: any) {

      console.log("SAVE ELECTRE CONFIG ERROR:", err);
      alert("Error", err?.response?.data?.message || "Could not save configuration");

    } finally {

      setSaving(false);

    }

  };


  const previewRanking = async () => {

    if (!weights) return;

    setPreviewing(true);
    setPreviewResult(null);

    try {

      const response = await API.post("/api/admin/electre-preview", {
        weights: CRITERIA.map((c) => Number(weights[c.key]) || 0),
        soilType: scenarioSoil,
        ph: Number(scenarioPh),
        rainfall: Number(scenarioRainfall),
        pest_level: scenarioPest,
      });

      setPreviewResult(response.data);

    } catch (err) {

      console.log("PREVIEW ERROR:", err);
      alert("Error", "Could not run preview ranking");

    } finally {

      setPreviewing(false);

    }

  };


  return (

    <AdminShell>

      <ThemedText type="subtitle">
        ⚙️ ELECTRE Configuration
      </ThemedText>

      <ThemedText themeColor="textSecondary" style={styles.subtitle}>
        Adjust how much each criterion influences the ranking. Weights must
        add up to 1.0.
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

      ) : !weights ? (

        <ActivityIndicator style={styles.loader} color={Palette.admin} />

      ) : (

        <>

        <View style={[styles.card, { backgroundColor: Palette.surface }]}>

          {CRITERIA.map((criterion) => (

            <View key={criterion.key} style={styles.row}>

              <View style={styles.rowLabel}>

                <ThemedText style={styles.rowIcon}>{criterion.icon}</ThemedText>

                <ThemedText type="smallBold">{criterion.label}</ThemedText>

              </View>

              <TextInput
                style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
                keyboardType="numeric"
                value={weights[criterion.key]}
                onChangeText={(text) => setField(criterion.key, text)}
              />

            </View>

          ))}


          <View style={[styles.totalRow, { borderTopColor: Palette.border }]}>

            <ThemedText type="smallBold">Total</ThemedText>

            <ThemedText
              type="smallBold"
              style={{ color: totalIsValid ? Palette.primary : Palette.danger }}
            >
              {total.toFixed(2)}
            </ThemedText>

          </View>


          <Pressable
            style={[styles.saveButton, (saving || !totalIsValid) && styles.saveButtonDisabled]}
            onPress={save}
            disabled={saving || !totalIsValid}
          >

            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.saveButtonText}>Save Configuration</ThemedText>
            )}

          </Pressable>

        </View>


        <ThemedText type="smallBold" style={styles.previewSectionTitle}>
          🔍 Test Scenario
        </ThemedText>

        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Preview how the weights above (whether saved yet or not) would rank
          varieties for a hypothetical farm. This never saves to anyone's
          recommendation history.
        </ThemedText>

        <View style={[styles.card, { backgroundColor: Palette.surface }]}>

          <ThemedText type="smallBold" style={styles.previewLabel}>Soil Type</ThemedText>

          <View style={styles.chipRow}>

            {SOIL_TYPES.map((option) => {

              const selected = scenarioSoil === option;

              return (

                <Pressable
                  key={option}
                  style={[
                    styles.chip,
                    { borderColor: Palette.border },
                    selected && { backgroundColor: Palette.primary, borderColor: Palette.primary },
                  ]}
                  onPress={() => setScenarioSoil(option)}
                >
                  <ThemedText type="small" style={selected ? { color: "#FFFFFF", fontWeight: "700" } : undefined}>
                    {option}
                  </ThemedText>
                </Pressable>

              );

            })}

          </View>

          <View style={styles.previewFieldRow}>

            <View style={styles.previewFieldHalf}>

              <ThemedText type="smallBold" style={styles.previewLabel}>Soil pH</ThemedText>

              <TextInput
                style={[styles.input, styles.previewInput, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
                keyboardType="numeric"
                value={scenarioPh}
                onChangeText={setScenarioPh}
              />

            </View>

            <View style={styles.previewFieldHalf}>

              <ThemedText type="smallBold" style={styles.previewLabel}>Rainfall (mm/yr)</ThemedText>

              <TextInput
                style={[styles.input, styles.previewInput, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
                keyboardType="numeric"
                value={scenarioRainfall}
                onChangeText={setScenarioRainfall}
              />

            </View>

          </View>

          <ThemedText type="smallBold" style={styles.previewLabel}>Pest Pressure</ThemedText>

          <View style={styles.chipRow}>

            {LEVELS.map((option) => {

              const selected = scenarioPest === option;

              return (

                <Pressable
                  key={option}
                  style={[
                    styles.chip,
                    { borderColor: Palette.border },
                    selected && { backgroundColor: Palette.danger, borderColor: Palette.danger },
                  ]}
                  onPress={() => setScenarioPest(option)}
                >
                  <ThemedText type="small" style={selected ? { color: "#FFFFFF", fontWeight: "700" } : undefined}>
                    {option}
                  </ThemedText>
                </Pressable>

              );

            })}

          </View>

          <Pressable
            style={[styles.saveButton, previewing && styles.saveButtonDisabled]}
            onPress={previewRanking}
            disabled={previewing}
          >

            {previewing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.saveButtonText}>Preview Ranking</ThemedText>
            )}

          </Pressable>


          {previewResult && (

            <View style={[styles.previewResults, { borderTopColor: Palette.border }]}>

              <ThemedText themeColor="textSecondary" type="small" style={{ marginBottom: 10 }}>
                Weights used: {previewResult.weightsUsed.map((w) => w.toFixed(2)).join(" / ")}
              </ThemedText>

              {previewResult.ranking.map((item, index) => (

                <View key={item.id} style={styles.previewRow}>

                  <ThemedText type="small" style={[styles.previewRank, { color: Palette.admin }]}>
                    #{index + 1}
                  </ThemedText>

                  <ThemedText type="small" style={{ flex: 1 }}>
                    {item.variety}
                  </ThemedText>

                  <ThemedText themeColor="textSecondary" type="small">
                    {item.score.toFixed(3)}
                  </ThemedText>

                </View>

              ))}

            </View>

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
    lineHeight: 20,
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

  card: {
    borderRadius: 20,
    padding: 24,
    maxWidth: 480,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: "0px 2px 6px rgba(15,23,42,0.06)",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },

  rowLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  rowIcon: {
    fontSize: 18,
  },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    width: 80,
    textAlign: "center",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 4,
  },

  saveButton: {
    backgroundColor: Palette.admin,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 22,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  previewSectionTitle: {
    fontSize: 15,
    marginTop: 32,
  },

  previewLabel: {
    marginBottom: 8,
    marginTop: 4,
  },

  previewFieldRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },

  previewFieldHalf: {
    flex: 1,
  },

  previewInput: {
    width: "100%",
    textAlign: "left",
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

  previewResults: {
    borderTopWidth: 1,
    marginTop: 22,
    paddingTop: 16,
    gap: 8,
  },

  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  previewRank: {
    fontWeight: "700",
    width: 32,
  },

});
