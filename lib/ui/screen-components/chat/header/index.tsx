// Core
import { View, Text, TouchableOpacity } from "react-native";

// Components
import { CallIcon, CircleCrossIcon } from "@/lib/ui/useable-components/svg";

// Methods
import { callNumber } from "@/lib/utils/methods";

// Hooks
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export default function ChatHeader() {
  // Hooks
  const { t } = useTranslation();
  const route = useRoute();
  const router = useRouter();
  const { orderId, phoneNumber } = route.params;

  return (
    <View className="mt-2 p-2">
      <View className="flex-row justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <CircleCrossIcon />
        </TouchableOpacity>
        <Text>{t("Contact Customer")}</Text>
        <TouchableOpacity onPress={() => callNumber(phoneNumber ?? "")}>
          <CallIcon />
        </TouchableOpacity>
      </View>
      <View className="h-[1px] w-full bg-gray-300 mt-4"></View>
      <View className="flex-row gap-x-2 items-center mt-4 mb-4">
        <Text className="font-[Inter] font-[12px] text-gray-900">
          {t("Order number")}
        </Text>
        <View className="bg-gray-200 w-fit p-2 pl-6 pr-6 border border-gray-200 rounded-2xl">
          <Text>{orderId ?? "-"}</Text>
        </View>
      </View>
      <View className="h-[1px] w-full bg-gray-300 mb-4"></View>
    </View>
  );
}
