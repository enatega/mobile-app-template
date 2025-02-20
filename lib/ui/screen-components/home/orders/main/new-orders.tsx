/* eslint-disable @typescript-eslint/no-require-imports */
import { useEffect, useState, useContext } from "react";
import { View, Text, Dimensions, Platform, StyleSheet } from "react-native";
import { NetworkStatus } from "@apollo/client";
import { FlatList } from "react-native-gesture-handler";

// Context
import UserContext from "@/lib/context/global/user.context";
// UI
import Order from "@/lib/ui/useable-components/order";
import Spinner from "@/lib/ui/useable-components/spinner";
// Constants
import { NO_ORDER_PROMPT } from "@/lib/utils/constants";
// Interface
import { IOrderTabsComponentProps } from "@/lib/utils/interfaces";
import { IOrder } from "@/lib/utils/interfaces/order.interface";
// Type
import { ORDER_TYPE } from "@/lib/utils/types";
// Icon
import { WalletIcon } from "@/lib/ui/useable-components/svg";
import { useTranslation } from "react-i18next";

const { height } = Dimensions.get("window");

export default function HomeNewOrdersMain(props: IOrderTabsComponentProps) {
  // Props
  const { route } = props;

  // Hooks
  const { t } = useTranslation();
  const {
    loadingAssigned,
    errorAssigned,
    assignedOrders,
    refetchAssigned,
    networkStatusAssigned,
  } = useContext(UserContext);

  // States
  const [orders, setOrders] = useState<IOrder[]>([]);

  // Handlers
  const onInitOrders = () => {
    if (loadingAssigned || errorAssigned) return;
    if (!assignedOrders) return;

    const _orders = assignedOrders?.filter(
      (o: IOrder) => o.orderStatus === "ACCEPTED" && !o.rider && !o.isPickedUp,
    );

    setOrders(_orders ?? []);
  };

  // Use Effect
  useEffect(() => {
    onInitOrders();
  }, [assignedOrders, route.key]);

  useEffect(() => {
    // Trigger refetch when orders length changes
    if (orders?.length === 0) {
      refetchAssigned();
    }
  }, [orders?.length]);

  // Calculate the marginBottom dynamically
  const marginBottom = Platform.OS === "ios" ? height * 0.4 : height * 0.35;

  // Render
  return (
    <View className="pt-14 flex-1 bg-white pb-16" style={style.contaienr}>
      {loadingAssigned ? (
        <View className="flex-1">
          <Spinner />
        </View>
      ) : errorAssigned ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-2xl">{t("Something went wrong")}</Text>
        </View>
      ) : orders?.length > 0 ? (
        <FlatList
          className={`h-[${height}px] mb-[${marginBottom}px]`}
          keyExtractor={(item) => item._id}
          data={orders}
          showsVerticalScrollIndicator={false}
          refreshing={networkStatusAssigned === NetworkStatus.loading}
          onRefresh={refetchAssigned}
          renderItem={({ item }: { item: IOrder }) => (
            <Order tab={route.key as ORDER_TYPE} order={item} key={item._id} />
          )}
          ListEmptyComponent={() => {
            return (
              <View
                style={{
                  minHeight:
                    height > 670
                      ? height - height * 0.5
                      : height - height * 0.6,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <WalletIcon height={100} width={100} />
                {orders?.length === 0 ? (
                  <Text className="font-[Inter] text-[18px] text-base font-[500] text-gray-600">
                    {t(NO_ORDER_PROMPT[route.key])}
                  </Text>
                ) : (
                  <Text>{t("Pull down to refresh")}</Text>
                )}
              </View>
            );
          }}
        />
      ) : (
        <View
          style={{
            minHeight:
              height > 670 ? height - height * 0.5 : height - height * 0.6,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <WalletIcon height={100} width={100} />

          {orders?.length === 0 ? (
            <Text className="font-[Inter] text-[18px] text-base font-[500] text-gray-600">
              {t(NO_ORDER_PROMPT[route.key])}
            </Text>
          ) : (
            <Text>{t("Pull down to refresh")}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const style = StyleSheet.create({
  contaienr: {
    paddingBottom: Platform.OS === "android" ? 50 : 80,
  },
});
