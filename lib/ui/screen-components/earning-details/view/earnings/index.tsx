// Core
import { ScrollView, Text } from "react-native";

// Interfaces
import { IRiderEarningsDetailProps } from "@/lib/utils/interfaces/earning.interface";
import { IRiderEarnings } from "@/lib/utils/interfaces/rider-earnings.interface";

// Components
import { useApptheme } from "@/lib/context/global/theme.context";
import NoRecordFound from "@/lib/ui/useable-components/no-record-found";
import EarningStack from "../../../earnings/view/earnings-stack";

export default function EarningsDetailStacks({
  riderEarningsData,
  isRiderEarningsLoading,
  setModalVisible,
}: IRiderEarningsDetailProps) {
  // Hooks
  const { appTheme } = useApptheme();
  return (
    <ScrollView
      className="h-full border-t-2"
      style={{
        backgroundColor: appTheme.screenBackground,
        borderTopColor: appTheme.borderLineColor,
      }}
    >
      <Text>
        {riderEarningsData?.riderEarningsGraph?.earnings?.length === 0 &&
          !isRiderEarningsLoading && <NoRecordFound />}
      </Text>
      {riderEarningsData?.riderEarningsGraph?.earnings?.length &&
        riderEarningsData?.riderEarningsGraph?.earnings?.map(
          (earning: IRiderEarnings, index) => (
            <EarningStack
              totalDeliveries={earning.totalDeliveries}
              date={earning.date}
              earning={earning.totalEarningsSum}
              _id={earning._id}
              tip={earning.totalTipsSum}
              earningsArray={earning.earningsArray}
              key={index}
              setModalVisible={setModalVisible}
            />
          ),
        )}
    </ScrollView>
  );
}
