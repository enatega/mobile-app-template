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
    const isOpened = Keyboard.addListener("keyboardWillShow", () => {
      setIsKeyboardVisible(true);
    });
    const isClosed = Keyboard.addListener("keyboardWillHide", () => {
      setIsKeyboardVisible(false);
    });
    return () => {
      isOpened.remove();
      isClosed.remove();
    };
  }, []);
  return (
    <SafeAreaView className="bg-white">
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
            maxHeight: isFormOpened === "LICENSE_FORM" ? 420 : 350,
            width: "100%",
            height: "100%",
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: 2,
            alignItems: "center",
            justifyContent: "flex-start",

            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            marginLeft: 0,
            marginTop:
              isFormOpened === "LICENSE_FORM"
                ? !isKeyboardVisible
                  ? 405
                  : 80
                : !isKeyboardVisible
                  ? 470
                  : 140,
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
