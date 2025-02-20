import { useContext, useState, useEffect } from "react";

import {
  useQuery,
  useMutation,
  useSubscription,
  ServerParseError,
  ServerError,
} from "@apollo/client";
import { FlashMessageComponent } from "../ui/useable-components";
import { IOrder } from "../utils/interfaces/order.interface";
import { SUBSCRIPTION_ORDERS } from "../apollo/subscriptions";
import { GET_CONFIGURATION } from "../api/graphql/query/configuration";
import { RIDER_ORDERS } from "../apollo/queries/rider.query";
import {
  ASSIGN_ORDER,
  UPDATE_ORDER_STATUS_RIDER,
} from "../apollo/mutations/order.mutation";
import UserContext from "../context/global/user.context";
import { useTranslation } from "react-i18next";
import { GraphQLFormattedError } from "graphql";

const useDetails = (orderData: IOrder) => {
  // Hooks
  const { t } = useTranslation();
  const { assignedOrders, loadingAssigned } = useContext(UserContext);
  const [order, setOrder] = useState(orderData);

  useEffect(() => {
    if (!loadingAssigned && order) {
      setOrder(assignedOrders.find((o) => o._id === order?._id));
    }
  }, [assignedOrders, order]);

  const preparationTime = {
    hours: new Date(order?.preparationTime).getHours(),
    minutes: new Date(order?.preparationTime).getMinutes(),
    seconds: new Date(order?.preparationTime).getSeconds(),
  };

  const currentTime = {
    hours: new Date().getHours(),
    minutes: new Date().getMinutes(),
    seconds: new Date().getSeconds(),
  };

  const preparationSeconds =
    preparationTime.hours * 3600 +
    preparationTime.minutes * 60 +
    preparationTime.seconds;
  const currentSeconds =
    currentTime.hours * 3600 + currentTime.minutes * 60 + currentTime.seconds;

  useSubscription(SUBSCRIPTION_ORDERS, {
    variables: { id: order?._id },
    skip: !order,
  });

  const {
    data: dataConfig,
    loading: loadingConfig,
    error: errorConfig,
  } = useQuery(GET_CONFIGURATION);

  const [mutateAssignOrder, { loading: loadingAssignOrder }] = useMutation(
    ASSIGN_ORDER,
    {
      onCompleted,
      onError,
      update,
    },
  );

  const [mutateOrderStatus, { loading: loadingOrderStatus }] = useMutation(
    UPDATE_ORDER_STATUS_RIDER,
    { onCompleted, onError, update },
  );

  async function onCompleted(result) {
    if (result.updateOrderStatusRider) {
      FlashMessageComponent({
        message: `${t("Order marked as")} ${result.updateOrderStatusRider.orderStatus}`,
      });
    }
    if (result.assignOrder) {
      FlashMessageComponent({
        message: "Order assigned",
      });
      //   setActive("MyOrders");
    }
  }

  function onError({
    graphQLErrors,
    networkError,
  }: {
    graphQLErrors: ReadonlyArray<GraphQLFormattedError>;
    networkError: Error | ServerParseError | ServerError | null;
  }) {
    let message = t("Something went wrong");
    if (networkError) message = "Internal Server Error";
    if (graphQLErrors) message = graphQLErrors.map((o) => o.message).join(", ");

    // FlashMessageComponent({ message: message });
    console.error({ message });
  }

  async function update(cache, { data: result }) {
    if (result.assignOrder) {
      const data = cache.readQuery({ query: RIDER_ORDERS });
      if (data) {
        const index = data.riderOrders.findIndex(
          (o) => o._id === result.assignOrder._id,
        );
        if (index > -1) {
          data.riderOrders[index].rider = result.assignOrder.rider;
          data.riderOrders[index].orderStatus = result.assignOrder.orderStatus;
          cache.writeQuery({
            query: RIDER_ORDERS,
            data: { riderOrders: [...data.riderOrders] },
          });
        }
      }
    }
    if (result.updateOrderStatusRider) {
      const data = cache.readQuery({ query: RIDER_ORDERS });
      if (data) {
        const index = data.riderOrders.findIndex(
          (o) => o._id === result.updateOrderStatusRider._id,
        );
        if (index > -1) {
          data.riderOrders[index].orderStatus =
            result.updateOrderStatusRider.orderStatus;
          cache.writeQuery({
            query: RIDER_ORDERS,
            data: { riderOrders: [...data.riderOrders] },
          });
        }
      }
    }
  }
  return {
    order,
    dataConfig,
    currentSeconds,
    preparationSeconds,
    loadingConfig,
    errorConfig,
    mutateAssignOrder,
    mutateOrderStatus,
    loadingAssignOrder,
    loadingOrderStatus,
  };
};

export default useDetails;
