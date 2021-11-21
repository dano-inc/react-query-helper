export default {
  resetMocks: true,
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', { sourceMaps: true }],
  },
};
