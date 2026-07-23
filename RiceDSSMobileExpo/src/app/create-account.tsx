import React, { useState } from "react";

import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { GradientHero } from "@/components/gradient-hero";
import { useTheme } from "@/hooks/use-theme";
import { Palette } from "@/constants/theme";

import API from "../api/api";
import { alert } from "../utils/alert";


export default function CreateAccount() {

  const theme = useTheme();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);


  const registerAccount = async () => {

    if (!username || !email || !password) {

      alert("Error", "Please complete all fields");
      return;

    }

    setLoading(true);

    try {

      const response = await API.post("/api/auth/register", {
        username,
        email,
        password,
        role: "farmer",
      });

      alert("Success", response.data.message || "Account created");

      router.replace("/login");

    } catch (error: any) {

      console.log(error);

      alert(
        "Error",
        error?.response?.data?.message || "Registration failed"
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <View style={styles.flex}>

      <SafeAreaView style={styles.flex} edges={["top"]}>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            <GradientHero
              icon="🌱"
              title="Create Account"
              subtitle="Sign up as a farmer to start receiving recommendations"
            />


            <View style={[styles.sheet, { backgroundColor: theme.background }]}>

              <View style={[styles.card, { backgroundColor: Palette.surface }]}>

                <ThemedText type="smallBold" style={styles.label}>
                  Username
                </ThemedText>

                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
                  placeholder="e.g. juan_delacruz"
                  placeholderTextColor={theme.textSecondary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />

                <ThemedText type="smallBold" style={styles.label}>
                  Email
                </ThemedText>

                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: Palette.border, backgroundColor: theme.background }]}
                  placeholder="you@example.com"
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
                  placeholder="••••••••"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />

                <Pressable
                  style={[styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={registerAccount}
                  disabled={loading}
                >

                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <ThemedText style={styles.primaryButtonText}>Register</ThemedText>
                  )}

                </Pressable>

                <Pressable
                  style={styles.backButton}
                  onPress={() => router.back()}
                >

                  <ThemedText type="smallBold" style={{ color: Palette.primary }}>
                    Back to Login
                  </ThemedText>

                </Pressable>

              </View>

            </View>

          </ScrollView>

        </KeyboardAvoidingView>

      </SafeAreaView>

    </View>

  );

}


const styles = StyleSheet.create({

  flex: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  sheet: {
    flex: 1,
    marginTop: -28,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 32,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },

  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: "0px 2px 6px rgba(15,23,42,0.06)",
  },

  label: {
    marginBottom: 6,
    marginTop: 14,
  },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },

  primaryButton: {
    backgroundColor: Palette.primary,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 24,
    boxShadow: "0px 6px 10px rgba(27,94,32,0.25)",
    elevation: 4,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  backButton: {
    alignItems: "center",
    marginTop: 18,
  },

});
