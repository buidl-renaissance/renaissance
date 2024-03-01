import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { DAProposal } from "../interfaces";
import { ExampleProposals } from "../mocks/proposals";
import ProposalCard from "../Components/ProposalCard";
import { FloatingButton } from "../Components/FloatingButton";
import { getProposals } from "../utils/proposal";
// import { HeaderTitleImage } from "../Components/HeaderTitleImage";

const ProposalListScreen = ({ navigation }) => {

  navigation.setOptions({
    headerTitle: "Proposals",
  });

  const [proposals, setProposals] =
    React.useState<DAProposal[]>(ExampleProposals);

  React.useEffect(() => {
    (async () => {
      // const proposalRes = await createProposal(description);
      const fetchedProps = await getProposals();
      // const vote = await voteProposal(to);
      // const proposal = await proposalRes.toJSON()
      // proposal.storedData()
      console.log("fetchedProps: ", fetchedProps);
      // setProposalId(Number(proposal.hex));
      // const res = await getProposal(proposal.to);
      // console.log(res);
      // console.log("stored data: ", proposal.getStoredData())
    })();
  }, []);

  const handleAddProposal = React.useCallback(() => {
    navigation.push("CreateProposal");
  }, []);

  const handleShowProposalDetail = React.useCallback((proposal: DAProposal) => {
    navigation.push("ProposalDetail", {
      proposal,
    });
  }, []);

  return (
    <View style={styles.container}>
      {proposals.length === 0 ? (
        <Text>No proposals available.</Text>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={proposals}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProposalCard proposal={item} onPress={handleShowProposalDetail} />
          )}
        />
      )}
      <FloatingButton onPress={handleAddProposal} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingBottom: 100,
  },
});

export default ProposalListScreen;
