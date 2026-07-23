import React, { useEffect, useState } from "react";

import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";

import * as Location from "expo-location";

import { ThemedText } from "@/components/themed-text";
import { FarmerShell } from "@/components/farmer-shell";
import { useTheme } from "@/hooks/use-theme";
import { Palette } from "@/constants/theme";

import API from "../api/api";
import { alert } from "../utils/alert";


const BARANGAYS = ["San Teodoro", "Poblacion", "Libertad", "San Marcos"] as const;

const SOIL_TYPES = ["Loam", "Clay", "Silty Clay Loam", "Clay Loam"] as const;

type Farm = {
  id: number;
  barangay: string | null;
  soil_type: string | null;
  area: string | null;
  latitude: string | null;
  longitude: string | null;
};


function staticMapUrl(lat: number, lon: number) {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=14&size=600x220&markers=${lat},${lon},red-pushpin`;
}


export default function Profile() {

  const theme = useTheme();

  // Account
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(true);

  // Farm
  const [farm, setFarm] = useState<Farm | null>(null);
  const [barangay, setBarangay] = useState("");
  const [soilType, setSoilType] = useState("");
  const [area, setArea] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locating, setLocating] = useState(false);
  const [savingFarm, setSavingFarm] = useState(false);
  const [loadingFarm, setLoadingFarm] = useState(true);


  useEffect(() => {

    API.get("/api/farmer/profile")
      .then((response) => {

        setName(response.data.name || "");
        setUsername(response.data.username || "");
        setEmail(response.data.email || "");

      })
      .catch((err) => console.log("PROFILE LOAD ERROR:", err))
      .finally(() => setLoadingAccount(false));

    API.get("/api/farmer/farms")
      .then((response) => {

        const existing = response.data?.[0] as Farm | undefined;

        if (existing) {

          setFarm(existing);
          setBarangay(existing.barangay || "");
          setSoilType(existing.soil_type || "");
          setArea(existing.area ? String(existing.area) : "");
          setLatitude(existing.latitude ? String(existing.latitude) : "");
          setLongitude(existing.longitude ? String(existing.longitude) : "");

        }

      })
      .catch((err) => console.log("FARM LOAD ERROR:", err))
      .finally(() => setLoadingFarm(false));

  }, []);


  const saveAccount = async () => {

    if (!name || !email) {

      alert("Missing Data", "Name and email are required");
      return;

    }

    setSavingAccount(true);

    try {

      await API.put("/api/farmer/profile", { name, email });
      alert("Saved", "Your profile was updated");

    } catch (err) {

      console.log("SAVE PROFILE ERROR:", err);
      alert("Error", "Could not update profile");

    } finally {

      setSavingAccount(false);

    }

  };


  const useMyLocation = async () => {

    setLocating(true);

    try {

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {

        alert("Permission Needed", "Location access is required to auto-fill your farm's coordinates.");
        return;

      }

      const position = await Location.getCurrentPositionAsync({});

      setLatitude(position.coords.latitude.toFixed(6));
      setLongitude(position.coords.longitude.toFixed(6));

    } catch (err) {

      console.log("LOCATION ERROR:", err);
      alert("Error", "Could not get your current location. You can enter coordinates manually instead.");

    } finally {

      setLocating(false);

    }

  };


  const saveFarm = async () => {

    if (!barangay || !soilType || !area) {

      alert("Missing Data", "Barangay, soil type, and land size are required");
      return;

    }

    setSavingFarm(true);

    try {

      const payload = {
        barangay,
        soil_type: soilType,
        area: Number(area),
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      };

      if (farm) {

        await API.put(`/api/farmer/farm/${farm.id}`, payload);

      } else {

        await API.post("/api/farmer/farm", payload);

      }

      alert("Saved", "Your farm profile was updated");

      const response = await API.get("/api/farmer/farms");
      setFarm(response.data?.[0] || null);

    } catch (err) {

      console.log("SAVE FARM ERROR:", err);
      alert("Error", "Could not save your farm profile");

    } finally {

      setSavingFarm(false);

    }

  };


  const lat = latitude ? Number(latitude) : null;
  const lon = longitude ? Number(longitude) : null;
  const hasCoords = lat !== null && lon !== null && !Number.isNaN(lat) && !Number.isNaN(lon);


  return (

    <FarmerShell>

      <ThemedText type="subtitle">
        🧑‍🌾 My Profile & Farm
      </ThemedText>

      <ThemedText themeColor="textSecondary" style={styles.subtitle}>
        Manage your account and your farm's location and land details.
      </ThemedText>


      <ThemedText type="smallBold" style={styles.sectionTitle}>
        Account
      </ThemedText>

      <View style={[styles.card, { backgroundColor: Palette.surface }]}>

        {loadingAccount ? (

          <ActivityIndicator color={Palette.primary} />

        ) : (

          <>

            <ThemedText type="smallBold" style={styles.label}>
              Full Name
            </ThemedText>

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Juan Dela Cruz"
              placeholderTextColor={theme.textSecondary}
            />

            <ThemedText type="smallBold" style={styles.label}>
              Username
            </ThemedText>

            <TextInput
              style={[styles.input, styles.inputDisabled, { color: theme.textSecondary, borderColor: Palette.border, backgroundColor: theme.background }]}
              value={username}
              editable={false}
            />

            <ThemedText type="smallBold" style={styles.label}>
              Email
            </ThemedText>

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Pressable
              style={[styles.button, savingAccount && styles.buttonDisabled]}
              onPress={saveAccount}
              disabled={savingAccount}
            >

              {savingAccount ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.buttonText}>Save Account Info</ThemedText>
              )}

            </Pressable>

          </>

        )}

      </View>


      <ThemedText type="smallBold" style={styles.sectionTitle}>
        My Farm
      </ThemedText>

      <View style={[styles.card, { backgroundColor: Palette.surface }]}>

        {loadingFarm ? (

          <ActivityIndicator color={Palette.primary} />

        ) : (

          <>

            <ThemedText type="smallBold" style={styles.label}>
              Barangay
            </ThemedText>

            <View style={styles.chipRow}>

              {BARANGAYS.map((b) => {

                const selected = barangay === b;

                return (

                  <Pressable
                    key={b}
                    style={[
                      styles.chip,
                      { borderColor: Palette.border },
                      selected && { backgroundColor: Palette.primary, borderColor: Palette.primary },
                    ]}
                    onPress={() => setBarangay(b)}
                  >

                    <ThemedText type="small" style={selected ? { color: "#FFFFFF", fontWeight: "700" } : undefined}>
                      {b}
                    </ThemedText>

                  </Pressable>

                );

              })}

            </View>


            <ThemedText type="smallBold" style={styles.label}>
              Soil Type
            </ThemedText>

            <View style={styles.chipRow}>

              {SOIL_TYPES.map((s) => {

                const selected = soilType === s;

                return (

                  <Pressable
                    key={s}
                    style={[
                      styles.chip,
                      { borderColor: Palette.border },
                      selected && { backgroundColor: Palette.grain, borderColor: Palette.grain },
                    ]}
                    onPress={() => setSoilType(s)}
                  >

                    <ThemedText type="small" style={selected ? { color: "#FFFFFF", fontWeight: "700" } : undefined}>
                      {s}
                    </ThemedText>

                  </Pressable>

                );

              })}

            </View>


            <ThemedText type="smallBold" style={styles.label}>
              Land Size (hectares)
            </ThemedText>

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
              value={area}
              onChangeText={setArea}
              keyboardType="numeric"
              placeholder="e.g. 1.5"
              placeholderTextColor={theme.textSecondary}
            />


            <ThemedText type="smallBold" style={styles.label}>
              Farm Location (coordinates)
            </ThemedText>

            <View style={styles.coordRow}>

              <TextInput
                style={[styles.input, styles.coordInput, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="numeric"
                placeholder="Latitude"
                placeholderTextColor={theme.textSecondary}
              />

              <TextInput
                style={[styles.input, styles.coordInput, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="numeric"
                placeholder="Longitude"
                placeholderTextColor={theme.textSecondary}
              />

            </View>

            <Pressable
              style={[styles.locateButton, { borderColor: Palette.sky }]}
              onPress={useMyLocation}
              disabled={locating}
            >

              {locating ? (
                <ActivityIndicator color={Palette.sky} size="small" />
              ) : (
                <ThemedText type="smallBold" style={{ color: Palette.sky }}>
                  📍 Use My Current Location
                </ThemedText>
              )}

            </Pressable>


            {hasCoords ? (

              <Image
                source={{ uri: staticMapUrl(lat as number, lon as number) }}
                style={styles.mapPreview}
                resizeMode="cover"
              />

            ) : (

              <View style={[styles.mapPlaceholder, { backgroundColor: theme.background, borderColor: Palette.border }]}>

                <ThemedText themeColor="textSecondary" type="small">
                  Add coordinates above to preview your farm's location on the map.
                </ThemedText>

              </View>

            )}


            <Pressable
              style={[styles.button, savingFarm && styles.buttonDisabled]}
              onPress={saveFarm}
              disabled={savingFarm}
            >

              {savingFarm ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.buttonText}>
                  {farm ? "Update Farm Profile" : "Save Farm Profile"}
                </ThemedText>
              )}

            </Pressable>

          </>

        )}

      </View>

    </FarmerShell>

  );

}


const styles = StyleSheet.create({

  subtitle: {
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 20,
  },

  sectionTitle: {
    fontSize: 15,
    marginBottom: 10,
    marginTop: 4,
  },

  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: "0px 2px 6px rgba(15,23,42,0.06)",
  },

  label: {
    marginBottom: 8,
    marginTop: 14,
  },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },

  inputDisabled: {
    opacity: 0.6,
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
  },

  coordInput: {
    flex: 1,
  },

  locateButton: {
    borderWidth: 1.5,
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },

  mapPreview: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    marginTop: 16,
  },

  mapPlaceholder: {
    borderWidth: 1,
    borderRadius: 14,
    marginTop: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },

  button: {
    backgroundColor: Palette.primary,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 22,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

});
