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

export const SemesterEnum = z.enum(["Summer 2025", "Fall 2025", "Winter 2026"]);

export const CourseSchema = z.object({
  id: z.number(),
  code: z
    .string()
    .max(8, "Invalid course code")
    .min(1, "Course code is required"),
  name: z.string(),
});

export const RestrictionSchema = z.object({
  type: z.string().min(1, "Restriction type is required"),
  days: z.array(z.string()).optional(),
  numDays: z
    .number()
    .positive()
    .max(4, "Cannot block all days of the week")
    .optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  disabled: z.boolean().optional(),
});

export const TimetableFormSchema = z.object({
  name: z
    .string()
    .max(100, "Name cannot exceed 100 characters")
    .min(1, "Name cannot be empty"),
  date: z.date(),
  semester: SemesterEnum,
  search: z.string(),
  courses: z.array(CourseSchema),
  restrictions: z.array(RestrictionSchema),
});
