import React from "react";
import { render, screen } from "../../test-utils";
import Profile from "@/app/(tabs)/profile";
import * as ReactQuery from "@tanstack/react-query";

describe("Profile", () => {
  // afterEach(() => {
  //   jest.clearAllMocks();
  // });

  // it("displays loading text when data is being fetched", () => {
  //   jest.mock("@tanstack/react-query", () => ({
  //     useQueries: () => [{ isPending: true }, { isPending: true }],
  //   }));

  //   render(<Profile />);
  //   expect(screen.getByText("Is Loading...")).toBeOnTheScreen();
  // });

  it("displays user and memories data when not loading", async () => {
    // jest.mock("@tanstack/react-query", () => ({
    //   useQueries: () => [
    //     {
    //       data: { hangouts: [{ id: 1, title: "Beach Hangout" }] },
    //       isPending: false,
    //     },
    //     {
    //       data: {
    //         result: {
    //           name: "Franklin Zhu",
    //           username: "franklin_zhu",
    //           profilePhoto: { fileUrl: "url/to/photo" },
    //         },
    //       },
    //       isPending: false,
    //     },
    //   ],
    // }));

    render(<Profile />);
    expect(await screen.findByText("Franklin Zhu")).toBeOnTheScreen();
    expect(await screen.findByText("franklin_zhu")).toBeOnTheScreen();
  });
});
