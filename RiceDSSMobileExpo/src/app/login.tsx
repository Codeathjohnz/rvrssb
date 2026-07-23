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
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

import { SafeAreaView } from "react-native-safe-area-context";

import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { FadeInView } from "@/components/fade-in-view";
import { SwayIcon } from "@/components/sway-icon";
import { Palette } from "@/constants/theme";

import API from "../api/api";
import { alert } from "../utils/alert";
import { saveToken } from "../storage/auth";


const RICE_FIELD_IMAGE_URL = "https://www.shutterbug.com/images/styles/960-wide/public/photo_post/[uid]/Ubud%20Bali%20Rice%20Paddy.jpg";


export default function Login() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);


  const submitLogin = async (loginEmail: string, loginPassword: string) => {

    if (!loginEmail || !loginPassword) {

      alert("Error", "Please enter email and password");
      return;

    }

    setLoading(true);

    try {

      const response = await API.post("/api/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });

      if (response.data.success) {

        const role = response.data.role?.toLowerCase();
        const username = response.data.username ?? "";

        if (response.data.token) {
          await saveToken(response.data.token);
        }

        if (role === "farmer") {

          router.replace({ pathname: "/farmer-dashboard", params: { username } });

        } else if (role === "admin") {

          router.replace({ pathname: "/admin-dashboard", params: { username } });

        } else {

          alert("Error", "Invalid user role");

        }

      } else {

        alert("Login Failed", response.data.message || "Invalid account");

      }

    } catch (error) {

      console.log("LOGIN ERROR:", error);

      alert("Error", "Cannot connect to server");

    } finally {

      setLoading(false);

    }

  };


  const login = () => submitLogin(email, password);


  return (

    <View style={styles.flex}>

      <Image
        source={{ uri: RICE_FIELD_IMAGE_URL }}
        style={styles.background}
        contentFit="cover"
      />

      <LinearGradient
        colors={["rgba(4,26,15,0.85)", "rgba(6,40,22,0.55)", "rgba(4,26,15,0.9)"]}
        locations={[0, 0.5, 1]}
        style={styles.scrim}
      />

      <SafeAreaView style={styles.flex} edges={["top", "bottom"]}>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            <FadeInView style={styles.centerWrap}>

              <View style={styles.badge}>
                <SwayIcon icon="🌾" size={36} />
              </View>

              <ThemedText style={styles.eyebrow}>
                DA BUNAWAN · AGUSAN DEL SUR
              </ThemedText>

              <ThemedText style={styles.heroTitle}>
                Welcome Back
              </ThemedText>

              <ThemedText style={styles.heroSubtitle}>
                Sign in to get your rice variety recommendations
              </ThemedText>


              <FadeInView delay={140} style={styles.glassCard}>

                <ThemedText style={styles.label}>
                  Email
                </ThemedText>

                <TextInput
                  placeholder="you@example.com"
                  placeholderTextColor="rgba(255,255,255,0.55)"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <ThemedText style={styles.label}>
                  Password
                </ThemedText>

                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.55)"
                  style={styles.input}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />

                <Pressable
                  onPress={login}
                  disabled={loading}
                  style={({ pressed }) => [styles.primaryButtonWrap, pressed && styles.pressed]}
                >

                  <LinearGradient
                    colors={[Palette.primary, Palette.slateActiveBar]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.primaryButton, loading && styles.buttonDisabled]}
                  >

                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <ThemedText style={styles.primaryButtonText}>Login</ThemedText>
                    )}

                  </LinearGradient>

                </Pressable>

                <Pressable onPress={() => router.push("/create-account")}>

                  <ThemedText style={styles.registerLink}>
                    Don&apos;t have an account?{" "}
                    <ThemedText style={styles.registerLinkBold}>Create one</ThemedText>
                  </ThemedText>

                </Pressable>

              </FadeInView>

            </FadeInView>

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

  background: {
    ...StyleSheet.absoluteFillObject,
  },

  scrim: {
    ...StyleSheet.absoluteFillObject,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },

  pressed: {
    opacity: 0.9,
  },

  centerWrap: {
    alignItems: "center",
    paddingHorizontal: 25,
  },

  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  eyebrow: {
    color: Palette.slateActiveBar,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 10,
  },

  heroTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
    textAlign: "center",
  },

  heroSubtitle: {
    marginTop: 10,
    fontSize: 15,
    textAlign: "center",
    color: "rgba(255,255,255,0.85)",
    maxWidth: 320,
    lineHeight: 21,
  },

  glassCard: {
    width: "100%",
    maxWidth: 420,
    marginTop: 32,
    borderRadius: 24,
    padding: 28,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    boxShadow: "0px 24px 60px rgba(0,0,0,0.35)",
    backdropFilter: "blur(24px)",
  } as any,

  label: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: "#FFFFFF",
  },

  primaryButtonWrap: {
    marginTop: 26,
    borderRadius: 30,
    boxShadow: "0px 10px 24px rgba(212,160,23,0.3)",
  },

  primaryButton: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  registerLink: {
    textAlign: "center",
    marginTop: 20,
    color: "rgba(255,255,255,0.75)",
  },

  registerLinkBold: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

});
