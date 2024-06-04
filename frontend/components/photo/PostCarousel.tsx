import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import PhotoPost from "./PhotoPost";

export interface ImageData {
  fileUrl: string;
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
  console.log(images);
  return (
    <View style={[styles.carouselContainer, { width, height }]}>
      <Carousel
        width={width}
        height={height}
        data={images}
        renderItem={({ item }: { item: ImageData }) => (
          <PhotoPost imageUrl={item.fileUrl} />
        )}
        autoPlay={false}
        loop={false}
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
