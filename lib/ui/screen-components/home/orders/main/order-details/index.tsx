/* eslint-disable @typescript-eslint/no-require-imports */
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Animated,
  Dimensions,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MapView, {
  LatLng,
  MapStyleElement,
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { Easing } from "react-native-reanimated";

// Methods
import { linkToMapsApp } from "@/lib/utils/methods";

// Icons
import Icons from "@expo/vector-icons/MaterialIcons";

// Screen Components
import ItemDetails from "@/lib/ui/screen-components/home/orders/main/item-details";

// Hooks
import useDetails from "@/lib/hooks/useDetail";
import useOrderDetail from "@/lib/hooks/useOrderDetails";

// Context
import { ConfigurationContext } from "@/lib/context/global/configuration.context";

// UI Components
import { RIDER_ORDERS } from "@/lib/apollo/queries";
import { useApptheme } from "@/lib/context/global/theme.context";
import { useUserContext } from "@/lib/context/global/user.context";
import { CustomContinueButton } from "@/lib/ui/useable-components";
import { IconSymbol } from "@/lib/ui/useable-components/IconSymbol";
import AccordionItem from "@/lib/ui/useable-components/accordian";
import SpinnerComponent from "@/lib/ui/useable-components/spinner";
import WelldoneComponent from "@/lib/ui/useable-components/well-done";
import { CustomMapStyles } from "@/lib/utils/constants/map";

const { height } = Dimensions.get("window");

export default function OrderDetailScreen() {
  // Ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Context
  const configuration = useContext(ConfigurationContext);

  // Hooks
  const { appTheme, currentTheme } = useApptheme();
  const { t } = useTranslation();
  const {
    restaurantAddressPin,
    deliveryAddressPin,
    GOOGLE_MAPS_KEY,
    setDistance,
    setDuration,
    order,
    tab,
    locationPin,
  } = useOrderDetail();
  const { userId } = useUserContext();
  const { mutateAssignOrder, mutateOrderStatus, loadingOrderStatus } =
    useDetails(order);

  // States
  const [customMapStyles, setCustomMapStyles] = useState<MapStyleElement[]>();
  const [orderId, setOrderId] = useState("");
  // const [lineDashPhase, setLineDashPhase] = useState(0);
  // Ref
  const latitude = useRef(
    new Animated.Value(locationPin.location.latitude),
  ).current;
  const longitude = useRef(
    new Animated.Value(locationPin.location.longitude),
  ).current;
  const waveAnimation = useRef(new Animated.Value(0)).current; // Wave animation value

  // Handler
  const moveMarker = (newLocation: LatLng) => {
    Animated.timing(latitude, {
      toValue: newLocation.latitude,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    Animated.timing(longitude, {
      toValue: newLocation.longitude,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  };

  const openMaps = () => {
    const rider = `${locationPin.location.latitude},${locationPin.location.longitude}`;
    const store = `${restaurantAddressPin.location.latitude},${restaurantAddressPin.location.longitude}`;
    const customer = `${deliveryAddressPin.location.latitude},${deliveryAddressPin.location.longitude}`;

    if (Platform.OS === "ios") {
      // Apple Maps (Only Rider -> Store -> Customer)
      const appleMapsUrl = `maps://app?saddr=${rider}&daddr=${order?.orderStatus === "PICKED" ? customer : store}`;
      Linking.openURL(appleMapsUrl);
    } else {
      // Google Maps (Supports waypoints: Rider -> Store -> Customer)
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${rider}&destination=${customer}&waypoints=${store}`;
      Linking.openURL(googleMapsUrl);
    }
  };

  // Use Effect
  useEffect(() => {
    const styles_for_map = CustomMapStyles(appTheme);
    if (currentTheme && appTheme) {
      setCustomMapStyles(styles_for_map);
    }
  }, [appTheme, currentTheme]);
  useEffect(() => {
    const interval = setInterval(() => {
      const newLatitude = locationPin.location.latitude;
      const newLongitude = locationPin.location.longitude;
      moveMarker({ latitude: newLatitude, longitude: newLongitude });
    }, 5000);

    // Start wave animation
    const animation = Animated.loop(
      Animated.timing(waveAnimation, {
        toValue: 1000,
        duration: 10000,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
    );

    animation.start();

    // Listen to the animated value change
    // const id = waveAnimation.addListener(({ value }) => {
    //   setLineDashPhase(-Math.floor(value)); // Adjust this multiplier to control the dash speed
    // });

    return () => {
      // waveAnimation.removeListener(id); // Clean up listener
      animation.stop();
      clearInterval(interval);
    };
  }, []);

  if (!order) return;

  return (
    <>
      <GestureHandlerRootView
        className="flex-1"
        style={{ backgroundColor: appTheme.themeBackground, height: "100%" }}
      >
        <View
          style={{
            height: height * 0.5,
            backgroundColor: "transparent",
          }}
        >
          {/* <Button title="Open in Maps" onPress={openMaps} /> */}
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",

              width: 38,
              backgroundColor: appTheme.themeBackground,
              opacity: 0.75,
              position: "absolute",
              top: 60,
              right: 12,
              zIndex: 1,
            }}
          >
            <TouchableOpacity onPress={openMaps}>
              <Icons
                name="navigation"
                size={30}
                color="#1f2937"
                className={appTheme.fontMainColor}
              />
            </TouchableOpacity>
          </View>
          {locationPin ? (
            <MapView
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: appTheme.themeBackground,
              }}
              customMapStyle={customMapStyles}
              showsUserLocation
              zoomEnabled={true}
              zoomControlEnabled={true}
              rotateEnabled={false}
              initialRegion={{
                latitude: locationPin?.location?.latitude ?? 0.0,
                longitude: locationPin?.location?.longitude ?? 0.0,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
                // latitudeDelta: 0.05,
                // longitudeDelta: 0.05,
              }}
              provider={
                Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
              }
              // customMapStyle={MapStyles}
            >
              {deliveryAddressPin?.location && (
                <Marker
                  coordinate={deliveryAddressPin.location}
                  title={t("Delivery Address")}
                  onPress={() => {
                    linkToMapsApp(
                      deliveryAddressPin.location,
                      deliveryAddressPin.label,
                    );
                  }}
                >
                  <Image
                    source={require("@/lib/assets/home_icon.png")}
                    style={{ height: 35, width: 32 }}
                  />
                </Marker>
              )}
              {restaurantAddressPin?.location && (
                <Marker
                  coordinate={restaurantAddressPin.location}
                  title={t("Restaurant")}
                  onPress={() => {
                    linkToMapsApp(
                      restaurantAddressPin.location,
                      restaurantAddressPin.label,
                    );
                  }}
                >
                  <Image
                    source={require("@/lib/assets/rest_icon.png")}
                    style={{ height: 35, width: 32 }}
                  />
                </Marker>
              )}
              {/* {locationPin?.location && ( */}
              {
                <Marker.Animated
                  coordinate={{ latitude, longitude }}
                  title="Rider"
                  description={t("This is rider's location")}
                  onPress={() => {
                    linkToMapsApp(locationPin.location, locationPin.label);
                  }}
                >
                  <Image
                    source={require("@/lib/assets/rider_icon.png")}
                    style={{ height: 35, width: 32 }}
                  />
                </Marker.Animated>
              }

              {order?.orderStatus === "ACCEPTED" ||
                (order?.orderStatus === "ASSIGNED" && (
                  <MapViewDirections
                    origin={locationPin.location}
                    destination={restaurantAddressPin.location}
                    apikey={GOOGLE_MAPS_KEY ?? ""}
                    strokeWidth={2}
                    strokeColor={"#f95509"}
                    // lineDashPattern={[5, 5]} // Dashed pattern
                    // lineDashPhase={lineDashPhase} // Animated wave
                    onReady={(result) => {
                      setDistance(result?.distance);
                      setDuration(result?.duration);
                    }}
                  />
                ))}

              {order?.orderStatus === "PICKED" && (
                <MapViewDirections
                  origin={locationPin.location}
                  destination={deliveryAddressPin.location}
                  apikey={GOOGLE_MAPS_KEY ?? ""}
                  strokeWidth={2}
                  strokeColor={"#f95509"}
                  // lineDashPattern={[5, 5]} // Dashed pattern
                  // lineDashPhase={lineDashPhase} // Animated wave
                  onReady={(result) => {
                    setDistance(result.distance);
                    setDuration(result.duration);
                  }}
                />
              )}

              {order?.orderStatus !== "ACCEPTED" &&
                order?.orderStatus !== "PICKED" &&
                order?.orderStatus !== "ASSIGNED" && (
                  <MapViewDirections
                    origin={restaurantAddressPin.location}
                    destination={deliveryAddressPin.location}
                    apikey={GOOGLE_MAPS_KEY ?? ""}
                    strokeWidth={2}
                    strokeColor={"#f95509"}
                    // lineDashPattern={[5, 5]} // Dashed pattern
                    // lineDashPhase={lineDashPhase} // Animated wave
                    onReady={(result) => {
                      setDistance(result?.distance);
                      setDuration(result?.duration);
                    }}
                  />
                )}

              {/* <Button title="Open in Maps" onPress={openMaps} /> */}
            </MapView>
          ) : (
            <View className="flex-1 justify-center items-center gap-y-3">
              <Text className="text-3xl">{t("Map not loaded.")}</Text>
              <Text
                className="text-lg "
                style={{ color: appTheme.fontSecondColor }}
              >
                {t("Please check for permissions.")}
              </Text>
            </View>
          )}
        </View>

        <BottomSheet
          ref={bottomSheetRef}
          index={0} // Initially, the sheet starts at 50% height (snap point 0)
          snapPoints={["50%"]} // Snap points: 50%
          backgroundStyle={styles.backgroundStyle} // Optional, to style the background
          animateOnMount={true} // Ensure that the initial animation is applied
          handleIndicatorStyle={{
            backgroundColor: "transparent",
          }}
          enableDynamicSizing
          enableOverDrag={false}
          maxDynamicContentSize={height * 0.8} // Set a maximum dynamic content size (optional)
        >
          <BottomSheetView
            className="flex-1  border p-1.5 rounded-lg"
            style={{
              backgroundColor: appTheme.themeBackground,
              borderColor: appTheme.borderLineColor,
            }}
          >
            <BottomSheetScrollView
              className="p-2"
              showsVerticalScrollIndicator={false}
              style={{ backgroundColor: appTheme.themeBackground }}
            >
              {/* Order ID */}
              <View className="flex-row justify-between mb-4">
                <Text
                  className="font-bold "
                  style={{ color: appTheme.fontSecondColor }}
                >
                  {t("Order ID")}
                </Text>
                <Text style={{ color: appTheme.fontMainColor }}>
                  #{order?.orderId ?? "-"}
                </Text>
              </View>

              <View className="flex-1 flex-row justify-start items-center gap-x-4 mb-4">
                <Image
                  src={order?.restaurant?.image}
                  style={{ width: 32, height: 30, borderRadius: 8 }}
                />

                <Text
                  className="font-[Inter] text-lg font-bold leading-7 text-left underline-offset-auto decoration-skip-ink "
                  style={{ color: appTheme.fontMainColor }}
                >
                  {order?.restaurant?.name}
                </Text>
              </View>

              {/* Pick Up Order */}
              <View className="w-[90%] flex-row items-center gap-x-2 mb-4">
                <View>
                  <IconSymbol
                    name="apartment"
                    size={30}
                    weight="medium"
                    color={appTheme.fontMainColor}
                  />
                </View>
                <View>
                  <Text
                    className="font-[Inter] text-base font-semibold leading-6 text-left underline-offset-auto decoration-skip-ink "
                    style={{ color: appTheme.fontSecondColor }}
                  >
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

              {/* Payment Method */}
              <View className="flex-1 flex-row justify-between items-center mb-4">
                <Text
                  className="font-[Inter] text-[16px] text-base font-[500]"
                  style={{ color: appTheme.fontSecondColor }}
                >
                  {t("Payment Method")}
                </Text>
                <Text
                  className="font-[Inter] text-base font-semibold  text-left underline-offset-auto decoration-skip-ink   mr-2"
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
                  {order?.orderAmount}
                  {order.paymentStatus === "PAID"
                    ? t("Paid")
                    : t("(Not paid yet)")}
                </Text>
              </View>

              {/* Divider */}
              <View className="flex-1 h-[1px] mb-4" />

              <AccordionItem title={t("Order Details")}>
                <ItemDetails orderData={order} tab={tab} />
              </AccordionItem>

              {/* Pick up Button */}
              {tab === "processing" && order.orderStatus === "ASSIGNED" && (
                <TouchableOpacity
                  className="h-14 rounded-3xl py-3 w-full mt-4 mb-10"
                  style={{ backgroundColor: appTheme.primary }}
                  disabled={loadingOrderStatus}
                  onPress={() =>
                    mutateOrderStatus({
                      variables: { id: order?._id, status: "PICKED" },
                    })
                  }
                >
                  {loadingOrderStatus ? (
                    <SpinnerComponent />
                  ) : (
                    <Text
                      className="text-center  text-lg font-medium"
                      style={{ color: appTheme.black }}
                    >
                      {t("Pick up")}
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              {tab == "processing" && order.orderStatus === "PICKED" && (
                <TouchableOpacity
                  className="h-14 rounded-3xl py-3 w-full mt-4 mb-10"
                  style={{ backgroundColor: appTheme.primary }}
                  disabled={loadingOrderStatus}
                  onPress={async () => {
                    await mutateOrderStatus({
                      variables: { id: order?._id, status: "DELIVERED" },
                      onCompleted: () => {
                        setOrderId(order?.orderId);
                      },
                    });
                    setOrderId(order?.orderId);
                  }}
                >
                  {loadingOrderStatus ? (
                    <SpinnerComponent color="white" />
                  ) : (
                    <Text
                      className="text-center text-lg font-medium"
                      style={{ color: appTheme.black }}
                    >
                      {t("Mark as Delivered")}
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              {tab === "new_orders" && order.orderStatus === "ACCEPTED" && (
                <CustomContinueButton
                  title={t("Assign me")}
                  className="w-[55%] mx-auto"
                  onPress={() =>
                    mutateAssignOrder({
                      variables: { id: order?._id },
                      refetchQueries: [
                        { query: RIDER_ORDERS, variables: { userId: userId } },
                      ],
                    })
                  }
                />
              )}
            </BottomSheetScrollView>
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
      {
        <WelldoneComponent
          orderId={orderId}
          setOrderId={setOrderId}
          status={order?.orderStatus === "DELIVERED" ? "Delivered" : ""}
        />
      }
    </>
  );
}

const styles = StyleSheet.create({
  map: {
    height: "100%",
    width: "100%",
  },
  backgroundStyle: {
    //zIndex: 0,
    backgroundColor: "transparent", // Change to your desired background color
  },
});
