import { useApptheme } from "@/lib/context/global/theme.context";
import { DrawerLayout } from "@/lib/ui/layouts/home-drawer";

export default function HomeLayout() {
  const { currentTheme, appTheme } = useApptheme();
  console.log("🚀 ~ HomeLayout ~ currentTheme:", currentTheme);
  return (
    <DrawerLayout
      key={currentTheme?.concat("_DRAWER")}
      currentTheme={currentTheme}
      appTheme={appTheme}
    />
  );
}
