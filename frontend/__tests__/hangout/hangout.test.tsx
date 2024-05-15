import CreateHangoutScreen from "@/app/(hangout)/CreateHangoutScreen";
import { render, screen, fireEvent } from "../../test-utils";
import * as ReactQuery from "@tanstack/react-query";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const delayedResolve = (data: any) => {
  return new Promise((resolve) => setTimeout(() => resolve({ data }), 100));
};

mockedAxios.get.mockImplementation((url) => {
  if (url.includes("/user/") && url.includes("/friends")) {
    return delayedResolve({
      result: [
        {
          id: "userId_1",
          profilePhoto: null,
          firstName: "Friend1",
        },
        {
          id: "userId_2",
          profilePhoto: null,
          firstName: "Friend2",
        },
      ],
    });
  }
  return Promise.reject(new Error("not found"));
});

describe("Hangout", () => {
  it("renders the correct components", () => {
    render(<CreateHangoutScreen />);
    expect(screen.getByLabelText("text-input")).toBeOnTheScreen;
    expect(screen.getByText("Invite your Friends")).toBeOnTheScreen;
    expect(screen.getByLabelText("search-bar")).toBeOnTheScreen;
    expect(screen.getByRole("button", { name: "Create your hangout" }))
      .toBeOnTheScreen;
  });
  it("renders friends loading when fetching for friends", () => {
    render(<CreateHangoutScreen />);
    expect(screen.getByText("Loading friends...")).toBeOnTheScreen;
  });
  it("renders list of friends after data is fetched", async () => {
    render(<CreateHangoutScreen />);
    expect(screen.findByRole("button", { name: "Friend1" })).toBeOnTheScreen;
    expect(screen.findByRole("button", { name: "Friend2" })).toBeOnTheScreen;
  });
});
