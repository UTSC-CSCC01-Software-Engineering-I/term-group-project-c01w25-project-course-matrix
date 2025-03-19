/**
 * Represents a course in the system.
 */
export interface CourseModel {
  /** Unique identifier for the course */
  id: number;

  /** Timestamp of when the course was created */
  created_at: string;

  /** Timestamp of when the course was last updated */
  updated_at: string;

  /** Unique course code (e.g., "CS101") */
  code: string;

  /** Breadth requirement associated with the course (optional) */
  breadth_requirement?: string;

  /** Description of the course experience (optional) */
  course_experience?: string;

  /** Detailed description of the course (optional) */
  description?: string;

  /** Prerequisite course description (optional) */
  prerequisite_description?: string;

  /** Exclusion course description (optional) */
  exclusion_description?: string;

  /** Name of the course */
  name: string;

  /** Recommended preparation for the course (optional) */
  recommended_preperation?: string;

  /** Corequisite course description (optional) */
  corequisite_description?: string;

  /** Additional notes about the course (optional) */
  note?: string;
}

/**
 * Represents a department in the system.
 */
export interface DepartmentModel {
  /** Unique identifier for the department */
  id: number;

  /** Timestamp of when the department was created */
  createdAt: string;

  /** Timestamp of when the department was last updated */
  updatedAt: string;

  /** Unique code for the department (e.g., "CS" for Computer Science) */
  code: string;

  /** Name of the department (e.g., "Computer Science") */
  name: string;
}

/**
 * Represents a prerequisite relationship between two courses.
 */
export interface PrerequisiteModel {
  /** Unique identifier for the prerequisite relationship */
  id: number;

  /** Timestamp of when the prerequisite relationship was created */
  created_at: string;

  /** Timestamp of when the prerequisite relationship was last updated */
  updated_at: string;

  /** Course ID for the course that has the prerequisite */
  course_id: number;

  /** Course ID for the course that is the prerequisite */
  prerequisite_id: number;

  /** Course code for the course that has the prerequisite */
  course_code: string;

  /** Course code for the prerequisite course */
  prerequisite_code: string;
}

/**
 * Represents a corequisite relationship between two courses.
 */
export interface CorequisiteModel {
  /** Unique identifier for the corequisite relationship */
  id: number;

  /** Timestamp of when the corequisite relationship was created */
  created_at: string;

  /** Timestamp of when the corequisite relationship was last updated */
  updated_at: string;

  /** Course ID for the course that has the corequisite */
  course_id: number;

  /** Course ID for the course that is the corequisite */
  corequisite_id: number;

  /** Course code for the course that has the corequisite */
  course_code: string;

  /** Course code for the corequisite course */
  corequisite_code: string;
}

/**
 * Represents an offering of a course, including details such as schedule and capacity.
 */
export interface OfferingModel {
  /** Unique identifier for the course offering */
  id: number;

  /** Timestamp of when the course offering was created */
  created_at: string;

  /** Timestamp of when the course offering was last updated */
  updated_at: string;

  /** ID of the course being offered */
  course_id: number;

  /** Unique code for the offering (e.g., "001" for a specific section) */
  code: string;

  /** The meeting section for the course offering (e.g "LEC 01", "TUT 0001") */
  meeting_section: string;

  /** Offering identifier (e.g., "Fall 2025") */
  offering: string;

  /** Day(s) of the week the course is offered */
  day: string;

  /** Start time of the course offering */
  start: string;

  /** End time of the course offering */
  end: string;

  /** Location where the course is held */
  location: string;

  /** Number of students currently enrolled */
  current: string;

  /** Maximum number of students allowed in the offering */
  max: string;

  /** Indicates if the offering has a waitlist */
  is_waitlisted: boolean;

  /** Delivery mode of the course (e.g., "Online Synchronous", "In-person") */
  delivery_mode: string;

  /** Instructor name for the course offering */
  instructor: string;

  /** Additional notes about the course offering */
  notes: string;
}

/**
 * Represents a timetable including details like its title, semester, and favorite satus
 */
export interface TimetableModel {
  /** Unique identifier */
  id: number;

  /** Creation timestamp */
  created_at: string;

  /** Last updated at timestamp  */
  updated_at: string;

  /**  Name of timetable */
  timetable_title: string;

  /** ID of user owning this timetable  */
  user_id: string;

  /** Semester that the timetable is for */
  semester: string;

  /** Is timetable favorited by user */
  favorite: boolean;

  /** Has user enabled email notifications for this timetable */
  email_notifications_enabled: boolean;
}
