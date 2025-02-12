import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { supabaseCourseClient } from "../db/setupDb";

export default {
	getCourses: asyncHandler(async (req: Request, res: Response) => {
		try {
			// Query the courses, offerings, and departments tables from the database
			let coursesQuery = supabaseCourseClient.from("courses").select();
			let offeringsQuery = supabaseCourseClient.from("offerings").select();

			// Get the data and errors from the queries
			const { data: coursesData, error: coursesError } = await coursesQuery;
			const { data: offeringsData, error: offeringsError } = await offeringsQuery;

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

			// Get the query parameters
			const { breadthRequirement, creditWeight, semester, department, yearLevel } = req.query;
			
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
					return courseCodesToSemestersMap[course.code]?.includes(semester as string);
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
					const courseYearLevel = course.code.charCodeAt(3) - 'A'.charCodeAt(0) + 1;
					return courseYearLevel === Number(yearLevel);
				});
			}

			// Return the filtered courses
			return res.status(200).send(filteredCourses);
		} catch (err) {
			return res.status(500).send({ err });
		}
	}),
};
