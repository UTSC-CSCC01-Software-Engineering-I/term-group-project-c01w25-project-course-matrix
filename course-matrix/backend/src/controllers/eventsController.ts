import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { supabase } from "../db/setupDb";
import { start } from "repl";

/**
 * Helper method to generate weekly course events.
 * @param courseEventName - The name of the course event (typically derived from the offering code and meeting section).
 * @param courseDay - The day code of the course event (e.g. "MO", "TU", etc.).
 * @param courseStartTime - The start time of the course.
 * @param courseEndTime - The end time of the course.
 * @param calendar_id - The ID of the calendar.
 * @param offering_id - The ID of the course offering.
 * @param semester_start_date - The start date of the semester (ISO string).
 * @param semester_end_date - The end date of the semester (ISO string).
 * @returns An array of event objects ready to be inserted.
 */

function getNextWeekDayOccurance(targetDay: string): string {
  //Map weekday code to JS day number
  const weekdayMap: { [key: string]: number } = {
    SU: 0,
    MO: 1,
    TU: 2,
    WE: 3,
    TH: 4,
    FR: 5,
    SA: 6,
  };

  const today = new Date();
  let currentWeekday = today.getDay();
  let targetWeekday = weekdayMap[targetDay];

  if (targetWeekday === undefined) {
    throw new Error("Invalid course day provided");
  }

  let offset = targetWeekday - currentWeekday;
  if (offset < 0) {
    offset += 7;
  }

  today.setDate(today.getDate() + offset);
  return today.toISOString().split("T")[0];
}

