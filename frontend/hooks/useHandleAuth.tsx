import { useAuth, useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useEffect } from "react";

export const useHandleAuth = () => {
  const { isLoaded, user } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      const userData = {
        userId: user?.id,
        email: user?.emailAddresses,
      };

      axios
        .post("http://localhost:3001/users", userData)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [isLoaded]);
};
