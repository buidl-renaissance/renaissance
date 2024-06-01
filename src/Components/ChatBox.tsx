import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TextInput } from "./Styled/TextInput";
import { Button } from "./Button";
import { DAComment } from "../interfaces";

const CommentBox = ({ comment }: { comment: DAComment }) => {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        paddingVertical: 4,
      }}
    >
      <Text style={{ fontWeight: "bold" }}>{comment.user?.name}: </Text>
      <Text>{comment.text}</Text>
    </View>
  );
};

export const ChatBox = ({ comments, handleSubmit }) => {
  const [text, setText] = React.useState<string>("");
  return (
    <View style={{ margin: 16, borderColor: "grey", borderWidth: 1, padding: 16, backgroundColor: "white" }}>
      {comments?.map((comment: DAComment) => (
        <CommentBox comment={comment} />
      ))}
      <TextInput
        placeholder="What Up Doe?..."
        value={text}
        onChangeText={(text) => setText(text)}
        style={styles.input}
      />
      <View>
        <Button
          title="Submit Comment"
          onPress={() => {
            handleSubmit(text);
            setText("");
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 10,
    // marginHorizontal: 16,
  },
});
