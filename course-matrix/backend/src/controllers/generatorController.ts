import { Request, Response } from "express";

import { supabase } from "../db/setupDb";
import asyncHandler from "../middleware/asyncHandler";

export interface Offering {
  id: number;
  course_id: number;
  meeting_section: string;
  offering: string;
  day: string;
  start: string;
  end: string;
  location: string;
  current: number;
  max: number;
  is_waitlisted: boolean;
  delivery_mode: string;
  instructor: string;
  notes: string;
  code: string;
}

export function createOffering(overrides: Partial<Offering> = {}): Offering {
  return {
    id: overrides.id ?? -1,
    course_id: overrides.course_id ?? -1,
    meeting_section: overrides.meeting_section ?? "No Section",
    offering: overrides.offering ?? "No Offering",
    day: overrides.day ?? "N/A",
    start: overrides.start ?? "00:00:00",
    end: overrides.end ?? "00:00:00",
    location: overrides.location ?? "No Room",
    current: overrides.current ?? -1,
    max: overrides.max ?? -1,
    is_waitlisted: overrides.is_waitlisted ?? false,
    delivery_mode: overrides.delivery_mode ?? "N/A",
    instructor: overrides.instructor ?? "N/A",
    notes: overrides.notes ?? "N/A",
    code: overrides.code ?? "N/A",
  };
}

export enum RestrictionType {
  RestrictBefore = "Restrict Before",
  RestrictAfter = "Restrict After",
  RestrictBetween = "Restrict Between",
  RestrictDay = "Restrict Day",
  RestrictDaysOff = "Days Off",
}

export interface Restriction {
  type: RestrictionType;
  days: string[];
  startTime: string;
  endTime: string;
  disabled: boolean;
}

export interface OfferingList {
  course_id: number;
  offerings: Offering[];
}

export async function getOfferings(course_id: number, semester: string) {
  let { data: offeringData, error: offeringError } = await supabase
    .schema("course")
    .from("offerings")
    .select(
      `
    id, 
    course_id, 
    meeting_section, 
    offering, 
    day, 
    start, 
    end, 
    location, 
    current, 
    max, 
    is_waitlisted, 
    delivery_mode, 
    instructor, 
    notes, 
    code
  `,
    )
    .eq("course_id", course_id)
    .eq("offering", semester);

  return offeringData;
}

export const filterValidOfferings = (
  offerings: Offering[],
  f: (x: Offering) => boolean,
): Offering[] => {
  return offerings.filter(f);
};

export function isValidOffering(
  offering: Offering,
  restrictions: Restriction[],
) {
  for (const restriction of restrictions) {
    if (restriction.disabled) continue;

    switch (restriction.type) {
      case RestrictionType.RestrictBefore:
        if (offering.start < restriction.startTime) return false;
        break;

      case RestrictionType.RestrictAfter:
        if (offering.end > restriction.endTime) return false;
        break;

      case RestrictionType.RestrictBetween:
        if (
          offering.start >= restriction.startTime &&
          offering.end <= restriction.endTime
        ) {
          return false;
        }
        break;
      case RestrictionType.RestrictDay:
        if (restriction.days.includes(offering.day)) {
          return false;
        }
        break;
    }
  }
  return true;
}

export async function getValidOfferings(
  offerings: Offering[],
  restrictions: Restriction[],
) {
  return filterValidOfferings(offerings, (x) =>
    isValidOffering(x, restrictions),
  );
}

export async function canInsert(toInsert: Offering, curList: Offering[]) {
  for (const offering of curList) {
    if (offering.day == toInsert.day) {
      if (offering.start < toInsert.end && toInsert.start < offering.end) {
        return false;
      }
    }
  }

  return true;
}

export async function getValidSchedules(
  courseOfferingsList: OfferingList[],
  curList: Offering[],
  cur: number,
  len: number,
): Promise<Offering[][]> {
  if (cur == len) return [curList];

  const validSchedules: Offering[][] = [];

  const offeringsForCourse = courseOfferingsList[cur];

  for (const offering of offeringsForCourse.offerings) {
    if (await canInsert(offering, curList)) {
      curList.push(offering);
      // Recursively call the function for the next course
      const res: Offering[][] = await getValidSchedules(
        courseOfferingsList,
        curList,
        cur + 1,
        len,
      );

      // If a valid schedule is found, return it
      validSchedules.push(...res);

      // If no valid schedule is found, pop the offering and continue
      curList.pop();
    }
  }

  // If no valid schedule is found for this course, return null
  return validSchedules;
}

export default {
  generateTimetable: asyncHandler(async (req: Request, res: Response) => {
    try {
      // Retrieve event properties from the request body
      const { name, date, semester, search, courses, restrictions } = req.body;
      const courseOfferingsList: OfferingList[] = [];
      const validCourseOfferingsList: OfferingList[] = [];
      // Retrieve the authenticated user
      const user_id = (req as any).user.id;

      // extracting offerings from each course
      for (const course of courses) {
        const { id, code, name } = course;
        courseOfferingsList.push({
          course_id: id,
          offerings: (await getOfferings(id, semester)) ?? [],
        });
      }
      courseOfferingsList.forEach((course) =>
        console.log(JSON.stringify(course, null, 2)),
      );

      // filter out invalid course entries
      for (const { course_id, offerings } of courseOfferingsList) {
        validCourseOfferingsList.push({
          course_id: course_id,
          offerings: await getValidOfferings(offerings ?? [], restrictions),
        });
      }

      const validSchedules = await getValidSchedules(
        validCourseOfferingsList,
        [],
        0,
        validCourseOfferingsList.length,
      );

      if (validSchedules.length === 0) {
        return res.status(404).json({ error: "No valid schedules found." });
      }
      return res.status(200).json({ validSchedules });
    } catch (error) {
      return res.status(500).send({ error });
    }
  }),
};
