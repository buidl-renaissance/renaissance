import React from "react";
import { StyleSheet } from "react-native";
import { Button, Card, Title, Paragraph } from "react-native-paper";
import { DAProposal } from "../interfaces";

interface ProposalCardProps {
  proposal: DAProposal;
  onPress?: (proposal: DAProposal) => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, onPress }) => {
  const { id, title, description, budget } = proposal;

  const handleVote = React.useCallback(() => {
    console.log("handleVote: ", proposal);
  }, [proposal]);

  const handleStake = React.useCallback(() => {
    console.log("handleStake: ", proposal);
  }, [proposal]);

  const handleShowDetail = React.useCallback(() => {
    onPress ? onPress(proposal) : null;
  }, [proposal]);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{`Proposal #${id}`}</Title>
        <Paragraph>{`Title: ${title}`}</Paragraph>
        <Paragraph>{`Description: ${description}`}</Paragraph>
        <Paragraph>{`Budget: ${budget}`}</Paragraph>
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <Button onPress={handleShowDetail}>Details</Button>
        <Button icon="thumb-up" onPress={handleVote}>
          Vote
        </Button>
        <Button icon="currency-usd" onPress={handleStake}>
          Stake
        </Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    marginHorizontal: 16,
  },
  actions: {
    justifyContent: "flex-end",
  },
});

export default ProposalCard;
