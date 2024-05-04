import "@testing-library/react-native/extend-expect";
jest.mock("@clerk/clerk-expo", () => {
  return {
    ClerkProvider: ({ children }) => children, // Mock ClerkProvider to just render children
    useUser: () => ({
      user: { id: "mockUserId", firstName: "Mock", lastName: "User" },
    }), // Mock useUser to return a fixed user object
    // Add other Clerk components and hooks that need mocking here
  };
});
