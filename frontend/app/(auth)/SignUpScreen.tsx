import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import { useOAuth, useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useRouter } from "expo-router";
import BaseScreen from "@/components/utils/BaseScreen";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

enum Strategy {
  Google = "oauth_google",
  Apple = "oauth_apple",
}

const Login = () => {
  useWarmUpBrowser();

  // const { startOAuthFlow: googleAuth } = useOAuth({ strategy: "oauth_google" });
  // const { startOAuthFlow: appleAuth } = useOAuth({ strategy: "oauth_apple" });

  const router = useRouter();

  // const onSelectAuth = async (strategy: Strategy) => {
  //   const selectedAuth = {
  //     [Strategy.Google]: googleAuth,
  //     [Strategy.Apple]: appleAuth,
  //   }[strategy];

  //   try {
  //     const { createdSessionId, signIn, signUp, setActive } =
  //       await selectedAuth();
  //     if (createdSessionId) {
  //       setActive?.({ session: createdSessionId });
  //       setUserSignedIn(true);
  //     }
  //   } catch (err) {
  //     console.error("OAuth Error: ", err);
  //   }
  // };

  return (
    <BaseScreen style={styles.container}>
      {/* <Pressable onPress={() => onSelectAuth(Strategy.Google)}>
        <Text>Login with Google</Text>
      </Pressable> */}
      <View style={styles.logo}></View>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: pressed
              ? "rgba(85, 85, 85, 0.7)"
              : "rgba(85, 85, 85, 0.5)",
          },
        ]}
        onPress={() => {
          router.push("/PhoneNumberScreen");
        }}
      >
        <Text style={styles.text}>Get started</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: pressed
              ? "rgba(85, 85, 85, 0.7)"
              : "rgba(85, 85, 85, 0.5)",
          },
        ]}
        onPress={() => {
          router.push("/LoginScreen");
        }}
      >
        <Text style={styles.text}>I already have an account</Text>
      </Pressable>
    </BaseScreen>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: hp(4),
  },
  logo: {
    height: hp(15),
    width: hp(15),
    backgroundColor: "white",
    marginBottom: hp(25),
  },
  button: {
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 5,
    height: hp(6),
    width: hp(30),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontFamily: "Inter",
    fontWeight: "bold",
  },
});

// import { Pressable, StyleSheet, Text, View } from "react-native";
// import React, { useEffect, useState } from "react";
// import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
// import { useOAuth, useUser } from "@clerk/clerk-expo";
// import { SafeAreaView } from "react-native-safe-area-context";
// import axios from "axios";
// import { TextInput } from "react-native-gesture-handler";

// enum Strategy {
//   Google = "oauth_google",
//   Apple = "oauth_apple",
// }

// const Login = () => {
//   useWarmUpBrowser();
//   const { isLoaded, user } = useUser();
//   const [userSignedIn, setUserSignedIn] = useState(false);

//   const { startOAuthFlow: googleAuth } = useOAuth({ strategy: "oauth_google" });
//   const { startOAuthFlow: appleAuth } = useOAuth({ strategy: "oauth_apple" });

//   useEffect(() => {
//     if (userSignedIn && isLoaded && user) {
//       const userData = {
//         userId: user.id,
//         username: user.firstName,
//         email: user.primaryEmailAddress?.emailAddress,
//       };

//       axios
//         .post("http://localhost:3001/users", userData)
//         .then((response) => {
//           console.log(response.data.message);
//         })
//         .catch((error) => {
//           console.error(error);
//         });
//     }
//   }, [userSignedIn, isLoaded, user]);

//   const onSelectAuth = async (strategy: Strategy) => {
//     const selectedAuth = {
//       [Strategy.Google]: googleAuth,
//       [Strategy.Apple]: appleAuth,
//     }[strategy];

//     try {
//       const { createdSessionId, signIn, signUp, setActive } =
//         await selectedAuth();
//       if (createdSessionId) {
//         setActive?.({ session: createdSessionId });
//         setUserSignedIn(true);
//       }
//     } catch (err) {
//       console.error("OAuth Error: ", err);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <Pressable onPress={() => onSelectAuth(Strategy.Google)}>
//         <Text>Login with Google</Text>
//       </Pressable>

//     </SafeAreaView>
//   );
// };

// export default Login;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });
