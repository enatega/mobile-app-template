import { View, Linking, Alert, Text, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { useLocationContext } from "@/lib/context/global/location.context";
import { ILocationPermissionComponentProps } from "@/lib/utils/interfaces";
import SpinnerComponent from "../spinner";
import { useTranslation } from "react-i18next";

export default function LocationPermissionComponent({
  children,
}: ILocationPermissionComponentProps) {
  // Hooks
  const { t } = useTranslation();
  const { setLocationPermission } = useLocationContext();

  // States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const getLocationPermission = async () => {
    setLoading(true);
    const { status } = await Location.getForegroundPermissionsAsync();
    setLoading(false);
    if (status === "granted") {
      setLocationPermission(true);
      setIsModalVisible(false);
    } else {
      setIsModalVisible(true);
    }
  };

  const LocationAlert = async () => {
    Alert.alert(
      "Location access",
      "Location permissions are required to use this app. Kindly open settings to allow location access.",
      [
        {
          text: "Open settings",
          onPress: async () => {
            await Linking.openSettings();
          },
        },
      ],
    );
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === "granted") {
      setLocationPermission(true);
      setIsModalVisible(false);
    }
  };

  const askLocationPermission = async () => {
    setLoading(true);
    const { status, canAskAgain } =
      await Location.getForegroundPermissionsAsync();
    setLoading(false);
    if (status === "granted") {
      setLocationPermission(true);
      setIsModalVisible(false);
    }
    if (canAskAgain) {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLoading(false);
      if (status === "granted") {
        setLocationPermission(true);
        setIsModalVisible(false);
      } else {
        LocationAlert();
      }
    } else {
      LocationAlert();
    }
  };

  useEffect(() => {
    getLocationPermission();
  }, []);

  return (
    <View className="flex-1">
      {children}

      <Modal
        isVisible={isModalVisible}
        coverScreen={false}
        backdropOpacity={0.5}
      >
        <View className="h-fit w-full bg-transparent justify-around items-center">
          <View className="h-fit w-[95%] p-4 items-center justify-around bg-white border-white rounded-[16px]">
            <View className="gap-y-2">
              <Text className="font-[Inter] text-gray-900 font-semibold text-[20px] leading-[28px] tracking-[0px] text-center">
                {t("Enable Location For Better Experience")}
              </Text>
              <Text className="font-[Inter] text-gray-700 font-[400] text-[14px] leading-[28px] tracking-[0px] text-center">
                {t(
                  "We need your location to find nearby restaurants, ensure accurate delivery, and provide the best service possible",
                )}
              </Text>
            </View>

            <TouchableOpacity
              className="h-10 bg-[#90E36D] rounded-3xl py-2 mt-4 w-[90%]"
              onPress={() => {
                askLocationPermission();
              }}
            >
              {isLoading ? (
                <SpinnerComponent />
              ) : (
                <Text className="text-center text-white text-[14px] font-medium">
                  Allow
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
