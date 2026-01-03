import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon, { IconTypes } from "./Icon";
import { theme } from "../colors";

interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: Date;
}

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [previousMessageId, setPreviousMessageId] = useState<string | undefined>();
  const scrollViewRef = React.useRef<ScrollView>(null);

  const sendMessageToBackend = async (text: string, parentMessageId?: string) => {
    try {
      const response = await fetch('https://builddetroit.xyz/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, parentMessageId }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return 'Sorry, there was an error processing your message.';
    }
  };

  const sendMessage = React.useCallback(async () => {
    if (inputText.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user", 
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");

    // Scroll to bottom after sending message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await sendMessageToBackend(inputText, previousMessageId);
      setPreviousMessageId(response.id);
      
      const botMessage: Message = {
        id: Date.now().toString(),
        text: response.detail.choices[0].message.content,
        sender: "other",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error in chat exchange:', error);
    }
  }, [inputText]);

  React.useEffect(() => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: "Hello, how can I help you today?",
      sender: "other",
      timestamp: new Date(),
    };
    setMessages([newMessage]);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // const sendMessage = React.useCallback(() => {
  //   if (inputText.trim() === "") return;

  //   const newMessage: Message = {
  //     id: Date.now().toString(),
  //     text: inputText,
  //     sender: "user",
  //     timestamp: new Date(),
  //   };

  //   const newMessages = [...messages, newMessage];

  //   setMessages(newMessages);
  //   setInputText("");

  //   // Scroll to bottom after sending message
  //   setTimeout(() => {
  //     scrollViewRef.current?.scrollToEnd({ animated: true });
  //   }, 100);

  //   setTimeout(() => {
  //     addFakeResponse(newMessages);
  //   }, 800);
  // }, [messages, setMessages, inputText]);

  // const addFakeResponse = (currentMessages: Message[]) => {
  //   const newMessage: Message = {
  //     id: Date.now().toString(),
  //     text: "This is a fake response",
  //     sender: "other",
  //     timestamp: new Date(),
  //   };
  //   setMessages([...currentMessages, newMessage]);
  //   setTimeout(() => {
  //     scrollViewRef.current?.scrollToEnd({ animated: true });
  //   }, 100);
  // };

  const renderMessage = (message: Message) => {
    const isUser = message.sender === "user";
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.otherMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.otherMessageText,
          ]}
        >
          {message.text}
        </Text>
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {messages.map(renderMessage)}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={inputText.trim() === ""}
        >
          <Icon type={IconTypes.Ionicons} name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    marginBottom: 32,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    padding: 10,
  },
  messageContainer: {
    maxWidth: "80%",
    marginVertical: 5,
    padding: 10,
    borderRadius: 15,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: theme.surfaceElevated,
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: theme.text,
  },
  timestamp: {
    fontSize: 12,
    color: theme.textTertiary,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: theme.inputBackground,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
    color: theme.text,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
