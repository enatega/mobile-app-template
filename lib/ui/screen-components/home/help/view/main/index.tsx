import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import HelpAccordian from "../../accordian";
import { FAQs } from "@/lib/utils/constants";
import { useFocusEffect } from "expo-router";
import * as Linking from "expo-linking";

export default function HelpMain() {
  // Hooks
  const { t } = useTranslation();

  const openWhatsAppChat = async () => {
    const phoneNumber = "+1(307)776%E2%80%918999";

    if (Platform.OS === "android") {
      const androidUrl = `whatsapp://send?phone=${phoneNumber}`;
      Linking.openURL(androidUrl);
    } else if (Platform.OS === "ios") {
      const iosUrl = `https://wa.me/${phoneNumber.replace("+", "")}`;
      try {
        const supported = await Linking.canOpenURL(iosUrl);
        if (supported) {
          await Linking.openURL(iosUrl);
        } else {
          console.log("WhatsApp is not installed on the device");
        }
      } catch (error) {
        console.error("Error opening URL", error);
      }
    }
  };

  useFocusEffect(() => {
    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor("white");
    }
  });

  return (
    <View className="flex flex-col w-full h-[95%] bg-gray-100 dark:bg-gray-900">
      <StatusBar barStyle="light-content" />

      <View className="flex w-full h-full items-start justify-start p-4">
        <FlatList
          className="flex flex-col w-[99%] ml-1 overflow-x-hidden"
          data={FAQs}
          keyExtractor={(item) => "Faq-" + item.id}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={({ item }) => (
            <HelpAccordian heading={t(item.heading)}>
              <Text className="text-gray-600 dark:text-gray-300">
                {t(item.description)}
              </Text>
            </HelpAccordian>
          )}
        />

        <View className=" bottom-6 w-full flex items-center">
          <TouchableOpacity
            activeOpacity={0.7}
            className="w-[90%] h-12 rounded-full bg-green-500 flex flex-row items-center justify-center gap-2 shadow-lg"
            onPress={openWhatsAppChat}
          >
            <FontAwesome name="whatsapp" size={24} color="white" />
            <Text className="text-white font-semibold text-lg">
              {t("whatsAppText")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
