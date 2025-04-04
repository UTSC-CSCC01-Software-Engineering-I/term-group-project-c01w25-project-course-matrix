import { describe, expect, it, test } from "@jest/globals";

import { Offering } from "../../src/types/generatorTypes";
import {
  canInsert,
  canInsertList,
  createOffering,
} from "../../src/utils/generatorHelpers";

describe("canInsert function", () => {
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
    day: "MO",
    start: "10:00:00",
    end: "11:00:00",
  });
  const offering3: Offering = createOffering({
    id: 3,
    course_id: 103,
    day: "MO",
    start: "11:00:00",
    end: "12:00:00",
  });

  it("should return true if there is no overlap with existing offerings", async () => {
    const toInsert: Offering = createOffering({
      id: 4,
      course_id: 104,
      day: "MO",
      start: "12:00:00",
      end: "13:00:00",
    });
    const curList: Offering[] = [offering1, offering2, offering3];

    const result = await canInsert(toInsert, curList);

    expect(result).toBe(true); // No overlap, should return true
  });

  it("should return false if there is an overlap with an existing offering", async () => {
    const toInsert: Offering = createOffering({
      id: 4,
      course_id: 104,
      day: "MO",
      start: "09:30:00",
      end: "10:30:00",
    });
    const curList: Offering[] = [offering1, offering2, offering3];

    const result = await canInsert(toInsert, curList);

    expect(result).toBe(false); // There is an overlap with offering1, should return false
  });

  it("should return true if the new offering starts after the last one ends", async () => {
    const toInsert: Offering = createOffering({
      id: 4,
      course_id: 104,
      day: "MO",
      start: "13:00:00",
      end: "14:00:00",
    });
    const curList: Offering[] = [offering1, offering2, offering3];

    const result = await canInsert(toInsert, curList);

    expect(result).toBe(true); // No overlap, should return true
  });

  it("should return true if the new offering ends before the first one starts", async () => {
    const toInsert: Offering = createOffering({
      id: 4,
      course_id: 104,
      day: "MO",
      start: "07:00:00",
      end: "08:00:00",
    });
    const curList: Offering[] = [offering1, offering2, offering3];

    const result = await canInsert(toInsert, curList);

    expect(result).toBe(true); // No overlap, should return true
  });

  it("should return false if the new offering is completely inside an existing one", async () => {
    const toInsert: Offering = createOffering({
      id: 4,
      course_id: 104,
      day: "MO",
      start: "09:30:00",
      end: "09:45:00",
    });
    const curList: Offering[] = [offering1, offering2, offering3];

    const result = await canInsert(toInsert, curList);

    expect(result).toBe(false); // Overlaps with offering1, should return false
  });

  it("should return true if the day is different (no overlap)", async () => {
    const toInsert: Offering = createOffering({
      id: 4,
      course_id: 104,
      day: "TU",
      start: "09:00:00",
      end: "10:00:00",
    });
    const curList: Offering[] = [offering1, offering2, offering3];

    const result = await canInsert(toInsert, curList);

    expect(result).toBe(true); // Different day, no overlap
  });

  it("special case", async () => {
    const toInsert: Offering = createOffering({
      id: 1069,
      course_id: 1271,
      day: "TH",
      start: "05:00:00",
      end: "17:00:00",
    });
    const offering11: Offering = createOffering({
      id: 414,
      course_id: 337,
      day: "TU",
      start: "15:00:00",
      end: "16:00:00",
    });
    const offering12: Offering = createOffering({
      id: 415,
      course_id: 337,
      day: "TH",
      start: "15:00:00",
      end: "17:00:00",
    });
    const offering13: Offering = createOffering({
      id: 1052,
      course_id: 1271,
      day: "TU",
      start: "10:00:00",
      end: "11:00:00",
    });
    const offering14: Offering = createOffering({
      id: 1053,
      course_id: 1271,
      day: "TU",
      start: "09:00:00",
      end: "11:00:00",
    });
    const curList: Offering[] = [
      offering11,
      offering12,
      offering13,
      offering14,
    ];

    const result = await canInsertList([toInsert], curList);

    expect(result).toBe(false); // Special bug-causing case
  });
});
