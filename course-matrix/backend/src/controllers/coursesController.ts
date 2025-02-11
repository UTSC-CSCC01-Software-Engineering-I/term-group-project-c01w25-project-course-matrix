import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { supabaseCourseClient } from "../db/setupDb";

export default {
	getCourses: asyncHandler(async (req: Request, res: Response) => {
		try {
			const { semester, creditWeight, breadthRequirement } = req.query;
			let query = supabaseCourseClient.from("courses").select();
			if (breadthRequirement) {
				query = query.eq("breadth_requirement", breadthRequirement);
			}
			
			// The commented-out lines below are just a placeholder for now.
			// if (semester) {
			// 	query = query.eq("semester", semester);
			// }
			// if (creditWeight) {
			// 	query = query.eq("creditWeight", creditWeight);
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