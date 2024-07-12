import HangoutPage from "@/components/hangoutDetail/HangoutPage";
import PostPage from "@/components/hangoutDetail/PostPage";
import BaseScreen from "@/components/utils/BaseScreen";
import { useUser } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

interface User {
  result: {
    userId: string;
    name: string;
    username: string;
    profilePhoto?: {
      fileUrl: string;
    };
    friends?: string[];
    phoneNumber: string;
    createdHangouts?: string[];
    upcomingHangouts?: string[];
  };
}

const Hangout = () => {
  const { hangoutId, memoryId } = useLocalSearchParams();
  const hangoutIdStr = Array.isArray(hangoutId) ? hangoutId[0] : hangoutId;
  const memoryIdStr = Array.isArray(memoryId) ? memoryId[0] : memoryId;
  const { user } = useUser();
  const queryClient = useQueryClient();
  const userData = queryClient.getQueryData<User>(["profile", user?.id]);
  const profile = userData?.result;

  return (
    <BaseScreen>
      {profile?.upcomingHangouts?.includes(hangoutIdStr) ? (
        <HangoutPage hangoutId={hangoutIdStr} memoryId={memoryIdStr} />
      ) : (
        user && (
          <PostPage hangoutId={hangoutIdStr} memoryId={memoryId as string} />
        )
      )}
    </BaseScreen>
  );
};

export default Hangout;
