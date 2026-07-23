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


type Admin = {
  id: number;
  name: string | null;
  username: string | null;
  email: string;
  created_at: string;
};


export default function AdminAccounts() {

  const theme = useTheme();
  const router = useRouter();

  const [admins, setAdmins] = useState<Admin[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const load = useCallback(() => {

    setError(null);

    return API.get("/api/admin/accounts")
      .then((response) => setAdmins(response.data))
      .catch((err) => {

        console.log("ADMIN ACCOUNTS ERROR:", err);

        if (err?.response?.status === 401 || err?.response?.status === 403) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Could not load admin accounts. Check your connection and try again.");
        }

      });

  }, []);


  useEffect(() => {

    load();

  }, [load]);


  const retry = () => {

    if (error?.includes("session")) {
      router.replace("/login");
      return;
    }

    load();

  };


  const createAdmin = async () => {

    if (!username || !email || !password) {

      alert("Missing Data", "Username, email, and password are required");
      return;

    }

    if (password.length < 8) {

      alert("Weak Password", "Password must be at least 8 characters");
      return;

    }

    setSaving(true);

    try {

      await API.post("/api/admin/accounts", { username, email, password });

      setUsername("");
      setEmail("");
      setPassword("");
      setShowForm(false);
      await load();

      alert("Admin Created", `${username} can now log in with administrator access.`);

    } catch (err: any) {

      console.log("CREATE ADMIN ERROR:", err);
      alert("Error", err?.response?.data?.message || "Could not create admin account");

    } finally {

      setSaving(false);

    }

  };


  return (

    <AdminShell>

      <View style={styles.header}>

        <View style={styles.headerText}>

          <ThemedText type="subtitle">
            🛡️ Admin Accounts
          </ThemedText>

          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {admins
              ? `${admins.length} administrator${admins.length === 1 ? "" : "s"}`
              : error
                ? error
                : "Loading…"}
          </ThemedText>

        </View>

        <Pressable
          style={[styles.addButton, showForm && styles.addButtonActive]}
          onPress={() => setShowForm((prev) => !prev)}
        >

          <ThemedText style={styles.addButtonText}>
            {showForm ? "✕ Cancel" : "+ New Admin"}
          </ThemedText>

        </Pressable>

      </View>


      <View style={[styles.infoBanner, { backgroundColor: Palette.adminSoft }]}>

        <ThemedText style={styles.infoIcon}>🔒</ThemedText>

        <ThemedText style={{ color: Palette.adminDark, flex: 1, lineHeight: 19 }}>
          Only an existing administrator can create another admin account —
          the public sign-up form always creates a farmer account.
        </ThemedText>

      </View>


      {showForm && (

        <View style={[styles.form, { backgroundColor: Palette.surface }]}>

          <ThemedText type="smallBold" style={styles.label}>
            Username
          </ThemedText>

          <TextInput
            style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
            placeholder="e.g. juan_delacruz"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <ThemedText type="smallBold" style={styles.label}>
            Email
          </ThemedText>

          <TextInput
            style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
            placeholder="admin@ricedss.ph"
            placeholderTextColor={theme.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <ThemedText type="smallBold" style={styles.label}>
            Password
          </ThemedText>

          <TextInput
            style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
            placeholder="At least 8 characters"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={createAdmin}
            disabled={saving}
          >

            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.saveButtonText}>Create Admin Account</ThemedText>
            )}

          </Pressable>

        </View>

      )}


      {!admins && !error ? (

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

        <View style={styles.list}>

          {admins?.map((admin) => (

            <View
              key={admin.id}
              style={[styles.card, { backgroundColor: Palette.surface }]}
            >

              <View style={[styles.avatar, { backgroundColor: Palette.adminSoft }]}>
                <ThemedText style={styles.avatarIcon}>🛡️</ThemedText>
              </View>

              <View style={{ flex: 1 }}>

                <ThemedText type="smallBold">
                  {admin.name || admin.username || "—"}
                </ThemedText>

                <ThemedText themeColor="textSecondary" type="small">
                  {admin.email}
                </ThemedText>

              </View>

              <ThemedText themeColor="textSecondary" type="small">
                Joined {new Date(admin.created_at).toLocaleDateString()}
              </ThemedText>

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
    marginBottom: 20,
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

  infoBanner: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },

  infoIcon: {
    fontSize: 18,
  },

  form: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: "0px 2px 6px rgba(15,23,42,0.06)",
    maxWidth: 480,
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

  list: {
    gap: 12,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: "0px 2px 6px rgba(15,23,42,0.06)",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarIcon: {
    fontSize: 18,
  },

});
