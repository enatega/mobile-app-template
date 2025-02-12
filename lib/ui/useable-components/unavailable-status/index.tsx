import { useUserContext } from "@/lib/context/global/user.context";
import { usePathname } from "expo-router";
import { View, Text } from "react-native";

export default function UnavailableStatus() {
  // Hooks
  const pathName = usePathname();
  const { dataProfile } = useUserContext();

  if (pathName === "/login") return;
  if (dataProfile?.available) return;

  return (
    <View className="absolute top-0 left-0 right-0 bg-black/70 p-3 py-2 px-4 z-50">
      <Text className="text-white text-center font-bold">
        You are currently Offline
      </Text>
    </View>
  );
}
