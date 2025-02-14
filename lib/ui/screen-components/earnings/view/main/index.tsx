// Core
import { TouchableOpacity, View } from "react-native";
import { Text } from "react-native";

// Contexts
import { useUserContext } from "@/lib/context/global/user.context";

// Interfaces
import {
  IRiderEarnings,
  IRiderEarningsResponse,
} from "@/lib/utils/interfaces/rider-earnings.interface";

// Charts
import { barDataItem } from "react-native-gifted-charts";

// GraphQL
import { RIDER_EARNINGS_GRAPH } from "@/lib/apollo/queries/earnings.query";

// Hooks
import { QueryResult, useQuery } from "@apollo/client";

// Expo
import { router } from "expo-router";

// Skeletons
import { EarningScreenMainLoading } from "@/lib/ui/skeletons";

// Components
import EarningStack from "../earnings-stack";
import EarningsBarChart from "../../bar-chart";
import { useTranslation } from "react-i18next";

export default function EarningsMain() {
  // Hooks
  const { t } = useTranslation();

  // Contexts
  const { userId, setModalVisible } = useUserContext();

  // Queries
  const { loading: isRiderEarningsLoading, data: riderEarningsData } = useQuery(
    RIDER_EARNINGS_GRAPH,
    {
      variables: {
        riderId: userId ?? "",
      },
    },
  ) as QueryResult<IRiderEarningsResponse | undefined, { riderId: string }>;

  const barData: barDataItem[] =
    riderEarningsData?.riderEarningsGraph.earnings
      .slice(0, 7)
      .map((earning: IRiderEarnings) => ({
        value: earning.totalEarningsSum,
        label: earning._id,
        topLabelComponent: () => {
          return (
            <Text
              style={{
                color: "#000",
                fontSize: 14,
                fontWeight: "600",
                marginBottom: 1,
              }}
            >
              ${earning.totalEarningsSum}
            </Text>
          );
        },
      })) ?? ([] as barDataItem[]);

  // If loading
  if (isRiderEarningsLoading) return <EarningScreenMainLoading />;

  return (
    <View className="bg-white">
      <EarningsBarChart
        data={barData}
        width={900}
        height={280}
        frontColor="#8fe36e"
      />
      <View className="flex flex-row justify-between w-full px-4 py-4">
        <Text className="text-xl text-black font-bold">
          {t("Recent Activity")}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setModalVisible({
              bool: false,
              _id: "",
              date: "",
              earningsArray: [],
              totalEarningsSum: 0,
              totalTipsSum: 0,
              totalDeliveries: 0,
            });
            router.push("/(tabs)/earnings/(routes)/earnings-detail");
          }}
        >
          <Text className="text-sm text-[#3B82F6] font-bold">
            {t("See More")}
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        {riderEarningsData?.riderEarningsGraph?.earnings?.length === 0 &&
          !isRiderEarningsLoading && (
            <Text className="block mx-auto font-bold text-center w-full my-12">
              {t("No record found")}
            </Text>
          )}
        {riderEarningsData?.riderEarningsGraph?.earnings?.length &&
          riderEarningsData?.riderEarningsGraph?.earnings
            ?.slice(0, 4)
            ?.map((earning: IRiderEarnings, index) => (
              <EarningStack
                date={earning.date}
                earning={earning.totalEarningsSum}
                totalDeliveries={earning.earningsArray.length}
                _id={earning._id}
                tip={earning.totalTipsSum}
                earningsArray={earning.earningsArray}
                key={index}
                setModalVisible={setModalVisible}
              />
            ))}
      </View>
    </View>
  );
}
