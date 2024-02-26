import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { DAProposal } from "../interfaces";
import ProposalCard from "../Components/ProposalCard";

interface ProposalDetailScreenProps {
  route: {
    params: {
      proposal: DAProposal;
    };
  };
}

const ProposalDetailScreen: React.FC<ProposalDetailScreenProps> = ({
  route,
}) => {
  const { proposal } = route.params;

  // Sample chat messages for demonstration purposes
  const [messages, setMessages] = useState<IMessage[]>([
    {
      _id: 1,
      text: "Hello! I have some questions about your proposal.",
      createdAt: new Date(),
      user: {
        _id: 2,
        name: "John Doe",
      },
    },
    {
      _id: 2,
      text: "Sure, feel free to ask anything!",
      createdAt: new Date(),
      user: {
        _id: 1,
        name: "Proposal Owner",
      },
    },
  ]);

  const onSend = (newMessages: IMessage[]) => {
    setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
  };

  return (
    <View style={styles.container}>
      <ProposalCard proposal={proposal} />

      {/* Add more details or actions related to the proposal as needed */}

      <View style={styles.chatContainer}>
        <GiftedChat
          messages={messages}
          onSend={(newMessages) => onSend(newMessages)}
          user={{
            _id: 1, // This would typically be the user's ID from your authentication system
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    marginTop: 16,
    marginBottom: 32,
  },
});

export default ProposalDetailScreen;
