// Moti
import { MotiView, Text } from "moti";

// Hooks
import { useTranslation } from "react-i18next";

export default function EarningHeadingSkeleton() {
  // Hooks
  const { t } = useTranslation();
  return (
    <MotiView className="p-3 bg-white flex flex-row w-full justify-between px-5">
      <Text className="font-bold text-lg bg-white pb-5 mt-0">
        {t("Recent Activity")}
      </Text>
      <Text className="text-sm text-[#3B82F6] font-bold">{t("See More")}</Text>
    </MotiView>
  );
}
