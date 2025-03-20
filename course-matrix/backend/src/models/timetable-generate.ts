import { z } from "zod";
import { DayOfWeekEnum, SemesterEnum } from "./timetable-form";

export const CreateTimetableArgs = z.object({
  schedule: z.array(
    z
      .object({
        id: z.number().nonnegative().describe("Course event ID"),
        course_id: z
          .number()
          .nonnegative()
          .describe("ID of course this event is for"),
        meeting_section: z
          .string()
          .describe("Meeting section e.g LEC01, TUT0002, PRAC0003"),
        offering: SemesterEnum,
        day: DayOfWeekEnum,
        start: z
          .string()
          .describe("Time string HH:mm:ss represnting start time of event"),
        end: z
          .string()
          .describe("Time string HH:mm:ss represnting start time of event"),
        location: z
          .string()
          .describe("Building and room in which event takes place"),
        current: z
          .number()
          .nonnegative()
          .optional()
          .describe("Current number of people enrolled"),
        max: z
          .number()
          .nonnegative()
          .optional()
          .describe("Max number of people that can enroll"),
        isWaitlisted: z
          .boolean()
          .optional()
          .describe("Whether the event is full or not"),
        deliveryMode: z
          .string()
          .optional()
          .describe("If event is online synchronough, in person, etc"),
        instructor: z
          .string()
          .optional()
          .describe("Instructor of course event"),
        notes: z.string().optional(),
        code: z.string().describe("Course code"),
      })
      .describe("A course event")
  ),
});
