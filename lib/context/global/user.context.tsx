import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  requestForegroundPermissionsAsync,
  watchPositionAsync,
  LocationAccuracy,
  LocationSubscription,
} from "expo-location";
import { QueryResult, useQuery } from "@apollo/client";
// Interface
import {
  IRiderProfileResponse,
  IUserContextProps,
  IUserProviderProps,
} from "@/lib/utils/interfaces";
// Context
// import { useLocationContext } from "./location.context";
// API
import { RIDER_ORDERS, RIDER_PROFILE } from "@/lib/apollo/queries";
import { UPDATE_LOCATION } from "@/lib/apollo/mutations/rider.mutation";
import {
  SUBSCRIPTION_ASSIGNED_RIDER,
  SUBSCRIPTION_ZONE_ORDERS,
} from "@/lib/apollo/subscriptions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  IRiderEarnings,
  IRiderEarningsArray,
} from "@/lib/utils/interfaces/rider-earnings.interface";
import { asyncStorageEmitter } from "@/lib/services/async-storage";

const UserContext = createContext<IUserContextProps>({} as IUserContextProps);

export const UserProvider = ({ children }: IUserProviderProps) => {
  // States
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
  >([] as IRiderEarningsArray[]);
  const [userId, setUserId] = useState("");

  // Refs
  const locationListener = useRef<LocationSubscription>();

  // Context
  // const { locationPermission } = useLocationContext()

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
    // onCompleted,
    // onError: error2,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    pollInterval: 10000,
    skip: !userId,
  });

  let unsubscribeZoneOrder: unknown = null;
  let unsubscribeAssignOrder: unknown = null;

  async function getUserId() {
    const id = await AsyncStorage.getItem("rider-id");

    if (id) {
      setUserId(id);
    }
  }

  const subscribeNewOrders = () => {
    try {
      const unsubAssignOrder = subscribeToMore({
        document: SUBSCRIPTION_ASSIGNED_RIDER,
        variables: { riderId: dataProfile?.rider?._id },
        updateQuery: (prev, { subscriptionData }) => {
          console.log("running subscription -> SUBSCRIPTION_ASSIGNED_RIDER");

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
        document: SUBSCRIPTION_ZONE_ORDERS, // Previously known as SUBSCRIPTION_UNASSIGNED_ORDER
        variables: { zoneId: dataProfile?.rider?.zone?._id },
        updateQuery: (prev, { subscriptionData }) => {
          console.log("running subscription -> SUBSCRIPTION_ZONE_ORDERS");

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
      console.log(error);
    }
  };

  const trackRiderLocation = async () => {
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
  };

  // UseEffects
  useEffect(() => {
    if (!dataProfile) return;
    {
      const { unsubZoneOrder, unsubAssignOrder } = subscribeNewOrders();
      unsubscribeZoneOrder = unsubZoneOrder;
      unsubscribeAssignOrder = unsubAssignOrder;
    }
    return () => {
      if (unsubscribeZoneOrder) {
        unsubscribeZoneOrder();
      }

      if (unsubscribeAssignOrder) unsubscribeAssignOrder();
    };
  }, [dataProfile]);

  useEffect(() => {
    if (!userId) return;

    refetchProfile({ id: userId });
  }, [userId]);

  useEffect(() => {
    const listener = asyncStorageEmitter.addListener("rider-id", (data) => {
      setUserId(data?.value ?? "");
    });

    getUserId();
    trackRiderLocation();
    return () => {
      if (locationListener.current) {
        locationListener?.current?.remove();
      }

      if (listener) {
        listener.removeListener("rider-id", () => {
          console.log("Rider Id listerener removed");
        });
      }
    };
  }, []);

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
          loadingAssigned || errorAssigned ? [] : dataAssigned?.riderOrders,
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
