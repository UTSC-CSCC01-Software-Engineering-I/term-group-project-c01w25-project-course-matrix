import {Request, Response} from 'express';

import {supabase} from '../db/setupDb';  // Supabase instance for database interactions
import asyncHandler from '../middleware/asyncHandler'; // Middleware to handle async route handlers

// Interface to define the structure of an Offering
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

// Utility function to create an Offering object with optional overrides
export function createOffering(overrides: Partial<Offering> = {}): Offering {
  return {
    id: overrides.id ?? -1,
    course_id: overrides.course_id ?? -1,
    meeting_section: overrides.meeting_section ?? 'No Section',
    offering: overrides.offering ?? 'No Offering',
    day: overrides.day ?? 'N/A',
    start: overrides.start ?? '00:00:00',
    end: overrides.end ?? '00:00:00',
    location: overrides.location ?? 'No Room',
    current: overrides.current ?? -1,
    max: overrides.max ?? -1,
    is_waitlisted: overrides.is_waitlisted ?? false,
    delivery_mode: overrides.delivery_mode ?? 'N/A',
    instructor: overrides.instructor ?? 'N/A',
    notes: overrides.notes ?? 'N/A',
    code: overrides.code ?? 'N/A',
  };
}

// Enum to define different types of restrictions for offerings
export enum RestrictionType {
  RestrictBefore = 'Restrict Before',
  RestrictAfter = 'Restrict After',
  RestrictBetween = 'Restrict Between',
  RestrictDay = 'Restrict Day',
  RestrictDaysOff = 'Days Off',
}

// Interface for the restriction object
export interface Restriction {
  type: RestrictionType;
  days: string[];
  startTime: string;
  endTime: string;
  disabled: boolean;
  numDays: number;
}

// Interface for organizing offerings by course ID
export interface OfferingList {
  course_id: number;
  offerings: Offering[];
}

// Function to fetch offerings from the database for a given course and semester
export async function getOfferings(course_id: number, semester: string) {
  let {data: offeringData, error: offeringError} =
      await supabase.schema('course')
          .from('offerings')
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
          .eq('course_id', course_id)
          .eq('offering', semester);

  return offeringData;
}

// Utility function to filter valid offerings based on the provided filter
// function
export const filterValidOfferings = (
    offerings: Offering[],
    f: (x: Offering) => boolean,
    ): Offering[] => {
  return offerings.filter(f);
};

// Function to check if an offering satisfies the restrictions
export function isValidOffering(
    offering: Offering,
    restrictions: Restriction[],
) {
  for (const restriction of restrictions) {
    if (restriction.disabled) continue;
    if (!restriction.days.includes(offering.day)) continue;
    // Check based on the restriction type
    switch (restriction.type) {
      case RestrictionType.RestrictBefore:
        if (offering.start < restriction.endTime) return false;
        break;

      case RestrictionType.RestrictAfter:
        console.log('====');
        console.log(offering.end);
        console.log(restriction.endTime);
        if (offering.end > restriction.startTime) return false;
        break;

      case RestrictionType.RestrictBetween:
        if (offering.start < restriction.endTime &&
            restriction.startTime < offering.end) {
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

  console.log(offering);
  return true;
}

// Function to get the maximum number of days allowed based on restrictions
export async function getMaxDays(restrictions: Restriction[]) {
  for (const restriction of restrictions) {
    if (restriction.disabled) continue;
    if (restriction.type == RestrictionType.RestrictDaysOff) {
      return 5 -
          restriction
              .numDays;  // Subtract the restricted days from the total days
    }
  }
  return 5;  // Default to 5 days if no restrictions
}

// Function to get valid offerings by filtering them based on the restrictions
export async function getValidOfferings(
    offerings: Offering[],
    restrictions: Restriction[],
) {
  return filterValidOfferings(
      offerings,
      (x) => isValidOffering(x, restrictions),
  );
}

// Function to check if an offering can be inserted into the current list of
// offerings without conflicts
export async function canInsert(toInsert: Offering, curList: Offering[]) {
  for (const offering of curList) {
    if (offering.day == toInsert.day) {
      if (offering.start < toInsert.end && toInsert.start < offering.end) {
        return false;  // Check if the time overlaps
      }
    }
  }

  return true;  // No conflict found
}

// Function to generate a frequency table of days from a list of offerings
export function getFrequencyTable(arr: Offering[]): Map<string, number> {
  const freqMap = new Map<string, number>();

  for (const item of arr) {
    const count = freqMap.get(item.day) || 0;
    freqMap.set(item.day, count + 1);
  }
  return freqMap;
}

// Function to generate all valid schedules based on offerings and restrictions
export async function getValidSchedules(
    validSchedules: Offering[][],
    courseOfferingsList: OfferingList[],
    curList: Offering[],
    cur: number,
    len: number,
    maxdays: number,
) {
  // Base case: if all courses have been considered
  if (cur == len) {
    const freq: Map<string, number> = getFrequencyTable(curList);

    // If the number of unique days is within the allowed limit, add the current
    // schedule to the list
    if (freq.size <= maxdays) {
      validSchedules.push([...curList]);  // Push a copy of the current list
    }
    return;
  }

  const offeringsForCourse = courseOfferingsList[cur];

  // Recursively attempt to add offerings for the current course
  for (const offering of offeringsForCourse.offerings) {
    if (await canInsert(offering, curList)) {
      curList.push(offering);  // Add offering to the current list

      // Recursively generate schedules for the next course
      await getValidSchedules(
          validSchedules,
          courseOfferingsList,
          curList,
          cur + 1,
          len,
          maxdays,
      );

      // Backtrack: remove the last offering if no valid schedule was found
      curList.pop();
    }
  }
}

// Express route handler to generate timetables based on user input
export default {
  generateTimetable: asyncHandler(async (req: Request, res: Response) => {
    try {
      // Extract event details and course information from the request
      const {name, date, semester, search, courses, restrictions} = req.body;
      const courseOfferingsList: OfferingList[] = [];
      const validCourseOfferingsList: OfferingList[] = [];
      const maxdays = await getMaxDays(restrictions);

      // Fetch offerings for each course
      for (const course of courses) {
        const {id} = course;
        courseOfferingsList.push({
          course_id: id,
          offerings: (await getOfferings(id, semester)) ?? [],
        });
      }


      // Filter out invalid offerings based on the restrictions
      for (const {course_id, offerings} of courseOfferingsList) {
        validCourseOfferingsList.push({
          course_id: course_id,
          offerings: await getValidOfferings(offerings ?? [], restrictions),
        });
      }

      // Log course offerings (for debugging purposes)
      validCourseOfferingsList.forEach(
          (course) => console.log(JSON.stringify(course, null, 2)),
      );


      const validSchedules: Offering[][] = [];

      // Generate valid schedules for the given courses and restrictions
      await getValidSchedules(
          validSchedules,
          validCourseOfferingsList,
          [],
          0,
          validCourseOfferingsList.length,
          maxdays,
      );

      // Return error if no valid schedules are found
      if (validSchedules.length === 0) {
        return res.status(404).json({error: 'No valid schedules found.'});
      }

      // Return the valid schedules
      return res.status(200).json({validSchedules});
    } catch (error) {
      // Catch any error and return the error message
      const errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(500).send({error: errorMessage});
    }
  }),
};
