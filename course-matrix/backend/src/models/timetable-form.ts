import { z, ZodType } from "zod";

export type TimetableForm = {
  name: string;
  date: Date;
  semester: string;
  search: string;
  courses: {
    id: number;
    code: string;
    name: string;
  }[];
  restrictions: RestrictionForm[];
};

export type RestrictionForm = {
  type: string;
  days?: string[];
  numDays?: number;
  startTime?: Date;
  endTime?: Date;
  disabled?: boolean;
};

export const daysOfWeek = [
  {
    id: "MO",
    label: "Monday",
  },
  {
    id: "TU",
    label: "Tuesday",
  },
  {
    id: "WE",
    label: "Wednesday",
  },
  {
    id: "TH",
    label: "Thursday",
  },
  {
    id: "FR",
    label: "Friday",
  },
] as const;

export const DayOfWeekEnum = z.enum(["SU", "MO", "TU", "WE", "TH", "FR", "SA"]);

export const SemesterEnum = z.enum(["Summer 2025", "Fall 2025", "Winter 2026"]);

export const CourseSchema = z.object({
  id: z.number().describe("The id of the course"),
  code: z
    .string()
    .max(8, "Invalid course code")
    .min(1, "Course code is required")
    .describe(
      "The course code. Formatted like: CSCA08H3. Course codes cannot be provided without the H3 at the end.",
    ),
  name: z.string().describe("The name of the course"),
});

export const RestrictionSchema = z.object({
  type: z
    .enum([
      "Restrict Before",
      "Restrict AFter",
      "Restrict Between",
      "Restrict Day",
      "Days Off",
    ])
    .describe("The type of restriction being applied"),
  days: z
    .array(z.string())
    .optional()
    .describe("Specific days of the week this restriction applies to"),
  numDays: z
    .number()
    .positive()
    .max(4, "Cannot block all days of the week")
    .optional()
    .describe(
      "If type is Days Off, then this field is used and describes min number of days off per week.",
    ),
  startTime: z
    .date()
    .optional()
    .describe(
      "If type is Restrict After, or Restrict Between, then this field describes the start boundary of the restricted time",
    ),
  endTime: z
    .date()
    .optional()
    .describe(
      "If type is Restrict Before, or Restrict Between, then this field describes the end boundary of the restricted time",
    ),
  disabled: z
    .boolean()
    .optional()
    .describe("Whether this restriction is currently disabled"),
});

export const TimetableFormSchema = z.object({
  name: z
    .string()
    .max(100, "Name cannot exceed 100 characters")
    .min(1, "Name cannot be empty")
    .describe("Title of timetable"),
  date: z.date().describe("Creation time of timetable"),
  semester: SemesterEnum,
  search: z.string().describe("Keeps track of search query. Only used in UI."),
  courses: z.array(CourseSchema),
  restrictions: z.array(RestrictionSchema),
});
