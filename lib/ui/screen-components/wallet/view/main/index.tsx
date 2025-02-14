// Interfaces
import {
  IRiderByIdResponse,
  IRiderCurrentWithdrawRequestResponse,
  IRiderEarningsResponse,
  IRiderTransactionHistoryResponse,
} from "@/lib/utils/interfaces/rider.interface";
import { ILazyQueryResult } from "@/lib/utils/interfaces";

// Components
import { CustomContinueButton } from "@/lib/ui/useable-components";
import RecentTransaction from "../recent-transactions";
import { FlashMessageComponent } from "@/lib/ui/useable-components";
import WithdrawModal from "../form";

// Hooks
import { useEffect, useState } from "react";
import { useLazyQueryQL } from "@/lib/hooks/useLazyQueryQL";
import { useMutation } from "@apollo/client";
import { useUserContext } from "@/lib/context/global/user.context";
import { useTranslation } from "react-i18next";

// GraphQL
import { CREATE_WITHDRAW_REQUEST } from "@/lib/apollo/mutations/withdraw-request.mutation";
import {
  RIDER_BY_ID,
  RIDER_CURRENT_WITHDRAW_REQUEST,
  RIDER_EARNINGS,
  RIDER_TRANSACTIONS_HISTORY,
} from "@/lib/apollo/queries";
import { GraphQLError } from "graphql";

// Expo
import { router } from "expo-router";

// Core
import { ScrollView, Alert } from "react-native";
import { Text, View } from "react-native";

// Skeletons
import { WalletScreenMainLoading } from "@/lib/ui/skeletons";

