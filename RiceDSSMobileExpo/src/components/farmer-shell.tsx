import React, { ReactNode } from "react";

import {
  View,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  StyleProp,
  ViewStyle,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useRouter, useLocalSearchParams, usePathname, Href } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { Palette } from "@/constants/theme";
import { clearToken } from "@/storage/auth";


export const FARMER_NAV_ITEMS = [

  { href: "/farmer-dashboard" as Href, icon: "🏠", label: "Dashboard", shortLabel: "Dashboard", color: Palette.primarySoft },
  { href: "/profile" as Href, icon: "🧑‍🌾", label: "My Profile & Farm", shortLabel: "Profile", color: Palette.skySoft },
  { href: "/farm-data" as Href, icon: "🌱", label: "Enter Farm Data", shortLabel: "Farm Data", color: Palette.soilSoft },
  { href: "/recommendation" as Href, icon: "🌾", label: "Rice Recommendation", shortLabel: "Recommend", color: Palette.grainSoft },
  { href: "/history" as Href, icon: "📊", label: "Recommendation History", shortLabel: "History", color: Palette.primarySoft },

];


const WIDE_BREAKPOINT = 820;


type Props = {
  children: ReactNode | ((isWide: boolean) => ReactNode);
  contentStyle?: StyleProp<ViewStyle>;
};


export function FarmerShell({ children, contentStyle }: Props) {

  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  const { username } = useLocalSearchParams<{ username?: string }>();

  const isWide = width >= WIDE_BREAKPOINT;

  const content = typeof children === "function" ? children(isWide) : children;

  const goTo = (href: Href) => router.push({ pathname: href as any, params: { username } });

  const logout = () => {
    clearToken();
    router.replace("/");
  };


  if (isWide) {

    return (

      <View style={styles.flex}>

        <SafeAreaView style={styles.flex} edges={["top", "bottom"]}>

          <View style={styles.wideRow}>

            <View style={[styles.sidebar, { backgroundColor: Palette.slate, borderRightColor: Palette.slateBorder }]}>

              <View style={styles.brandRow}>

                <View style={styles.brandDot} />

                <ThemedText type="small" style={styles.brandText}>
                  RVRSSB
                </ThemedText>

              </View>


              <View style={[styles.sidebarProfile, { borderBottomColor: Palette.slateBorder }]}>

                <View style={[styles.avatar, { backgroundColor: "rgba(22,163,74,0.18)", borderColor: Palette.slateActiveBar }]}>
                  <ThemedText style={styles.avatarIcon}>👨‍🌾</ThemedText>
                </View>

                <ThemedText type="smallBold" numberOfLines={1} style={styles.slateTextLight}>
                  {username || "Farmer"}
                </ThemedText>

                <ThemedText type="small" style={styles.slateTextDim}>
                  Farmer
                </ThemedText>

              </View>


              <View style={styles.navList}>

                {FARMER_NAV_ITEMS.map((item) => {

                  const active = pathname === item.href;

                  return (

                    <Pressable
                      key={String(item.href)}
                      style={({ pressed }) => [
                        styles.navItem,
                        active && styles.navItemActive,
                        pressed && styles.pressed,
                      ]}
                      onPress={() => goTo(item.href)}
                    >

                      {active && <View style={styles.activeBar} />}

                      <View style={[styles.navIconCircle, { backgroundColor: item.color }]}>
                        <ThemedText style={styles.navIconText}>{item.icon}</ThemedText>
                      </View>

                      <ThemedText
                        type="smallBold"
                        style={active ? styles.slateTextLight : styles.slateTextDim}
                      >
                        {item.label}
                      </ThemedText>

                    </Pressable>

                  );

                })}

              </View>


              <Pressable
                style={({ pressed }) => [styles.sidebarLogout, pressed && styles.pressed]}
                onPress={logout}
              >

                <View style={[styles.navIconCircle, { backgroundColor: Palette.dangerSoft }]}>
                  <ThemedText style={styles.navIconText}>🚪</ThemedText>
                </View>

                <ThemedText type="smallBold" style={{ color: "#F87171" }}>
                  Logout
                </ThemedText>

              </Pressable>

            </View>


            <ScrollView style={[styles.flex, { backgroundColor: Palette.canvas }]} contentContainerStyle={[styles.mainContent, contentStyle]}>

              {content}

            </ScrollView>

          </View>

        </SafeAreaView>

      </View>

    );

  }


  return (

    <View style={[styles.flex, { backgroundColor: Palette.canvas }]}>

      <SafeAreaView style={styles.flex} edges={["top", "bottom"]}>

        <ScrollView style={styles.flex} contentContainerStyle={[styles.mobileContent, contentStyle]} showsVerticalScrollIndicator={false}>

          {content}

        </ScrollView>


        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.tabBar, { backgroundColor: Palette.slate, borderTopColor: Palette.slateBorder }]}
          contentContainerStyle={styles.tabBarContent}
        >

          {FARMER_NAV_ITEMS.map((item) => {

            const active = pathname === item.href;

            return (

              <Pressable key={String(item.href)} style={styles.tabItem} onPress={() => goTo(item.href)}>

                <ThemedText style={[styles.tabIcon, { opacity: active ? 1 : 0.55 }]}>
                  {item.icon}
                </ThemedText>

                <ThemedText
                  type="small"
                  style={active ? { color: Palette.slateActiveBar, fontWeight: "700" } : styles.slateTextDim}
                >
                  {item.shortLabel}
                </ThemedText>

              </Pressable>

            );

          })}

          <Pressable style={styles.tabItem} onPress={logout}>

            <ThemedText style={[styles.tabIcon, { opacity: 0.55 }]}>🚪</ThemedText>

            <ThemedText type="small" style={styles.slateTextDim}>
              Logout
            </ThemedText>

          </Pressable>

        </ScrollView>

      </SafeAreaView>

    </View>

  );

}


const styles = StyleSheet.create({

  flex: {
    flex: 1,
  },

  pressed: {
    opacity: 0.65,
  },

  slateTextLight: {
    color: "#F1F5F9",
  },

  slateTextDim: {
    color: Palette.slateTextDim,
  },

  // Wide (desktop) layout

  wideRow: {
    flex: 1,
    flexDirection: "row",
  },

  sidebar: {
    width: 260,
    borderRightWidth: 1,
    padding: 20,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },

  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.primary,
  },

  brandText: {
    color: Palette.slateTextDim,
    letterSpacing: 1.5,
    fontWeight: "700",
    fontSize: 12,
  },

  sidebarProfile: {
    alignItems: "center",
    gap: 4,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1.5,
  },

  avatarIcon: {
    fontSize: 28,
  },

  navList: {
    flex: 1,
    gap: 4,
  },

  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  navItemActive: {
    backgroundColor: Palette.slateActiveTint,
  },

  activeBar: {
    position: "absolute",
    left: -20,
    top: 6,
    bottom: 6,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: Palette.slateActiveBar,
  },

  navIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconText: {
    fontSize: 15,
  },

  sidebarLogout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginTop: 12,
  },

  mainContent: {
    padding: 40,
    maxWidth: 760,
    width: "100%",
  },

  // Narrow (mobile) layout

  mobileContent: {
    flexGrow: 1,
  },

  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 10,
    flexGrow: 0,
  },

  tabBarContent: {
    paddingHorizontal: 8,
  },

  tabItem: {
    width: 76,
    alignItems: "center",
    gap: 3,
  },

  tabIcon: {
    fontSize: 20,
  },

});
