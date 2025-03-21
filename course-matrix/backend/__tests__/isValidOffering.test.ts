import { describe, expect, it, test } from "@jest/globals";

import { createOffering, isValidOffering } from "../src/utils/generatorHelpers";
import {
  Offering,
  Restriction,
  RestrictionType,
} from "../src/types/generatorTypes";

describe("isValidOffering", () => {
  const sampleOffering: Offering = createOffering({
    id: 1,
    course_id: 101,
    day: "MO",
    start: "10:00:00",
    end: "11:00:00",
  });

  test("should allow offering if there are no restrictions", () => {
    expect(isValidOffering(sampleOffering, [])).toBe(true);
  });

  test("should allow offering if all restrictions are disabled", () => {
    const restrictions: Restriction[] = [
      {
        type: RestrictionType.RestrictBefore,
        days: ["MO"],
        startTime: "",
        endTime: "09:00:00",
        disabled: true,
        numDays: 0,
      },
    ];
    expect(isValidOffering(sampleOffering, restrictions)).toBe(true);
  });

  test("should reject offering if it starts before restriction start time", () => {
    const restrictions: Restriction[] = [
      {
        type: RestrictionType.RestrictBefore,
        days: ["MO"],
        startTime: "",
        endTime: "11:00:00",
        disabled: false,
        numDays: 0,
      },
    ];
    expect(isValidOffering(sampleOffering, restrictions)).toBe(false);
  });

  test("should reject offering if it ends after restriction end time", () => {
    const restrictions: Restriction[] = [
      {
        type: RestrictionType.RestrictAfter,
        days: ["MO"],
        startTime: "10:30:00",
        endTime: "",
        disabled: false,
        numDays: 0,
      },
    ];
    expect(isValidOffering(sampleOffering, restrictions)).toBe(false);
  });

  test("should reject offering if it is within restricted time range", () => {
    const restrictions: Restriction[] = [
      {
        type: RestrictionType.RestrictBetween,
        days: ["MO"],
        startTime: "09:00:00",
        endTime: "12:00:00",
        disabled: false,
        numDays: 0,
      },
    ];
    expect(isValidOffering(sampleOffering, restrictions)).toBe(false);
  });

  test("should reject offering if the day is restricted", () => {
    const restrictions: Restriction[] = [
      {
        type: RestrictionType.RestrictDay,
        days: ["MO"],
        startTime: "",
        endTime: "",
        disabled: false,
        numDays: 0,
      },
    ];
    expect(isValidOffering(sampleOffering, restrictions)).toBe(false);
  });

  test("should allow offering if the day is not restricted", () => {
    const restrictions: Restriction[] = [
      {
        type: RestrictionType.RestrictDay,
        days: ["TU"],
        startTime: "",
        endTime: "",
        disabled: false,
        numDays: 0,
      },
    ];
    expect(isValidOffering(sampleOffering, restrictions)).toBe(true);
  });
});
