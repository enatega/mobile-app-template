// Interfaces
import { IEarningStackProps } from "@/lib/utils/interfaces/earning.interface";
// SVG
import { RightChevron } from "@/lib/ui/useable-components/svg";
// Core
import { Text, TouchableOpacity, View } from "react-native";

export default function EarningStack({
  date,
  earning,
  setModalVisible,
  _id,
  earningsArray,
  tip,
  totalDeliveries,
}: IEarningStackProps) {
  // Handlers
  function handleForwardPress() {
    setModalVisible({
      bool: true,
      _id: _id,
      date: date,
      earningsArray: earningsArray,
      totalTipsSum: tip,
      totalEarningsSum: earning,
      totalDeliveries: totalDeliveries,
    });
  }
  return (
    <View className="flex flex-row justify-between items-center p-4 w-[95%] mx-auto my-3 border-b-gray-300 border-b-2">
      <View className="flex flex-row gap-2 items-center flex-2">
        <Text>{date}</Text>
        <Text className="font-bold">Total Earning</Text>
      </View>
      <TouchableOpacity
        className="flex flex-row gap-2 items-center flex-2"
        onPress={handleForwardPress}
      >
        <Text className="font-bold">${earning}</Text>
        <RightChevron />
      </TouchableOpacity>
    </View>
  );
}
