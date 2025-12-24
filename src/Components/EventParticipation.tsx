import React from "react";
import { Text, View } from "react-native";
import { DAEvent } from "../interfaces";
import { Button } from "./Button";
import { submitEventRsvp } from "../dpop";
import { getGoingStatus, toggleGoingStatus } from "../utils/rsvp";
import { EventRegister } from "react-native-event-listeners";

interface EventParticipationProps {
  event: DAEvent;
}

const EventParticipation: React.FC<EventParticipationProps> = ({ event }) => {
  const [numGoing, setNumGoing] = React.useState<number>(event.stats?.num_going ?? 0);
  const [numInterested, setNumInterested] = React.useState<number>(event.stats?.num_interested ?? 0);
  const [isGoing, setIsGoing] = React.useState<boolean>(false);
  const [isInterested, setIsInterested] = React.useState<boolean>(false);

  // Load persisted going status on mount
  React.useEffect(() => {
    (async () => {
      const goingStatus = await getGoingStatus(event);
      setIsGoing(goingStatus);
    })();
  }, [event]);

  // Listen for going status changes from other components
  React.useEffect(() => {
    const listener = EventRegister.addEventListener("GoingEvent", (data) => {
      if (event.id === data.event?.id) {
        setIsGoing(data.isGoing);
      }
    });
    return () => {
      if (typeof listener === "string") {
        EventRegister.removeEventListener(listener);
      }
    };
  }, [event]);

  const handleImGoing = React.useCallback(async () => {
    if (!isGoing) {
      setNumGoing(numGoing + 1);
      setIsGoing(true);
      await toggleGoingStatus(event);
      submitEventRsvp(event.slug, 'going');
      // Emit event for other components to update
      EventRegister.emitEvent("GoingEvent", {
        event,
        isGoing: true,
      });
    } else {
      setNumGoing(numGoing - 1);
      setIsGoing(false);
      await toggleGoingStatus(event);
      // Emit event for other components to update
      EventRegister.emitEvent("GoingEvent", {
        event,
        isGoing: false,
      });
    }
  }, [numGoing, isGoing, event]);

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