export default function WalletMain() {
  // Hooks
  const { t } = useTranslation();

  // States
  const [isBottomModalOpen, setIsBottomModalOpen] = useState(false);
  const [amountErrMsg, setAmountErrMsg] = useState("");
  const { userId } = useUserContext();

  // Queries
  const { fetch: fetchRiderEarnings, loading: isRiderEarningsLoading } =
    useLazyQueryQL(RIDER_EARNINGS) as ILazyQueryResult<
      IRiderEarningsResponse | undefined,
      undefined
    >;

  const {
    data: riderTransactionData,
    fetch: fetchRiderTransactions,
    loading: isRiderTransactionLoading,
  } = useLazyQueryQL(
    RIDER_TRANSACTIONS_HISTORY,
    {},
    {
      userType: "RIDER",
      userId: userId,
    },
  ) as ILazyQueryResult<
    IRiderTransactionHistoryResponse | undefined,
    {
      userType: string;
      userId: string;
    }
  >;
  const {
    data: riderProfileData,
    fetch: fetchRiderProfile,
    loading: isRiderProfileLoading,
  } = useLazyQueryQL(
    RIDER_BY_ID,
    { enabled: !!userId },
    {
      id: userId,
    },
  ) as ILazyQueryResult<IRiderByIdResponse | undefined, { id: string }>;

  const {
    data: riderCurrentWithdrawRequestData,
    fetch: fetchRiderCurrentWithdrawRequest,
    loading: isRiderCurrentWithdrawRequestLoading,
  } = useLazyQueryQL(
    RIDER_CURRENT_WITHDRAW_REQUEST,
    {},
    { riderId: userId },
  ) as ILazyQueryResult<
    IRiderCurrentWithdrawRequestResponse | undefined,
    {
      riderId: string;
    }
  >;

  // Mutaions
  const [createWithDrawRequest, { loading: createWithDrawRequestLoading }] =
    useMutation(CREATE_WITHDRAW_REQUEST, {
      onCompleted: () => {
        FlashMessageComponent({
          message: t("Successfully created the withdraw request"),
        });
        setIsBottomModalOpen(false);
        // setIsModalVisible(true)
        router.push({
          pathname: "/(tabs)/wallet/(routes)/success",
        });
      },
      onError: (error) => {
        Alert.alert(t("Warning"), error.message, [
          {
            onPress: () => setIsBottomModalOpen(false),
            text: t("Okay"),
          },
        ]);
        FlashMessageComponent({
          message:
            error.message ||
            error.graphQLErrors[0].message ||
            JSON.stringify(error) ||
            t("Something went wrong"),
        });
      },
      refetchQueries: [
        { query: RIDER_BY_ID, variables: { id: userId } },
        { query: RIDER_EARNINGS, variables: { id: userId } },
      ],
    });

  // Handlers
  async function handleFormSubmission(withdrawAmount: number) {
    const currentAmount = riderProfileData?.rider.currentWalletAmount || 0;
    if (withdrawAmount > (currentAmount || 0)) {
      return setAmountErrMsg(
        `${t("Please enter a valid amount, You have $")}${currentAmount} ${t("available")}.`,
      );
    } else if (withdrawAmount < 10) {
      return setAmountErrMsg(
        t("The withdraw amount must be atleast 10 or greater"),
      );
    } else if (typeof withdrawAmount !== "number") {
      return setAmountErrMsg(t("Please enter a valid number"));
    }
    try {
      await createWithDrawRequest({
        variables: {
          requestAmount: withdrawAmount,
        },
      });
    } catch (error) {
      const err = error as GraphQLError;

      FlashMessageComponent({
        message:
          err.message || JSON.stringify(error) || t("Something went wrong"),
      });
    }
  }
  // Loading state
  const isLoading =
    createWithDrawRequestLoading ||
    isRiderEarningsLoading ||
    isRiderProfileLoading ||
    isRiderTransactionLoading ||
    isRiderCurrentWithdrawRequestLoading ||
    !riderProfileData?.rider.currentWalletAmount;

  // UseEffects
  useEffect(() => {
    if (userId) {
      fetchRiderProfile();
      fetchRiderEarnings();
      fetchRiderTransactions();
      fetchRiderCurrentWithdrawRequest({
        riderId: userId,
      });
    }
  }, [userId]);
  if (isLoading) return <WalletScreenMainLoading />;
  return (
    <View className="flex flex-col justify-between  w-[100%] h-full bg-white">
      {!isLoading && riderProfileData?.rider.currentWalletAmount && (
        <View className="flex flex-column gap-4 items-center bg-gray-100 m-4 p-4 rounded-lg">
          <Text className="text-[18px] text-[#4B5563] font-[600]">
            {t("Current Balance")}
          </Text>
          <Text className="font-semibold text-[32px]">
            ${riderProfileData?.rider.currentWalletAmount ?? 0}
          </Text>
          <CustomContinueButton
            title={t("Withdraw Now")}
            onPress={() => setIsBottomModalOpen((prev) => !prev)}
          />
        </View>
      )}
      {riderCurrentWithdrawRequestData?.riderCurrentWithdrawRequest
        .requestAmount !== 0 &&
        riderCurrentWithdrawRequestData?.riderCurrentWithdrawRequest && (
          <View>
            <Text className="font-bold text-lg bg-white p-5 mt-4">
              {t("Pending Request")}
            </Text>
            <RecentTransaction
              transaction={{
                amountTransferred:
                  riderCurrentWithdrawRequestData?.riderCurrentWithdrawRequest
                    .requestAmount || 0,
                status:
                  riderCurrentWithdrawRequestData?.riderCurrentWithdrawRequest
                    .status,
                createdAt:
                  riderCurrentWithdrawRequestData?.riderCurrentWithdrawRequest
                    .createdAt,
              }}
              key={
                riderCurrentWithdrawRequestData?.riderCurrentWithdrawRequest
                  .createdAt
              }
              isLast={false}
            />
          </View>
        )}
      <Text className="font-bold text-lg bg-white p-5 mt-4">
        {t("Recent Transactions")}
      </Text>

      <ScrollView style={{ backgroundColor: "white" }}>
        {riderTransactionData?.transactionHistory.data.map(
          (transaction, index) => {
            return (
              <RecentTransaction
                transaction={transaction}
                key={transaction.createdAt}
                isLast={
                  riderTransactionData?.transactionHistory.data.length - 1 ===
                  index
                }
              />
            );
          },
        )}
      </ScrollView>

      <WithdrawModal
        isBottomModalOpen={isBottomModalOpen}
        setIsBottomModalOpen={setIsBottomModalOpen}
        amountErrMsg={amountErrMsg}
        setAmountErrMsg={setAmountErrMsg}
        currentTotal={riderProfileData?.rider?.currentWalletAmount ?? 0}
        handleFormSubmission={handleFormSubmission}
        withdrawRequestLoading={createWithDrawRequestLoading}
      />
    </View>
  );
}
