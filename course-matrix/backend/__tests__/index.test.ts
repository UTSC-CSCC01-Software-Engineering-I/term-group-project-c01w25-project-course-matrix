import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import app from "../src/index";

describe("Sum function", () => {
  test("Returns correct value", () => {
    expect(2 + 3).toEqual(5);
  });
});
