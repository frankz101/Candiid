import { useUser } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

type FriendUpdateAction = {
  action: string;
  friendId: string;
};

export const useFriendFunctions = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const [pendingUpdates, setPendingUpdates] = useState<FriendUpdateAction[]>(
    []
  );
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const applyUpdates = useCallback(async () => {
    if (pendingUpdates.length === 0) return;

    const finalUpdates = pendingUpdates.reduce((acc: any, update: any) => {
      if (acc[update.friendId]) {
        if (
          acc[update.friendId].action === "add" &&
          update.action === "removeRequest"
        ) {
          delete acc[update.friendId];
        } else if (
          acc[update.friendId].action === "removeRequest" &&
          update.action === "add"
        ) {
          delete acc[update.friendId];
        }
      } else {
        acc[update.friendId] = update;
      }
      return acc;
    }, {});

    await Promise.all(
      Object.values(finalUpdates).map(async (update: any) => {
        if (update.action === "add") {
          await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/friendRequest`, {
            senderId: user?.id,
            receiverId: update.friendId,
          });
        } else if (update.action === "removeRequest") {
          await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/friendRequest/handle`,
            {
              senderId: user?.id,
              receiverId: update.friendId,
              status: "reject",
            }
          );
        }
      })
    );

    setPendingUpdates([]);
  }, [pendingUpdates]);

  useEffect(() => {
    if (pendingUpdates.length > 0) {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        applyUpdates();
      }, 5000);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      applyUpdates();
    };
  }, [pendingUpdates, applyUpdates]);

  const sendFriendRequest = (friendId: string) => {
    setPendingUpdates((currentUpdates) => [
      ...currentUpdates,
      { action: "add", friendId },
    ]);
  };

  const removeFriendRequest = (friendId: string) => {
    setPendingUpdates((currentUpdates) => [
      ...currentUpdates,
      { action: "removeRequest", friendId },
    ]);
  };

  const handleFriendRequest = async (friendId: string, status: string) => {
    await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/friendRequest/handle`,
      {
        senderId: friendId,
        receiverId: user?.id,
        status,
      }
    );
  };

  const removeFriend = async (friendId: string) => {
    try {
      Alert.alert(
        "Remove Friend",
        "Are you sure you want to remove this friend?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            style: "destructive",
            onPress: async () => {
              queryClient.setQueryData(
                ["friends", user?.id],
                (oldData: any) => {
                  return oldData.filter(
                    (friend: any) => friend.userId !== friendId
                  );
                }
              );
              await axios.put(
                `${process.env.EXPO_PUBLIC_API_URL}/friends/remove/users/${user?.id}`,
                {
                  receiverId: friendId,
                }
              );
              console.log("removed");
            },
          },
        ],
        { cancelable: true }
      );
    } catch (err) {
      console.error("Error removing friend: ", err);
    }
  };

  const blockUser = async (
    userId: string,
    setModalVisible: (status: boolean) => void,
    setFriendStatus?: () => void
  ) => {
    try {
      if (user) {
        Alert.alert(
          "Are you sure you want to block this user?",
          "You will no longer be able to view their profile",
          [
            {
              text: "No",
              style: "cancel",
            },
            {
              text: "Yes",
              style: "destructive",
              onPress: async () => {
                setModalVisible(false);
                const details = {
                  userId: user.id,
                  blockedUserId: userId,
                };
                await axios.post(
                  `${process.env.EXPO_PUBLIC_API_URL}/user/block`,
                  {
                    details,
                  }
                );
                setFriendStatus && setFriendStatus();
              },
            },
          ],
          { cancelable: true }
        );
      }
    } catch (err) {
      console.error("Error blocking user: ", err);
    }
  };

  return {
    sendFriendRequest,
    removeFriendRequest,
    handleFriendRequest,
    removeFriend,
    blockUser,
  };
};