export function generateWeeklyCourseEvents(
  user_id: string,
  courseEventName: string,
  courseDay: string,
  courseStartTime: string,
  courseEndTime: string,
  calendar_id: string,
  offering_id: string,
  semester_start_date: string,
  semester_end_date: string,
): any[] {
  //Map weekday code to JS day number
  const weekdayMap: { [key: string]: number } = {
    SU: 0,
    MO: 1,
    TU: 2,
    WE: 3,
    TH: 4,
    FR: 5,
    SA: 6,
  };

  const targetWeekday = weekdayMap[courseDay];
  if (targetWeekday === undefined) {
    throw new Error("Invalid course day provided");
  }

  const semesterStartObj = new Date(semester_start_date + "T00:00:00-05:00");
  const semesterEndObj = new Date(semester_end_date + "T00:00:00-05:00");

  if (semesterStartObj >= semesterEndObj) {
    throw new Error("Semester end date cannot be before semester start date");
  }

  //Compute the date of first lecture of the semester
  let currentDate = new Date(semester_start_date + "T00:00:00-05:00");
  const currentWeekday = currentDate.getDay();
  let offset = targetWeekday - currentWeekday;
  if (offset < 0) {
    offset += 7;
  }
  currentDate.setDate(currentDate.getDate() + offset);

  let eventsToInsert: any[] = [];
  //Loop through the semester, adding an event for each week on the targeted weekday
  while (currentDate <= semesterEndObj) {
    eventsToInsert.push({
      user_id,
      calendar_id,
      event_name: courseEventName,
      //Convert the occurrence of date to YYYY-MM-DD format
      event_date: currentDate.toISOString().split("T")[0],
      event_start: courseStartTime,
      event_end: courseEndTime,
      event_description: null,
      offering_id,
    });
    //Cycle to the next week
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return eventsToInsert;
}

export default {
  /**
   * Create a new event.
   * If an offering_id is provided it's treated as a course event:
   * - Queries course information (from the "offerings" table in the course schema
   * - Inserts into the course_events table.
   * Otherwise, it's treated as a user event and is inserted into the user_event table.
   * Expected body fields for both:
   * - calendar_id, event_date, event_start, event_end, event_description
   * For course events, you must provide: offering_id
   * For user events, you must provide event_name
   */

  createEvent: asyncHandler(async (req: Request, res: Response) => {
    try {
      //Retrieve event properties from the request body
      const {
        calendar_id,
        event_date,
        event_start,
        event_end,
        event_description,
        event_name,
        offering_id,
        //Semester start and end date format: YYYY-MM-DD
        semester_start_date,
        semester_end_date,
      } = req.body;

      // Retrieve the authenticated user
      const user_id = (req as any).user.id;

      //Check for calendar_id
      if (!calendar_id) {
        return res.status(400).json({ error: "calendar id is required" });
      }

      //Retrieve users allowed to access the timetable
      const { data: timetableData, error: timetableError } = await supabase
        .schema("timetable")
        .from("timetables")
        .select("*")
        .eq("id", calendar_id)
        .eq("user_id", user_id)
        .maybeSingle();

      if (timetableError)
        return res.status(400).json({ error: timetableError.message });

      //Validate timetable validity:
      if (!timetableData || timetableData.length === 0) {
        return res.status(404).json({ error: "Calendar id not found" });
      }

      const timetable_user_id = timetableData.user_id;

      //Validate user access
      if (user_id !== timetable_user_id) {
        return res
          .status(401)
          .json({ error: "Unauthorized access to timetable events" });
      }

      if (offering_id) {
        //This is a course event

        //Query course offering information using the provided offering_id
        const { data: offeringData, error: offeringError } = await supabase
          .schema("course")
          .from("offerings")
          .select("*")
          .eq("id", offering_id)
          .maybeSingle();

        if (offeringError)
          return res.status(400).json({ error: offeringError.message });

        if (!offeringData || offeringData.length === 0) {
          return res.status(400).json({
            error: "Invalid offering_id or course offering not found.",
          });
        }

        //Generate event details
        const courseEventName = ` ${offeringData.code} - ${offeringData.meeting_section} `;
        const courseDay = offeringData.day;
        const courseStartTime = offeringData.start;
        const courseEndTime = offeringData.end;

        if (!courseDay || !courseStartTime || !courseEndTime) {
          return res.status(400).json({
            error: "Incomplete offering data to generate course event",
          });
        }

        let eventsToInsert: any[];
        if (semester_start_date && semester_end_date) {
          eventsToInsert = generateWeeklyCourseEvents(
            user_id,
            courseEventName,
            courseDay,
            courseStartTime,
            courseEndTime,
            calendar_id,
            offering_id,
            semester_start_date,
            semester_end_date,
          );
        } else {
          //If no semester dates provided, insert a single event using the provided event_date
          let eventDate = getNextWeekDayOccurance(courseDay);
          eventsToInsert = [
            {
              calendar_id,
              event_name: courseEventName,
              event_date: eventDate,
              event_start: courseStartTime,
              event_end: courseEndTime,
              event_description: null,
              offering_id,
              user_id,
            },
          ];
        }

        //Each week lecture will be inputted as a separate events from sememseter start to end date
        //Semester start & end dates are inputted by user
        const { data: courseEventData, error: courseEventError } =
          await supabase
            .schema("timetable")
            .from("course_events")
            .insert(eventsToInsert)
            .select("*");

        if (courseEventError) {
          return res.status(400).json({ error: courseEventError.message });
        }

        return res.status(201).json(courseEventData);
      } else {
        //No offering_id provided -> User events
        if (!event_name) {
          return res
            .status(400)
            .json({ error: "Event name is required for user events" });
        }

        if (!event_date || !event_start || !event_end) {
          return res
            .status(400)
            .json({ error: "Event date and time are required" });
        }

        // Function to construct date in local time
        const start_time = new Date(`${event_date}T${event_start}-00:00`);
        const end_time = new Date(`${event_date}T${event_end}-00:00`);
        const valid_minutes = [0, 15, 30, 45];

        if (isNaN(start_time.getTime()) || isNaN(end_time.getTime())) {
          return res.status(400).json({ error: "Invalid event date or time" });
        }

        if (
          !valid_minutes.includes(start_time.getMinutes()) ||
          !valid_minutes.includes(end_time.getMinutes())
        ) {
          return res.status(400).json({
            error: "Event start / end minutes must be 00, 15, 30, 45",
          });
        }

        if (start_time.getTime() === end_time.getTime()) {
          return res
            .status(400)
            .json({ error: "Event start and end time must not be the same" });
        }

        if (start_time.getTime() - end_time.getTime() > 0) {
          return res
            .status(400)
            .json({ error: "Event start time cannot be after event end time" });
        }

        const eventsToInsert = {
          user_id,
          calendar_id,
          event_name,
          event_date,
          event_start,
          event_end,
          event_description,
        };

        const { data: userEventData, error: userEventError } = await supabase
          .schema("timetable")
          .from("user_events")
          .insert([eventsToInsert])
          .select("*");

        if (userEventError) {
          return res.status(400).json({ error: userEventError.message });
        }
        return res.status(201).json(userEventData);
      }
    } catch (error) {
      return res.status(500).send({ error });
    }
  }),

  /**
   * Get events for a given calendar
   *
   */
  getEvents: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { calendar_id } = req.params;

      // Retrieve the authenticated user
      const user_id = (req as any).user.id;

      // Check for calendar_id
      if (!calendar_id) {
        return res.status(400).json({ error: "calendar id is required" });
      }

      //Retrieve users allowed to access the timetable
      const { data: timetableData, error: timetableError } = await supabase
        .schema("timetable")
        .from("timetables")
        .select("*")
        .eq("id", calendar_id)
        .eq("user_id", user_id)
        .maybeSingle();

      if (timetableError)
        return res.status(400).json({ error: timetableError.message });

      //Validate timetable validity:
      if (!timetableData || timetableData.length === 0) {
        return res.status(404).json({ error: "Calendar id not found" });
      }

      const timetable_user_id = timetableData.user_id;

      //Validate user access
      if (user_id !== timetable_user_id) {
        return res
          .status(401)
          .json({ error: "Unauthorized access to timetable events" });
      }

      const { data: courseEvents, error: courseError } = await supabase
        .schema("timetable")
        .from("course_events")
        .select("*")
        .eq("user_id", user_id)
        .eq("calendar_id", calendar_id);

      const { data: userEvents, error: userError } = await supabase
        .schema("timetable")
        .from("user_events")
        .select("*")
        .eq("calendar_id", calendar_id)
        .eq("user_id", user_id);

      if (courseError || userError) {
        return res
          .status(400)
          .json({ error: courseError?.message || userError?.message });
      }

      return res.status(200).json({ courseEvents, userEvents });
    } catch (error) {
      return res.status(500).send({ error });
    }
  }),

  /**
   * Update an event
   * The request should provide:
   * - id (as URL parameter)
   * - offering_id for courseEvent, other event fields for userEvent
   */

  updateEvent: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        calendar_id,
        event_date,
        event_start,
        event_end,
        event_description,
        event_name,
        old_offering_id,
        new_offering_id,
        //Semester start and end date format: YYYY-MM-DD
        semester_start_date,
        semester_end_date,
      } = req.body;

      // Retrieve the authenticated user
      const user_id = (req as any).user.id;

      //Check for calendar_id
      if (!calendar_id) {
        return res.status(400).json({ error: "calendar id is required" });
      }

      //Retrieve users allowed to access the timetable
      const { data: timetableData, error: timetableError } = await supabase
        .schema("timetable")
        .from("timetables")
        .select("*")
        .eq("id", calendar_id)
        .eq("user_id", user_id)
        .maybeSingle();

      if (timetableError)
        return res.status(400).json({ error: timetableError.message });

      //Validate timetable validity:
      if (!timetableData || timetableData.length === 0) {
        return res.status(404).json({ error: "Calendar id not found" });
      }

      const timetable_user_id = timetableData.user_id;

      //Validate user access
      if (user_id !== timetable_user_id) {
        return res
          .status(401)
          .json({ error: "Unauthorized access to timetable events" });
      }

      if (new_offering_id) {
        //If an offering_id is provided: Updating a courseEvent
        //If old_offering_id does not match throw an error
        const { data: oldofferingData, error: oldofferingError } =
          await supabase
            .schema("timetable")
            .from("course_events")
            .select("*")
            .eq("offering_id", old_offering_id)
            .eq("user_id", user_id)
            .eq("calendar_id", calendar_id);
        if (oldofferingError)
          return res.status(400).json({ error: oldofferingError.message });

        if (!oldofferingData || oldofferingData.length === 0) {
          return res.status(400).json({
            error:
              "Invalid current offering_id or current offering id not found.",
          });
        }

        const { data: newofferingData, error: newofferingError } =
          await supabase
            .schema("course")
            .from("offerings")
            .select("*")
            .eq("id", new_offering_id)
            .maybeSingle();

        if (newofferingError)
          return res.status(400).json({ error: newofferingError.message });

        if (!newofferingData || newofferingData.length === 0) {
          return res.status(400).json({
            error: "Invalid offering_id or course offering not found.",
          });
        }

        const { data: courseEventData, error: courseEventError } =
          await supabase
            .schema("timetable")
            .from("course_events")
            .select("*")
            .eq("id", id)
            .eq("user_id", user_id)
            .eq("calendar_id", calendar_id)
            .maybeSingle();

        if (courseEventData.calendar_id !== timetableData.id) {
          return res.status(400).json({
            error: "Restriction id does not belong to the provided calendar id",
          });
        }

        const courseEventName = `${newofferingData.code} - ${newofferingData.meeting_section}`;
        const courseDay = newofferingData.day;
        const courseStartTime = newofferingData.start;
        const courseEndTime = newofferingData.end;

        let eventsToInsert: any[];
        if (semester_start_date && semester_end_date) {
          eventsToInsert = generateWeeklyCourseEvents(
            user_id,
            courseEventName,
            courseDay,
            courseStartTime,
            courseEndTime,
            calendar_id,
            new_offering_id,
            semester_start_date,
            semester_end_date,
          );
        } else {
          const eventDate = getNextWeekDayOccurance(courseDay);
          eventsToInsert = [
            {
              user_id,
              calendar_id,
              event_name: courseEventName,
              event_date: eventDate,
              event_start: courseStartTime,
              event_end: courseEndTime,
              event_description: null,
              offering_id: new_offering_id,
            },
          ];
        }

        //Delete old course events for this offering and calendar
        const { error: deleteError } = await supabase
          .schema("timetable")
          .from("course_events")
          .delete()
          .eq("user_id", user_id)
          .eq("calendar_id", calendar_id)
          .eq("offering_id", old_offering_id);

        if (deleteError) {
          return res.status(400).json({ error: deleteError.message });
        }

        //Insert new set of events
        const { data: updateData, error: updateError } = await supabase
          .schema("timetable")
          .from("course_events")
          .insert(eventsToInsert)
          .select("*");
        if (updateError)
          return res.status(400).json({ error: updateError.message });

        return res.status(200).json(updateData);
      } else {
        const { data: userEventData, error: usereventError } = await supabase
          .schema("timetable")
          .from("user_events")
          .select("*")
          .eq("id", id)
          .eq("calendar_id", calendar_id)
          .eq("user_id", user_id)
          .maybeSingle();

        if (userEventData.calendar_id !== timetableData.id) {
          return res.status(400).json({
            error: "Event id does not belong to the provided calendar id",
          });
        }

        // Function to construct date in local time

        let start_time = null;
        let end_time = null;
        let date = null;
        const valid_minutes = [0, 15, 30, 45];

        if (!event_date) {
          date = userEventData.event_date;
        } else {
          date = event_date;
        }

        if (event_start) {
          start_time = new Date(`${date}T${event_start}-00:00`);
          if (!valid_minutes.includes(start_time.getMinutes())) {
            return res.status(400).json({
              error: "Event start time must be 00, 15, 30, 45",
            });
          }
        } else {
          start_time = new Date(`${date}T${userEventData.event_start}-00:00`);
        }

        if (event_end) {
          end_time = new Date(`${date}T${event_end}-00:00`);
          if (!valid_minutes.includes(end_time.getMinutes())) {
            return res.status(400).json({
              error: "Event end  time must be 00, 15, 30, 45",
            });
          }
        } else {
          end_time = new Date(`${date}T${userEventData.event_end}-00:00`);
        }

        if (!start_time || !end_time) {
          console.log("Start time or end time is null");
          console.log("start_time:", start_time);
          console.log("end_time:", end_time);
        }

        if (start_time.getTime() === end_time.getTime()) {
          return res
            .status(400)
            .json({ error: "Event start and end time must not be the same" });
        }

        if (start_time.getTime() > end_time.getTime()) {
          return res
            .status(400)
            .json({ error: "Event start time cannot be after event end time" });
        }

        //Update userEvent
        const updateData = {
          calendar_id,
          event_date,
          event_start,
          event_end,
          event_description,
          event_name,
        };

        const { data: updateResult, error: updateError } = await supabase
          .schema("timetable")
          .from("user_events")
          .update(updateData)
          .eq("id", id)
          .eq("user_id", user_id)
          .eq("calendar_id", calendar_id)
          .select("*");

        if (updateError)
          return res.status(400).json({ error: updateError.message });

        return res.status(200).json(updateResult);
      }
    } catch (error) {
      return res.status(500).send({ error });
    }
  }),

  /**
   * Delete an event
   */
  deleteEvent: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { calendar_id, event_type, offering_id } = req.query;

      // Retrieve the authenticated user
      const user_id = (req as any).user.id;

      //Check for calendar_id
      if (!calendar_id) {
        return res.status(400).json({ error: "calendar id is required" });
      }

      //Retrieve users allowed to access the timetable
      const { data: timetableData, error: timetableError } = await supabase
        .schema("timetable")
        .from("timetables")
        .select("*")
        .eq("id", calendar_id)
        .eq("user_id", user_id)
        .maybeSingle();

      if (timetableError)
        return res.status(400).json({ error: timetableError.message });

      //Validate timetable validity:
      if (!timetableData || timetableData.length === 0) {
        return res.status(404).json({ error: "Calendar id not found" });
      }

      const timetable_user_id = timetableData.user_id;

      //Validate user access
      if (user_id !== timetable_user_id) {
        return res
          .status(401)
          .json({ error: "Unauthorized access to timetable events" });
      }

      if (!event_type) {
        return res.status(400).json({ error: "event type is required" });
      }

      if (event_type === "course") {
        //Validate note availability
        const { data: courseEventData, error: courseEventError } =
          await supabase
            .schema("timetable")
            .from("course_events")
            .select("*")
            .eq("id", id)
            .eq("user_id", user_id)
            .eq("calendar_id", calendar_id)
            .maybeSingle();

        if (courseEventError)
          return res.status(400).json({ error: courseEventError.message });

        if (!courseEventData || courseEventData.length === 0) {
          return res
            .status(400)
            .json({ error: "Provided note ID is invalid or does not exist" });
        }

        if (courseEventData.calendar_id !== timetableData.id) {
          return res.status(400).json({
            error: "Restriction id does not belong to the provided calendar id",
          });
        }

        //Build the delete query
        let deleteQuery = supabase
          .schema("timetable")
          .from("course_events")
          .delete();

        //If offering_id is provided, delete all events with that offering_id
        //Else delete that one occurence

        if (offering_id) {
          deleteQuery = deleteQuery.eq("offering_id", offering_id);
        } else {
          deleteQuery = deleteQuery.eq("id", id);
        }

        const { error: deleteError } = await deleteQuery
          .eq("calendar_id", calendar_id)
          .eq("user_id", user_id)
          .select("*");
        if (deleteError)
          return res.status(400).json({ error: deleteError.message });

        return res.status(200).send("Event successfully deleted");
      } else if (event_type === "user") {
        //Validate note availability
        const { data: userEventData, error: userEventError } = await supabase
          .schema("timetable")
          .from("user_events")
          .select("*")
          .eq("id", id)
          .eq("user_id", user_id)
          .eq("calendar_id", calendar_id)
          .maybeSingle();

        if (userEventError)
          return res.status(400).json({ error: userEventError.message });

        if (!userEventData || userEventData.length === 0) {
          return res
            .status(400)
            .json({ error: "Provided note ID is invalid or does not exist" });
        }

        if (userEventData.calendar_id !== timetableData.id) {
          return res.status(400).json({
            error: "Restriction id does not belong to the provided calendar id",
          });
        }

        const { error: deleteError } = await supabase
          .schema("timetable")
          .from("user_events")
          .delete()
          .eq("id", id)
          .eq("user_id", user_id)
          .eq("calendar_id", calendar_id)
          .select("*");

        if (deleteError)
          return res.status(400).json({ error: deleteError.message });

        return res.status(200).send("Event successfully deleted");
      } else {
        return res.status(400).json({ error: "Invalid event type provided" });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  }),
};
