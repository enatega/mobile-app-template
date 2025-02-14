// Moti
import { MotiText, MotiView } from "moti";
import { Skeleton } from "moti/skeleton";

// Hooks
import { useTranslation } from "react-i18next";

export default function EarningSummaryHeader() {
  // Hooks
  const { t } = useTranslation();
  return (
    <MotiView className="flex flex-col gap-3 p-3 w-full bg-gray-200">
      <MotiView>
        <MotiText className="font-bold text-lg pb-5 mt-0">
          {t("Summary")}
        </MotiText>
      </MotiView>
      <MotiView className="flex flex-row justify-between w-[95%]">
        <MotiView className="flex flex-col gap-2 items-center">
          <MotiText className="text-lg text-black">
            {t("Total Earnings")}
          </MotiText>
          <Skeleton colorMode="light" width={100} height={70} />
        </MotiView>
        <MotiView className="flex flex-col gap-2 items-center">
          <MotiText className="text-lg text-black">{t("Total Tips")}</MotiText>
          <Skeleton colorMode="light" width={100} height={70} />
        </MotiView>
        <MotiView className="flex flex-col gap-2 items-center">
          <MotiText className="text-lg text-black">
            {t("Total Deliveries")}
          </MotiText>
          <Skeleton colorMode="light" width={100} height={70} />
        </MotiView>
      </MotiView>
    </MotiView>
  );
}
