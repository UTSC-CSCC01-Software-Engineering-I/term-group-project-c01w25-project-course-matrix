import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { supabaseCourseClient } from "../db/setupDb";

export default {
	getCourses: asyncHandler(async (req: Request, res: Response) => {
		try {
			const { semester, creditWeight, breadthRequirement } = req.query;

			// Query the courses table for courses that match the given breadth requirement.
			let coursesQuery = supabaseCourseClient
				.from("courses")
				.select()
				.eq("breadth_requirement", breadthRequirement);
			const { data, error } = await coursesQuery;

			// Create a map of course codes to semesters.
			const courseCodesToSemestersMap: { [key: string]: string[] } = {};
			let offeringsQuery = supabaseCourseClient.from("offerings").select();
			const { data: offeringsData, error: offeringsError } =
				await offeringsQuery;
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

			// Filter the courses based on the semester
			const courses = data || [];
			const filteredCourses = courses.filter((course) => {
				const courseCode = course.code;
				const semesters = courseCodesToSemestersMap[courseCode] || [];
				return semester && semesters.includes(semester as string);
			});

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
