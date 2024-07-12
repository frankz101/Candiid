import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Carousel, {
  Pagination,
  ICarouselInstance,
} from "react-native-reanimated-carousel";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import PhotoPost from "./PhotoPost";
import { Image } from "expo-image";
import { useSharedValue } from "react-native-reanimated";

export interface ImageData {
  fileUrl: string;
  takenAt?: string;
  takenBy?: string;
}

interface PostCarouselProps {
  images: ImageData[];
  width: number;
  height: number;
}

const PostCarousel: React.FC<PostCarouselProps> = ({
  images,
  width,
  height,
}) => {
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };
  return (
    <View>
      <Carousel
        width={width}
        height={height}
        data={images}
        onProgressChange={progress}
        renderItem={({ item }: { item: ImageData }) => (
          <View style={[styles.carouselContainer, { width, height }]}>
            <PhotoPost imageUrl={item.fileUrl} />
          </View>
        )}
        autoPlay={false}
        loop={false}
      />
      <Pagination.Basic
        progress={progress}
        data={images}
        dotStyle={{
          width: wp(2.5),
          height: wp(2.5),
          borderRadius: wp(2.5) / 2,
          backgroundColor: "rgba(44, 44, 48, 0.50)",
          margin: wp(1),
        }}
        activeDotStyle={{
          width: wp(2.5),
          height: wp(2.5),
          borderRadius: wp(2.5) / 2,
          backgroundColor: "#FFF", // Red color for the active dot
        }}
        containerStyle={{
          paddingTop: hp(1),
          backgroundColor: "transparent",
        }}
        onPress={onPressPagination}
      />
    </View>
  );
};

export default PostCarousel;

const styles = StyleSheet.create({
  carouselContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
