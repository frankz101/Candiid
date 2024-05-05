export const useRouter = () => ({
  push: jest.fn(),
  pop: jest.fn(),
  navigate: jest.fn(),
  replace: jest.fn(),
  goBack: jest.fn(),
});

module.exports = {
  useRouter,
};
