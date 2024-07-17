import BackButton from "@/components/utils/BackButton";
import BaseScreen from "@/components/utils/BaseScreen";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const LIMIT = 20;

const ChatScreen = () => {
  const { hangoutId, name } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const { user } = useUser();
  const roomId = hangoutId;
  const [loading, setLoading] = useState<boolean>(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

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
      return response.data.result;
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
    const socket = new WebSocket(`${process.env.EXPO_PUBLIC_WEBSOCKET_URL}`);

    socket.onopen = () => {
      console.log("Connected to websocket");
      socket.send(JSON.stringify({ roomId }));
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (
        data.type === "added" ||
        data.type === "modified" ||
        data.type === "removed"
      ) {
        setMessages((prevMessages) => {
          return [{ id: data.doc.id, ...data.doc }, ...prevMessages];
        });
      }
    };
    socket.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    return () => {
      socket.close();
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
          renderItem={({ item }) => (
            <View
              style={[
                styles.message,
                isOwnMessage(item.senderId)
                  ? styles.ownMessage
                  : styles.otherMessage,
              ]}
            >
              <Text style={styles.sender}>{item.senderName}</Text>
              <Text style={styles.text}>{item.text}</Text>
            </View>
          )}
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
          />
          <Button title="Send" onPress={handleSendMessage} />
        </View>
      </View>
    </BaseScreen>
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
    padding: 10,
  },
  message: {
    padding: 10,
    borderBottomWidth: 1,
    marginVertical: 5,
  },
  ownMessage: {
    backgroundColor: "#007BFF",
    alignSelf: "flex-end",
    borderRadius: 10,
  },
  otherMessage: {
    backgroundColor: "#ccc",
    alignSelf: "flex-start",
    borderRadius: 10,
  },
  sender: {
    fontWeight: "bold",
    color: "white",
  },
  text: {
    color: "white",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
    color: "white",
  },
});
