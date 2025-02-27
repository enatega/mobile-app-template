// Core
import { View, Text } from "react-native";
import Modal from "react-native-modal";

// Interface
import { IWellDoneComponentProps } from "@/lib/utils/interfaces";

// Hooks
import { useTranslation } from "react-i18next";

export default function WelldoneComponent({
  orderId = "",
  status = "Delivered",
  setOrderId,
}: IWellDoneComponentProps) {
  // Hooks
  const { t } = useTranslation();
  return (
    <Modal
      isVisible={!!orderId}
      onBackdropPress={() => setOrderId("")}
      onBackButtonPress={() => setOrderId("")}
      coverScreen={false}
    >
      <View className="h-fit w-full bg-transparent justify-around items-center">
        <View className="h-[120px] w-[95%] items-center justify-around bg-white border-white rounded-[16px]">
          <View>
            <Text>{t("Icon Here")}</Text>
          </View>
          <View className="items-center">
            <Text className="font-inter text-lg font-bold text-centertext-gray-900">
              {t("Well Done Rider")}
            </Text>
            <Text className="font-inter text-sm font-normal leading-[22px] text-center">
              {t("Order Number")} #{orderId} {status}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
