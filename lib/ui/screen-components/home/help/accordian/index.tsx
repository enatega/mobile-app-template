import { ReactNode, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
export default function HelpAccordian({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <View className="flex w-full items-center justify-center border border-gray-300 rounded-lg p-2">
      <TouchableOpacity
        className="flex flex-row items-center justify-between w-full bg-gray-100  px-4 py-4  active:opacity-80"
        onPress={() => setOpen(!open)}
        activeOpacity={0.7}
      >
        <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {t(heading)}
        </Text>
        <Entypo
          name={open ? "chevron-small-up" : "chevron-small-down"}
          size={24}
          color="gray"
        />
      </TouchableOpacity>

      {open && (
        <View className="w-full bg-gray-100 dark:bg-gray-700 p-3 rounded-b-lg">
          {children}
        </View>
      )}
    </View>
  );
}
