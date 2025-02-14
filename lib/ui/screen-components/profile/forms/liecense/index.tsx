// Core
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import FormHeader from "../form-header";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

// React Native Calendars
import { Calendar, DateData } from "react-native-calendars";

// Flash Message
import { showMessage } from "react-native-flash-message";

// Icons
import { UploadIcon } from "@/lib/assets/svg";
import { Ionicons } from "@expo/vector-icons";

// Components
import { CustomContinueButton } from "@/lib/ui/useable-components";

// Expo
import * as ImagePicker from "expo-image-picker";
import { Link } from "expo-router";

// Skeleton
import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";

// Hooks
import { useMutation } from "@apollo/client";
import { useUserContext } from "@/lib/context/global/user.context";

// GraphQL
import { UPDATE_LICENSE } from "@/lib/apollo/mutations/rider.mutation";
import { RIDER_PROFILE } from "@/lib/apollo/queries";

// Interfaces
import { TRiderProfileBottomBarBit } from "@/lib/utils/types/rider";
import { ICloudinaryResponse } from "@/lib/utils/interfaces/cloudinary.interface";
import { useTranslation } from "react-i18next";

export default function DrivingLicenseForm({
  setIsFormOpened,
}: {
  setIsFormOpened: Dispatch<SetStateAction<TRiderProfileBottomBarBit>>;
}) {
  // Hooks
  const { t } = useTranslation();
  const { userId, dataProfile } = useUserContext();

  // States
  const [isLoading, setIsLoading] = useState({
    isUploading: false,
    isCalendarVisible: false,
    isSubmitting: false,
  });
  const [cloudinaryResponse, setCloudinaryResponse] =
    useState<ICloudinaryResponse | null>(null);
  const [formData, setFormData] = useState({
    expiryDate: "",
    image: "",
    number: "",
  });
  // Mutations
  const [mutateLicense] = useMutation(UPDATE_LICENSE, {
    onError: (error) => {
      showMessage({
        message: t("Failed to update license"),
        type: "danger",
      });
      console.error("Failed to update license", error);
    },
    onCompleted: () => {
      setIsLoading({
        isCalendarVisible: false,
        isSubmitting: false,
        isUploading: false,
      });
    },
    refetchQueries: [{ query: RIDER_PROFILE, variables: { id: userId } }],
  });

  const pickImage = async () => {
    try {
      setIsLoading((prev) => ({
        ...prev,
        isUploading: true,
      }));
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const formData = new FormData();
        formData.append("file", {
          uri: result.assets[0].uri,
          name: `license_${Date.now()}.jpg`, // Unique name
          type: "image/jpeg",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        formData.append("upload_preset", "rider_data");
        formData.append("cloud_name", "do1ia4vzf");
        await fetch("https://api.cloudinary.com/v1_1/do1ia4vzf/image/upload", {
          method: "POST",
          body: formData,
        })
          .then((resp) =>
            resp
              .json()
              .then((data: ICloudinaryResponse) => {
                setCloudinaryResponse(data);
                setFormData((prev) => ({ ...prev, image: data.secure_url }));
              })
              .catch((err) => {
                console.error(err);
                setIsLoading((prev) => ({
                  ...prev,
                  isUploading: false,
                }));
              }),
          )
          .catch((err) => console.error({ err }));
        setIsLoading((prev) => ({
          ...prev,
          isUploading: false,
        }));
      }
    } catch (error) {
      console.error(error);
      return showMessage({
        message: t("Failed to upload image"),
        type: "danger",
      });
    } finally {
      setIsLoading((prev) => ({
        ...prev,
        isUploading: false,
      }));
    }
  };

  // Handlers
  const handleInputChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading((prev) => ({
        ...prev,
        isSubmitting: true,
      }));
      if (!formData.expiryDate) {
        return showMessage({
          message: t("Please select an expiry date"),
          type: "danger",
        });
      } else if (!formData.number) {
        return showMessage({
          message: t("Please enter a license number"),
          type: "danger",
        });
      } else if (!formData.image) {
        return showMessage({
          message: t("Please upload an image"),
          type: "danger",
        });
      }
      await mutateLicense({
        variables: {
          updateRiderLicenseDetailsId: userId,
          licenseDetails: formData,
        },
      });
      setIsFormOpened(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading((prev) => ({
        ...prev,
        isSubmitting: false,
      }));
    }
  };

  useEffect(() => {
    setFormData({
      expiryDate: new Date(
        dataProfile?.licenseDetails?.expiryDate ?? "",
      ).toDateString(),
      image: dataProfile?.licenseDetails?.image ?? "",
      number: String(dataProfile?.licenseDetails?.number ?? ""),
    });
  }, []);
  return (
    <View className="w-full items-center justify-center">
      {isLoading.isCalendarVisible && (
        <View
          style={{
            top: 0,
            position: "absolute",
            width: "95%",
            gap: 10,
            backgroundColor: "transparent",
            padding: 8,
            marginLeft: 10,
            borderRadius: 12,
          }}
        >
          <Calendar
            initialDate={formData.expiryDate}
            style={{ width: "100%", height: "80%" }}
            onDayPress={(day: DateData) =>
              handleInputChange("expiryDate", day.dateString)
            }
            markedDates={{
              [formData.expiryDate]: { selected: true, marked: true },
            }}
          />
          <CustomContinueButton
            title={t("Done")}
            onPress={() =>
              setIsLoading((prev) => ({
                ...prev,
                isCalendarVisible: false,
              }))
            }
          />
        </View>
      )}
      {!isLoading.isCalendarVisible && (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            className={`flex flex-col justify-between w-full p-3 h-[95%] my-auto mt-0 -z-1`}
          >
            <FormHeader title="Driving License" />
            <View>
              <View className="flex flex-col w-full mb-2">
                <Text>{t("License No")}</Text>
                <TextInput
                  value={formData.number}
                  onChangeText={(licenseNo) =>
                    handleInputChange("number", licenseNo)
                  }
                  className="w-full rounded-md border border-gray-300 p-3 my-2"
                />
              </View>
              <View className="flex flex-col w-full my-2">
                <Text>{t("License Expiry Date")}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsLoading((prev) => ({
                      ...prev,
                      isCalendarVisible: true,
                    }));
                    Keyboard.dismiss();
                  }}
                  className="w-full rounded-md border border-gray-300 p-3 my-2"
                >
                  <Text className="text-gray-400">
                    {formData.expiryDate ?? new Date().toDateString()}
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="flex flex-col w-full my-2">
                <Text>{t("Add License Document")}</Text>
                {!cloudinaryResponse?.secure_url || !formData.image ? (
                  <TouchableOpacity
                    className="w-full rounded-md border border-dashed border-gray-300 p-3 h-28 items-center justify-center"
                    onPress={pickImage}
                  >
                    {isLoading.isUploading ? (
                      <MotiView>
                        <Skeleton width={90} height={20} colorMode="light" />
                      </MotiView>
                    ) : (
                      <UploadIcon />
                    )}
                  </TouchableOpacity>
                ) : (
                  <View className="flex flex-row justify-between border border-gray-300 rounded-md p-4 my-2">
                    <View className="flex flex-row gap-2">
                      <Ionicons name="image" size={20} color="#3F51B5" />
                      <Text className="text-[#3F51B5] border-b-2 border-b-[#3F51B5]">
                        {cloudinaryResponse?.original_filename ??
                          !formData.image}
                        .{cloudinaryResponse?.format ?? "image"}
                      </Text>
                    </View>
                    <View className="flex flex-row">
                      <Text>{(cloudinaryResponse.bytes ?? 0) / 1000}KB</Text>
                      <Link
                        download={
                          cloudinaryResponse.secure_url ?? formData.image
                        }
                        href={cloudinaryResponse.secure_url ?? !formData.image}
                        className="text-[#9CA3AF] text-xs"
                      >
                        <Ionicons size={18} name="download" color="#6B7280" />
                      </Link>
                    </View>
                  </View>
                )}
              </View>
              <View>
                <CustomContinueButton
                  title={isLoading.isSubmitting ? t("Please wait") : t("Add")}
                  onPress={handleSubmit}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
}
