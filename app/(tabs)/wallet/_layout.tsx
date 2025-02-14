// Expo
import { Stack } from "expo-router";

// Hooks
import { useTranslation } from "react-i18next";

export default function StackLayout() {
  // Hooks
  const { t } = useTranslation();
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: t("Wallet"),
          headerTitleAlign: "center",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen name="(routes)/success" options={{ headerShown: false }} />
    </Stack>
  );
}
