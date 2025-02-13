// GraphQL
import { RIDER_EARNINGS_GRAPH } from "@/lib/apollo/queries/earnings.query";

// Hooks
import { useUserContext } from "@/lib/context/global/user.context";
import { QueryResult, useQuery } from "@apollo/client";

// Components
import SpinnerComponent from "@/lib/ui/useable-components/spinner";

// Interfacs
import { IRiderEarningsResponse } from "@/lib/utils/interfaces/rider-earnings.interface";

// Core
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

export default function EarningDetailsHeader() {
  // Hooks
  const { t } = useTranslation();

  // States
  const [riderEarningsGrandTotal, setRiderEarningsGrandTotal] = useState({
    earnings: 0,
    tips: 0,
    totalDeliveries: 0,
  });

  // Contexts
  const { userId } = useUserContext();

  // Queries
  const { loading: isRiderEarningsLoading, data: riderEarningsData } = useQuery(
    RIDER_EARNINGS_GRAPH,
    {
      variables: {
        riderId: userId ?? "",
      },
    },
  ) as QueryResult<IRiderEarningsResponse | undefined, { riderId: string }>;

  useEffect(() => {
    if (riderEarningsData?.riderEarningsGraph?.earnings?.length) {
      const totalEarnings =
        riderEarningsData?.riderEarningsGraph?.earnings?.reduce(
          (acc, curr) => acc + curr.totalEarningsSum,
          0,
        );
      const totalTips = riderEarningsData?.riderEarningsGraph?.earnings?.reduce(
        (acc, curr) => acc + curr.totalTipsSum,
        0,
      );
      const totalDeliveries =
        riderEarningsData?.riderEarningsGraph.earnings.reduce(
          (acc, curr) => acc + curr.totalDeliveries,
          0,
        );
      setRiderEarningsGrandTotal({
        earnings: totalEarnings,
        tips: totalTips,
        totalDeliveries: totalDeliveries,
      });
    }
  }, []);

  if (isRiderEarningsLoading) return <SpinnerComponent />;
  return (
    <View className="bg-gray-100 py-3 border border-gray-100">
      <Text className="left-5 text-xl font-semibold">{t("Summary")}</Text>
      <View className="flex flex-row justify-between items-center p-5">
        <View className="flex gap-2 items-center">
          <Text className="text-lg text-black">{t("Total Earnings")}</Text>
          <Text className="font-semibold text-lg text-start self-start">
            ${riderEarningsGrandTotal.earnings}
          </Text>
        </View>
        <View className="flex gap-2 items-center border-l-2 border-l-gray-200 pl-3">
          <Text className="text-lg text-black">{t("Total Tips")}</Text>
          <Text className="font-semibold text-lg text-start self-start">
            ${riderEarningsGrandTotal.tips}
          </Text>
        </View>
        <View className="flex gap-2 items-center border-l-2 border-l-gray-200 pl-3">
          <Text className="text-lg text-black">{t("Total Deliveries")}</Text>
          <Text className="font-semibold text-lg text-start self-start">
            {riderEarningsGrandTotal.totalDeliveries}
          </Text>
        </View>
      </View>
    </View>
  );
}
