import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  requestForegroundPermissionsAsync,
  watchPositionAsync,
  LocationAccuracy,
  LocationSubscription,
} from "expo-location";
import { QueryResult, useQuery } from "@apollo/client";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  IRiderProfileResponse,
  IUserContextProps,
  IUserProviderProps,
} from "@/lib/utils/interfaces";
import { RIDER_ORDERS, RIDER_PROFILE } from "@/lib/apollo/queries";
import { UPDATE_LOCATION } from "@/lib/apollo/mutations/rider.mutation";
import {
  SUBSCRIPTION_ASSIGNED_RIDER,
  SUBSCRIPTION_ZONE_ORDERS,
} from "@/lib/apollo/subscriptions";
import {
  IRiderEarnings,
  IRiderEarningsArray,
} from "@/lib/utils/interfaces/rider-earnings.interface";

const UserContext = createContext<IUserContextProps>({} as IUserContextProps);

export const UserProvider = ({ children }: IUserProviderProps) => {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const [modalVisible, setModalVisible] = useState<
    IRiderEarnings & { bool: boolean }
  >({
    bool: false,
    _id: "",
    date: "",
    earningsArray: [] as IRiderEarningsArray[],
    totalEarningsSum: 0,
    totalTipsSum: 0,
    totalDeliveries: 0,
  });
  const [riderOrderEarnings, setRiderOrderEarnings] = useState<
    IRiderEarningsArray[]
  >([]);
  const [userId, setUserId] = useState("");
  const locationListener = useRef<LocationSubscription>();

  const {
    loading: loadingProfile,
    error: errorProfile,
    data: dataProfile,
    refetch: refetchProfile,
  } = useQuery(RIDER_PROFILE, {
    fetchPolicy: "network-only",
    skip: !userId,
    variables: {
      id: userId,
    },
  }) as QueryResult<IRiderProfileResponse | undefined, { id: string }>;

  const {
    client,
    loading: loadingAssigned,
    error: errorAssigned,
    data: dataAssigned,
    networkStatus: networkStatusAssigned,
    subscribeToMore,
    refetch: refetchAssigned,
  } = useQuery(RIDER_ORDERS, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const getUserId = async () => {
    try {
      const id = await AsyncStorage.getItem("rider-id");
      setUserId(id || "");
      if (!id) {
        router.replace("/login");
        return;
      }
      setIsInitialized(true);
    } catch (error) {
      console.error("Error getting user ID:", error);
      setIsInitialized(true);
      router.replace("/login");
      return;
    }
  };

  const subscribeNewOrders = () => {
    try {
      const unsubAssignOrder = subscribeToMore({
        document: SUBSCRIPTION_ASSIGNED_RIDER,
        variables: { riderId: dataProfile?.rider._id },
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev;
          if (subscriptionData.data.subscriptionAssignRider.origin === "new") {
            return {
              riderOrders: [
                subscriptionData.data.subscriptionAssignRider.order,
                ...prev.riderOrders,
              ],
            };
          } else if (
            subscriptionData.data.subscriptionAssignRider.origin === "remove"
          ) {
            return {
              riderOrders: [
                ...prev.riderOrders.filter(
                  (o) =>
                    o._id !==
                    subscriptionData.data.subscriptionAssignRider.order._id,
                ),
              ],
            };
          }
          return prev;
        },
      });

      const unsubZoneOrder = subscribeToMore({
        document: SUBSCRIPTION_ZONE_ORDERS,
        variables: { zoneId: dataProfile?.rider?.zone?._id },
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev;
          if (subscriptionData.data.subscriptionZoneOrders.origin === "new") {
            return {
              riderOrders: [
                subscriptionData.data.subscriptionZoneOrders.order,
                ...prev.riderOrders,
              ],
            };
          }
          return prev;
        },
      });

      return { unsubZoneOrder, unsubAssignOrder };
    } catch (error) {
      console.log(error, "zone order Error");
      return { unsubZoneOrder: null, unsubAssignOrder: null };
    }
  };

  const trackRiderLocation = async () => {
    try {
      locationListener.current = await watchPositionAsync(
        { accuracy: LocationAccuracy.BestForNavigation, timeInterval: 10000 },
        async (location) => {
          client.mutate({
            mutation: UPDATE_LOCATION,
            variables: {
              latitude: location.coords.latitude.toString(),
              longitude: location.coords.longitude.toString(),
            },
          });
        },
      );
    } catch (error) {
      console.error(error, "Location Error");
    }
  };

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    refetchProfile({ id: userId });
  }, [userId, isInitialized]);

  useEffect(() => {
    if (!dataProfile) return;

    const { unsubZoneOrder, unsubAssignOrder } = subscribeNewOrders();
    return () => {
      if (unsubZoneOrder) unsubZoneOrder();
      if (unsubAssignOrder) unsubAssignOrder();
    };
  }, [dataProfile]);

  useEffect(() => {
    trackRiderLocation();
    return () => {
      locationListener.current?.remove();
    };
  }, []);

  if (!isInitialized) {
    return null; // or a loading component
  }

  return (
    <UserContext.Provider
      value={{
        modalVisible,
        riderOrderEarnings,
        setModalVisible,
        setRiderOrderEarnings,
        userId,
        loadingProfile,
        errorProfile,
        dataProfile: dataProfile?.rider ?? null,
        loadingAssigned,
        errorAssigned,
        assignedOrders:
          loadingAssigned || errorAssigned ? [] : dataAssigned.riderOrders,
        refetchAssigned,
        networkStatusAssigned,
        requestForegroundPermissionsAsync,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const UserConsumer = UserContext.Consumer;
export const useUserContext = () => useContext(UserContext);
export default UserContext;
