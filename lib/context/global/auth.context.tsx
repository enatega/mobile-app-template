// Core
import { createContext } from "react";

// Expo
import * as Location from "expo-location";

// React Native Navigation
import AsyncStorage from "@react-native-async-storage/async-storage";

// Interfaces
import { IAuthContext, IAuthProviderProps } from "@/lib/utils/interfaces";

// Constants
import { RIDER_TOKEN } from "@/lib/utils/constants";

// Components
import { FlashMessageComponent } from "@/lib/ui/useable-components";

// Hooks
import { FC, useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export const AuthProvider: FC<IAuthProviderProps> = ({ client, children }) => {
  // Hooks
  const { t } = useTranslation();
  const router = useRouter();

  // State
  const [token, setToken] = useState<string>("");
  const setTokenAsync = async (token: string) => {
    await AsyncStorage.setItem(RIDER_TOKEN, token);
    client.clearStore();
    setToken(token);
  };

  const logout = async () => {
    try {
      client.clearStore();
      await AsyncStorage.removeItem(RIDER_TOKEN);
      await AsyncStorage.removeItem("rider-id");

      if (await Location.hasStartedLocationUpdatesAsync("RIDER_LOCATION")) {
        await Location.stopLocationUpdatesAsync("RIDER_LOCATION");
        client.clearStore();
        await AsyncStorage.removeItem(RIDER_TOKEN);
      }
      setToken("");
      router.replace("/login");
    } catch (e) {
      FlashMessageComponent({
        message: t(`Logout failed`),
      });
      console.log("Logout Error: ", e);
    }
  };

  const values: IAuthContext = {
    token: token ?? "",
    logout,
    setTokenAsync,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};
