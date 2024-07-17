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

const ChatScreen = () => {
  const { hangoutId } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const { user } = useUser();
  const roomId = hangoutId;

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

  const fetchMessages = async (hangoutId: string) => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/chat/${roomId}`
      );
      setMessages(response.data.result);
    } catch (error) {
      console.error("Error fetching messages: ", error);
      return [];
    }
  };

  useEffect(() => {
    fetchMessages(roomId as string);

    const socket = new WebSocket("ws://192.168.1.228:3001");

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
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: data.doc.id, ...data.doc },
        ]);
      }
    };
  }, [hangoutId]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      await addMessage({
        senderName: user?.fullName as string,
        senderId: user?.id as string,
        text: newMessage,
      });
      setNewMessage("");
    }
  };
  const isOwnMessage = (messageSenderId: string) => {
    return messageSenderId === user?.id;
  };

  return (
    <BaseScreen>
      <BackButton />
      <View style={styles.container}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            return (
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
            );
          }}
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
