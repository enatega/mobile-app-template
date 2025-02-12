// Core
import { SafeAreaView } from "react-native";
import { useEffect, useState } from "react";

// Components
import ProfileHeader from "../../screen-components/profile/header";
import ProfileMain from "../../screen-components/profile/view/main";

// Types & Interfaces
import { TRiderProfileBottomBarBit } from "@/lib/utils/types/rider";
import DrivingLicenseForm from "../../screen-components/profile/forms/liecense";
import VehiclePlateForm from "../../screen-components/profile/forms/vehicle";
import ReactNativeModal from "react-native-modal";
import { Keyboard } from "react-native";

export default function ComponentName() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isFormOpened, setIsFormOpened] =
    useState<TRiderProfileBottomBarBit>(null);

  // UseEffects
  useEffect(() => {
    const isOpened = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const isClosed = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });
    return () => {
      isOpened.remove();
      isClosed.remove();
    };
  }, [Keyboard, isKeyboardVisible]);
  console.log(isKeyboardVisible);
  return (
    <SafeAreaView>
      <ProfileHeader />
      <ProfileMain
        isFormOpened={isFormOpened}
        setIsFormOpened={setIsFormOpened}
      />
      {isFormOpened !== null && (
        <ReactNativeModal
          isVisible={isFormOpened !== null}
          animationIn={"slideInUp"}
          animationOut={"slideOutDown"}
          onBackdropPress={() => {
            setIsFormOpened(null);
          }}
          style={{
            maxHeight:
              isKeyboardVisible && isFormOpened === "LICENSE_FORM"
                ? "100%"
                : !isKeyboardVisible && isFormOpened === "LICENSE_FORM"
                  ? "65%"
                  : isKeyboardVisible && isFormOpened === "VEHICLE_FORM"
                    ? "100%"
                    : !isKeyboardVisible && isFormOpened === "VEHICLE_FORM"
                      ? "45%"
                      : "65%",
            width: "100%",
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: 2,
            alignItems: "center",
            justifyContent: "space-between",

            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            marginLeft: 0,
            marginTop:
              isFormOpened === "LICENSE_FORM" && !isKeyboardVisible
                ? "65%"
                : isFormOpened === "LICENSE_FORM" && isKeyboardVisible
                  ? "10%"
                  : isFormOpened === "VEHICLE_FORM" && !isKeyboardVisible
                    ? "100%"
                    : isFormOpened === "VEHICLE_FORM" && isKeyboardVisible
                      ? "10%"
                      : "auto",
            shadowOpacity: 0.25,
            shadowRadius: 4,
          }}
        >
          {isFormOpened === "LICENSE_FORM" && (
            <DrivingLicenseForm setIsFormOpened={setIsFormOpened} />
          )}
          {isFormOpened === "VEHICLE_FORM" && (
            <VehiclePlateForm setIsFormOpened={setIsFormOpened} />
          )}
          {isFormOpened === null && <></>}
        </ReactNativeModal>
      )}
    </SafeAreaView>
  );
}
