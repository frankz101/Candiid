import { StateCreator } from "zustand";

export interface PhotoDetails {
  fileUrl: string;
  takenAt: string;
  takenBy: string;
}

export interface PostDetails {
  hangoutId: string;
  photos: PhotoDetails[];
  caption: string;
}

export interface PostSlice {
  postDetails: PostDetails;
  setPostDetails: (postDetails: PostDetails) => void;
}

export const createPostSlice: StateCreator<PostSlice> = (set) => ({
  postDetails: {
    hangoutId: "",
    photos: [],
    caption: "",
  },
  setPostDetails: (postDetails) =>
    set((state) => ({
      postDetails: {
        ...state.postDetails,
        ...postDetails,
      },
    })),
});
