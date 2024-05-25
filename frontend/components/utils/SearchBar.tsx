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
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type SearchBarProps = {
  clicked: boolean;
  searchPhrase: string;
  placeholder: string;
  setSearchPhrase: (phrase: string) => void;
  setClicked: (clicked: boolean) => void;
  onSubmit: () => void;
};

const SearchBar: React.FC<SearchBarProps> = ({
  clicked,
  searchPhrase,
  placeholder,
  setSearchPhrase,
  setClicked,
  onSubmit,
}) => {
  return (
    <View style={styles.container}>
      <View
        style={
          clicked ? styles.searchBar__clicked : styles.searchBar__unclicked
        }
      >
        <Pressable onPress={onSubmit}>
          <Ionicons
            name="search"
            size={20}
            color="#F2F2F2"
            style={{ marginLeft: 1 }}
          />
        </Pressable>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#F2F2F2"
          value={searchPhrase}
          onChangeText={setSearchPhrase}
          onFocus={() => {
            setClicked(true);
          }}
          onSubmitEditing={() => onSubmit}
          accessibilityLabel="search-bar"
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
            <Text style={{ color: "#FFF" }}>Cancel</Text>
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
    marginTop: hp(2),
    marginLeft: wp(2),
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    width: wp("95%"),
  },
  searchBar__unclicked: {
    padding: 14,
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#252525",
    borderRadius: 5,
    alignItems: "center",
  },
  searchBar__clicked: {
    padding: 14,
    flexDirection: "row",
    width: "85%",
    backgroundColor: "#252525",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  input: {
    fontSize: 14,
    marginLeft: 10,
    width: "90%",
  },
});
