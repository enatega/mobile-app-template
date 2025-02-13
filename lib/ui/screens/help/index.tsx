// Core
import { SafeAreaView } from "react-native-safe-area-context";

// Components
import HelpMain from "../../screen-components/home/help/view/main";

const HelpScreen = () => {
  return (
    <SafeAreaView edges={["bottom", "right", "left"]} className="w-full h-full">
      <HelpMain />
    </SafeAreaView>
  );
};

export default HelpScreen;
