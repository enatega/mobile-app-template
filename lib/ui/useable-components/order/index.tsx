import { useRouter } from "expo-router";
import { useContext } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

// Components
import { IconSymbol } from "@/lib/ui/useable-components/IconSymbol";
import SpinnerComponent from "@/lib/ui/useable-components/spinner";
// Interface
import { IOrderComponentProps } from "@/lib/utils/interfaces/order.interface";

// Contexrtg
import { ConfigurationContext } from "@/lib/context/global/configuration.context";
// Hook
import useOrder from "@/lib/hooks/useOrder";

// Cion
import { BikeRidingIcon, ChatIcon, ClockIcon } from "../svg";

// Hooks
import { useApptheme } from "@/lib/context/global/theme.context";
import { calculateDistance } from "@/lib/utils/methods/custom-functions";
import { useTranslation } from "react-i18next";

const Order = ({ order, tab }: IOrderComponentProps) => {
  // Hook
  const { time, mutateAssignOrder, loadingAssignOrder } = useOrder(order);

  // // Context
  const configuration = useContext(ConfigurationContext);

  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View className="h-fit">
      {order?.orderStatus === "ACCEPTED" || order?.orderStatus === "PICKED" ? (
        <View />
      ) : null}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          router.push({
            pathname: "/order-detail",
            params: { itemId: order?._id, order: JSON.stringify(order), tab },
          });
        }}
      >
        <View
          className="flex-1 gap-y-4  border border-gray-100 border-1 rounded-[8px] m-4 p-2"
          style={{ backgroundColor: appTheme.themeBackground }}
        >
          {/* Status */}
          <View className="flex-1 flex-row justify-between items-center">
            <Text
              className="font-[Inter] text-base font-bold  text-left decoration-skip-ink-0 "
              style={{ color: appTheme.fontSecondColor }}
            >
              {t("Status")}
            </Text>
            <View
              className={`ps-3 pe-3 bg-green-100 border border-1 rounded-[12px] ${
                tab === "delivered"
                  ? "border-blue-500 bg-blue-100"
                  : tab === "processing"
                    ? "border-yellow-500 bg-yellow-100"
                    : "border-green-500 bg-green-100"
              }`}
            >
              <Text
                className={`font-[Inter] text-[12px] font-semibold text-center decoration-skip-ink-0 ${
                  tab === "delivered"
                    ? "text-blue-800"
                    : tab === "processing"
                      ? "text-yellow-800"
                      : "text-green-800"
                }`}
              >
                {order?.orderStatus}
              </Text>
            </View>
          </View>

          {/* Order ID */}
          <View className="flex-1 flex-row justify-between items-center">
            <Text
              className="font-[Inter] text-base font-bold  text-left decoration-skip-ink-0 "
              style={{ color: appTheme.fontSecondColor }}
            >
              {t("Order ID")}
            </Text>
            <Text
              className="font-[Inter] text-[16px] text-base font-semibold  text-right underline-offset-auto decoration-skip-ink "
              style={{ color: appTheme.fontMainColor }}
            >
              #{order?.orderId}
            </Text>
          </View>

          {/* Store Image and Name */}
          <View className="w-[90%] flex-row justify-start items-center gap-x-4">
            {/* <View className="h-8 w-8 bg-gray-400 justify-center items-center"> */}
            {/* <View className="w-[60px] h-[70px] bg-gray-200 rounded-[8px]"> */}
            <Image
              src={order?.restaurant?.image}
              style={{ width: 32, height: 30, borderRadius: 8 }}
            />
            {/* </View> */}
            {/* </View> */}
            <Text
              className="font-[Inter] text-lg font-bold leading-7 text-left underline-offset-auto decoration-skip-ink "
              style={{ color: appTheme.fontMainColor }}
            >
              {order?.restaurant?.name}
            </Text>
          </View>

          {/* Pick Up Order */}
          <View className="w-[90%] flex-row items-center gap-x-2">
            <View>
              <IconSymbol
                name="apartment"
                size={30}
                weight="medium"
                color="#111827"
              />
            </View>
            <View>
              <Text className="font-[Inter] text-base font-semibold leading-6 text-left underline-offset-auto decoration-skip-ink text-gray-500">
                {t("Pickup Order")}
              </Text>
              <Text
                className="font-[Inter] text-base font-bold leading-6 text-left underline-offset-auto decoration-skip-ink "
                style={{ color: appTheme.fontMainColor }}
              >
                {order?.restaurant?.address ?? "-"}
              </Text>
            </View>
          </View>

          {/* Delivery Order */}
          <View className="w-[90%] flex-row items-center gap-x-2">
            <View>
              <IconSymbol
                name="home"
                size={30}
                weight="medium"
                color="#111827"
              />
            </View>
            <View>
              <Text className="font-[Inter] text-base font-semibold leading-6 text-left underline-offset-auto decoration-skip-ink text-gray-500">
                {t("Delivery Order")}
              </Text>
              <Text
                className="font-[Inter] text-base font-bold leading-6 text-left underline-offset-auto decoration-skip-ink "
                style={{ color: appTheme.fontMainColor }}
              >
                {order?.deliveryAddress?.deliveryAddress ?? "-"}
              </Text>
            </View>
          </View>

          {/* Price/Time/Distance */}
          <View className="w-[99%] flex-row justify-between items-center">
            {/* <View className="flex-row gap-x-1">
              <IconSymbol size={20} name="currency-exchange" color="#6b7280" />
              <Text className="font-[Inter] text-base font-medium leading-6 text-left underline-offset-auto decoration-skip-ink text-gray-500">
                0.71
              </Text>
            </View> */}

            <View className="flex-1 flex-row justify-start  items-center gap-x-1">
              <ClockIcon color="#6b7280" />
              <Text className="font-[Inter] text-base font-medium  text-left underline-offset-auto decoration-skip-ink text-gray-500">
                {time}
              </Text>
            </View>

            <View className="flex-1 flex-row justify-end items-center gap-x-1">
              <BikeRidingIcon color="#6b7280" />
              <Text className="font-[Inter] text-base font-medium text-gray-500">
                {calculateDistance(
                  Number(order?.restaurant?.location?.coordinates[0]),
                  Number(order?.restaurant?.location?.coordinates[1]),
                  order?.deliveryAddress?.location?.coordinates[0],
                  order?.deliveryAddress?.location?.coordinates[1],
                )
                  .toFixed(2)
                  .toLocaleString()}
                km
              </Text>
            </View>
          </View>

          {/* Payment Method */}
          <View className="w-[99%] flex-row justify-between items-center">
            <Text
              className="flex-1 font-[Inter] text-[16px] text-base font-[500] "
              style={{ color: appTheme.fontSecondColor }}
            >
              {t("Payment Method")}
            </Text>
            <Text
              className="flex-1 font-[Inter] text-base font-semibold text-right underline-offset-auto decoration-skip-ink "
              style={{ color: appTheme.fontMainColor }}
            >
              {order?.paymentMethod}
            </Text>
          </View>

          {/* Order Amount */}
          <View className="w-[99%] flex-row justify-between">
            <Text
              className="flex-1 font-[Inter] text-[16px] text-base font-[500] "
              style={{ color: appTheme.fontSecondColor }}
            >
              {t("Order Amount")}
            </Text>

            <Text
              className="flex-1 font-[Inter] font-semibold text-right "
              style={{ color: appTheme.fontMainColor }}
            >
              {configuration?.currencySymbol}
              {order?.orderAmount}{" "}
              {order.paymentStatus === "PAID" ? t("Paid") : t("(Not paid yet)")}
            </Text>
          </View>

          {["ASSIGNED", "PICKED"].includes(order.orderStatus) && (
            <View className="flex-row items-center gap-x-2">
              <TouchableOpacity
                onPress={() => {
                  router.push({
                    pathname: "/chat",
                    params: {
                      phoneNumber: order?.user.phone,
                      orderId: order?.orderId,
                      id: order?._id,
                    },
                  });
                }}
              >
                <View className="border border-[#E2E8F0] rounded-full p-3">
                  <ChatIcon
                    width={30}
                    height={30}
                    color={appTheme.fontMainColor}
                  />
                </View>
              </TouchableOpacity>
              {/* Order Comment */}
              <View className="flex-1">
                <Text
                  className="font-[Inter] text-[16px] text-base font-[500] "
                  style={{ color: appTheme.fontSecondColor }}
                >
                  {t("Order Comment")}
                </Text>
                <Text
                  className="font-[Inter] text-[16px] italic font-medium "
                  style={{ color: appTheme.fontMainColor }}
                >
                  {t("No Comment")}
                </Text>
              </View>
            </View>
          )}

          {tab === "new_orders" && (
            <TouchableOpacity
              className="h-12 bg-green-500 rounded-3xl py-3 mt-10 w-full"
              onPress={() =>
                mutateAssignOrder({
                  variables: { id: order?._id },
                })
              }
            >
              {loadingAssignOrder ? (
                <SpinnerComponent />
              ) : (
                <Text className="text-center text-white text-lg font-medium">
                  {t("Assign me")}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default Order;
