import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
// import { DAProposal } from "../interfaces";
// import { ExampleProposals } from "../mocks/proposals";
import ProposalCard from "../Components/ProposalCard";
import { FloatingButton } from "../Components/FloatingButton";
import { ProposalData, getProposals } from "../utils/proposal";
// import { HeaderTitleImage } from "../Components/HeaderTitleImage";
import { EventRegister } from "react-native-event-listeners";
import { Button } from "../Components/Button";

const ProposalListScreen = ({ navigation }) => {
  const [proposals, setProposals] = React.useState<ProposalData[]>([]);

  navigation.setOptions({
    headerTitle: "Proposals",
  });

  const fetchProposals = React.useCallback(() => {
    (async () => {
      const fetchedProposals = await getProposals();
      setProposals(fetchedProposals);
    })();
  }, []);

  React.useEffect(() => {
    const listener = EventRegister.addEventListener(
      "UpdateProposalsEvent",
      (data) => {
        fetchProposals();
      }
    );
    return () => {
      if (typeof listener === "string")
        EventRegister.removeEventListener(listener);
    };
  }, []);

  React.useEffect(() => {
    fetchProposals();
  }, []);

  const handleAddProposal = React.useCallback(() => {
    navigation.push("CreateProposal");
  }, []);

  const handleShowProposalDetail = React.useCallback((proposal: ProposalData) => {
    navigation.push("ProposalDetail", {
      proposal,
    });
  }, []);

  return (
    <View style={styles.container}>
      {proposals?.length < 1 ? (
        <View>
          <Text>No proposals available.</Text>
          <Button onPress={handleAddProposal} title="Create Proposal" />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={proposals}
          keyExtractor={(item, i) => item.id?.toString() ?? `item-${i}`}
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
