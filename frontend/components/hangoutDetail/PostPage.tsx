import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import BaseScreen from "../utils/BaseScreen";
import axios from "axios";
import { useEffect, useState } from "react";
import BackButton from "../utils/BackButton";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Timestamp } from "react-native-reanimated/lib/typescript/reanimated2/commonTypes";
import PostCarousel from "../photo/PostCarousel";
import ParticipantsList from "./ParticipantsList";
import UserBanner from "../friends/UserBanner";
import { FlatList } from "react-native-actions-sheet";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface PostProps {
  hangoutId: string;
  memoryId: string;
}

interface Hangout {
  id: string;
  completed: boolean;
  createdAt: Timestamp;
  hangoutDescription: string;
  hangoutName: string;
  participantIds: string[];
  userId: string;
}

interface PhotoDetailsProps {
  fileUrl: string;
  takenAt: string;
  takenBy: string;
}

interface Post {
  id: string;
  createdAt: Timestamp;
  hangoutId: string;
  photoUrls: PhotoDetailsProps[];
  userId: string;
  caption?: string;
}

const { width: screenWidth } = Dimensions.get("window");
const PostPage: React.FC<PostProps> = ({ hangoutId, memoryId }) => {
  const [post, setPost] = useState<Post>();
  const [hangout, setHangout] = useState<Hangout>();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const fetchParticipants = async () => {
    if (hangout?.participantIds && hangout?.participantIds?.length > 0) {
      return axios
        .post(`${process.env.EXPO_PUBLIC_API_URL}/user/list`, {
          userIds: hangout.participantIds,
        })
        .then((res) => res.data.result);
    }
    return [];
  };

  const { data: participants } = useQuery({
    queryKey: ["hangoutParticipants", hangoutId],
    queryFn: fetchParticipants,
    enabled: !!hangout,
  });

  const getPost = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/posts/${user?.id}/${hangoutId}`
      );
      if (res.status === 201) {
        setPost(res.data.result);
      }
    } catch (err: any) {
      console.error(err.errors[0].message);
    }
  };

  const getHangout = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/hangout/${hangoutId}`
      );
      if (res.status === 200) {
        setHangout(res.data);
      }
    } catch (err: any) {
      console.error(err.errors[0].message);
    }
  };

  useEffect(() => {
    getPost();
    getHangout();
  }, []);

  const deleteHangout = async () => {
    Alert.alert(
      "Are you sure you want to delete this memory?",
      "This action is not recoverable.",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              router.back();
              const res = await axios.delete(
                `${process.env.EXPO_PUBLIC_API_URL}/memories/${memoryId}/${post?.id}`
              );
            } catch (err) {
              console.error(err);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  return (
    <BaseScreen>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingRight: wp(2),
        }}
      >
        <BackButton />
        <Pressable onPress={() => setShowModal(true)}>
          <Ionicons name="ellipsis-horizontal" color="white" size={32} />
        </Pressable>
      </View>
      <Modal transparent={true} animationType="fade" visible={showModal}>
        <Pressable style={styles.overlay} onPress={() => setShowModal(false)}>
          <View style={styles.modalContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.modalButton,
                pressed
                  ? { backgroundColor: "#3a3a3d" }
                  : { backgroundColor: "#2a2a2d" },
              ]}
              onPress={() => {
                setShowModal(false);
                deleteHangout();
              }}
            >
              <Text style={styles.modalButtonText}>Delete Hangout</Text>
              <Ionicons name="trash-outline" color="red" size={24} />
            </Pressable>
          </View>
        </Pressable>
      </Modal>
      <View style={{ alignItems: "center", padding: wp(2) }}>
        <Text style={styles.headerText}>{hangout?.hangoutName}</Text>
        <Text style={styles.descriptionText}>
          {hangout?.hangoutDescription}
        </Text>
      </View>
      {post && (
        <PostCarousel
          images={post?.photoUrls}
          width={screenWidth}
          height={screenWidth}
        />
      )}
      <Text style={styles.caption}>{post?.caption}</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.sectionTwoText}>Participants</Text>
        <Pressable onPress={() => setEditModalVisible(true)}>
          <Text
            style={[
              styles.sectionTwoText,
              { color: "gray", fontWeight: "normal" },
            ]}
          >
            Show more
          </Text>
        </Pressable>
        <Modal
          transparent={true}
          animationType="slide"
          visible={editModalVisible}
        >
          <Pressable
            style={styles.bottomOverlay}
            onPress={() => setEditModalVisible(false)}
          >
            <View style={styles.bottomModalContainer}>
              <FlatList
                data={participants}
                renderItem={({ item }) => (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <UserBanner user={item} type="participants" />
                    </View>
                  </View>
                )}
                keyExtractor={(item) => item}
              />
            </View>
          </Pressable>
        </Modal>
      </View>
      {hangout && (
        <ParticipantsList
          participants={hangout.participantIds}
          hangoutId={hangoutId as string}
          showModal={() => setEditModalVisible(true)}
        />
      )}
    </BaseScreen>
  );
};

export default PostPage;

const styles = StyleSheet.create({
  headerText: {
    fontSize: 30,
    fontFamily: "inter",
    fontWeight: "700",
    color: "#FFF",
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: "inter",
    fontWeight: "500",
    color: "#FFF",
    padding: wp(1),
  },
  caption: {
    color: "white",
    fontSize: 16,
    marginHorizontal: wp(2),
  },
  sectionTwoText: {
    fontSize: 14,
    fontFamily: "inter",
    fontWeight: "700",
    paddingTop: wp(4),
    paddingBottom: wp(2),
    paddingHorizontal: wp(2),
    color: "#FFF",
  },
  modalContainer: {
    width: wp(50),
    maxWidth: wp(90),
    backgroundColor: "#d9d9d9",
    borderRadius: 10,
    overflow: "hidden",
  },
  modalButton: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderBottomColor: "#4a4a4d",
    borderBottomWidth: 0.5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalButtonText: {
    color: "red",
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: hp(11),
    paddingRight: wp(3),
  },
  bottomOverlay: {
    flex: 1,
  },
  bottomModalContainer: {
    position: "absolute",
    bottom: 0,
    width: wp(100),
    height: hp(80),
    backgroundColor: "#2a2a2d",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: hp(1),
  },
});
