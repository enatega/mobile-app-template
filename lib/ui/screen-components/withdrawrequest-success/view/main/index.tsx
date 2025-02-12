// Components
import SuccessModal from "../success-modal";

// Core
import { View } from "react-native";

// Hooks
import { useTranslation } from "react-i18next";

export default function WithdrawRquestSuccessMain() {
  // Hooks
  const { t } = useTranslation();
  return (
    <View className="items-center justify-center h-full">
      <SuccessModal
        message={t("Your request for withdrawal has been submitted")}
      />
    </View>
  );
}
