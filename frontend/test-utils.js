import { render } from "@testing-library/react-native";
import { ClerkProvider } from "@clerk/clerk-expo";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const AllTheProviders = ({ children }) => {
  const queryClient = new QueryClient();
  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ClerkProvider>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from "@testing-library/react-native";

// override render method
export { customRender as render };
