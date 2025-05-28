export default {
  testMatch: ["**/*.test.mjs"],
  transform: {},
  extensionsToTreatAsEsm: [".mjs"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  testEnvironment: "node"
}; 