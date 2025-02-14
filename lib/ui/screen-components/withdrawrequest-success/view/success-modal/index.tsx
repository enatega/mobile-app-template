// Core
import { Image, View } from "react-native";
import { Text } from "react-native";

// Icons
import { Ionicons } from "@expo/vector-icons";

// Assets
import { IMAGES } from "@/lib/assets/images";

// Expo
import { router } from "expo-router";

// Interfaces
import { IWalletSuccessModalProps } from "@/lib/utils/interfaces/withdraw.interface";

// Hooks
import { useTranslation } from "react-i18next";
const SuccessModal = ({ message }: IWalletSuccessModalProps) => {
  // Hooks
  const { t } = useTranslation();
  return (
    <View
      style={{
        shadowRadius: 480,
        shadowOpacity: 1,
        shadowColor: "black",
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        maxHeight: 400,
        marginTop: 0,
        borderRadius: 10,
        width: 350,
        padding: 12,
        boxShadow: "25px 25px 35px gray",
      }}
    >
      <View className="absolute right-3 top-3">
        <Ionicons
          name="close-circle-outline"
          size={20}
          onPress={() => {
            router.back();
          }}
        />
      </View>

      <Image
        source={IMAGES.successWithdrawRequest}
        style={{ width: 200, height: 200 }}
        resizeMode="contain"
      />
      <View className="flex flex-col gap-3 items-center justify-center self-center mx-auto w-[80%]">
        <Text className="text-lg font-bold text-center">{message}</Text>
        <Text>{t("Usually it takes 1-2 business days")}</Text>
      </View>
    </View>
  );
};

export default SuccessModal;
