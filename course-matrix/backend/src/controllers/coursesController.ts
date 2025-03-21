import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { supabase } from "../db/setupDb";

const DEFAULT_COURSE_LIMIT = 1000;

export default {
  /**
   * Get a list of courses based on various query parameters.
   *
   * @param {Request} req - The request object containing query parameters.
   * @param {Response} res - The response object to send the filtered courses.
   * @returns {Promise<Response>} - The response object with the filtered courses.
   */
  getCourses: asyncHandler(async (req: Request, res: Response) => {
    try {
      // Get the query parameters
      const {
        limit,
        search,
        semester,
        breadthRequirement,
        creditWeight,
        department,
        yearLevel,
      } = req.query;

      // Query the courses, offerings tables from the database
      let coursesQuery = supabase
        .schema("course")
        .from("courses")
        .select()
        .limit(Number(limit || DEFAULT_COURSE_LIMIT));

      if ((search as string)?.trim()) {
        coursesQuery = coursesQuery.or(
          `code.ilike.%${search}%,name.ilike.%${search}%`,
        );
      }
      let offeringsQuery = supabase.schema("course").from("offerings").select();

      // Get the data and errors from the queries
      const { data: coursesData, error: coursesError } = await coursesQuery;
      const { data: offeringsData, error: offeringsError } =
        await offeringsQuery;

      // Set the courses and offerings data
      const courses = coursesData || [];
      const offerings = offeringsData || [];

      // Create a map of course codes to semesters.
      const courseCodesToSemestersMap: { [key: string]: string[] } = {};
      offerings.forEach((offering) => {
        const courseCode = offering.code;
        const semester = offering.offering;
        if (courseCodesToSemestersMap[courseCode]) {
          courseCodesToSemestersMap[courseCode].push(semester);
        } else {
          courseCodesToSemestersMap[courseCode] = [semester];
        }
      });

      // Filter the courses based on the breadth requirement, credit weight, semester, department, and year level
      let filteredCourses = courses;
      if (breadthRequirement) {
        filteredCourses = filteredCourses.filter((course) => {
          return course.breadth_requirement === breadthRequirement;
        });
      }
      if (creditWeight) {
        filteredCourses = filteredCourses.filter((course) => {
          const courseCreditWeight =
            course.code[course.code.length - 2] === "H" ? 0.5 : 1;
          return courseCreditWeight === Number(creditWeight);
        });
      }
      if (semester) {
        filteredCourses = filteredCourses.filter((course) => {
          return courseCodesToSemestersMap[course.code]?.includes(
            semester as string,
          );
        });
      }
      if (department) {
        filteredCourses = filteredCourses.filter((course) => {
          const courseDepartment = course.code.substring(0, 3);
          return courseDepartment === department;
        });
      }
      if (yearLevel) {
        filteredCourses = filteredCourses.filter((course) => {
          const courseYearLevel =
            course.code.charCodeAt(3) - "A".charCodeAt(0) + 1;
          return courseYearLevel === Number(yearLevel);
        });
      }

      // Return the filtered courses
      return res.status(200).send(filteredCourses);
    } catch (err) {
      return res.status(500).send({ err });
    }
  }),

  /**
   * Gets the total number of sections for a list of courses.
   *
   * @param {Request} req - The request object containing query parameters.
   * @param {Response} res - The response object to send the total number of sections.
   * @returns {Promise<Response>} - The response object with the total number of sections.
   *
   */
  getNumberOfSections: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { course_ids, semester } = req.query;

      if (!semester) {
        return res.status(400).send({ error: "Semester is required" });
      }

      if (!course_ids) {
        return res.status(200).send({ totalNumberOfCourseSections: 0 });
      }

      const course_ids_array = (course_ids as string).split(",");

      let totalNumberOfCourseSections = 0;
      const promises = course_ids_array.map(async (course_id) => {
        const { data: courseOfferingsData, error: courseOfferingsError } =
          await supabase
            .schema("course")
            .from("offerings")
            .select()
            .eq("course_id", course_id)
            .eq("offering", semester);

        const offerings = courseOfferingsData || [];

        const hasLectures = offerings.some((offering) =>
          offering.meeting_section.startsWith("LEC"),
        );
        const hasTutorials = offerings.some((offering) =>
          offering.meeting_section.startsWith("TUT"),
        );
        const hasPracticals = offerings.some((offering) =>
          offering.meeting_section.startsWith("PRA"),
        );
        if (hasLectures) {
          totalNumberOfCourseSections += 1;
        }
        if (hasTutorials) {
          totalNumberOfCourseSections += 1;
        }
        if (hasPracticals) {
          totalNumberOfCourseSections += 1;
        }
      });

      await Promise.all(promises);
      return res.status(200).send({ totalNumberOfCourseSections });
    } catch (err) {
      return res.status(500).send({ err });
    }
  }),
};
