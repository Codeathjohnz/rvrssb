import React, { useEffect, useState } from "react";

import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { useRouter, useLocalSearchParams } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { FarmerShell } from "@/components/farmer-shell";
import { useTheme } from "@/hooks/use-theme";
import { Palette } from "@/constants/theme";

import API from "../api/api";
import { alert } from "../utils/alert";


const SOIL_TYPES = [

  { value: "Loam", desc: "Crumbly, dark, and well-draining — the easiest to work with." },
  { value: "Clay", desc: "Sticky and moldable when wet; hardens and cracks when dry." },
  { value: "Silty Clay Loam", desc: "Smooth, soapy feel; holds water longer than loam." },
  { value: "Clay Loam", desc: "Firm but slightly gritty; drains slower, holds nutrients well." },

] as const;

const LEVELS = ["Low", "Medium", "High"] as const;
const SEASONS = ["Wet", "Dry"] as const;
const YIELD_UNITS = ["sacks/ha", "tons/ha", "cavans/ha"] as const;

const OTHER_SEEDLINGS = "Other / farm-saved seeds";

// PhilRice-recommended basal and top-dress fertilizers for irrigated rice
// (Complete 14-14-14 at planting; Urea and Muriate of Potash as top-dress).
const FERTILIZER_OPTIONS = [
  "Complete (14-14-14)",
  "Urea (46-0-0)",
  "Muriate of Potash (0-0-60)",
  "Ammonium Sulfate (21-0-0)",
  "Diammonium Phosphate (18-46-0)",
  "Organic Fertilizer (Compost/Vermicast)",
  "None applied",
] as const;

// Rice IPM categories per DA/PhilRice guidance: cultural, biological,
// botanical/organic, and chemical control.
const PEST_CONTROL_OPTIONS = [
  "Insecticide Spray (Chemical)",
  "Biological Control (Natural Predators)",
  "Cultural Control (Field Sanitation, Synchronous Planting)",
  "Botanical/Organic Pesticide (Neem, Garlic-based)",
  "Integrated Pest Management (Combined Methods)",
  "None applied",
] as const;

type NPKKey = "nitrogen" | "phosphorus" | "potassium";

type Farm = {
  id: number;
  barangay: string | null;
  soil_type: string | null;
};

type Variety = {
  id: number;
  name: string;
};

const CURRENT_YEAR = new Date().getFullYear();


