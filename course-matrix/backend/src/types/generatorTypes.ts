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

// Enum to define different types of restrictions for offerings
export enum RestrictionType {
  RestrictBefore = "Restrict Before",
  RestrictAfter = "Restrict After",
  RestrictBetween = "Restrict Between",
  RestrictDay = "Restrict Day",
  RestrictDaysOff = "Days Off",
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

// Interface for organizing offerings with the same meeting_section together
export interface GroupedOfferingList {
  course_id: number;
  groups: Record<string, Offering[]>;
}

// Interface for organizing offerings by course ID
export interface OfferingList {
  course_id: number;
  offerings: Offering[];
}

// Interface for organizing offerings by course ID and the category of the
// course (LEC, TUT, PRA)
export interface CategorizedOfferingList {
  course_id: number;
  category: "LEC" | "TUT" | "PRA";
  offerings: Record<string, Offering[]>;
}
