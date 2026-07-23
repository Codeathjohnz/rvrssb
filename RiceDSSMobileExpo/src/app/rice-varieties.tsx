import React, { useCallback, useEffect, useState } from "react";

import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  TextInput,
} from "react-native";

import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { AdminShell } from "@/components/admin-shell";
import { useTheme } from "@/hooks/use-theme";
import { Palette } from "@/constants/theme";

import API from "../api/api";
import { alert } from "../utils/alert";


type Variety = {
  id: number;
  name: string;
  yield_score: string;
  soil_score: string;
  pest_resistance: string;
  climate_score: string;
  market_score: string;
};


const NEW_FORM_FIELDS = [

  { key: "name", label: "Name", placeholder: "e.g. NSIC Rc 480", numeric: false },
  { key: "soil_score", label: "Soil Suitability (0-1)", placeholder: "0.85", numeric: true },
  { key: "yield_score", label: "Yield Potential (0-1)", placeholder: "0.90", numeric: true },
  { key: "pest_resistance", label: "Pest Resistance (0-1)", placeholder: "0.80", numeric: true },
  { key: "climate_score", label: "Climate Adaptability (0-1)", placeholder: "0.85", numeric: true },
  { key: "market_score", label: "Market Demand (0-1)", placeholder: "0.75", numeric: true },

] as const;

type FormKey = typeof NEW_FORM_FIELDS[number]["key"];


