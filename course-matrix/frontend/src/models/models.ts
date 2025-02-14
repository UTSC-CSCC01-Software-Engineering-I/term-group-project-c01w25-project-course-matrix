// Types for database models
export interface CourseModel {
  id: number,
  created_at: string,
  updated_at: string,
  code: string,
  breadth_requirement?: string,
  course_experience?: string,
  description?: string,
  prerequisite_description?: string,
  exclusion_description?: string,
  name: string,
  recommended_preperation?: string,
  corequisite_description?: string,
  note?: string,
}

export interface DepartmentModel {
  id: number,
  createdAt: string,
  updatedAt: string,
  code: string,
  name: string,
}

export interface PrerequisiteModel {
  id: number,
  created_at: string,
  updated_at: string,
  course_id: number,
  prerequisite_id: number,
  course_code: string,
  prerequisite_code: string,
}

export interface CorequisiteModel {
  id: number,
  created_at: string,
  updated_at: string,
  course_id: number,
  corequisite_id: number,
  course_code: string,
  corequisite_code: string,
}

export interface OfferingModel {
  id: number,
  created_at: string,
  updated_at: string,
  course_id: number,
  code: string,
  meeting_section: string,
  offering: string,
  day: string,
  start: string,
  end: string,
  location: string,
  current: string,
  max: string,
  is_waitlisted: boolean,
  delivery_mode: string,
  instructor: string,
  notes: string,
}