export default function FarmData() {

  const router = useRouter();
  const theme = useTheme();
  const { username } = useLocalSearchParams<{ username?: string }>();

  const [farm, setFarm] = useState<Farm | null>(null);
  const [checkingFarm, setCheckingFarm] = useState(true);
  const [varieties, setVarieties] = useState<Variety[]>([]);

  // Environmental / agronomic conditions
  const [soilType, setSoilType] = useState("");
  const [ph, setPh] = useState("");
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");
  const [rainfall, setRainfall] = useState("");
  const [pestLevel, setPestLevel] = useState("");

  // Season / crop management
  const [season, setSeason] = useState("");
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [seedlings, setSeedlings] = useState("");
  const [seedlingsOther, setSeedlingsOther] = useState("");
  const [fertilizers, setFertilizers] = useState<string[]>([]);
  const [pestControl, setPestControl] = useState<string[]>([]);
  const [yieldAmount, setYieldAmount] = useState("");
  const [yieldUnit, setYieldUnit] = useState("");

  const [loading, setLoading] = useState(false);


  useEffect(() => {

    API.get("/api/farmer/farms")
      .then((response) => {

        const existing = response.data?.[0] as Farm | undefined;

        if (existing) {

          setFarm(existing);

          if (existing.soil_type) setSoilType(existing.soil_type);

        }

      })
      .catch((err) => console.log("FARM CHECK ERROR:", err))
      .finally(() => setCheckingFarm(false));

    API.get("/api/farmer/varieties")
      .then((response) => setVarieties(response.data))
      .catch((err) => console.log("VARIETIES FETCH ERROR:", err));

  }, []);


  const npkValues: Record<NPKKey, string> = { nitrogen, phosphorus, potassium };
  const setNpk: Record<NPKKey, (v: string) => void> = {
    nitrogen: setNitrogen,
    phosphorus: setPhosphorus,
    potassium: setPotassium,
  };

  const toggleInList = (list: string[], value: string): string[] => {

    if (value === "None applied") return list.includes(value) ? [] : [value];

    const withoutNone = list.filter((item) => item !== "None applied");

    return withoutNone.includes(value)
      ? withoutNone.filter((item) => item !== value)
      : [...withoutNone, value];

  };


  const getRecommendation = async () => {

    if (!farm) {

      alert(
        "Set Up Your Farm First",
        "Please add your farm's location and land size in My Profile & Farm before entering season data.",
        [{ text: "Go to Profile", onPress: () => router.push({ pathname: "/profile", params: { username } }) }, { text: "Cancel", style: "cancel" }]
      );

      return;

    }

    if (!soilType || !ph || !nitrogen || !phosphorus || !potassium || !rainfall || !pestLevel || !season) {

      alert("Missing Data", "Please complete all environmental conditions and select a season");
      return;

    }

    setLoading(true);

    try {

      const seedlingsValue = seedlings === OTHER_SEEDLINGS ? seedlingsOther.trim() : seedlings;
      const fertilizersValue = fertilizers.join(", ");
      const pestControlValue = pestControl.join(", ");

      await API.post("/api/farmer/soil", {
        farm_id: farm.id,
        ph: Number(ph),
        nitrogen,
        phosphorus,
        potassium,
        rainfall: Number(rainfall),
        pest_level: pestLevel,
      });

      await API.post("/api/farmer/season", {
        farm_id: farm.id,
        season,
        year: Number(year),
        seedlings: seedlingsValue || null,
        fertilizers: fertilizersValue || null,
        pest_control: pestControlValue || null,
        yield_amount: yieldAmount ? Number(yieldAmount) : null,
        yield_unit: yieldAmount ? (yieldUnit || YIELD_UNITS[0]) : null,
      });

      const response = await API.post("/api/electre/recommend", {
        farm_id: farm.id,
        soilType,
        ph: Number(ph),
        rainfall: Number(rainfall),
        pest_level: pestLevel,
      });

      router.push({
        pathname: "/recommendation",
        params: { result: JSON.stringify(response.data), username },
      });

    } catch (error) {

      console.log(error);

      alert("Error", "Cannot generate recommendation");

    } finally {

      setLoading(false);

    }

  };


  if (checkingFarm) {

    return (

      <FarmerShell>
        <ActivityIndicator color={Palette.primary} style={{ marginTop: 60 }} />
      </FarmerShell>

    );

  }


  return (

    <FarmerShell>

      <ThemedText type="subtitle">
        🌱 Farm Data Entry
      </ThemedText>

      <ThemedText themeColor="textSecondary" style={styles.subtitle}>
        Tell us about your field and this season's crop so we can rank the best-fit rice varieties.
      </ThemedText>


      {!farm && (

        <Pressable
          style={[styles.infoBanner, { backgroundColor: Palette.dangerSoft }]}
          onPress={() => router.push({ pathname: "/profile", params: { username } })}
        >

          <ThemedText style={styles.infoIcon}>⚠️</ThemedText>

          <ThemedText style={{ color: Palette.danger, flex: 1, lineHeight: 19 }}>
            <ThemedText type="smallBold" style={{ color: Palette.danger }}>
              No farm on file yet.{" "}
            </ThemedText>
            Tap here to add your farm's location and land size first — it's needed before we can generate a recommendation.
          </ThemedText>

        </Pressable>

      )}


      <View style={[styles.infoBanner, { backgroundColor: Palette.primarySoft }]}>

        <ThemedText style={styles.infoIcon}>📋</ThemedText>

        <ThemedText style={{ color: Palette.primaryDark, flex: 1, lineHeight: 19 }}>
          <ThemedText type="smallBold" style={{ color: Palette.primaryDark }}>
            Where to get this data:{" "}
          </ThemedText>
          Your barangay agricultural technician or the DA-Bunawan Municipal
          Agriculture Office can run a free Soil Test Kit (STK) on your field
          — it reports pH plus Nitrogen, Phosphorus, and Potassium as Low,
          Medium, or High.
        </ThemedText>

      </View>


      <ThemedText type="smallBold" style={styles.sectionTitle}>
        Environmental &amp; Agronomic Conditions
      </ThemedText>

      <View style={[styles.card, { backgroundColor: Palette.surface }]}>

        <ThemedText type="smallBold" style={styles.label}>
          Soil Type
        </ThemedText>

        <View style={styles.chipRow}>

          {SOIL_TYPES.map((type) => {

            const selected = soilType === type.value;

            return (

              <Pressable
                key={type.value}
                style={[
                  styles.chip,
                  { borderColor: Palette.border },
                  selected && { backgroundColor: Palette.primary, borderColor: Palette.primary },
                ]}
                onPress={() => setSoilType(type.value)}
              >

                <ThemedText
                  type="small"
                  style={selected ? { color: "#FFFFFF", fontWeight: "700" } : undefined}
                >
                  {type.value}
                </ThemedText>

              </Pressable>

            );

          })}

        </View>

        {soilType ? (

          <ThemedText themeColor="textSecondary" type="small" style={styles.helperText}>
            {SOIL_TYPES.find((t) => t.value === soilType)?.desc}
          </ThemedText>

        ) : (

          <ThemedText themeColor="textSecondary" type="small" style={styles.helperText}>
            Not sure? Judge by feel — squeeze a moist handful and compare to the descriptions above.
          </ThemedText>

        )}


        <ThemedText type="smallBold" style={styles.label}>
          Soil pH
        </ThemedText>

        <TextInput
          style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
          placeholder="e.g. 6.5"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
          value={ph}
          onChangeText={setPh}
        />

        <ThemedText themeColor="textSecondary" type="small" style={styles.helperText}>
          0–14 scale, 7.0 is neutral. Most rice varieties prefer 5.5–7.0. Check your STK report or a pH test strip.
        </ThemedText>


        {(["nitrogen", "phosphorus", "potassium"] as NPKKey[]).map((key) => (

          <View key={key}>

            <ThemedText type="smallBold" style={styles.label}>
              {key === "nitrogen" ? "Nitrogen (N)" : key === "phosphorus" ? "Phosphorus (P)" : "Potassium (K)"}
            </ThemedText>

            <View style={styles.chipRow}>

              {LEVELS.map((level) => {

                const selected = npkValues[key] === level;

                return (

                  <Pressable
                    key={level}
                    style={[
                      styles.chip,
                      { borderColor: Palette.border },
                      selected && { backgroundColor: Palette.grain, borderColor: Palette.grain },
                    ]}
                    onPress={() => setNpk[key](level)}
                  >

                    <ThemedText
                      type="small"
                      style={selected ? { color: "#FFFFFF", fontWeight: "700" } : undefined}
                    >
                      {level}
                    </ThemedText>

                  </Pressable>

                );

              })}

            </View>

          </View>

        ))}

        <ThemedText themeColor="textSecondary" type="small" style={styles.helperText}>
          Taken straight from your Soil Test Kit (STK) report — it rates each nutrient as Low, Medium, or High rather than a lab number.
        </ThemedText>


        <ThemedText type="smallBold" style={styles.label}>
          Rainfall (mm/year)
        </ThemedText>

        <TextInput
          style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
          placeholder="e.g. 1800"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
          value={rainfall}
          onChangeText={setRainfall}
        />

        <ThemedText themeColor="textSecondary" type="small" style={styles.helperText}>
          Bunawan is tropical with no dry season — typical totals run roughly 1,500–2,500mm/year. Check PAGASA or your barangay records if unsure.
        </ThemedText>


        <ThemedText type="smallBold" style={styles.label}>
          Pest Pressure
        </ThemedText>

        <View style={styles.chipRow}>

          {LEVELS.map((level) => {

            const selected = pestLevel === level;

            return (

              <Pressable
                key={level}
                style={[
                  styles.chip,
                  { borderColor: Palette.border },
                  selected && { backgroundColor: Palette.danger, borderColor: Palette.danger },
                ]}
                onPress={() => setPestLevel(level)}
              >

                <ThemedText type="small" style={selected ? { color: "#FFFFFF", fontWeight: "700" } : undefined}>
                  {level}
                </ThemedText>

              </Pressable>

            );

          })}

        </View>

        <ThemedText themeColor="textSecondary" type="small" style={styles.helperText}>
          How much pest/disease pressure your field usually sees — this shifts how heavily pest resistance is weighed in your ranking.
        </ThemedText>

      </View>


      <ThemedText type="smallBold" style={styles.sectionTitle}>
        This Season's Crop Management
      </ThemedText>

      <View style={[styles.card, { backgroundColor: Palette.surface }]}>

        <ThemedText type="smallBold" style={styles.label}>
          Season
        </ThemedText>

        <View style={styles.chipRow}>

          {SEASONS.map((s) => {

            const selected = season === s;

            return (

              <Pressable
                key={s}
                style={[
                  styles.chip,
                  { borderColor: Palette.border },
                  selected && { backgroundColor: Palette.sky, borderColor: Palette.sky },
                ]}
                onPress={() => setSeason(s)}
              >

                <ThemedText type="small" style={selected ? { color: "#FFFFFF", fontWeight: "700" } : undefined}>
                  {s} Season
                </ThemedText>

              </Pressable>

            );

          })}

        </View>


        <ThemedText type="smallBold" style={styles.label}>
          Year
        </ThemedText>

        <TextInput
          style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
          keyboardType="numeric"
          value={year}
          onChangeText={setYear}
        />


        <ThemedText type="smallBold" style={styles.label}>
          Seedlings Used
        </ThemedText>

        <View style={styles.chipRow}>

          {[...varieties.map((v) => v.name), OTHER_SEEDLINGS].map((name) => {

            const selected = seedlings === name;

            return (

              <Pressable
                key={name}
                style={[
                  styles.chip,
                  { borderColor: Palette.border },
                  selected && { backgroundColor: Palette.primary, borderColor: Palette.primary },
                ]}
                onPress={() => setSeedlings(name)}
              >

                <ThemedText type="small" style={selected ? { color: "#FFFFFF", fontWeight: "700" } : undefined}>
                  {name}
                </ThemedText>

              </Pressable>

            );

          })}

        </View>

        {seedlings === OTHER_SEEDLINGS && (

          <TextInput
            style={[styles.input, styles.otherInput, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
            placeholder="Describe the seeds used"
            placeholderTextColor={theme.textSecondary}
            value={seedlingsOther}
            onChangeText={setSeedlingsOther}
          />

        )}

        <ThemedText themeColor="textSecondary" type="small" style={styles.helperText}>
          Varieties tracked in the system — pick whichever you actually planted this season.
        </ThemedText>


        <ThemedText type="smallBold" style={styles.label}>
          Fertilizers Applied
        </ThemedText>

        <View style={styles.chipRow}>

          {FERTILIZER_OPTIONS.map((option) => {

            const selected = fertilizers.includes(option);

            return (

              <Pressable
                key={option}
                style={[
                  styles.chip,
                  { borderColor: Palette.border },
                  selected && { backgroundColor: Palette.grain, borderColor: Palette.grain },
                ]}
                onPress={() => setFertilizers((prev) => toggleInList(prev, option))}
              >

                <ThemedText type="small" style={selected ? { color: "#FFFFFF", fontWeight: "700" } : undefined}>
                  {option}
                </ThemedText>

              </Pressable>

            );

          })}

        </View>

        <ThemedText themeColor="textSecondary" type="small" style={styles.helperText}>
          Based on PhilRice's basal + top-dress fertilizer guide for irrigated rice. Select all that you applied this season.
        </ThemedText>


        <ThemedText type="smallBold" style={styles.label}>
          Pest Control Applied
        </ThemedText>

        <View style={styles.chipRow}>

          {PEST_CONTROL_OPTIONS.map((option) => {

            const selected = pestControl.includes(option);

            return (

              <Pressable
                key={option}
                style={[
                  styles.chip,
                  { borderColor: Palette.border },
                  selected && { backgroundColor: Palette.danger, borderColor: Palette.danger },
                ]}
                onPress={() => setPestControl((prev) => toggleInList(prev, option))}
              >

                <ThemedText type="small" style={selected ? { color: "#FFFFFF", fontWeight: "700" } : undefined}>
                  {option}
                </ThemedText>

              </Pressable>

            );

          })}

        </View>

        <ThemedText themeColor="textSecondary" type="small" style={styles.helperText}>
          Based on DA/PhilRice's Integrated Pest Management (IPM) categories. Select all methods you used.
        </ThemedText>


        <ThemedText type="smallBold" style={styles.label}>
          Yield From Last Season (optional)
        </ThemedText>

        <View style={styles.coordRow}>

          <TextInput
            style={[styles.input, styles.coordInput, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
            placeholder="Amount"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            value={yieldAmount}
            onChangeText={setYieldAmount}
          />

        </View>

        <View style={styles.chipRow}>

          {YIELD_UNITS.map((unit) => {

            const selected = yieldUnit === unit;

            return (

              <Pressable
                key={unit}
                style={[
                  styles.chip,
                  { borderColor: Palette.border },
                  selected && { backgroundColor: Palette.soil, borderColor: Palette.soil },
                ]}
                onPress={() => setYieldUnit(unit)}
              >

                <ThemedText type="small" style={selected ? { color: "#FFFFFF", fontWeight: "700" } : undefined}>
                  {unit}
                </ThemedText>

              </Pressable>

            );

          })}

        </View>

        <ThemedText themeColor="textSecondary" type="small" style={styles.helperText}>
          Reporting your actual yield helps track how well past recommendations performed — leave blank if this is your first season.
        </ThemedText>


        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={getRecommendation}
          disabled={loading}
        >

          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.buttonText}>
              🌾 Generate ELECTRE Recommendation
            </ThemedText>
          )}

        </Pressable>

      </View>

    </FarmerShell>

  );

}


const styles = StyleSheet.create({

  subtitle: {
    marginTop: 6,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 15,
    marginBottom: 10,
    marginTop: 4,
  },

  infoBanner: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },

  infoIcon: {
    fontSize: 18,
  },

  card: {
    borderRadius: 20,
    padding: 24,
    gap: 4,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: "0px 2px 6px rgba(15,23,42,0.06)",
  },

  label: {
    marginBottom: 8,
    marginTop: 16,
  },

  helperText: {
    marginTop: 6,
    lineHeight: 17,
  },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },

  otherInput: {
    marginTop: 10,
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

  coordRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },

  coordInput: {
    flex: 1,
  },

  button: {
    backgroundColor: Palette.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 26,
    boxShadow: "0px 6px 10px rgba(27,94,32,0.25)",
    elevation: 4,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

});
