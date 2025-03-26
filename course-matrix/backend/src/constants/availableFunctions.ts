import { Request } from "express";

import { generateWeeklyCourseEvents } from "../controllers/eventsController";
import { supabase } from "../db/setupDb";
import { RestrictionForm } from "../models/timetable-form";
import getOfferings from "../services/getOfferings";
import { getValidSchedules } from "../services/getValidSchedules";
import {
  GroupedOfferingList,
  Offering,
  OfferingList,
} from "../types/generatorTypes";
import { convertTimeStringToDate } from "../utils/convert-time-string";
import {
  categorizeValidOfferings,
  getFreq,
  getMaxDays,
  getMaxHour,
  getValidOfferings,
  groupOfferings,
  trim,
  shuffle,
} from "../utils/generatorHelpers";

// Add all possible function names here
export type FunctionNames =
  | "getTimetables"
  | "updateTimetable"
  | "deleteTimetable"
  | "generateTimetable"
  | "getCourses";

type AvailableFunctions = {
  [K in FunctionNames]: (args: any, req: Request) => Promise<any>;
};

// Functions used for OpenAI function calling
export const availableFunctions: AvailableFunctions = {
  getTimetables: async (args: any, req: Request) => {
    try {
      // Retrieve user_id
      const user_id = (req as any).user.id;
      console.log("NO");
      // Retrieve user timetable item based on user_id
      let timeTableQuery = supabase
        .schema("timetable")
        .from("timetables")
        .select()
        .eq("user_id", user_id);
      const { data: timetableData, error: timetableError } =
        await timeTableQuery;
      // console.log("Timetables: ", timetableData)

      if (timetableError) return { status: 400, error: timetableError.message };

      // If no records were updated due to non-existence timetable or it doesn't
      // belong to the user.
      if (!timetableData || timetableData.length === 0) {
        return {
          status: 404,
          error: "Timetable not found or you are not authorized to update it",
        };
      }

      return { status: 200, timetableCount: timetableData.length, data: timetableData };
    } catch (error) {
      console.log(error);
      return { status: 400, error: error };
    }
  },
  updateTimetable: async (args: any, req: Request) => {
    try {
      const { id, timetable_title, semester } = args;

      if (!timetable_title && !semester) {
        return {
          status: 400,
          error:
            "New timetable title or semester is required when updating a timetable",
        };
      }

      // Retrieve the authenticated user
      const user_id = (req as any).user.id;

      // Retrieve users allowed to access the timetable
      const { data: timetableUserData, error: timetableUserError } =
        await supabase
          .schema("timetable")
          .from("timetables")
          .select("*")
          .eq("id", id)
          .eq("user_id", user_id)
          .maybeSingle();

      const timetable_user_id = timetableUserData?.user_id;

      if (timetableUserError)
        return { status: 400, error: timetableUserError.message };

      // Validate timetable validity:
      if (!timetableUserData || timetableUserData.length === 0) {
        return { status: 404, error: "Calendar id not found" };
      }

      // Validate user access
      if (user_id !== timetable_user_id) {
        return {
          status: 401,
          error: "Unauthorized access to timetable events",
        };
      }

      let updateData: any = {};
      if (timetable_title) updateData.timetable_title = timetable_title;
      if (semester) updateData.semester = semester;

      // Update timetable title, for authenticated user only
      let updateTimetableQuery = supabase
        .schema("timetable")
        .from("timetables")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user_id)
        .select();

      const { data: timetableData, error: timetableError } =
        await updateTimetableQuery;

      if (timetableError) return { status: 400, error: timetableError.message };

      // If no records were updated due to non-existence timetable or it doesn't
      // belong to the user.
      if (!timetableData || timetableData.length === 0) {
        return {
          status: 404,
          error: "Timetable not found or you are not authorized to update it",
        };
      }
      return { status: 200, data: timetableData };
    } catch (error) {
      return { status: 500, error: error };
    }
  },
  deleteTimetable: async (args: any, req: Request) => {
    try {
      const { id } = args;

      // Retrieve the authenticated user
      const user_id = (req as any).user.id;

      // Retrieve users allowed to access the timetable
      const { data: timetableUserData, error: timetableUserError } =
        await supabase
          .schema("timetable")
          .from("timetables")
          .select("*")
          .eq("id", id)
          .eq("user_id", user_id)
          .maybeSingle();
      const timetable_user_id = timetableUserData?.user_id;

      if (timetableUserError)
        return { status: 400, error: timetableUserError.message };

      // Validate timetable validity:
      if (!timetableUserData || timetableUserData.length === 0) {
        return { status: 404, error: "Calendar id not found" };
      }

      // Validate user access
      if (user_id !== timetable_user_id) {
        return {
          status: 401,
          error: "Unauthorized access to timetable events",
        };
      }

      // Delete only if the timetable belongs to the authenticated user
      let deleteTimetableQuery = supabase
        .schema("timetable")
        .from("timetables")
        .delete()
        .eq("id", id)
        .eq("user_id", user_id);

      const { error: timetableError } = await deleteTimetableQuery;

      if (timetableError) return { status: 400, error: timetableError.message };

      return { status: 200, data: "Timetable successfully deleted" };
    } catch (error) {
      return { status: 500, error: error };
    }
  },
  generateTimetable: async (args: any, req: Request) => {
    try {
      // Extract event details and course information from the request
      const { name, semester, courses, restrictions } = args;
      // Get user id from session authentication to insert in the user_id col
      const user_id = (req as any).user.id;

      if (name.length > 50) {
        return {
          status: 400,
          error: "timetable title is over 50 characters long",
        };
      }

      // Timetables cannot exceed the size of 25.
      const { count: timetable_count, error: timetableCountError } =
        await supabase
          .schema("timetable")
          .from("timetables")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user_id);

      console.log(timetable_count);

      if ((timetable_count ?? 0) >= 25) {
        return {
          status: 400,
          error: "You have exceeded the limit of 25 timetables",
        };
      }

      const courseOfferingsList: OfferingList[] = [];
      const validCourseOfferingsList: GroupedOfferingList[] = [];
      const maxdays = getMaxDays(restrictions);
      const maxhours = getMaxHour(restrictions);
      const validSchedules: Offering[][] = [];
      // Fetch offerings for each course
      for (const course of courses) {
        const { id } = course;
        courseOfferingsList.push({
          course_id: id,
          offerings: (await getOfferings(id, semester)) ?? [],
        });
      }
      const groupedOfferingsList: GroupedOfferingList[] =
        groupOfferings(courseOfferingsList);

      for (const {
        course_id,
        groups,
        lectures,
        tutorials,
        practicals,
      } of groupedOfferingsList) {
        const group: Record<string, Offering[]> = getValidOfferings(
          groups,
          restrictions,
        );
        let groupedOfferings = {
          course_id: course_id,
          groups: group,
          lectures: 0,
          tutorials: 0,
          practicals: 0,
        };
        groupedOfferings = getFreq(groupedOfferings);
        if (
          (lectures != 0 && groupedOfferings.lectures == 0) ||
          (tutorials != 0 && groupedOfferings.tutorials == 0) ||
          (practicals != 0 && groupedOfferings.practicals == 0)
        ) {
          return {
            status: 404,
            error: "No valid schedules found. (Restriction)",
          };
        }

        validCourseOfferingsList.push(groupedOfferings);
      }

      let categorizedOfferings = categorizeValidOfferings(
        validCourseOfferingsList,
      );
      // console.log(JSON.stringify(categorizedOfferings));
      // Generate valid schedules for the given courses and restrictions
      categorizedOfferings = shuffle(categorizedOfferings);
      getValidSchedules(
        validSchedules,
        categorizedOfferings,
        [],
        0,
        categorizedOfferings.length,
        maxdays,
        maxhours,
        false,
      );
      // Return error if no valid schedules are found
      if (validSchedules.length === 0) {
        return { status: 404, error: "No valid schedules found." };
      }

      // ------ CREATE FLOW ------

      // Retrieve timetable title
      const schedule = trim(validSchedules)[0];
      if (!name || !semester) {
        return {
          status: 400,
          error: "timetable title and semester are required",
        };
      }

      // Check if a timetable with the same title already exist for this user
      const { data: existingTimetable, error: existingTimetableError } =
        await supabase
          .schema("timetable")
          .from("timetables")
          .select("id")
          .eq("user_id", user_id)
          .eq("timetable_title", name)
          .maybeSingle();

      if (existingTimetableError) {
        return {
          status: 400,
          error: `Existing timetable with name: ${name}. Please rename
timetable.`,
        };
      }

      if (existingTimetable) {
        return {
          status: 400,
          error: "A timetable with this title already exists",
        };
      }

      let favorite = false;

      // Insert the user_id and timetable_title into the db
      let insertTimetable = supabase
        .schema("timetable")
        .from("timetables")
        .insert([
          {
            user_id,
            timetable_title: name,
            semester,
            favorite,
          },
        ])
        .select()
        .single();

      const { data: timetableData, error: timetableError } =
        await insertTimetable;

      if (timetableError) {
        return {
          status: 400,
          error: "Timetable error" + timetableError.message,
        };
      }

      // Insert events
      for (const offering of schedule) {
        // Query course offering information
        const { data: offeringData, error: offeringError } = await supabase
          .schema("course")
          .from("offerings")
          .select("*")
          .eq("id", offering.id)
          .maybeSingle();

        if (offeringError)
          return {
            status: 400,
            error: `Offering error id: ${offering.id} ` + offeringError.message,
          };

        if (!offeringData || offeringData.length === 0) {
          return {
            status: 400,
            error: "Invalid offering_id or course offering not found.",
          };
        }

        // Generate event details
        const courseEventName = ` ${offeringData.code} -
${offeringData.meeting_section} `;
        const courseDay = offeringData.day;
        const courseStartTime = offeringData.start;
        const courseEndTime = offeringData.end;

        if (!courseDay || !courseStartTime || !courseEndTime) {
          return {
            status: 400,
            error: "Incomplete offering data to generate course event",
          };
        }

        let eventsToInsert: any[] = [];
        let semester_start_date;
        let semester_end_date;

        if (semester === "Summer 2025") {
          semester_start_date = "2025-05-02";
          semester_end_date = "2025-08-07";
        } else if (semester === "Fall 2025") {
          semester_start_date = "2025-09-03";
          semester_end_date = "2025-12-03";
        } else {
          // Winter 2026
          semester_start_date = "2026-01-06";
          semester_end_date = "2026-04-04";
        }

        if (semester_start_date && semester_end_date) {
          eventsToInsert = generateWeeklyCourseEvents(
            user_id,
            courseEventName,
            courseDay,
            courseStartTime,
            courseEndTime,
            timetableData.id,
            offering.id.toString(),
            semester_start_date,
            semester_end_date,
          );
        }

        // Each week lecture will be inputted as a separate events from
        // sememseter start to end date Semester start & end dates are inputted
        // by user
        const { data: courseEventData, error: courseEventError } =
          await supabase
            .schema("timetable")
            .from("course_events")
            .insert(eventsToInsert)
            .select("*");

        if (courseEventError) {
          return {
            status: 400,
            error: "Coruse event error " + courseEventError.message,
          };
        }
      }

      // Save restrictions
      for (const restriction of restrictions as RestrictionForm[]) {
        let startTime: String | null = null;
        let endTime: String | null = null;

        if (restriction.startTime) {
          let restriction_start_time = convertTimeStringToDate(
            restriction.startTime,
          );
          startTime = restriction_start_time.toISOString().split("T")[1];
        }

        if (restriction.endTime) {
          let restriction_end_time = convertTimeStringToDate(
            restriction.endTime,
          );
          endTime = restriction_end_time.toISOString().split("T")[1];
        }
        const { data: restrictionData, error: restrictionError } =
          await supabase
            .schema("timetable")
            .from("restriction")
            .insert([
              {
                user_id,
                type: restriction?.type,
                days: restriction?.days,
                start_time: startTime,
                end_time: endTime,
                disabled: restriction?.disabled,
                num_days: restriction?.numDays,
                calendar_id: timetableData?.id,
                max_gap: restriction?.maxGap,
              },
            ])
            .select();

        if (restrictionError) {
          return { status: 400, error: restrictionError.message };
        }
      }

      return { status: 201, data: timetableData };
    } catch (error) {
      // Catch any error and return the error message
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      return { status: 500, error: errorMessage };
    }
  },
  getCourses: async (args: any, req: Request) => {
    const { courses } = args; // course codes
    try {
      const filterConditions = courses.map((prefix: string) => {
        return `code.ilike.${prefix}%`;
      });

      // Get all courses that have any of the provided courses as its prefix
      const { data, error } = await supabase
        .schema("course")
        .from("courses")
        .select("*")
        .or(filterConditions.join(","));

      if (error) {
        return { status: 400, error: error.message };
      }

      return { status: 200, data };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      return { status: 500, error: errorMessage };
    }
  },
};
