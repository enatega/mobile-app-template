// Expo
import { Stack } from "expo-router";

// Hooks
import { useTranslation } from "react-i18next";

export default function ProfileLayout() {
  // Hooks
  const { t } = useTranslation();
  return (
    <Stack screenOptions={{ headerShown: false, headerShadowVisible: false }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitleAlign: "center",
          headerTitle: t("Profile"),
        }}
      />
    </Stack>
  );
}
