import React, { Fragment } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

import { SafeAreaView } from "react-native-safe-area-context";

import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { FadeInView } from "@/components/fade-in-view";
import { FarmerIllustration } from "@/components/farmer-illustration";
import { useTheme } from "@/hooks/use-theme";
import { Palette } from "@/constants/theme";


const RICE_FIELD_IMAGE_URL = "https://cdn.britannica.com/33/125833-050-3C90801C/Paddy-field-Minamiuonuma-Japan.jpg";


const WIDE_BREAKPOINT = 960;


const NAV_LINKS = ["Features", "How It Works", "About"] as const;

const FEATURES = [

  { icon: "🌱", bg: "#E8F5E9", title: "Variety Match", desc: "Best rice types for your field" },
  { icon: "📊", bg: "#E3F2FD", title: "ELECTRE Analysis", desc: "Multi-criteria decision ranking" },
  { icon: "🌦️", bg: "#FFF3E0", title: "Field-Ready Support", desc: "Soil and climate matching" },
  { icon: "📍", bg: "#FCE4EC", title: "Local Guidance", desc: "Barangay-specific advice" },

];

const STEPS = [

  { number: "1", icon: "📝", title: "Enter Your Farm Data", desc: "Soil type, pH, rainfall, and pest pressure — with real DA Soil Test Kit guidance built in." },
  { number: "2", icon: "⚖️", title: "Get an ELECTRE Ranking", desc: "Every tracked variety is scored and ranked using the ELECTRE I multi-criteria method." },
  { number: "3", icon: "🌾", title: "Plant With Confidence", desc: "See why each variety ranked where it did, then report your season's results." },

];

const STATS = [

  { value: "8", label: "Rice Varieties Tracked" },
  { value: "4", label: "Barangays Covered" },
  { value: "5", label: "ELECTRE Criteria Weighed" },

];


