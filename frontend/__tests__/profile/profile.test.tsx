import React from "react";
import { fireEvent, render, screen } from "../../test-utils";
import Profile from "@/app/(tabs)/profile";
import * as ReactQuery from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "expo-router";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const delayedResolve = (data: any) => {
  return new Promise((resolve) => setTimeout(() => resolve({ data }), 100)); // 100 ms delay
};

mockedAxios.get.mockImplementation((url) => {
  if (url.includes("/memories/")) {
    return delayedResolve([
      {
        id: "0WbC7U7E6Xjr194vqlO3",
        postY: -75.33332824707031,
        createdAt: {
          seconds: 1711857204,
          nanoseconds: 519000000,
        },
        postX: -113,
        hangoutId: "aUbMBlWu6ut8SiAgXssV",
        userId: "user_2eKCLRN7oIbAr5XCmggOZEmZyJw",
      },
      {
        id: "A49s91ikr1Bmtyk2ibwC",
        postY: -163.3333282470703,
        userId: "user_2eKCLRN7oIbAr5XCmggOZEmZyJw",
        createdAt: {
          seconds: 1711643969,
          nanoseconds: 590000000,
        },
        postX: -60.333343505859375,
        hangoutId: "tW5ebQpP01NiyfrNZUB5",
      },
    ]);
  }
  if (url.includes("/users/")) {
    return delayedResolve({
      result: {
        name: "Franklin Zhu",
        username: "franklin_zhu",
        profilePhoto: { fileUrl: "url/to/photo" },
      },
    });
  }
  return Promise.reject(new Error("not found"));
});

// jest.mock("expo-router", () => ({
//   ...jest.requireActual("expo-router"),
//   useRouter: jest.fn(),
// }));

describe("Profile", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("displays loading text when data is being fetched", async () => {
    render(<Profile />);

    expect(screen.getByText("Is Loading...")).toBeOnTheScreen();
  });

  it("displays user and memories data when not loading", async () => {
    render(<Profile />);
    expect(await screen.findByText("Franklin Zhu")).toBeOnTheScreen();
    expect(await screen.findByText("@franklin_zhu")).toBeOnTheScreen();
  });

  it("navigates to Add Friends screen on button click", async () => {
    render(<Profile />);
    fireEvent.press(
      await screen.findByRole("button", { name: "add-friends-button" })
    );
    expect(useRouter().push).toHaveBeenCalledWith(
      "/(profile)/AddFriendsScreen"
    );
  });
});
