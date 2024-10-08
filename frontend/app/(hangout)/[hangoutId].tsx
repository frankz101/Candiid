import HangoutPage from "@/components/hangoutDetail/HangoutPage";
import PostPage from "@/components/hangoutDetail/PostPage";
import BaseScreen from "@/components/utils/BaseScreen";
import { useUser } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";

interface User {
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
}

const Hangout = () => {
  const { userId, hangoutId, memoryId } = useLocalSearchParams();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const userData = queryClient.getQueryData<User>(["profile", user?.id]);
  const profile = userData;

  return (
    <BaseScreen>
      {profile?.upcomingHangouts?.includes(hangoutId as string) ? (
        <HangoutPage hangoutId={hangoutId as string} />
      ) : (
        user && (
          <PostPage
            hangoutId={hangoutId as string}
            memoryId={memoryId as string}
            userId={userId as string}
          />
        )
      )}
    </BaseScreen>
  );
};

export default Hangout;
