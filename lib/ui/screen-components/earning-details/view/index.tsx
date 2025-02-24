// Core
import { View } from "react-native";

// Interfaces
import {
  IEarningDetailsMainProps,
  IRiderEarningsResponse,
} from "@/lib/utils/interfaces/rider-earnings.interface";

// Hooks
import { useUserContext } from "@/lib/context/global/user.context";
import { QueryResult, useQuery } from "@apollo/client";

// GraphQL
import { RIDER_EARNINGS_GRAPH } from "@/lib/apollo/queries/earnings.query";

// Components
import EarningDetailsHeader from "../header";
import EarningsDetailStacks from "./earnings";

// Skeletons
import { useApptheme } from "@/lib/context/global/theme.context";
import { EarningsSummaryMainLoading } from "@/lib/ui/skeletons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { showMessage } from "react-native-flash-message";
import EarningDetailsDateFilter from "../date-filter";

export default function EarningDetailsMain({
  dateFilter,
  setDateFilter,
}: IEarningDetailsMainProps) {
  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();

  // States
  const [isFiltering, setIsFiltering] = useState(false);
  const [isDateFilterVisible, setIsDateFilterVisible] = useState(false);

  // Contexts
  const { setModalVisible, userId } = useUserContext();

  // Queries
  const {
    loading: isRiderEarningsLoading,
    data: riderEarningsData,
    refetch: fetchRiderEarnings,
  } = useQuery(RIDER_EARNINGS_GRAPH, {
    onError: (err) => {
      console.error(err);
      showMessage({
        message:
          err.graphQLErrors[0].message ||
          err.networkError?.message ||
          "Failed to fetch earnings",
        type: "danger",
        duration: 1000,
      });
    },
    variables: {
      riderId: userId ?? "",
    },
  }) as QueryResult<
    IRiderEarningsResponse | undefined,
    { riderId: string; startDate?: string; endDate?: string }
  >;

  // Handlers
  async function handleDateFilterSubmit() {
    setIsFiltering(true);
    // Validation
    if (!dateFilter.startDate) {
      return showMessage({
        message: t("Please select a start date"),
        type: "danger",
        duration: 1000,
      });
    } else if (!dateFilter.endDate) {
      return showMessage({
        message: t("Please select an end date"),
        type: "danger",
        duration: 1000,
      });
    } else if (new Date(dateFilter.startDate) > new Date(dateFilter.endDate)) {
      return showMessage({
        message: t("Start date cannot be after end date"),
        type: "danger",
        duration: 1000,
      });
    }
    if (!userId) {
      return showMessage({
        message: t("Please log in to view your earnings"),
        type: "danger",
        duration: 1000,
      });
    }

    // Fetch with filters
    await fetchRiderEarnings({
      riderId: userId,
      startDate: dateFilter.startDate,
      endDate: dateFilter.endDate,
    });

    setIsFiltering(false);
    setIsDateFilterVisible(false);
  }
  // If loading
  if (isRiderEarningsLoading || isFiltering)
    return <EarningsSummaryMainLoading />;
  return (
    <View style={{ backgroundColor: appTheme.screenBackground }}>
      <EarningDetailsDateFilter
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        handleFilterSubmit={handleDateFilterSubmit}
        isFiltering={isRiderEarningsLoading || isFiltering}
        isDateFilterVisible={isDateFilterVisible}
        setIsDateFilterVisible={setIsDateFilterVisible}
        refetchDeafult={fetchRiderEarnings}
      />
      <EarningDetailsHeader />
      <EarningsDetailStacks
        isRiderEarningsLoading={isRiderEarningsLoading}
        riderEarningsData={riderEarningsData}
        setModalVisible={setModalVisible}
      />
    </View>
  );
}
