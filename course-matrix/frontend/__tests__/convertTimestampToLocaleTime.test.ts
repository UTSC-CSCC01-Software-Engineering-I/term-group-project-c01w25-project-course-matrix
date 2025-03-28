import { convertTimestampToLocaleTime } from "../src/utils/convert-timestamp-to-locale-time";
import { describe, expect, it, test } from "@jest/globals";

describe("convertTimestampToLocaleTime", () => {
  test("should convert a valid timestamp string to a locale time string", () => {
    const timestamp = "2025-03-28T12:00:00Z";
    const result = convertTimestampToLocaleTime(timestamp);
    expect(result).toBe("3/28/2025, 8:00:00 AM");
    expect(result.length).toBeGreaterThan(0); // Ensures it returns a non-empty string
  });

  test("should convert a valid numeric timestamp to a locale time string", () => {
    const timestamp = 1711622400000; // Equivalent to 2025-03-28T12:00:00Z in milliseconds
    const result = convertTimestampToLocaleTime(timestamp);
    expect(result).toBe("3/28/2024, 6:40:00 AM");
    expect(result.length).toBeGreaterThan(0);
  });

  test("convert to locale time date is different", () => {
    const timestamp = "2025-03-28 02:33:02.589+00";
    const result = convertTimestampToLocaleTime(timestamp);
    expect(result).toBe("3/27/2025, 10:33:02 PM");
    expect(result.length).toBeGreaterThan(0);
  });

  test("should return 'Invalid Date' for an invalid timestamp", () => {
    const timestamp = "invalid";
    const result = convertTimestampToLocaleTime(timestamp);
    expect(result).toBe("Invalid Date");
  });
});
