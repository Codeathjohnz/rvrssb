import React, { useCallback, useEffect, useState } from "react";

import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  TextInput,
  Platform,
} from "react-native";

import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { AdminShell } from "@/components/admin-shell";
import { useTheme } from "@/hooks/use-theme";
import { Palette } from "@/constants/theme";

import API from "../api/api";
import { alert } from "../utils/alert";


const BARANGAYS = ["San Teodoro", "Poblacion", "Libertad", "San Marcos"] as const;
const SOIL_TYPES = ["Loam", "Clay", "Silty Clay Loam", "Clay Loam"] as const;
const LEVELS = ["Low", "Medium", "High"] as const;


type Farmer = {
  id: number;
  name: string | null;
  username: string | null;
  email: string;
  role: string;
  created_at: string;
};

type Farm = {
  id: number;
  user_id: number;
  barangay: string | null;
  soil_type: string | null;
  area: string | number | null;
  latitude: string | number | null;
  longitude: string | number | null;
};

type SoilTest = {
  id: number;
  farm_id: number;
  ph: string | number | null;
  nitrogen: string | null;
  phosphorus: string | null;
  potassium: string | null;
  rainfall: string | number | null;
  pest_level: string | null;
  created_at: string;
};

type FarmForm = {
  barangay: string;
  soil_type: string;
  area: string;
  latitude: string;
  longitude: string;
};

type SoilForm = {
  ph: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  rainfall: string;
  pest_level: string;
};

const EMPTY_FARM_FORM: FarmForm = { barangay: "", soil_type: "", area: "", latitude: "", longitude: "" };
const EMPTY_SOIL_FORM: SoilForm = { ph: "", nitrogen: "", phosphorus: "", potassium: "", rainfall: "", pest_level: "" };


