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
      const fetchedProposals = await getProposals();
      setProposals(fetchedProposals);
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
