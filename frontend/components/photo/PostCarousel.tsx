import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import PhotoPost from "./PhotoPost";

const { width: screenWidth } = Dimensions.get("window");
const postWidth = screenWidth;
const postHeight = postWidth * (5 / 4);

interface ImageData {
  fileUrl: string;
}

interface PostCarouselProps {
  images: ImageData[];
}

const PostCarousel: React.FC<PostCarouselProps> = ({ images }) => {
  return (
    <View style={styles.carouselContainer}>
      <Carousel
        width={screenWidth}
        height={postHeight}
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
