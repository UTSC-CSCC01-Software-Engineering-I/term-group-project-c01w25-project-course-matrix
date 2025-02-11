import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { supabaseCourseClient } from "../db/setupDb";

export default {
	getCourses: asyncHandler(async (req: Request, res: Response) => {
		try {
			let query = supabaseCourseClient.from("courses").select();
			// TODO: Discuss with team about how we should filter by semester since `semester` is not a column in the courses table.
			// The commented-out lines below are just a placeholder for now.
			// const { semester, creditWeight, breadthRequirement } = req.query;
			// console.log("Filters Passed In: ", req.query);
			// if (semester) {
			// 	query = query.eq("semester", semester);
			// }
			// if (creditWeight) {
			// 	query = query.eq("creditWeight", creditWeight);
			// }
			// if (breadthRequirement) {
			// 	query = query.eq("breadthRequirement", breadthRequirement);
			// }
			const { data, error } = await query;
			if (error) {
				throw error;
			}
			return res.status(200).send(data);
		} catch (err) {
			return res.status(500).send({ err });
		}
	}),
};