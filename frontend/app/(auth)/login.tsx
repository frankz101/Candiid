import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import { useOAuth } from "@clerk/clerk-expo";

enum Strategy {
  Google = "oauth_google",
  Apple = "oauth_apple",
}

const Login = () => {
  useWarmUpBrowser();

  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: "oauth_apple" });

  const onSelectAuth = async (strategy: Strategy) => {
    const selectedAuth = {
      [Strategy.Google]: googleAuth,
      [Strategy.Apple]: appleAuth,
    }[strategy];

    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await selectedAuth();
      if (createdSessionId) {
        setActive?.({ session: createdSessionId });
      }
    } catch (err) {
      console.error("OAuth Error: ", err);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => onSelectAuth(Strategy.Google)}>
        <Text>Login with Google</Text>
      </Pressable>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
