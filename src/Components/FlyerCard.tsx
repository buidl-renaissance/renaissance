import React from "react";
import {
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { DAEvent, DAFlyer } from "../interfaces";
import { EventCard } from "./EventCard";
import { Button } from "./Button";

interface FlyerCardProps {
  flyer: DAFlyer;
  onSelectEvent: (event: DAEvent) => void;
}

export const FlyerCard = ({ flyer, onSelectEvent }: FlyerCardProps) => {
  const [numAttending, setNumAttending] = React.useState<number>(17);
  const [isAttending, setIsAttending] = React.useState<boolean>(false);
  const handleImGoing = React.useCallback(() => {
    console.log(isAttending, numAttending);
    if (!isAttending) {
      setNumAttending(numAttending + 1);
      setIsAttending(true);
    } else {
      setNumAttending(numAttending - 1);
      setIsAttending(false);
    }
  }, [numAttending, isAttending]);
  const handleImInterested = React.useCallback(() => {}, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onSelectEvent(flyer.event)}>
        <Image
          source={{
            uri: flyer.data.imageUrl,
          }}
          style={{
            height: Dimensions.get("window").width - 32,
            width: Dimensions.get("window").width - 32,
            resizeMode: "cover",
          }}
        />
      </TouchableOpacity>
      {flyer.event && (
        <EventCard
          event={flyer.event}
          options={{
            showBookmark: true,
            showDate: true,
            showVenue: true,
            showImage: false,
          }}
          onSelectEvent={() => onSelectEvent(flyer.event)}
        >
          {/* <Text>{flyer.user.name}</Text> */}
          <View style={{ marginLeft: 52, marginBottom: 12 }}>
            <Text style={{ fontSize: 12 }}>
              {numAttending} people are going
            </Text>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 8,
                marginTop: 4,
              }}
            >
              <Button
                size="small"
                title={isAttending ? "I'm goin!" : "RSVP"}
                onPress={handleImGoing}
              />
              <Button
                size="small"
                title="I'm interested"
                onPress={handleImInterested}
              />
            </View>
          </View>
        </EventCard>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // padding: 4,
    // borderBottomColor: "#bcd0c7",
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 14,
    borderColor: "#ccc",
    borderWidth: 1,
    borderBottomWidth: 1,
    overflow: "hidden",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 12,
    width: "auto",
    fontWeight: "500",
  },
  tagsContainer: {
    paddingVertical: 4,
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
  },
  chip: {
    color: "#28303d",
    borderColor: "#28303d",
    borderWidth: 1,
    paddingHorizontal: 4,
    // paddingVertical: 1,
    marginTop: 4,
    marginRight: 4,
    marginBottom: 4,
  },
});

// borderColor: '#ddd', borderWidth: 1, borderRadius: 4,
