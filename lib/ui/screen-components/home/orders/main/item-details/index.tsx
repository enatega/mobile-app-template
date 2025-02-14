import { ConfigurationContext } from "@/lib/context/global/configuration.context";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View, Text } from "react-native";

const ItemDetails = ({ orderData: order }) => {
  // Hooks
  const { t } = useTranslation();
  const configuration = useContext(ConfigurationContext);

  if (!order) return null;

  const itemAmount = useMemo(() => {
    return order?.items?.reduce((sum, item) => {
      return sum + item.quantity * item.variation.price;
    }, 0);
  }, [order._id]);

  return (
    <View className="pb-4">
      <View className="flex-1 flex-row justify-between items-center">
        <Text className="font-[Inter] text-[11px] text-base font-[500] text-gray-600">
          {t("ITEMS AND QUANTITY")}
        </Text>
        <Text className="font-[Inter] text-[11px] text-base font-[500] text-gray-600">
          {t("PRICE")}
        </Text>
      </View>

      <View className="flex-1 mt-2">
        {order?.items?.map((item) => {
          return (
            <View
              key={item._id}
              className="flex-1 flex-row  justify-between items-start gap-x-2"
            >
              <View className="h-[3.8rem] w-12 bg-gray-400 justify-center items-center">
                <Text>I</Text>
              </View>
              <View className="flex-1">
                <View>
                  <Text className="font-[Inter] text-[14px] font-semibold text-left text-gray-900">
                    {item?.title ?? "-"}
                  </Text>
                </View>
                <View>
                  <Text className="font-[Inter] text-[12px] font-semibold text-left text-gray-600">
                    {item?.description ?? "-"}
                  </Text>
                </View>
                <View>
                  <Text className="font-[Inter] text-[12px] font-semibold text-left text-gray-900">
                    x{item?.quantity ?? "0"}
                  </Text>
                </View>
              </View>

              <View>
                <Text className="font-[Inter] text-[14px] font-semibold text-left text-gray-900">
                  {configuration?.currencySymbol}
                  {item.variation?.price}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Divider */}
      <View className="flex-1 h-[1px] bg-gray-300 mb-4 mt-4" />

      {/* Order Amount */}
      <View className="flex-1 flex-row justify-between mb-4">
        <Text className="font-[Inter] text-[16px] text-base font-[500] text-gray-600">
          {t("Total")}
        </Text>
        <View className="flex-row gap-x-1">
          <Text className="font-[Inter] font-semibold text-left text-gray-900">
            {configuration?.currencySymbol}
            {itemAmount}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ItemDetails;
