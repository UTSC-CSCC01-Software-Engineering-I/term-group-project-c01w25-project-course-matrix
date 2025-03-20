import { describe, expect, it, test } from "@jest/globals";

import {
  createOffering,
  getFrequencyTable,
} from "../src/utils/generatorHelpers";
import {Offering} from "../src/types/generatorTypes"

describe("getFrequencyTable", () => {
  test("should return a frequency map of days", () => {
    const offering1: Offering = createOffering({
      id: 1,
      course_id: 101,
      day: "MO",
      start: "09:00:00",
      end: "10:00:00",
    });
    const offering2: Offering = createOffering({
      id: 2,
      course_id: 102,
      day: "TU",
      start: "10:00:00",
      end: "11:00:00",
    });
    const offering3: Offering = createOffering({
      id: 3,
      course_id: 103,
      day: "TU",
      start: "11:00:00",
      end: "12:00:00",
    });
    const offering4: Offering = createOffering({
      id: 4,
      course_id: 104,
      day: "MO",
      start: "11:00:00",
      end: "12:00:00",
    });
    const offering5: Offering = createOffering({
      id: 5,
      course_id: 105,
      day: "WE",
      start: "11:00:00",
      end: "12:00:00",
    });
    const offering6: Offering = createOffering({
      id: 6,
      course_id: 106,
      day: "WE",
      start: "11:00:00",
      end: "12:00:00",
    });
    const offering7: Offering = createOffering({
      id: 7,
      course_id: 107,
      day: "WE",
      start: "11:00:00",
      end: "12:00:00",
    });

    const result = getFrequencyTable([
      offering1,
      offering2,
      offering3,
      offering4,
      offering5,
      offering6,
      offering7,
    ]);

    expect(result.get("MO")).toBe(2);
    expect(result.get("TU")).toBe(2);
    expect(result.get("WE")).toBe(3);
    expect(result.get("TH")).toBeUndefined(); // Day not in data
    expect(result.get("FR")).toBeUndefined(); // Day not in data
    expect(result.size).toBe(3);
  });

  test("should return an empty map for an empty array", () => {
    const result = getFrequencyTable([]);
    expect(result.size).toBe(0);
  });
});