export default function ManageFarmers() {

  const theme = useTheme();
  const router = useRouter();

  const [farmers, setFarmers] = useState<Farmer[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const [activeFarmerId, setActiveFarmerId] = useState<number | null>(null);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletingFarmerId, setDeletingFarmerId] = useState<number | null>(null);

  const [farms, setFarms] = useState<Farm[] | null>(null);
  const [farmsLoading, setFarmsLoading] = useState(false);
  const [farmForms, setFarmForms] = useState<Record<number, FarmForm>>({});
  const [savingFarmId, setSavingFarmId] = useState<number | null>(null);

  const [showAddFarm, setShowAddFarm] = useState(false);
  const [newFarmForm, setNewFarmForm] = useState<FarmForm>(EMPTY_FARM_FORM);
  const [savingNewFarm, setSavingNewFarm] = useState(false);

  const [soilByFarm, setSoilByFarm] = useState<Record<number, SoilTest[]>>({});
  const [soilForms, setSoilForms] = useState<Record<number, SoilForm>>({});
  const [editingSoilId, setEditingSoilId] = useState<number | null>(null);
  const [savingSoilKey, setSavingSoilKey] = useState<string | null>(null);

  const [addingSoilFarmId, setAddingSoilFarmId] = useState<number | null>(null);
  const [newSoilForm, setNewSoilForm] = useState<SoilForm>(EMPTY_SOIL_FORM);


  const load = useCallback(() => {

    setError(null);

    return API.get("/api/admin/users")
      .then((response) => setFarmers(response.data))
      .catch((err) => {

        console.log("MANAGE FARMERS ERROR:", err);

        if (err?.response?.status === 401 || err?.response?.status === 403) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Could not load farmer records. Check your connection and try again.");
        }

      })
      .finally(() => setLoading(false));

  }, []);


  useEffect(() => {

    load();

  }, [load]);


  const onRefresh = () => {

    setLoading(true);
    load();

  };


  const retry = () => {

    if (error?.includes("session")) {
      router.replace("/login");
      return;
    }

    onRefresh();

  };


  const exportCsv = async () => {

    if (Platform.OS !== "web") {

      alert("Desktop Only", "Spreadsheet export is available from the web admin panel.");
      return;

    }

    setExporting(true);

    try {

      const response = await API.get("/api/admin/export/farmers.csv", { responseType: "blob" });

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `ricedss-farmers-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

    } catch (err) {

      console.log("EXPORT CSV ERROR:", err);
      alert("Error", "Could not export farmer data");

    } finally {

      setExporting(false);

    }

  };


  const loadSoil = (farmId: number) => {

    API.get(`/api/admin/farms/${farmId}/soil`)
      .then((response) => setSoilByFarm((prev) => ({ ...prev, [farmId]: response.data })))
      .catch((err) => console.log("ADMIN SOIL LOAD ERROR:", err));

  };


  const loadFarms = (farmerId: number) => {

    setFarmsLoading(true);

    API.get(`/api/admin/users/${farmerId}/farms`)
      .then((response) => {

        const data: Farm[] = response.data;

        setFarms(data);

        const forms: Record<number, FarmForm> = {};

        data.forEach((farm) => {

          forms[farm.id] = {
            barangay: farm.barangay || "",
            soil_type: farm.soil_type || "",
            area: farm.area !== null && farm.area !== undefined ? String(farm.area) : "",
            latitude: farm.latitude !== null && farm.latitude !== undefined ? String(farm.latitude) : "",
            longitude: farm.longitude !== null && farm.longitude !== undefined ? String(farm.longitude) : "",
          };

        });

        setFarmForms(forms);

        data.forEach((farm) => loadSoil(farm.id));

      })
      .catch((err) => {

        console.log("ADMIN FARMS LOAD ERROR:", err);
        alert("Error", "Could not load farm records for this farmer");

      })
      .finally(() => setFarmsLoading(false));

  };


  const toggleFarmer = (farmer: Farmer) => {

    if (activeFarmerId === farmer.id) {

      setActiveFarmerId(null);
      return;

    }

    setActiveFarmerId(farmer.id);
    setProfileForm({ name: farmer.name || farmer.username || "", email: farmer.email });
    setFarms(null);
    setFarmForms({});
    setSoilByFarm({});
    setShowAddFarm(false);
    setNewFarmForm(EMPTY_FARM_FORM);
    setAddingSoilFarmId(null);
    setEditingSoilId(null);

    loadFarms(farmer.id);

  };


  const saveProfile = async (farmerId: number) => {

    if (!profileForm.name || !profileForm.email) {

      alert("Missing Data", "Name and email are required");
      return;

    }

    setSavingProfile(true);

    try {

      await API.put(`/api/admin/users/${farmerId}`, profileForm);
      await load();
      alert("Saved", "Farmer profile updated");

    } catch (err) {

      console.log("SAVE PROFILE ERROR:", err);
      alert("Error", "Could not update this farmer's profile");

    } finally {

      setSavingProfile(false);

    }

  };


  const deleteFarmer = (farmer: Farmer) => {

    const displayName = farmer.name || farmer.username || "this farmer";

    alert(
      "Delete Farmer Account",
      `Permanently delete ${displayName}? This also deletes their farm, soil test, and recommendation records. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {

            setDeletingFarmerId(farmer.id);

            try {

              await API.delete(`/api/admin/users/${farmer.id}`);

              setActiveFarmerId(null);
              await load();
              alert("Deleted", `${displayName}'s account has been removed.`);

            } catch (err) {

              console.log("DELETE FARMER ERROR:", err);
              alert("Error", "Could not delete this farmer account");

            } finally {

              setDeletingFarmerId(null);

            }

          },
        },
      ]
    );

  };


  const saveFarm = async (farmId: number) => {

    const form = farmForms[farmId];

    if (!form?.barangay || !form?.soil_type || !form?.area) {

      alert("Missing Data", "Barangay, soil type, and land size are required");
      return;

    }

    setSavingFarmId(farmId);

    try {

      await API.put(`/api/admin/farms/${farmId}`, {
        barangay: form.barangay,
        soil_type: form.soil_type,
        area: Number(form.area),
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      });

      alert("Saved", "Farm record updated");

    } catch (err) {

      console.log("SAVE FARM ERROR:", err);
      alert("Error", "Could not update this farm record");

    } finally {

      setSavingFarmId(null);

    }

  };


  const addFarm = async () => {

    if (!activeFarmerId) return;

    if (!newFarmForm.barangay || !newFarmForm.soil_type || !newFarmForm.area) {

      alert("Missing Data", "Barangay, soil type, and land size are required");
      return;

    }

    setSavingNewFarm(true);

    try {

      await API.post(`/api/admin/users/${activeFarmerId}/farms`, {
        barangay: newFarmForm.barangay,
        soil_type: newFarmForm.soil_type,
        area: Number(newFarmForm.area),
        latitude: newFarmForm.latitude ? Number(newFarmForm.latitude) : null,
        longitude: newFarmForm.longitude ? Number(newFarmForm.longitude) : null,
      });

      setShowAddFarm(false);
      setNewFarmForm(EMPTY_FARM_FORM);
      loadFarms(activeFarmerId);
      alert("Saved", "Farm added for this farmer");

    } catch (err) {

      console.log("ADD FARM ERROR:", err);
      alert("Error", "Could not add farm");

    } finally {

      setSavingNewFarm(false);

    }

  };


  const startEditSoil = (test: SoilTest) => {

    setEditingSoilId(test.id);

    setSoilForms((prev) => ({
      ...prev,
      [test.id]: {
        ph: test.ph !== null && test.ph !== undefined ? String(test.ph) : "",
        nitrogen: test.nitrogen || "",
        phosphorus: test.phosphorus || "",
        potassium: test.potassium || "",
        rainfall: test.rainfall !== null && test.rainfall !== undefined ? String(test.rainfall) : "",
        pest_level: test.pest_level || "",
      },
    }));

  };


  const saveSoilEdit = async (farmId: number, soilId: number) => {

    const form = soilForms[soilId];

    if (!form) return;

    setSavingSoilKey(`edit-${soilId}`);

    try {

      await API.put(`/api/admin/soil/${soilId}`, {
        ph: form.ph ? Number(form.ph) : null,
        nitrogen: form.nitrogen || null,
        phosphorus: form.phosphorus || null,
        potassium: form.potassium || null,
        rainfall: form.rainfall ? Number(form.rainfall) : null,
        pest_level: form.pest_level || null,
      });

      setEditingSoilId(null);
      loadSoil(farmId);
      alert("Saved", "Soil & weather record updated");

    } catch (err) {

      console.log("SAVE SOIL ERROR:", err);
      alert("Error", "Could not update this soil record");

    } finally {

      setSavingSoilKey(null);

    }

  };


  const saveNewSoil = async (farmId: number) => {

    setSavingSoilKey(`new-${farmId}`);

    try {

      await API.post(`/api/admin/farms/${farmId}/soil`, {
        ph: newSoilForm.ph ? Number(newSoilForm.ph) : null,
        nitrogen: newSoilForm.nitrogen || null,
        phosphorus: newSoilForm.phosphorus || null,
        potassium: newSoilForm.potassium || null,
        rainfall: newSoilForm.rainfall ? Number(newSoilForm.rainfall) : null,
        pest_level: newSoilForm.pest_level || null,
      });

      setAddingSoilFarmId(null);
      setNewSoilForm(EMPTY_SOIL_FORM);
      loadSoil(farmId);
      alert("Saved", "Soil & weather record added");

    } catch (err) {

      console.log("ADD SOIL ERROR:", err);
      alert("Error", "Could not add soil record");

    } finally {

      setSavingSoilKey(null);

    }

  };


  const renderChips = <T extends string>(
    options: readonly T[],
    value: string,
    onSelect: (v: T) => void,
    color: string,
  ) => (

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


  return (

    <AdminShell>

      <View style={styles.header}>

        <View style={styles.headerText}>

          <ThemedText type="subtitle">
            👨‍🌾 Manage Farmers
          </ThemedText>

          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {farmers
              ? `${farmers.length} registered farmer${farmers.length === 1 ? "" : "s"} — tap a row to view or edit their profile, farm, and soil records.`
              : error
                ? error
                : "Loading farmer records…"}
          </ThemedText>

        </View>

        <View style={styles.headerActions}>

          <Pressable
            style={[styles.exportButton, exporting && styles.buttonDisabled]}
            onPress={exportCsv}
            disabled={exporting}
          >

            {exporting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <ThemedText type="smallBold" style={{ color: "#FFFFFF" }}>
                ⬇ Export Spreadsheet
              </ThemedText>
            )}

          </Pressable>

          <Pressable style={styles.refreshButton} onPress={onRefresh}>
            <ThemedText type="smallBold" style={{ color: Palette.admin }}>
              ↻ Refresh
            </ThemedText>
          </Pressable>

        </View>

      </View>


      {loading && !farmers ? (

        <ActivityIndicator style={styles.loader} color={Palette.admin} />

      ) : error ? (

        <View style={[styles.emptyState, { backgroundColor: Palette.surface }]}>

          <ThemedText themeColor="textSecondary">{error}</ThemedText>

          <Pressable style={styles.retryButton} onPress={retry}>
            <ThemedText type="smallBold" style={{ color: "#FFFFFF" }}>
              {error.includes("session") ? "Go to Login" : "Retry"}
            </ThemedText>
          </Pressable>

        </View>

      ) : farmers && farmers.length === 0 ? (

        <View style={[styles.emptyState, { backgroundColor: Palette.surface }]}>
          <ThemedText style={styles.emptyIcon}>🌱</ThemedText>
          <ThemedText themeColor="textSecondary">No farmers registered yet.</ThemedText>
        </View>

      ) : (

        <View style={styles.list}>

          {farmers?.map((farmer) => {

            const isOpen = activeFarmerId === farmer.id;

            return (

              <View key={farmer.id} style={[styles.card, { backgroundColor: Palette.surface }]}>

                <Pressable style={styles.cardHeader} onPress={() => toggleFarmer(farmer)}>

                  <View style={{ flex: 1 }}>

                    <ThemedText type="smallBold">
                      {farmer.name || farmer.username || "—"}
                    </ThemedText>

                    <ThemedText themeColor="textSecondary" type="small">
                      {farmer.email} · Joined {new Date(farmer.created_at).toLocaleDateString()}
                    </ThemedText>

                  </View>

                  <ThemedText themeColor="textSecondary">{isOpen ? "▲" : "▼"}</ThemedText>

                </Pressable>


                {isOpen && (

                  <View style={[styles.detailPanel, { borderTopColor: Palette.border }]}>

                    <ThemedText type="smallBold" style={styles.sectionLabel}>
                      Profile
                    </ThemedText>

                    <View style={styles.fieldRow}>

                      <TextInput
                        style={[styles.input, styles.fieldHalf, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
                        placeholder="Full name"
                        placeholderTextColor={theme.textSecondary}
                        value={profileForm.name}
                        onChangeText={(text) => setProfileForm((prev) => ({ ...prev, name: text }))}
                      />

                      <TextInput
                        style={[styles.input, styles.fieldHalf, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
                        placeholder="Email"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={profileForm.email}
                        onChangeText={(text) => setProfileForm((prev) => ({ ...prev, email: text }))}
                      />

                    </View>

                    <Pressable
                      style={[styles.smallButton, savingProfile && styles.buttonDisabled]}
                      onPress={() => saveProfile(farmer.id)}
                      disabled={savingProfile}
                    >

                      {savingProfile ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <ThemedText style={styles.smallButtonText}>Save Profile</ThemedText>
                      )}

                    </Pressable>


                    <ThemedText type="smallBold" style={styles.sectionLabel}>
                      Farm{farms && farms.length !== 1 ? "s" : ""}
                    </ThemedText>

                    {farmsLoading ? (

                      <ActivityIndicator color={Palette.admin} style={{ marginVertical: 12 }} />

                    ) : (

                      <>

                        {farms?.map((farm) => {

                          const form = farmForms[farm.id] || EMPTY_FARM_FORM;
                          const tests = soilByFarm[farm.id] || [];

                          return (

                            <View key={farm.id} style={[styles.farmCard, { borderColor: Palette.border, backgroundColor: Palette.canvas }]}>

                              <ThemedText type="smallBold" style={styles.label}>Barangay</ThemedText>

                              {renderChips(BARANGAYS, form.barangay, (v) => setFarmForms((prev) => ({ ...prev, [farm.id]: { ...prev[farm.id], barangay: v } })), Palette.primary)}

                              <ThemedText type="smallBold" style={styles.label}>Soil Type</ThemedText>

                              {renderChips(SOIL_TYPES, form.soil_type, (v) => setFarmForms((prev) => ({ ...prev, [farm.id]: { ...prev[farm.id], soil_type: v } })), Palette.soil)}

                              <View style={styles.fieldRow}>

                                <View style={styles.fieldThird}>

                                  <ThemedText type="smallBold" style={styles.label}>Land Size (ha)</ThemedText>

                                  <TextInput
                                    style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
                                    keyboardType="numeric"
                                    placeholder="e.g. 1.5"
                                    placeholderTextColor={theme.textSecondary}
                                    value={form.area}
                                    onChangeText={(text) => setFarmForms((prev) => ({ ...prev, [farm.id]: { ...prev[farm.id], area: text } }))}
                                  />

                                </View>

                                <View style={styles.fieldThird}>

                                  <ThemedText type="smallBold" style={styles.label}>Latitude</ThemedText>

                                  <TextInput
                                    style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
                                    keyboardType="numeric"
                                    placeholder="e.g. 8.2043"
                                    placeholderTextColor={theme.textSecondary}
                                    value={form.latitude}
                                    onChangeText={(text) => setFarmForms((prev) => ({ ...prev, [farm.id]: { ...prev[farm.id], latitude: text } }))}
                                  />

                                </View>

                                <View style={styles.fieldThird}>

                                  <ThemedText type="smallBold" style={styles.label}>Longitude</ThemedText>

                                  <TextInput
                                    style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
                                    keyboardType="numeric"
                                    placeholder="e.g. 125.9822"
                                    placeholderTextColor={theme.textSecondary}
                                    value={form.longitude}
                                    onChangeText={(text) => setFarmForms((prev) => ({ ...prev, [farm.id]: { ...prev[farm.id], longitude: text } }))}
                                  />

                                </View>

                              </View>

                              <Pressable
                                style={[styles.smallButton, savingFarmId === farm.id && styles.buttonDisabled]}
                                onPress={() => saveFarm(farm.id)}
                                disabled={savingFarmId === farm.id}
                              >

                                {savingFarmId === farm.id ? (
                                  <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                  <ThemedText style={styles.smallButtonText}>Save Farm</ThemedText>
                                )}

                              </Pressable>


                              <ThemedText type="smallBold" style={[styles.label, { marginTop: 18 }]}>
                                Soil &amp; Weather Records
                              </ThemedText>

                              {tests.length === 0 && (

                                <ThemedText themeColor="textSecondary" type="small" style={{ marginBottom: 8 }}>
                                  No soil test on file for this farm yet.
                                </ThemedText>

                              )}

                              {tests.map((test) => {

                                const editing = editingSoilId === test.id;
                                const soilForm = soilForms[test.id];

                                if (editing && soilForm) {

                                  return (

                                    <View key={test.id} style={[styles.soilEditCard, { borderColor: Palette.border, backgroundColor: Palette.surface }]}>

                                      <View style={styles.fieldRow}>

                                        <View style={styles.fieldHalf}>
                                          <ThemedText type="small" style={styles.label}>pH</ThemedText>
                                          <TextInput
                                            style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
                                            keyboardType="numeric"
                                            value={soilForm.ph}
                                            onChangeText={(text) => setSoilForms((prev) => ({ ...prev, [test.id]: { ...prev[test.id], ph: text } }))}
                                          />
                                        </View>

                                        <View style={styles.fieldHalf}>
                                          <ThemedText type="small" style={styles.label}>Rainfall (mm/yr)</ThemedText>
                                          <TextInput
                                            style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
                                            keyboardType="numeric"
                                            value={soilForm.rainfall}
                                            onChangeText={(text) => setSoilForms((prev) => ({ ...prev, [test.id]: { ...prev[test.id], rainfall: text } }))}
                                          />
                                        </View>

                                      </View>

                                      {(["nitrogen", "phosphorus", "potassium"] as const).map((key) => (

                                        <View key={key}>
                                          <ThemedText type="small" style={styles.label}>
                                            {key === "nitrogen" ? "Nitrogen (N)" : key === "phosphorus" ? "Phosphorus (P)" : "Potassium (K)"}
                                          </ThemedText>
                                          {renderChips(LEVELS, soilForm[key], (v) => setSoilForms((prev) => ({ ...prev, [test.id]: { ...prev[test.id], [key]: v } })), Palette.grain)}
                                        </View>

                                      ))}

                                      <ThemedText type="small" style={styles.label}>Pest Pressure</ThemedText>
                                      {renderChips(LEVELS, soilForm.pest_level, (v) => setSoilForms((prev) => ({ ...prev, [test.id]: { ...prev[test.id], pest_level: v } })), Palette.danger)}

                                      <View style={styles.fieldRow}>

                                        <Pressable
                                          style={[styles.smallButton, savingSoilKey === `edit-${test.id}` && styles.buttonDisabled]}
                                          onPress={() => saveSoilEdit(farm.id, test.id)}
                                          disabled={savingSoilKey === `edit-${test.id}`}
                                        >
                                          {savingSoilKey === `edit-${test.id}` ? (
                                            <ActivityIndicator color="#FFFFFF" size="small" />
                                          ) : (
                                            <ThemedText style={styles.smallButtonText}>Save</ThemedText>
                                          )}
                                        </Pressable>

                                        <Pressable style={styles.cancelButton} onPress={() => setEditingSoilId(null)}>
                                          <ThemedText type="small">Cancel</ThemedText>
                                        </Pressable>

                                      </View>

                                    </View>

                                  );

                                }

                                return (

                                  <Pressable
                                    key={test.id}
                                    style={[styles.soilRow, { borderColor: Palette.border }]}
                                    onPress={() => startEditSoil(test)}
                                  >

                                    <ThemedText type="small" style={{ flex: 1 }}>
                                      pH {test.ph ?? "—"} · N {test.nitrogen || "—"} · P {test.phosphorus || "—"} · K {test.potassium || "—"} · {test.rainfall ?? "—"}mm · Pest {test.pest_level || "—"}
                                    </ThemedText>

                                    <ThemedText themeColor="textSecondary" type="small">✎ Edit</ThemedText>

                                  </Pressable>

                                );

                              })}


                              {addingSoilFarmId === farm.id ? (

                                <View style={[styles.soilEditCard, { borderColor: Palette.border, backgroundColor: Palette.surface }]}>

                                  <View style={styles.fieldRow}>

                                    <View style={styles.fieldHalf}>
                                      <ThemedText type="small" style={styles.label}>pH</ThemedText>
                                      <TextInput
                                        style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
                                        keyboardType="numeric"
                                        placeholder="e.g. 6.5"
                                        placeholderTextColor={theme.textSecondary}
                                        value={newSoilForm.ph}
                                        onChangeText={(text) => setNewSoilForm((prev) => ({ ...prev, ph: text }))}
                                      />
                                    </View>

                                    <View style={styles.fieldHalf}>
                                      <ThemedText type="small" style={styles.label}>Rainfall (mm/yr)</ThemedText>
                                      <TextInput
                                        style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
                                        keyboardType="numeric"
                                        placeholder="e.g. 1800"
                                        placeholderTextColor={theme.textSecondary}
                                        value={newSoilForm.rainfall}
                                        onChangeText={(text) => setNewSoilForm((prev) => ({ ...prev, rainfall: text }))}
                                      />
                                    </View>

                                  </View>

                                  {(["nitrogen", "phosphorus", "potassium"] as const).map((key) => (

                                    <View key={key}>
                                      <ThemedText type="small" style={styles.label}>
                                        {key === "nitrogen" ? "Nitrogen (N)" : key === "phosphorus" ? "Phosphorus (P)" : "Potassium (K)"}
                                      </ThemedText>
                                      {renderChips(LEVELS, newSoilForm[key], (v) => setNewSoilForm((prev) => ({ ...prev, [key]: v })), Palette.grain)}
                                    </View>

                                  ))}

                                  <ThemedText type="small" style={styles.label}>Pest Pressure</ThemedText>
                                  {renderChips(LEVELS, newSoilForm.pest_level, (v) => setNewSoilForm((prev) => ({ ...prev, pest_level: v })), Palette.danger)}

                                  <View style={styles.fieldRow}>

                                    <Pressable
                                      style={[styles.smallButton, savingSoilKey === `new-${farm.id}` && styles.buttonDisabled]}
                                      onPress={() => saveNewSoil(farm.id)}
                                      disabled={savingSoilKey === `new-${farm.id}`}
                                    >
                                      {savingSoilKey === `new-${farm.id}` ? (
                                        <ActivityIndicator color="#FFFFFF" size="small" />
                                      ) : (
                                        <ThemedText style={styles.smallButtonText}>Save Record</ThemedText>
                                      )}
                                    </Pressable>

                                    <Pressable style={styles.cancelButton} onPress={() => setAddingSoilFarmId(null)}>
                                      <ThemedText type="small">Cancel</ThemedText>
                                    </Pressable>

                                  </View>

                                </View>

                              ) : (

                                <Pressable style={styles.linkButton} onPress={() => { setAddingSoilFarmId(farm.id); setNewSoilForm(EMPTY_SOIL_FORM); }}>
                                  <ThemedText type="smallBold" style={{ color: Palette.admin }}>+ Add Soil / Weather Record</ThemedText>
                                </Pressable>

                              )}

                            </View>

                          );

                        })}


                        {farms && farms.length === 0 && !showAddFarm && (

                          <Pressable style={styles.linkButton} onPress={() => setShowAddFarm(true)}>
                            <ThemedText type="smallBold" style={{ color: Palette.admin }}>+ Add Farm for This Farmer</ThemedText>
                          </Pressable>

                        )}


                        {showAddFarm && (

                          <View style={[styles.farmCard, { borderColor: Palette.border, backgroundColor: Palette.canvas }]}>

                            <ThemedText type="smallBold" style={styles.label}>Barangay</ThemedText>

                            {renderChips(BARANGAYS, newFarmForm.barangay, (v) => setNewFarmForm((prev) => ({ ...prev, barangay: v })), Palette.primary)}

                            <ThemedText type="smallBold" style={styles.label}>Soil Type</ThemedText>

                            {renderChips(SOIL_TYPES, newFarmForm.soil_type, (v) => setNewFarmForm((prev) => ({ ...prev, soil_type: v })), Palette.soil)}

                            <View style={styles.fieldRow}>

                              <View style={styles.fieldThird}>
                                <ThemedText type="smallBold" style={styles.label}>Land Size (ha)</ThemedText>
                                <TextInput
                                  style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
                                  keyboardType="numeric"
                                  placeholder="e.g. 1.5"
                                  placeholderTextColor={theme.textSecondary}
                                  value={newFarmForm.area}
                                  onChangeText={(text) => setNewFarmForm((prev) => ({ ...prev, area: text }))}
                                />
                              </View>

                              <View style={styles.fieldThird}>
                                <ThemedText type="smallBold" style={styles.label}>Latitude</ThemedText>
                                <TextInput
                                  style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
                                  keyboardType="numeric"
                                  placeholder="e.g. 8.2043"
                                  placeholderTextColor={theme.textSecondary}
                                  value={newFarmForm.latitude}
                                  onChangeText={(text) => setNewFarmForm((prev) => ({ ...prev, latitude: text }))}
                                />
                              </View>

                              <View style={styles.fieldThird}>
                                <ThemedText type="smallBold" style={styles.label}>Longitude</ThemedText>
                                <TextInput
                                  style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
                                  keyboardType="numeric"
                                  placeholder="e.g. 125.9822"
                                  placeholderTextColor={theme.textSecondary}
                                  value={newFarmForm.longitude}
                                  onChangeText={(text) => setNewFarmForm((prev) => ({ ...prev, longitude: text }))}
                                />
                              </View>

                            </View>

                            <View style={styles.fieldRow}>

                              <Pressable
                                style={[styles.smallButton, savingNewFarm && styles.buttonDisabled]}
                                onPress={addFarm}
                                disabled={savingNewFarm}
                              >
                                {savingNewFarm ? (
                                  <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                  <ThemedText style={styles.smallButtonText}>Save Farm</ThemedText>
                                )}
                              </Pressable>

                              <Pressable style={styles.cancelButton} onPress={() => setShowAddFarm(false)}>
                                <ThemedText type="small">Cancel</ThemedText>
                              </Pressable>

                            </View>

                          </View>

                        )}

                      </>

                    )}


                    <View style={[styles.dangerZone, { borderColor: Palette.danger }]}>

                      <ThemedText type="smallBold" style={{ color: Palette.danger }}>
                        Danger Zone
                      </ThemedText>

                      <ThemedText themeColor="textSecondary" type="small" style={{ marginTop: 4, marginBottom: 12 }}>
                        Permanently deletes this farmer's account along with their farm, soil test, and recommendation records.
                      </ThemedText>

                      <Pressable
                        style={[styles.deleteButton, deletingFarmerId === farmer.id && styles.buttonDisabled]}
                        onPress={() => deleteFarmer(farmer)}
                        disabled={deletingFarmerId === farmer.id}
                      >

                        {deletingFarmerId === farmer.id ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <ThemedText style={styles.deleteButtonText}>🗑️ Delete Farmer Account</ThemedText>
                        )}

                      </Pressable>

                    </View>

                  </View>

                )}

              </View>

            );

          })}

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

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  exportButton: {
    backgroundColor: Palette.admin,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 168,
    alignItems: "center",
    justifyContent: "center",
  },

  refreshButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  subtitle: {
    marginTop: 6,
  },

  loader: {
    marginTop: 40,
  },

  emptyState: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: Palette.border,
  },

  emptyIcon: {
    fontSize: 32,
  },

  retryButton: {
    backgroundColor: Palette.admin,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
  },

  list: {
    gap: 12,
  },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: "0px 2px 6px rgba(15,23,42,0.06)",
    overflow: "hidden",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },

  detailPanel: {
    borderTopWidth: 1,
    padding: 16,
  },

  sectionLabel: {
    marginBottom: 10,
    marginTop: 4,
  },

  label: {
    marginBottom: 6,
    marginTop: 10,
  },

  fieldRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },

  fieldHalf: {
    flex: 1,
    minWidth: 140,
  },

  fieldThird: {
    flex: 1,
    minWidth: 110,
  },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  chip: {
    borderWidth: 1.5,
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  smallButton: {
    backgroundColor: Palette.admin,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    alignSelf: "flex-start",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  smallButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },

  dangerZone: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
  },

  deleteButton: {
    backgroundColor: Palette.danger,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },

  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },

  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 12,
    justifyContent: "center",
  },

  linkButton: {
    marginTop: 10,
    paddingVertical: 8,
  },

  farmCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  soilRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
    gap: 8,
  },

  soilEditCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },

});
