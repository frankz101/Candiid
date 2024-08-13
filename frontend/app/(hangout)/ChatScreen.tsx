import BackButton from "@/components/utils/BackButton";
import BaseScreen from "@/components/utils/BaseScreen";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useKeyboard } from "@react-native-community/hooks";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { io } from "socket.io-client";

const LIMIT = 20;

interface ParticipantPhoto {
  id: string;
  name: string;
  profilePhoto?: string;
}

const ChatScreen = () => {
  const { hangoutId, name } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const { user } = useUser();
  const roomId = hangoutId;
  const [loading, setLoading] = useState<boolean>(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const queryClient = useQueryClient();
  const participantPhotos = queryClient.getQueryData<ParticipantPhoto[]>([
    "participants",
    hangoutId,
  ]);
  const profilePhotoMap = Object.fromEntries(
    (participantPhotos || []).map((p) => [p.id, p.profilePhoto])
  );

  const addMessage = async (message: {
    senderName: string;
    senderId: string;
    text: string;
  }) => {
    try {
      await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/chat/${roomId}`, {
        message,
      });
    } catch (error) {
      console.error("Error adding message: ", error);
    }
  };

  const fetchMessages = async (limit: number, lastMessageId?: string) => {
    try {
      console.log("fetching messages");
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/chat/${roomId}`,
        {
          params: {
            limit,
            lastMessageId,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching messages: ", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const initialMessages = await fetchMessages(LIMIT);
      setMessages(initialMessages);
      setLastMessageId(initialMessages[initialMessages.length - 1]?.id || null);
      setHasMore(initialMessages.length === LIMIT); // Check if we got the full limit of messages
      setLoading(false);
    };

    fetchData();

    const socket = io(`${process.env.EXPO_PUBLIC_WEBSOCKET_URL}`);

    socket.on("connect", () => {
      console.log("Connected to websocket");
      socket.emit("joinRoom", roomId);
    });

    socket.on("message", (data) => {
      if (
        data.type === "added" ||
        data.type === "modified" ||
        data.type === "removed"
      ) {
        setMessages((prevMessages) => {
          return [{ id: data.doc.id, ...data.doc }, ...prevMessages];
        });
      }
    });

    return () => {
      socket.emit("leaveRoom");
      socket.disconnect();
      console.log("Disconnected from WebSocket server");
    };
  }, []);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      setNewMessage("");
      await addMessage({
        senderName: user?.fullName as string,
        senderId: user?.id as string,
        text: newMessage,
      });
    }
  };

  const isOwnMessage = (messageSenderId: string) => {
    return messageSenderId === user?.id;
  };

  const loadMoreMessages = async () => {
    if (!loading && hasMore) {
      // Only load more if not already loading and there are more messages
      setLoading(true);
      const moreMessages = await fetchMessages(LIMIT, lastMessageId as string);
      setMessages((prevMessages) => {
        const newMessages = moreMessages.filter(
          (msg: any) => !prevMessages.some((m) => m.id === msg.id)
        );
        return [...prevMessages, ...newMessages];
      });
      setLastMessageId(moreMessages[moreMessages.length - 1]?.id || null);
      setHasMore(moreMessages.length === LIMIT); // Check if we got the full limit of messages
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <BaseScreen>
        <View style={styles.headerContainer}>
          <BackButton />
          <Text style={styles.header}>{name}</Text>
        </View>
        <View style={styles.container}>
          <FlatList
            data={messages}
            keyExtractor={(item, index) =>
              item.id?.toString() || index.toString()
            }
            renderItem={({ item, index }) => {
              const showProfilePhoto =
                index === 0 || item.senderId !== messages[index - 1].senderId;
              const showName =
                index === messages.length - 1 ||
                item.senderId !== messages[index + 1].senderId;
              const ownMessage = isOwnMessage(item.senderId);

              return (
                <View
                  style={[
                    styles.messageContainer,
                    ownMessage
                      ? { alignSelf: "flex-end" }
                      : { alignSelf: "flex-start" },
                    !showProfilePhoto && !ownMessage && { marginLeft: wp(11) },
                  ]}
                >
                  {showProfilePhoto &&
                    !ownMessage &&
                    (profilePhotoMap[item.senderId] ? (
                      <Image
                        source={{
                          uri: profilePhotoMap[item.senderId],
                        }}
                        style={styles.profilePhoto}
                      />
                    ) : (
                      <Ionicons
                        name="person-circle-outline"
                        color="white"
                        size={40}
                        style={styles.profilePhoto}
                      />
                    ))}
                  <View>
                    {showName &&
                      (ownMessage ? (
                        <View style={{ marginTop: hp(0.5) }}></View>
                      ) : (
                        <Text style={styles.sender}>{item.senderName}</Text>
                      ))}
                    <View
                      style={[
                        styles.message,
                        ownMessage ? styles.ownMessage : styles.otherMessage,
                      ]}
                    >
                      <Text
                        style={[
                          { fontSize: 16 },
                          ownMessage ? { color: "white" } : { color: "black" },
                        ]}
                      >
                        {item.text}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            }}
            inverted
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.1}
            ListFooterComponent={loading ? <Text>Loading...</Text> : null}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message"
              blurOnSubmit={false}
              onSubmitEditing={handleSendMessage}
              multiline
              numberOfLines={4}
            />
            {newMessage && (
              <Pressable onPress={handleSendMessage} style={styles.sendButton}>
                <Ionicons name="arrow-up-circle" color="#007BFF" size={30} />
              </Pressable>
            )}
          </View>
        </View>
      </BaseScreen>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  header: {
    position: "absolute",
    left: wp(20),
    right: wp(20),
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 24,
  },
  container: {
    flex: 1,
    padding: wp(2),
  },
  message: {
    padding: hp(1),
    borderRadius: 15,
    maxWidth: wp(70),
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: hp(0.1),
  },
  ownMessage: {
    backgroundColor: "#007BFF",
    marginRight: wp(2),
  },
  otherMessage: {
    backgroundColor: "#ccc",
  },
  sender: {
    marginLeft: wp(1),
    marginBottom: hp(0.25),
    fontSize: 14,
    color: "lightgray",
  },
  profilePhoto: {
    width: wp(9),
    height: wp(9),
    borderRadius: 20,
    marginRight: wp(2),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp(2),
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#424242",
    borderRadius: 20,
    paddingHorizontal: wp(3.5),
    paddingTop: hp(1),
    paddingBottom: hp(1),
    color: "white",
  },
  sendButton: {
    marginLeft: wp(3),
  },
});
