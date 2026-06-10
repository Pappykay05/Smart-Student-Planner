import { DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AppProvider, useApp } from "@/context/AppContext";

function RootLayoutContent() {
  const segments = useSegments();
  const router = useRouter();
  const { user, onboarded, loading } = useApp();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "login";
    const inOnboardingGroup = segments[0] === "onboarding";

    if (!onboarded) {
      if (!inOnboardingGroup) {
        router.replace("/onboarding");
      }
    } else if (!user) {
      if (!inAuthGroup) {
        router.replace("/login");
      }
    } else {
      // User is onboarded and logged in
      if (inAuthGroup || inOnboardingGroup) {
        router.replace("/");
      }
    }
  }, [user, onboarded, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen
          name="task/[id]"
          options={{ headerShown: false, presentation: "card" }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ThemeProvider value={DefaultTheme}>
          <RootLayoutContent />
        </ThemeProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});
