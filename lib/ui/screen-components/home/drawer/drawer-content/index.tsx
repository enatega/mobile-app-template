// Core
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { useContext } from "react";
import { Text, View, TouchableOpacity } from "react-native";

// Context
import { AuthContext } from "@/lib/context/global/auth.context";

// Constants
import { Colors } from "@/lib/utils/constants";

import CustomDrawerHeader from "@/lib/ui/screen-components/home/drawer/drawer-header";

// UI-Componetns
import { LogoutIcon, RightArrowIcon } from "@/lib/ui/useable-components/svg";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native-gesture-handler";

export default function CustomDrawerContent(
  props: DrawerContentComponentProps,
) {
  // Hooks
  const { t } = useTranslation();
  const { logout } = useContext(AuthContext);

  return (
    <DrawerContentScrollView
      {...props}
      // scrollEnabled={false}

      contentContainerStyle={{
        backgroundColor: "white",
        paddingBottom: 30,
        paddingStart: 0,
        paddingEnd: 0,
      }}
    >
      <CustomDrawerHeader />

      {/* Drawer Items with Right Arrow */}
      <ScrollView
        style={{
          backgroundColor: Colors.light.white,
          height: "auto",
          paddingBottom: 20,
        }}
        scrollEnabled={true}
      >
        {props.state.routes.map((route, index) => {
          const isFocused = props.state.index === index;
          const { options } = props.descriptors[route.key];

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => props.navigation.navigate(route.name)}
              className="flex-row justify-between items-center px-4 py-3 border-b-[0.5px]"
              style={{
                backgroundColor: isFocused
                  ? Colors.light.lowOpacityPrimaryColor
                  : "",
                borderColor: Colors.light.borderLineColor,
              }}
            >
              {/* Left Icon and Label */}
              <View className="flex-row items-center gap-3">
                <View
                  className="h-[40px] w-[40px] rounded-full items-center justify-center"
                  style={{
                    backgroundColor: Colors.light.sidebarIconBackground,
                  }}
                >
                  {options.drawerIcon
                    ? options.drawerIcon({
                        color: Colors.light.black,
                        size: 16,
                        focused: true,
                      })
                    : null}
                </View>
                <Text className="text-sm font-semibold">
                  {(options.drawerLabel as string) ?? route.name}
                </Text>
              </View>

              {/* Right Arrow Icon */}
              <RightArrowIcon
                color={Colors.light.black}
                height={20}
                width={20}
              />
            </TouchableOpacity>
          );
        })}

        {/* Logout Button */}
        <TouchableOpacity
          onPress={logout}
          className="flex-row justify-between items-center px-4 py-2 border-b-[0.5px]"
          style={{ borderColor: Colors.light.borderLineColor }}
        >
          <View className="flex-row items-center gap-3">
            <View
              className="h-[30px] w-[40px] rounded-full items-center justify-center"
              style={{ backgroundColor: Colors.light.sidebarIconBackground }}
            >
              <LogoutIcon width={16} height={16} color={Colors.light.black} />
            </View>
            <Text className="text-sm font-semibold">{t("Logout")}</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </DrawerContentScrollView>
  );
}
