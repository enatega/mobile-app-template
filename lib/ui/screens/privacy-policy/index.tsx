import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useLayoutEffect } from "react";

const index = () => {
  useLayoutEffect(() => {
    router.replace("/(tabs)/home/orders/processing");
    Linking.openURL("https://multivendor.enatega.com/#/privacy");
  }, []);
  return <></>;
};

export default index;
