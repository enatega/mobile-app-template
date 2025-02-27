// Core
import { Text } from "react-native";

// Interfaces
import { IRiderEarningsDetailProps } from "@/lib/utils/interfaces/earning.interface";
import { IRiderEarnings } from "@/lib/utils/interfaces/rider-earnings.interface";

// Components
import { useApptheme } from "@/lib/context/global/theme.context";
import NoRecordFound from "@/lib/ui/useable-components/no-record-found";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList } from "react-native-gesture-handler";
import EarningStack from "../../../earnings/view/earnings-stack";

export default function EarningsDetailStacks({
  riderEarningsData,
  isRiderEarningsLoading,
  setModalVisible,
}: IRiderEarningsDetailProps) {
  // States
  const [recentTransaction, setRecentTransaction] =
    useState<IRiderEarnings[]>();

  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();

  // UseEffects
  useEffect(() => {
    if (riderEarningsData?.riderEarningsGraph?.earnings?.length) {
      const sortedTransactions = [
        ...riderEarningsData.riderEarningsGraph.earnings,
      ].sort(
        (a, b) =>
          new Date(String(b?.date)).setHours(0, 0, 0, 0) -
          new Date(String(a?.date)).setHours(23, 59, 59, 999),
      );
      setRecentTransaction(sortedTransactions);
    }
  }, [riderEarningsData?.riderEarningsGraph?.earnings?.length]);

  // If Loading
  if (isRiderEarningsLoading) return <NoRecordFound />;

  return (
    <FlatList
      data={recentTransaction}
      contentContainerClassName="scroll-smooth"
      keyExtractor={(_, index) => index.toString()}
      style={{ height: "55%" }}
      ListEmptyComponent={
        <Text
          className="block mx-auto font-bold text-center w-full my-12 "
          style={{ color: appTheme.fontSecondColor }}
        >
          {t("No record found")}
        </Text>
      }
      renderItem={(info) => {
        return (
          <EarningStack
            date={info?.item?.date}
            earning={info?.item?.totalEarningsSum}
            totalDeliveries={info?.item?.earningsArray.length}
            _id={info?.item?._id}
            tip={info?.item?.totalTipsSum}
            earningsArray={info?.item?.earningsArray}
            key={info.index}
            setModalVisible={setModalVisible}
          />
        );
      }}
    />
  );
}
