export default {
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', { sourceMaps: true }],
  },
};
