/* eslint-disable @typescript-eslint/no-require-imports */
import { EDIT_RIDER } from "@/lib/apollo/mutations/rider.mutation";
import { RIDER_PROFILE } from "@/lib/apollo/queries";
import { useUserContext } from "@/lib/context/global/user.context";
import { FlashMessageComponent } from "@/lib/ui/useable-components";
import SpinnerComponent from "@/lib/ui/useable-components/spinner";
import {
  BikeRidingIcon,
  CarIcon,
  MotorBikeIcon,
  TruckIcon,
} from "@/lib/ui/useable-components/svg";
import { VEHICLE_TYPE } from "@/lib/utils/constants";
import { IVehicleTypeItem } from "@/lib/utils/interfaces";
import { useMutation } from "@apollo/client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  FlatList,
} from "react-native";

const vehicleMap: Record<string, JSX.Element> = {
  bicycle: <BikeRidingIcon />,
  motorbike: <MotorBikeIcon />,
  car: <CarIcon />,
  pickup_truck: <TruckIcon />,
};

export default function VehicleTypeMainScreen() {
  // Context
  const { dataProfile } = useUserContext();

  // Hooks
  const { t } = useTranslation();

  // State
  const [selectedCode, setSelectedCode] = useState<string>(
    VEHICLE_TYPE.find((vt) => vt.code === dataProfile?.vehicleType)?.code || "",
  );

  // API Hook
  const [mutate, { loading: mutationLoading }] = useMutation(EDIT_RIDER, {
    refetchQueries: [
      { query: RIDER_PROFILE, variables: { id: dataProfile?._id } },
    ],
  });

  // Hook
  const { width } = useWindowDimensions();

  // Components
  const renderItem = ({ item }: { item: IVehicleTypeItem }) => {
    const isSelected = item.code === selectedCode;
    return (
      <TouchableOpacity
        className={`flex-row items-center p-4  border-b my-1  bg-white ${isSelected ? "border-green-500" : "border-gray-300"}`}
        style={{ width: width * 0.95 }}
        onPress={() => setSelectedCode(item.code)}
      >
        <View className="mr-2">{vehicleMap[item.code as string]}</View>
        <Text className="flex-1 font-inter font-semibold leading-5 tracking-normal">
          {item.label}
        </Text>
        <View
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-green-500" : "border-gray-400"}`}
        >
          {isSelected && (
            <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Form Submission
  const onHandlerSubmit = () => {
    mutate({
      variables: {
        riderInput: {
          _id: dataProfile?._id,
          name: dataProfile?.name, //
          username: dataProfile?.username,
          password: dataProfile?.password,
          phone: dataProfile?.phone?.toString(),
          zone: dataProfile?.zone._id,
          vehicleType: selectedCode,
          available: dataProfile?.available,
        },
      },
      onCompleted: () => {
        FlashMessageComponent({
          message: t("Vehicle Type has been updated successfully"),
        });
      },
      onError: (error) => {
        FlashMessageComponent({
          message:
            error.graphQLErrors[0]?.message ?? t("Please try again later"),
        });
      },
    });
  };

  return (
    <View className="flex-1 items-center mt-5">
      <View className="h-[80%]">
        <FlatList
          data={VEHICLE_TYPE}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          extraData={selectedCode}
        />
      </View>

      <View className="h-[20%]">
        <TouchableOpacity
          className="h-12 bg-green-500 rounded-3xl py-3 mt-10"
          style={{ width: width * 0.9 }}
          onPress={() => onHandlerSubmit()}
        >
          {mutationLoading ? (
            <SpinnerComponent />
          ) : (
            <Text className="text-center text-white text-lg font-medium">
              {t("Update")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
