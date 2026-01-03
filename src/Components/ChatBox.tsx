import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TextInput } from "./Styled/TextInput";
import { Button } from "./Button";
import { DAComment } from "../interfaces";
import { styledInput } from "./Styles";
import { theme } from "../colors";

const CommentBox = ({ comment }: { comment: DAComment }) => {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        paddingVertical: 4,
      }}
    >
      <Text style={{ fontWeight: "bold", color: theme.text }}>{comment.user?.name}: </Text>
      <Text style={{ color: theme.text }}>{comment.text}</Text>
    </View>
  );
};

export const ChatBox = ({ comments, handleSubmit }) => {
  const [text, setText] = React.useState<string>("");
  return (
    <View
      style={{
        margin: 16,
        borderColor: theme.border,
        borderWidth: 1,
        padding: 16,
        backgroundColor: theme.surface,
      }}
    >
      {comments?.map((comment: DAComment, index: number) => (
        <CommentBox key={index} comment={comment} />
      ))}
      {/* <View style={{ display: "flex", flexDirection: "row", gap: 8 }}>
        <Button
          size="small"
          title="I'm going"
          onPress={() => {
            handleSubmit("I'm going");
            setText("");
          }}
        />
        <Button
          size="small"
          title="I'm interested"
          onPress={() => {
            handleSubmit("I'm interested");
            setText("");
          }}
        />
      </View> */}
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <TextInput
          placeholder="What Up Doe?..."
          value={text}
          onChangeText={(text) => setText(text)}
          style={styles.input}
        />
        <Button
          size="small"
          title="Send"
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
    height: 34,
    borderColor: theme.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexGrow: 1,
    // marginHorizontal: 16,
  },
});
