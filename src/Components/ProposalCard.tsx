import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, Card, Title, Paragraph, Icon } from "react-native-paper";
import { ProposalData, stakeTokens, voteOnProposal } from "../utils/proposal";
import { EventRegister } from "react-native-event-listeners";

interface ProposalCardProps {
  proposal: ProposalData;
  showDetails?: boolean;
  onPress?: (proposal: ProposalData) => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  showDetails,
  onPress,
}) => {
  const { id, category, title, description, body, budget } = proposal;

  const handleUpVote = React.useCallback(() => {
    (async () => {
      await voteOnProposal(`${proposal.id}`, true);
      EventRegister.emitEvent("UpdateProposalsEvent");
    })();
  }, [proposal]);

  const handleDownVote = React.useCallback(() => {
    (async () => {
      await voteOnProposal(`${proposal.id}`, false);
      EventRegister.emitEvent("UpdateProposalsEvent");
    })();
  }, [proposal]);

  const handleStake = React.useCallback(() => {
    (async () => {
      await stakeTokens(`${proposal.id}`, 10);
      EventRegister.emitEvent("UpdateProposalsEvent");
    })();
  }, [proposal]);

  const handleShowDetail = React.useCallback(() => {
    onPress ? onPress(proposal) : null;
  }, [proposal]);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text
          style={{ fontWeight: "bold", fontSize: 22, marginBottom: 4 }}
        >{`#${id} - ${title}`}</Text>
        {category && (
          <Text
            style={{
              marginBottom: 8,
              fontWeight: "500",
              fontStyle: "italic",
              color: "gray",
            }}
          >{`${category}`}</Text>
        )}
        <Text
          style={{
            marginBottom: 8,
          }}
        >{`${description}`}</Text>
        <Text
          style={{
            marginBottom: 8,
            fontWeight: "500",
            fontStyle: "italic",
          }}
        >{`Est. Budget: ${budget}`}</Text>
        {showDetails ? (
          <View>
            <Text
              style={{ fontSize: 14, fontWeight: "bold", marginVertical: 4 }}
            >
              Proposal Details:
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 8 }}>{body}</Text>
          </View>
        ) : (
          <View
            style={{
              borderBottomColor: "#ccc",
              borderBottomWidth: 1,
              paddingBottom: 8,
            }}
          >
            <Button
              onPress={handleShowDetail}
              style={{
                alignContent: "flex-end",
                borderColor: "#7c1aed",
                borderWidth: 1,
              }}
            >
              See Details
            </Button>
          </View>
        )}
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <Button onPress={handleStake}>
          Staked (§{proposal.tokensStaked})
        </Button>
        <Button icon="thumb-up" onPress={handleUpVote}>
          {proposal.forVotes}
        </Button>
        <Button icon="thumb-down" onPress={handleDownVote}>
          {proposal.againstVotes}
        </Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  actions: {
    justifyContent: "flex-end",
  },
});

export default ProposalCard;
