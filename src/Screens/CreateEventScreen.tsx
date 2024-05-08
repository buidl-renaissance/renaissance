import React from "react";
import {
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  Text,
  View,
} from "react-native";

import { HeaderTitleImage } from "../Components/HeaderTitleImage";
import { TextInputGroup } from "../Components/TextInputGroup";
import { Button } from "../Components/Button";
import { EventCard } from "../Components/EventCard";
import DateTimePicker from "../Components/DateTimePicker";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import { useVenues } from "../hooks/useVenues";
import { createEvent } from "../dpop";

import { lightGreen, darkGrey } from "../colors";
import { DAVenue } from "../interfaces";
import moment from "moment";

const CreateEventScreen = ({ navigation, route }) => {
  navigation.setOptions({
    headerTitle: () => <HeaderTitleImage />,
  });

  const [title, onChangeTitle] = React.useState<string>("");
  const [desc, onChangeDesc] = React.useState<string>("");

  const [venue, onChangeVenue] = React.useState<DAVenue>();

  const [venues] = useVenues();

  const [startDate, setStartDate] = React.useState<Date>(
    moment().add('hour', 1).startOf("hour").toDate()
  );
  const [endDate, setEndDate] = React.useState<Date>(
    moment().add('hour', 4).startOf("hour").toDate()
  );

  const setSelectedItem = React.useCallback(
    (item) => {
      console.log("Selected Item: ", item);
      if (venues?.length) onChangeVenue(item);
    },
    [venues]
  );

  const onChangeStartDate = React.useCallback((date) => {
    setStartDate(date);
    setEndDate(moment(date).add(4, "hour").toDate());
  }, []);

  const onChangeEndDate = React.useCallback((date) => {
    setEndDate(date);
  }, []);

  const handleCreate = React.useCallback(() => {
    (async () => {
      await createEvent(
        title,
        desc,
        venue,
        startDate?.toISOString(),
        endDate?.toISOString()
      );
    })();
  }, [title, desc, venue, startDate, endDate]);

  return (
    <AutocompleteDropdownContextProvider headerOffset={88}>
      <View style={styles.container}>
        <ScrollView style={{ padding: 16 }}>
          <TextInputGroup
            label="Title"
            placeholder="Title (required)"
            onChangeText={onChangeTitle}
            style={styles.input}
            value={title}
          />
          <TextInputGroup
            label="Description"
            placeholder="Description"
            multiline={true}
            onChangeText={onChangeDesc}
            value={desc}
            style={[
              {
                height: 80,
              },
              styles.input,
            ]}
          />
          <Text>Location</Text>
          <AutocompleteDropdown
            clearOnFocus={false}
            closeOnBlur={true}
            closeOnSubmit={false}
            onSelectItem={setSelectedItem}
            suggestionsListMaxHeight={Dimensions.get("window").height * 0.4}
            containerStyle={{ marginBottom: 8 }}
            dataSet={venues.map((venue) => {
              return { id: `${venue.id}`, title: venue.title };
            })}
          />
          <DateTimePicker
            date={startDate}
            label="Start Date / Time"
            onDateChange={onChangeStartDate}
            style={styles.input}
          />
          <DateTimePicker
            date={endDate}
            label="End Date / Time"
            onDateChange={onChangeEndDate}
            style={styles.input}
          />
        </ScrollView>
        <View style={styles.buttonContainer}>
          <Button title="Create" variant="solid" onPress={handleCreate} />
        </View>
      </View>
    </AutocompleteDropdownContextProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    flexDirection: "column",
    borderColor: "#999",
    borderTopWidth: 1,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 32,
    borderColor: "#999",
    borderBottomWidth: 1,
    // backgroundColor: lightGreen,
    backgroundColor: darkGrey,
  },
  input: {
    backgroundColor: "#e5ecf3",
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
});

export default CreateEventScreen;
