// Core
import { SafeAreaView } from "react-native-safe-area-context";

// Components
import ChatHeader from "@/lib/ui/screen-components/chat/header";
import ChatMain from "@/lib/ui/screen-components/chat/main";

export default function Chat() {
  return (
    <SafeAreaView className="flex-1  gap-y-3">
      <ChatHeader />
      <ChatMain />
    </SafeAreaView>
  );
}
