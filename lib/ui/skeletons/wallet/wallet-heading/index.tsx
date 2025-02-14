// Moti
import { MotiView, Text } from "moti";

// Hooks
import { useTranslation } from "react-i18next";

export default function WalletHeadingSkeleton() {
  // Hooks
  const { t } = useTranslation();
  return (
    <MotiView className="p-3 bg-white">
      <Text className="font-bold text-lg bg-white pb-5 mt-0">
        {t("Recent Transactions")}
      </Text>
    </MotiView>
  );
}
