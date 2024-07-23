import React from "react";
import { Text, View } from "react-native";
import { DAEvent } from "../interfaces";
import { Button } from "./Button";
import { submitEventRsvp } from "../dpop";

interface EventParticipationProps {
  event: DAEvent;
}

const EventParticipation: React.FC<EventParticipationProps> = ({ event }) => {
  const [numGoing, setNumGoing] = React.useState<number>(event.stats?.num_going ?? 0);
  const [numInterested, setNumInterested] = React.useState<number>(event.stats?.num_interested ?? 0);
  const [isGoing, setIsGoing] = React.useState<boolean>(false);
  const [isInterested, setIsInterested] = React.useState<boolean>(false);

  const handleImGoing = React.useCallback(() => {
    if (!isGoing) {
      setNumGoing(numGoing + 1);
      setIsGoing(true);
      submitEventRsvp(event.slug, 'going');
    } else {
      setNumGoing(numGoing - 1);
      setIsGoing(false);
    }
  }, [numGoing, isGoing]);

  const handleImInterested = React.useCallback(() => {
    if (!isInterested) {
      setNumInterested(numInterested + 1);
      setIsInterested(true);
      submitEventRsvp(event.slug, 'interested');
    } else {
      setNumInterested(numInterested - 1);
      setIsInterested(false);
    }
  }, [numInterested, isInterested]);

  const [desc, setDesc] = React.useState<string>("");
  React.useEffect(() => {
    const d: string[] = [];
    if (numGoing) {
      d.push(`${numGoing} going`);
    }
    if (numInterested) {
      d.push(`${numInterested} interested`);
    }
    setDesc(d.join(", "));
  }, [numGoing, numInterested]);

  return (
    <View style={{ marginLeft: 52, marginBottom: 12 }}>
      {desc?.length > 0 && <Text style={{ fontSize: 12 }}>{desc}</Text>}
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 8,
          marginTop: 4,
        }}
      >
        <Button
          active={isGoing}
          size="small"
          title="I'm going!"
          onPress={handleImGoing}
        />
        <Button
          active={isInterested}
          size="small"
          title="I'm interested"
          onPress={handleImInterested}
        />
      </View>
    </View>
  );
};

export default EventParticipation;
