import { z, ZodType } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

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

export const RestrictionSchema = z
  .object({
    type: z.string().min(1, "Restriction type is required"),
    days: z.array(z.string()).optional(),
    numDays: z
      .number()
      .positive()
      .max(4, "Cannot block all days of the week")
      .optional(),
    // startTime: z.string().regex(timeRegex, "Invalid time format (HH:MM)").optional(),
    // endTime: z.string().regex(timeRegex, "Invalid time format (HH:MM)").optional(),
    startTime: z.date().optional(),
    endTime: z.date().optional(),
    disabled: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.startTime < data.endTime;
      }
      return true; // Allow if either undefined
    },
    {
      message: "Start time must be before end time",
      path: ["startTime"],
    }
  )
  .refine(
    (data) => {
      if (
        data.type &&
        (data.type === "Restrict Before" || data.type === "Restrict Between") &&
        !data.endTime
      )
        return false;
      return true;
    },
    {
      message: "Must choose time",
      path: ["endTime"],
    }
  )
  .refine(
    (data) => {
      if (
        data.type &&
        (data.type === "Restrict After" || data.type === "Restrict Between") &&
        !data.startTime
      )
        return false;
      return true;
    },
    {
      message: "Must choose time",
      path: ["startTime"],
    }
  )
  .refine(
    (data) => {
      if (
        data.type &&
        data.type === "Restrict Day" &&
        data.days &&
        data.days.length > 4
      )
        return false;
      return true;
    },
    {
      message: "Cannot block all days",
      path: ["days"],
    }
  )
  .refine(
    (data) => {
      if (
        data.type &&
        data.type.startsWith("Restrict") &&
        data.days &&
        data.days.length < 1
      )
        return false;
      return true;
    },
    {
      message: "Must choose at least 1 day",
      path: ["days"],
    }
  )
  .refine(
    (data) => {
      if (
        data.type &&
        data.type === "Days Off" &&
        data.numDays &&
        data.numDays > 4
      )
        return false;
      return true;
    },
    {
      message: "Cannot block all days",
      path: ["numDays"],
    }
  )
  .refine(
    (data) => {
      if (
        data.type &&
        data.type === "Days Off" &&
        (!data.numDays || data.numDays < 1)
      )
        return false;
      return true;
    },
    {
      message: "Number must be at least 1",
      path: ["numDays"],
    }
  )
  .refine(
    (data) => {
      if (
        data.type &&
        data.type === "Restrict Before" &&
        data.endTime?.getHours() === 0 &&
        data.endTime?.getMinutes() === 0
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Cannot restrict whole day",
      path: ["endTime"],
    }
  )
  .refine(
    (data) => {
      if (
        data.type &&
        data.type === "Restrict After" &&
        data.startTime?.getHours() === 0 &&
        data.startTime?.getMinutes() === 0
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Cannot restrict whole day",
      path: ["startTime"],
    }
  );

export const TimetableFormSchema: ZodType<TimetableForm> = z
  .object({
    name: z
      .string()
      .max(100, "Name cannot exceed 100 characters")
      .min(1, "Name cannot be empty"),
    date: z.date(),
    semester: SemesterEnum,
    search: z.string(),
    courses: z.array(CourseSchema),
    restrictions: z.array(RestrictionSchema),
  })
  .refine(
    (data) => {
      return !(data.courses.length < 1);
    },
    {
      message: "Must pick at least 1 course",
      path: ["search"],
    }
  )
  .refine(
    (data) => {
      return !(data.courses.length > 8);
    },
    {
      message: "Cannot pick more than 8 courses",
      path: ["search"],
    }
  )
  .refine(
    (data) => {
      return !(
        data.restrictions.filter((r) => r.type === "Days Off").length > 1
      );
    },
    {
      message: "Already added minimum days off per week",
      path: ["restrictions"],
    }
  );

export const baseTimetableForm: TimetableForm = {
  name: "New Timetable",
  date: new Date(),
  semester: "Fall 2025",
  search: "",
  courses: [],
  restrictions: [],
};

export const baseRestrictionForm: RestrictionForm = {
  type: "",
  days: [],
  disabled: false,
};
