import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { supabaseCourseClient } from "../db/setupDb";

export default {
	getCourses: asyncHandler(async (req: Request, res: Response) => {
		try {
			const { semester, creditWeight, breadthRequirement } = req.query;

			// Query the courses from the database
			let coursesQuery = supabaseCourseClient.from("courses").select();
			const { data, error } = await coursesQuery;

			// Create a map of course codes to semesters.
			const courseCodesToSemestersMap: { [key: string]: string[] } = {};
			let offeringsQuery = supabaseCourseClient.from("offerings").select();
			const { data: offeringsData, error: offeringsError } = await offeringsQuery;
			const offerings = offeringsData || [];
			offerings.forEach((offering) => {
				const courseCode = offering.code;
				const semester = offering.offering;
				if (courseCodesToSemestersMap[courseCode]) {
					courseCodesToSemestersMap[courseCode].push(semester);
				} else {
					courseCodesToSemestersMap[courseCode] = [semester];
				}
			});

			let filteredCourses = data || [];

			// Filter the courses based on the breadth requirement
			if (breadthRequirement) {
				filteredCourses = filteredCourses.filter((course) => {
					return course.breadth_requirement === breadthRequirement;
				});
			}

			// Filter the courses based on the credit weight
			if (creditWeight) {
				filteredCourses = filteredCourses.filter((course) => {
					const courseCreditWeight =
						course.code[course.code.length - 2] === "H" ? 0.5 : 1;
					return courseCreditWeight === Number(creditWeight);
				});
			}

			// Filter the courses based on the semester
			if (semester) {
				filteredCourses = filteredCourses.filter((course) => {
					return courseCodesToSemestersMap[course.code].includes(
						semester as string
					);
				});
			}

			// Debugging logs (WILL BE REMOVED)
			console.log("courseCodesToSemestersMap: ", courseCodesToSemestersMap);
			console.log("Query Params: ", req.query);
			console.log(
				"Filtered Courses (First 5 entries): ",
				filteredCourses.slice(0, 5)
			);

			return res.status(200).send(filteredCourses);
		} catch (err) {
			return res.status(500).send({ err });
		}
	}),
};
