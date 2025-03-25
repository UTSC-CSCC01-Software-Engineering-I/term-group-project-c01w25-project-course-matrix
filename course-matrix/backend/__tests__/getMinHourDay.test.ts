import { describe, expect, it, test } from "@jest/globals";

import { Offering } from "../src/types/generatorTypes";
import {
  createOffering,
  getMinHour,
  getMinHourDay,
} from "../src/utils/generatorHelpers";

describe("getMinHourDay function", () => {
  it("Back to back to back courses", async () => {
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
    const schedule: Offering[] = [offering1, offering2, offering3];

    const result = getMinHourDay(schedule, 0);

    expect(result).toBe(true);
  });

  it("courses that has a max gap of 4 hours", async () => {
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
      start: "15:00:00",
      end: "16:00:00",
    });
    const schedule: Offering[] = [offering3, offering2, offering1];

    const result = getMinHourDay(schedule, 3);

    expect(result).toBe(false);
  });

  it("only 1 offering in list, return 0", async () => {
    const offering1: Offering = createOffering({
      id: 1,
      course_id: 101,
      day: "MO",
      start: "09:00:00",
      end: "10:00:00",
    });
    const schedule: Offering[] = [offering1];

    const result = getMinHourDay(schedule, 23);

    expect(result).toBe(true);
  });

  it("getMinHour test", async () => {
    const arr_day = [
      "MO",
      "MO",
      "TU",
      "TH",
      "FR",
      "MO",
      "TU",
      "TH",
      "MO",
      "MO",
    ];
    const arr_start = [
      "09:00:00",
      "10:00:00",
      "09:00:00",
      "12:00:00",
      "13:00:00",
      "12:00:00",
      "14:00:00",
      "16:00:00",
      "13:00:00",
      "15:00:00",
    ];
    const arr_end = [
      "10:00:00",
      "11:00:00",
      "10:00:00",
      "15:00:00",
      "16:00:00",
      "13:00:00",
      "19:00:00",
      "18:00:00",
      "14:00:00",
      "18:00:00",
    ];
    const schedule: Offering[] = [];
    for (let i = 0; i < 10; i++) {
      schedule.push(
        createOffering({
          id: i,
          course_id: 100 + i,
          day: arr_day[i],
          start: arr_start[i],
          end: arr_end[i],
        }),
      );
    }

    const result = getMinHour(schedule, 4);

    expect(result).toEqual(true);
  });

  it("getMinHour test 2", async () => {
    const arr_day = [
      "MO",
      "MO",
      "TU",
      "TH",
      "FR",
      "MO",
      "TU",
      "TH",
      "MO",
      "MO",
    ];
    const arr_start = [
      "09:00:00",
      "10:00:00",
      "09:00:00",
      "12:00:00",
      "13:00:00",
      "12:00:00",
      "14:00:00",
      "16:00:00",
      "13:00:00",
      "15:00:00",
    ];
    const arr_end = [
      "10:00:00",
      "11:00:00",
      "10:00:00",
      "15:00:00",
      "16:00:00",
      "13:00:00",
      "19:00:00",
      "18:00:00",
      "14:00:00",
      "18:00:00",
    ];
    const schedule: Offering[] = [];
    for (let i = 0; i < 10; i++) {
      schedule.push(
        createOffering({
          id: i,
          course_id: 100 + i,
          day: arr_day[i],
          start: arr_start[i],
          end: arr_end[i],
        }),
      );
    }

    const result = getMinHour(schedule, 3);

    expect(result).toEqual(false);
  });
});
