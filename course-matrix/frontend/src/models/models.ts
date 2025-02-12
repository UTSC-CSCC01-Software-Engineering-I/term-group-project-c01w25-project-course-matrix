// Types for database models
export type CourseModel = {
  id: number,
  createdAt: string,
  updatedAt: string,
  code: string,
  breadthRequirement?: string,
  courseExperience?: string,
  description?: string,
  prerequisiteDescription?: string,
  exclusionDescription?: string,
  name: string,
  recommendedPreperation?: string,
  corequisiteDescription?: string,
  note?: string,
}

export type DepartmentModel = {
  id: number,
  createdAt: string,
  updatedAt: string,
  code: string,
  name: string,
}