export default function RiceVarieties() {

  const theme = useTheme();
  const router = useRouter();

  const [varieties, setVarieties] = useState<Variety[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<Record<FormKey, string>>({
    name: "",
    soil_score: "",
    yield_score: "",
    pest_resistance: "",
    climate_score: "",
    market_score: "",
  });


  const load = useCallback(() => {

    setError(null);

    return API.get("/api/admin/rice")
      .then((response) => setVarieties(response.data))
      .catch((err) => {

        console.log("RICE VARIETIES ERROR:", err);

        if (err?.response?.status === 401 || err?.response?.status === 403) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Could not load rice varieties. Check your connection and try again.");
        }

      })
      .finally(() => setLoading(false));

  }, []);


  useEffect(() => {

    load();

  }, [load]);


  const retry = () => {

    if (error?.includes("session")) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    load();

  };


  const setField = (key: FormKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };


  const startEdit = (variety: Variety) => {

    setEditingId(variety.id);

    setForm({
      name: variety.name,
      soil_score: String(variety.soil_score),
      yield_score: String(variety.yield_score),
      pest_resistance: String(variety.pest_resistance),
      climate_score: String(variety.climate_score),
      market_score: String(variety.market_score),
    });

    setShowForm(true);

  };


  const cancelForm = () => {

    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", soil_score: "", yield_score: "", pest_resistance: "", climate_score: "", market_score: "" });

  };


  const saveVariety = async () => {

    const { name, soil_score, yield_score, pest_resistance, climate_score, market_score } = form;

    if (!name || !soil_score || !yield_score || !pest_resistance || !climate_score || !market_score) {

      alert("Missing Data", "Please complete all fields");
      return;

    }

    setSaving(true);

    try {

      const payload = {
        name,
        soil_score: Number(soil_score),
        yield_score: Number(yield_score),
        pest_resistance: Number(pest_resistance),
        climate_score: Number(climate_score),
        market_score: Number(market_score),
      };

      if (editingId) {
        await API.put(`/api/admin/rice/${editingId}`, payload);
      } else {
        await API.post("/api/admin/rice", payload);
      }

      cancelForm();
      setLoading(true);
      await load();

    } catch (err) {

      console.log("SAVE RICE ERROR:", err);
      alert("Error", `Could not ${editingId ? "update" : "add"} rice variety`);

    } finally {

      setSaving(false);

    }

  };


  const deleteVariety = (id: number, name: string) => {

    alert(
      "Delete Variety",
      `Remove ${name} from the system?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {

            try {

              await API.delete(`/api/admin/rice/${id}`);
              setVarieties((prev) => prev?.filter((v) => v.id !== id) ?? null);

            } catch (err) {

              console.log("DELETE RICE ERROR:", err);
              alert("Error", "Could not delete variety");

            }

          },
        },
      ]
    );

  };


  return (

    <AdminShell>

      <View style={styles.header}>

        <View style={styles.headerText}>

          <ThemedText type="subtitle">
            🌾 Rice Varieties
          </ThemedText>

          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {varieties
              ? `${varieties.length} varieties tracked`
              : error
                ? error
                : "Loading…"}
          </ThemedText>

        </View>

        <Pressable
          style={[styles.addButton, showForm && styles.addButtonActive]}
          onPress={() => (showForm ? cancelForm() : setShowForm(true))}
        >

          <ThemedText style={styles.addButtonText}>
            {showForm ? "✕ Cancel" : "+ Add Variety"}
          </ThemedText>

        </Pressable>

      </View>


      {showForm && (

        <View style={[styles.form, { backgroundColor: Palette.surface }]}>

          <ThemedText type="smallBold" style={{ marginBottom: 4 }}>
            {editingId ? "Editing Variety" : "New Variety"}
          </ThemedText>

          {NEW_FORM_FIELDS.map((field) => (

            <View key={field.key}>

              <ThemedText type="smallBold" style={styles.label}>
                {field.label}
              </ThemedText>

              <TextInput
                style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
                placeholder={field.placeholder}
                placeholderTextColor={theme.textSecondary}
                keyboardType={field.numeric ? "numeric" : "default"}
                value={form[field.key]}
                onChangeText={(text) => setField(field.key, text)}
              />

            </View>

          ))}

          <Pressable
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={saveVariety}
            disabled={saving}
          >

            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.saveButtonText}>
                {editingId ? "Update Variety" : "Save Variety"}
              </ThemedText>
            )}

          </Pressable>

        </View>

      )}


      {loading && !varieties ? (

        <ActivityIndicator style={styles.loader} color={Palette.admin} />

      ) : error ? (

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

      ) : (

        <View style={styles.grid}>

          {varieties?.map((variety) => (

            <View
              key={variety.id}
              style={[styles.card, { backgroundColor: Palette.surface }]}
            >

              <View style={styles.cardHeader}>

                <ThemedText type="smallBold">{variety.name}</ThemedText>

                <View style={styles.cardActions}>

                  <Pressable onPress={() => startEdit(variety)}>
                    <ThemedText style={{ color: Palette.admin }}>✎</ThemedText>
                  </Pressable>

                  <Pressable onPress={() => deleteVariety(variety.id, variety.name)}>
                    <ThemedText style={{ color: Palette.danger }}>🗑️</ThemedText>
                  </Pressable>

                </View>

              </View>

              <View style={styles.scoreRow}>
                <ThemedText themeColor="textSecondary" type="small">Soil</ThemedText>
                <ThemedText type="small">{variety.soil_score}</ThemedText>
              </View>

              <View style={styles.scoreRow}>
                <ThemedText themeColor="textSecondary" type="small">Yield</ThemedText>
                <ThemedText type="small">{variety.yield_score}</ThemedText>
              </View>

              <View style={styles.scoreRow}>
                <ThemedText themeColor="textSecondary" type="small">Pest Resistance</ThemedText>
                <ThemedText type="small">{variety.pest_resistance}</ThemedText>
              </View>

              <View style={styles.scoreRow}>
                <ThemedText themeColor="textSecondary" type="small">Climate</ThemedText>
                <ThemedText type="small">{variety.climate_score}</ThemedText>
              </View>

              <View style={styles.scoreRow}>
                <ThemedText themeColor="textSecondary" type="small">Market</ThemedText>
                <ThemedText type="small">{variety.market_score}</ThemedText>
              </View>

            </View>

          ))}

        </View>

      )}

    </AdminShell>

  );

}


const styles = StyleSheet.create({

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    gap: 12,
    flexWrap: "wrap",
  },

  headerText: {
    flex: 1,
    minWidth: 200,
  },

  subtitle: {
    marginTop: 6,
  },

  addButton: {
    backgroundColor: Palette.admin,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
  },

  addButtonActive: {
    backgroundColor: Palette.danger,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  form: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: "0px 2px 6px rgba(15,23,42,0.06)",
  },

  label: {
    marginBottom: 6,
    marginTop: 12,
  },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },

  saveButton: {
    backgroundColor: Palette.admin,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  loader: {
    marginTop: 40,
  },

  errorState: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    gap: 14,
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

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

  card: {
    flexBasis: "31%",
    flexGrow: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: "0px 2px 6px rgba(15,23,42,0.06)",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  cardActions: {
    flexDirection: "row",
    gap: 12,
  },

  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

});
