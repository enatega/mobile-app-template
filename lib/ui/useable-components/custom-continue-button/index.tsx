import { useApptheme } from "@/lib/context/global/theme.context";
import { Text, TouchableOpacity } from "react-native";
import { TouchableOpacityProps } from "react-native-gesture-handler";

export default function CustomContinueButton({
  title,
  ...props
}: { title: string } & TouchableOpacityProps) {
  // Hooks
  const { appTheme } = useApptheme();
  return (
    <TouchableOpacity
      {...props}
      className="py-5 min-w-96 lg:px-52 rounded-[80] items-center justify-center"
      style={{ backgroundColor: appTheme.primary }}
    >
      <Text className="text-[16px]">{title}</Text>
    </TouchableOpacity>
  );
}
