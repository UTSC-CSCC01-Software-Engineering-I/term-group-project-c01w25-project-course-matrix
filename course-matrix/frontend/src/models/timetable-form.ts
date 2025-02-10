import { z, ZodType } from "zod"

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

export type TimetableForm = {
  name: string,
  date: Date,
  semester: string,
  search: string,
  courses: {
    id: number,
    code: string,
    name: string,
  }[],
  restrictions: {
    type: string,
    days?: DayOfWeek[],
    numDays?: number,
    startTime?: string,
    endTime?: string,
    disabled?: boolean,
  }[]
}

export type RestrictionForm = {
  type: string,
  days?: DayOfWeek[],
  numDays?: number,
  startTime?: string,
  endTime?: string,
  disabled?: boolean,
}

export type DayOfWeek = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU"

export const SemesterEnum = z.enum(["Summer 2025", "Fall 2025", "Winter 2026"])

export const CourseSchema = z.object({
  id: z.number(),
  code: z.string().max(8, "Invalid course code").min(1, "Course code is required"),
  name: z.string(),
})

export const RestrictionSchema = z.object({
  type: z.string().min(1, "Restriction type is required"),
  days: z.array(z.enum(["MO" , "TU" , "WE" , "TH" , "FR" ,"SA" , "SU"])).optional(),
  numDays: z.number().positive().optional(),
  startTime: z.string().regex(timeRegex, "Invalid time format (HH:MM)").optional(),
  endTime: z.string().regex(timeRegex, "Invalid time format (HH:MM)").optional(),
  disabled: z.boolean().optional(),
})

export const TimetableFormSchema: ZodType<TimetableForm> = z.object({
  name: z.string().max(100, "Name cannot exceed 100 characters").min(1, "Name cannot be empty"),
  date: z.date(),
  semester: SemesterEnum,
  search: z.string(),
  courses: z.array(CourseSchema).min(1, "At least 1 course is required"),
  restrictions: z.array(RestrictionSchema)
})

export const baseTimetableForm: TimetableForm = {
  name: "New Timetable",
  date: new Date(),
  semester: "Fall 2025",
  search: "",
  courses: [],
  restrictions: [],
}

export const baseRestrictionForm: RestrictionForm = {
  type: "",
  days: [],
  disabled: false,
}

