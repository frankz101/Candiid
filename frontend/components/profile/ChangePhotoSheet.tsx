import React from "react";
import { View, Text, Button } from "react-native";
import ActionSheet from "react-native-actions-sheet";
import ImagePicker from "react-native-image-crop-picker";
import { SheetManager } from "react-native-actions-sheet";
import { useUser } from "@clerk/clerk-expo";
import axios, { AxiosResponse } from "axios";
import RNFetchBlob from "rn-fetch-blob";
import { useQueryClient } from "@tanstack/react-query";

const ChangePhotoSheet = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const handleProfilePhoto = async (image: any) => {
    closeChangePhotoSheet();
    try {
      RNFetchBlob.fetch(
        "PUT",
        `${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/profile-photo`,
        {
          "Content-Type": "multipart/form-data",
        },
        [
          {
            name: "profilePhoto",
            filename: `profile-photo.${image.mime.split("/")[1]}`,
            data: RNFetchBlob.wrap(image.path),
          },
        ]
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("Profile photo change success:", data);
          queryClient.invalidateQueries({
            queryKey: ["profile", user?.id],
          });
        })
        .catch((error) => {
          console.error("Error changing profile photo:", error);
        });
    } catch (error) {
      console.error("Error channging profile photo:", error);
    }
  };

  const removeProfilePhoto = async () => {
    closeChangePhotoSheet();
    try {
      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_API_URL}/user/${user?.id}/profile-photo`
      );
      console.log("Profile photo removed successfully:", response.data);
      queryClient.invalidateQueries({
        queryKey: ["profile", user?.id],
      });
    } catch (error) {
      console.error("Error removing profile photo:", error);
    }
  };

  const closeChangePhotoSheet = () => {
    SheetManager.hide("change-photo");
  };

  const openImagePicker = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      cropperCircleOverlay: true, // Optional: if you want a circular cropper
    })
      .then((image) => {
        handleProfilePhoto(image);
      })
      .catch((error) => {
        console.error("Error selecting image:", error);
      });
  };

  return (
    <ActionSheet>
      <View>
        {/* <Button title="Take Photo" onPress={() => {}} /> */}
        <Button title="Choose from Library" onPress={openImagePicker} />
        <Button title="Remove profile photo" onPress={removeProfilePhoto} />
        <Button title="Cancel" onPress={closeChangePhotoSheet} />
      </View>
    </ActionSheet>
  );
};

export default ChangePhotoSheet;
