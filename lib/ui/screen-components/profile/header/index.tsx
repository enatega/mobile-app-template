// Hooks
import { useUserContext } from "@/lib/context/global/user.context";

// Constants
import { Colors } from "@/lib/utils/constants";
import { useTranslation } from "react-i18next";

// Core
import { Text, View } from "react-native";

export default function ProfileHeader() {
  // Hooks
  const { t } = useTranslation();
  const { dataProfile } = useUserContext();
  return (
    <View className="justify-between flex-row h-[130px] w-[55%] items-center p-4">
      <View
        className="w-[54px] h-[54px] rounded-full items-center justify-center overflow-hidden"
        style={{ backgroundColor: Colors.light.white }}
      >
        <Text
          className="text-[16px] font-semibold"
          style={{
            color: Colors.light.primary,
          }}
        >
          {dataProfile?.name
            ?.split(" ")[0]
            ?.substring(0, 1)
            ?.toUpperCase()
            ?.concat(
              "",
              dataProfile?.name?.split(" ")[1]?.substring(0, 1)?.toUpperCase(),
            ) ?? "JS"}
        </Text>
      </View>
      <View>
        <Text
          className="font-semibold text-[16px]"
          style={{
            color: Colors.light.black,
          }}
        >
          {dataProfile?.name ?? t("rider name")}
        </Text>
        <Text
          className="font-medium"
          style={{
            color: Colors.light.secondaryTextColor,
          }}
        >
          {dataProfile?._id.substring(0, 9).toUpperCase() ?? "rider id"}
        </Text>
      </View>
    </View>
  );
}
