import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  moduleNameMapper: { "@/(.*)$": "<rootDir>/src/$1" },
  // to obtain access to the matchers.
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  modulePaths: ["<rootDir>"],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json",
      },
    ],
    "^.+\\.(js|jsx)$": "babel-jest",
  },
};

export default config;
