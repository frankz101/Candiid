import React from "react";
import {
  StyleSheet,
  TextInput,
  Text,
  View,
  Keyboard,
  Button,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type SearchBarProps = {
  clicked: boolean;
  searchPhrase: string;
  setSearchPhrase: (phrase: string) => void;
  setClicked: (clicked: boolean) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({
  clicked,
  searchPhrase,
  setSearchPhrase,
  setClicked,
}) => {
  return (
    <View style={styles.container}>
      <View
        style={
          clicked ? styles.searchBar__clicked : styles.searchBar__unclicked
        }
      >
        <Ionicons
          name="search"
          size={20}
          color="black"
          style={{ marginLeft: 1 }}
        />
        <TextInput
          style={styles.input}
          placeholder="Search Friends"
          value={searchPhrase}
          onChangeText={setSearchPhrase}
          onFocus={() => {
            setClicked(true);
          }}
        />
      </View>
      {clicked && (
        <View>
          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              setClicked(false);
              setSearchPhrase("");
            }}
          >
            <Text>Cancel</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};
export default SearchBar;

// styles
const styles = StyleSheet.create({
  container: {
    margin: 15,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    width: "90%",
  },
  searchBar__unclicked: {
    padding: 10,
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#d9dbda",
    borderRadius: 15,
    alignItems: "center",
  },
  searchBar__clicked: {
    padding: 10,
    flexDirection: "row",
    width: "80%",
    backgroundColor: "#d9dbda",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  input: {
    fontSize: 20,
    marginLeft: 10,
    width: "90%",
  },
});