export default function HomeScreen() {

  const router = useRouter();
  const theme = useTheme();

  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;


  return (

    <View style={styles.flex}>

      <SafeAreaView style={styles.flex} edges={["top"]}>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* NAV BAR */}

          <View style={[styles.navBar, { backgroundColor: theme.background, borderBottomColor: Palette.border }]}>

            <View style={[styles.navInner, isWide && styles.navInnerWide]}>

              <View style={styles.navBrand}>

                <Image
                  source={require("../assets/images/da-logo.png")}
                  style={styles.navLogo}
                  contentFit="contain"
                />

                <ThemedText type="smallBold" style={styles.navBrandText}>
                  RVRSSB
                </ThemedText>

              </View>


              {isWide && (

                <View style={styles.navLinks}>

                  {NAV_LINKS.map((link) => (

                    <ThemedText key={link} type="smallBold" themeColor="textSecondary" style={styles.navLink}>
                      {link}
                    </ThemedText>

                  ))}

                </View>

              )}


              <View style={styles.navActions}>

                <Pressable style={styles.navLoginButton} onPress={() => router.push("/login")}>
                  <ThemedText type="smallBold" style={{ color: Palette.primary }}>
                    Login
                  </ThemedText>
                </Pressable>

                <Pressable style={styles.navCtaButton} onPress={() => router.push("/create-account")}>
                  <ThemedText type="smallBold" style={{ color: "#FFFFFF" }}>
                    Get Started
                  </ThemedText>
                </Pressable>

              </View>

            </View>

          </View>


          {/* HERO */}

          <View style={[styles.hero, { backgroundColor: Palette.primaryDark }]}>

            <Image
              source={{ uri: RICE_FIELD_IMAGE_URL }}
              style={styles.heroBackground}
              contentFit="cover"
            />

            <LinearGradient
              colors={
                isWide
                  ? ["rgba(11,77,44,0.85)", "rgba(11,77,44,0.32)"]
                  : ["rgba(11,77,44,0.8)", "rgba(11,77,44,0.6)"]
              }
              start={{ x: 0, y: 0 }}
              end={isWide ? { x: 1, y: 0 } : { x: 0, y: 1 }}
              style={styles.heroScrim}
            />

            <View style={[styles.heroInner, isWide && styles.heroInnerWide]}>

              <FadeInView style={[styles.heroText, isWide && styles.heroTextWide]}>

                <View style={styles.eyebrow}>
                  <ThemedText type="small" style={styles.eyebrowText}>
                    🌾 DA Bunawan · Agusan del Sur
                  </ThemedText>
                </View>

                <ThemedText style={[styles.heroTitle, isWide && styles.heroTitleWide, !isWide && styles.centerText]}>
                  Grow the Right Rice Variety, Every Season
                </ThemedText>

                <ThemedText style={[styles.heroSubtitle, !isWide && styles.centerText]}>
                  RVRSSB pairs your farm&apos;s soil, climate, and pest conditions with
                  the ELECTRE multi-criteria method to rank the best-fit rice
                  varieties for your field.
                </ThemedText>

                <View style={[styles.heroButtons, !isWide && styles.heroButtonsNarrow]}>

                  <Pressable style={styles.heroPrimaryButton} onPress={() => router.push("/create-account")}>
                    <ThemedText style={styles.heroPrimaryButtonText}>Get Started Free</ThemedText>
                  </Pressable>

                  <Pressable style={styles.heroSecondaryButton} onPress={() => router.push("/login")}>
                    <ThemedText style={styles.heroSecondaryButtonText}>Login</ThemedText>
                  </Pressable>

                </View>

                <View style={[styles.trustRow, !isWide && styles.centerRow]}>

                  {STATS.map((stat) => (

                    <View key={stat.label} style={styles.trustItem}>
                      <ThemedText style={styles.trustValue}>{stat.value}</ThemedText>
                      <ThemedText style={styles.trustLabel}>{stat.label}</ThemedText>
                    </View>

                  ))}

                </View>

              </FadeInView>


              <FadeInView delay={150} style={styles.heroIllustration}>
                <FarmerIllustration size={isWide ? 260 : 140} />
              </FadeInView>

            </View>

          </View>


          {/* MAIN CONTENT */}

          <View style={[styles.mainSection, { backgroundColor: theme.background }]}>

            <View style={[styles.content, isWide && styles.contentWide]}>

              {/* FEATURES */}

              <FadeInView style={styles.section}>

                <ThemedText type="subtitle" style={[styles.sectionTitle, !isWide && styles.centerText]}>
                  What You Get
                </ThemedText>

                <ThemedText themeColor="textSecondary" style={[styles.sectionSubtitle, !isWide && styles.centerText]}>
                  Everything you need to choose a rice variety with confidence.
                </ThemedText>

                <View style={[styles.grid, isWide && styles.gridWide]}>

                  {FEATURES.map((feature) => (

                    <View
                      key={feature.title}
                      style={[styles.featureCard, isWide && styles.featureCardWide, { backgroundColor: Palette.surface }]}
                    >

                      <View style={[styles.iconCircle, { backgroundColor: feature.bg }]}>
                        <ThemedText style={styles.icon}>{feature.icon}</ThemedText>
                      </View>

                      <ThemedText type="smallBold" style={styles.featureTitle}>
                        {feature.title}
                      </ThemedText>

                      <ThemedText themeColor="textSecondary" type="small">
                        {feature.desc}
                      </ThemedText>

                    </View>

                  ))}

                </View>

              </FadeInView>


              {/* HOW IT WORKS */}

              <FadeInView style={styles.section}>

                <ThemedText type="subtitle" style={[styles.sectionTitle, !isWide && styles.centerText]}>
                  How It Works
                </ThemedText>

                <ThemedText themeColor="textSecondary" style={[styles.sectionSubtitle, !isWide && styles.centerText]}>
                  Three steps from field notes to a ranked recommendation.
                </ThemedText>

                <View style={[styles.stepsRow, isWide && styles.stepsRowWide]}>

                  {STEPS.map((step, index) => (

                    <Fragment key={step.title}>

                      <View style={[styles.stepCard, isWide && styles.stepCardWide, { backgroundColor: Palette.surface }]}>

                        <View style={styles.stepNumber}>
                          <ThemedText type="smallBold" style={{ color: "#FFFFFF" }}>
                            {step.number}
                          </ThemedText>
                        </View>

                        <ThemedText style={styles.stepIcon}>{step.icon}</ThemedText>

                        <ThemedText type="smallBold" style={styles.stepTitle}>
                          {step.title}
                        </ThemedText>

                        <ThemedText themeColor="textSecondary" type="small">
                          {step.desc}
                        </ThemedText>

                      </View>

                      {isWide && index < STEPS.length - 1 && (
                        <ThemedText style={styles.stepArrow}>→</ThemedText>
                      )}

                    </Fragment>

                  ))}

                </View>

              </FadeInView>


              {/* ABOUT */}

              <FadeInView style={[styles.aboutCard, { backgroundColor: Palette.primarySoft }]}>

                <ThemedText type="smallBold" style={{ color: Palette.primaryDark }}>
                  About This System
                </ThemedText>

                <ThemedText style={styles.aboutText}>
                  RVRSSB (Rice Variety Recommendation and Support System for
                  Bunawan) is a decision-support tool built for rice farmers in
                  Bunawan, Agusan del Sur. It uses the ELECTRE I method to weigh
                  soil suitability, yield potential, pest resistance, climate
                  fit, and market demand — grounded in real PhilRice/NSIC
                  variety data — so recommendations reflect your actual field
                  conditions, not generic averages.
                </ThemedText>

              </FadeInView>

            </View>

          </View>


          {/* FINAL CTA BAND */}

          <View style={[styles.ctaBand, { backgroundColor: Palette.primaryDark }]}>

            <ThemedText type="subtitle" style={styles.ctaTitle}>
              Ready to find your best-fit variety?
            </ThemedText>

            <ThemedText style={styles.ctaSubtitle}>
              Create a free account and enter your farm data in minutes.
            </ThemedText>

            <Pressable style={styles.ctaButton} onPress={() => router.push("/create-account")}>
              <ThemedText style={styles.ctaButtonText}>Create Account</ThemedText>
            </Pressable>

          </View>


          {/* FOOTER */}

          <View style={[styles.footer, { backgroundColor: Palette.slate }]}>

            <View style={[styles.footerContent, isWide && styles.footerContentWide]}>

              <View style={styles.footerBrand}>

                <ThemedText type="smallBold" style={{ color: "#FFFFFF" }}>
                  🌾 RVRSSB
                </ThemedText>

                <ThemedText type="small" style={styles.footerText}>
                  Rice Variety Recommendation and Support System{"\n"}Bunawan, Agusan del Sur
                </ThemedText>

              </View>

              <View style={styles.footerLinks}>

                <Pressable onPress={() => router.push("/login")}>
                  <ThemedText type="small" style={styles.footerLink}>Login</ThemedText>
                </Pressable>

                <Pressable onPress={() => router.push("/create-account")}>
                  <ThemedText type="small" style={styles.footerLink}>Create Account</ThemedText>
                </Pressable>

              </View>

            </View>

            <View style={[styles.footerBottom, { borderTopColor: Palette.slateBorder }]}>

              <ThemedText type="small" style={styles.footerText}>
                © {new Date().getFullYear()} RVRSSB — a thesis capstone project by Macasampon, ASSCAT
              </ThemedText>

            </View>

          </View>

        </ScrollView>

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

  // Nav bar

  navBar: {
    borderBottomWidth: 1,
  },

  navInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  navInnerWide: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 40,
  },

  navBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  navLogo: {
    width: 30,
    height: 30,
  },

  navBrandText: {
    fontSize: 16,
    letterSpacing: 0.5,
  },

  navLinks: {
    flexDirection: "row",
    gap: 28,
  },

  navLink: {
    fontSize: 14,
  },

  navActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  navLoginButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },

  navCtaButton: {
    backgroundColor: Palette.primary,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 20,
  },

  // Hero

  hero: {
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 48,
    overflow: "hidden",
    position: "relative",
  },

  heroBackground: {
    ...StyleSheet.absoluteFillObject,
  },

  heroScrim: {
    ...StyleSheet.absoluteFillObject,
  },

  heroInner: {
    alignItems: "center",
    gap: 20,
  },

  heroInnerWide: {
    flexDirection: "row",
    justifyContent: "space-between",
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    paddingVertical: 40,
    gap: 40,
  },

  heroText: {
    alignItems: "center",
    width: "100%",
    maxWidth: 480,
  },

  heroTextWide: {
    alignItems: "flex-start",
    flex: 1,
    maxWidth: 560,
  },

  eyebrow: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 16,
  },

  eyebrowText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 38,
  },

  heroTitleWide: {
    fontSize: 44,
    lineHeight: 50,
  },

  centerText: {
    textAlign: "center",
  },

  centerRow: {
    justifyContent: "center",
  },

  heroSubtitle: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 23,
    color: "rgba(255,255,255,0.9)",
  },

  heroButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 26,
  },

  heroButtonsNarrow: {
    width: "100%",
  },

  heroPrimaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 30,
    alignItems: "center",
    flexGrow: 1,
  },

  heroPrimaryButtonText: {
    color: Palette.primaryDark,
    fontWeight: "bold",
    fontSize: 15,
  },

  heroSecondaryButton: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.7)",
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 30,
    alignItems: "center",
    flexGrow: 1,
  },

  heroSecondaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },

  trustRow: {
    flexDirection: "row",
    gap: 28,
    marginTop: 34,
    flexWrap: "wrap",
  },

  trustItem: {
    minWidth: 90,
  },

  trustValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },

  trustLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 2,
  },

  heroIllustration: {
    alignItems: "center",
    justifyContent: "center",
  },

  // Main content

  mainSection: {
    paddingVertical: 8,
  },

  content: {
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 25,
  },

  contentWide: {
    maxWidth: 1100,
    paddingHorizontal: 40,
  },

  section: {
    paddingVertical: 36,
  },

  sectionTitle: {
    fontSize: 26,
  },

  sectionSubtitle: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 15,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

  gridWide: {
    gap: 20,
  },

  featureCard: {
    flexBasis: "47%",
    flexGrow: 1,
    borderRadius: 18,
    padding: 18,
    gap: 4,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: "0px 2px 6px rgba(15,23,42,0.06)",
  },

  featureCardWide: {
    flexBasis: "22%",
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  icon: {
    fontSize: 22,
  },

  featureTitle: {
    marginTop: 2,
  },

  // How it works

  stepsRow: {
    gap: 16,
  },

  stepsRowWide: {
    flexDirection: "row",
    alignItems: "center",
  },

  stepCard: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: "0px 2px 6px rgba(15,23,42,0.06)",
    gap: 6,
  },

  stepCardWide: {
    flex: 1,
  },

  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  stepIcon: {
    fontSize: 26,
  },

  stepTitle: {
    marginTop: 2,
  },

  stepArrow: {
    alignSelf: "center",
    fontSize: 22,
    color: Palette.border,
    paddingHorizontal: 4,
  },

  // About

  aboutCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 36,
  },

  aboutText: {
    color: Palette.primaryDark,
    lineHeight: 21,
    marginTop: 8,
  },

  // CTA band

  ctaBand: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 25,
  },

  ctaTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    textAlign: "center",
  },

  ctaSubtitle: {
    color: "rgba(255,255,255,0.85)",
    marginTop: 8,
    marginBottom: 22,
    textAlign: "center",
  },

  ctaButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 30,
  },

  ctaButtonText: {
    color: Palette.primaryDark,
    fontWeight: "bold",
    fontSize: 15,
  },

  // Footer

  footer: {
    paddingTop: 32,
  },

  footerContent: {
    paddingHorizontal: 25,
    gap: 24,
  },

  footerContentWide: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 40,
  },

  footerBrand: {
    gap: 6,
  },

  footerText: {
    color: Palette.slateTextDim,
    lineHeight: 18,
  },

  footerLinks: {
    flexDirection: "row",
    gap: 20,
  },

  footerLink: {
    color: "#F1F5F9",
    fontWeight: "600",
  },

  footerBottom: {
    marginTop: 28,
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderTopWidth: 1,
    alignItems: "center",
  },

});
