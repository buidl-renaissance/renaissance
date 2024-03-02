import React from "react";
import { View, StyleSheet } from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import ProposalCard from "../Components/ProposalCard";
import { ProposalData, getProposal } from "../utils/proposal";
import { EventRegister } from "react-native-event-listeners";

interface ProposalDetailScreenProps {
  navigation;
  route: {
    params: {
      proposal: ProposalData;
    };
  };
}

const ProposalDetailScreen: React.FC<ProposalDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const [proposal, setProposal] = React.useState(route.params.proposal);

  navigation.setOptions({
    headerTitle: `Proposal #${proposal.id}`,
  });

  const fetchProposal = React.useCallback(() => {
    (async () => {
      if (proposal.id === 0 || proposal.id) {
        const fetchedProposal = await getProposal(proposal.id);
        if (fetchedProposal) setProposal(fetchedProposal);
      }
    })();
  }, []);

  React.useEffect(() => {
    const listener = EventRegister.addEventListener(
      "UpdateProposalsEvent",
      () => {
        fetchProposal();
      }
    );
    return () => {
      if (typeof listener === "string")
        EventRegister.removeEventListener(listener);
    };
  }, []);
  // Sample chat messages for demonstration purposes
  const [messages, setMessages] = React.useState<IMessage[]>([]);

  const onSend = (newMessages: IMessage[]) => {
    setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
  };

  return (
    <View style={styles.container}>
      <ProposalCard proposal={proposal} showDetails={true} />
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
