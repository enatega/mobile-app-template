/* eslint-disable @typescript-eslint/no-require-imports */
import { ApolloProvider } from "@apollo/client";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
// import * as Sentry from "sentry-expo";
import * as Sentry from "@sentry/react-native";

import FlashMessage from "react-native-flash-message";

// Service
import setupApollo from "@/lib/apollo";

// Context
import { AuthProvider } from "@/lib/context/global/auth.context";
import { ConfigurationProvider } from "@/lib/context/global/configuration.context";
import { LocationProvider } from "@/lib/context/global/location.context";
import { SoundProvider } from "@/lib/context/global/sound.context";
import { UserProvider } from "@/lib/context/global/user.context";
// Service
import { initSentry } from "@/lib/utils/service";
// Locale
import "@/i18next";

// Style
import InternetProvider from "@/lib/context/global/internet-provider";
import AppThemeProvidor, {
  useApptheme,
} from "@/lib/context/global/theme.context";
import { LocationPermissionComp } from "@/lib/ui/useable-components";
import AnimatedSplashScreen from "@/lib/ui/useable-components/splash/AnimatedSplashScreen";
import UnavailableStatus from "@/lib/ui/useable-components/unavailable-status";
import { requestMediaLibraryPermissionsAsync } from "expo-image-picker";
import { useEffect } from "react";
import "../global.css";

initSentry();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen?.preventAutoHideAsync();

function RootLayout() {
  // Hooks
  const { currentTheme } = useApptheme();
  const [loaded] = useFonts({
    SpaceMono: require("../lib/assets/fonts/SpaceMono-Regular.ttf"),
    Inter: require("../lib/assets/fonts/Inter.ttf"),
  });
  const client = setupApollo();

  // Permissions
  async function grantCameraAndGalleryPermissions() {
    await requestMediaLibraryPermissionsAsync();
  }
  // Use Effect
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error("Global Error Caught:", { error, isFatal });
  });
  useEffect(() => {
    grantCameraAndGalleryPermissions();
  }, []);

  if (!loaded) {
    return null;
  }

  console.log(currentTheme);
  return (
    <AppThemeProvidor>
      <AnimatedSplashScreen>
        <InternetProvider>
          <ApolloProvider client={client}>
            <ConfigurationProvider>
              <AuthProvider client={client}>
                <LocationProvider>
                  <UserProvider>
                    <SoundProvider>
                      <LocationPermissionComp>
                        <UnavailableStatus />
                        <Stack
                          screenOptions={{
                            headerShown: false,
                          }}
                          initialRouteName="(tabs)"
                        >
                          <Stack.Screen
                            name="login"
                            options={{ headerShown: false }}
                          />
                          <Stack.Screen
                            name="(tabs)"
                            options={{ headerShown: false }}
                          />
                          <Stack.Screen name="+not-found" />
                          <Stack.Screen
                            name="order-detail"
                            options={{ headerShown: false }}
                          />
                          <Stack.Screen
                            name="chat"
                            options={{ headerShown: false }}
                          />
                        </Stack>
                      </LocationPermissionComp>
                      <StatusBar style="inverted" />
                      <FlashMessage position="bottom" />
                    </SoundProvider>
                  </UserProvider>
                </LocationProvider>
              </AuthProvider>
            </ConfigurationProvider>
          </ApolloProvider>
        </InternetProvider>
      </AnimatedSplashScreen>
    </AppThemeProvidor>
  );
}

export default Sentry.wrap(RootLayout);
