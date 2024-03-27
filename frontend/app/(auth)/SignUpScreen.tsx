import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import { useOAuth, useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useRouter } from "expo-router";

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
    <SafeAreaView style={styles.container}>
      {/* <Pressable onPress={() => onSelectAuth(Strategy.Google)}>
        <Text>Login with Google</Text>
      </Pressable> */}
      <Pressable
        onPress={() => {
          router.push("/PhoneNumberScreen");
        }}
      >
        <Text>Sign up with phone</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          router.push("/LoginScreen");
        }}
      >
        <Text>Login with phone</Text>
      </Pressable>
    </SafeAreaView>
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
