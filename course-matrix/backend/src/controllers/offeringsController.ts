import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { supabase } from "../db/setupDb";
import { generateWeeklyCourseEvents } from "./eventsController";

export default {
	/**
	 * Get a list of offering events based on offering ids, semester start date, and semester end date.
	 *
	 * @param {Request} req - The request object containing query parameters.
	 * @param {Response} res - The response object to send the offering events data.
	 * @returns {Promise<Response>} - The response object with the offering events data.
	 */
	getOfferingEvents: asyncHandler(async (req: Request, res: Response) => {
		const { offering_ids, semester_start_date, semester_end_date } = req.query;

		// Retrieve the authenticated user
		const user_id = (req as any).user.id;

		// Check if semester start and end dates are provided
		if (!semester_start_date || !semester_end_date) {
			return res.status(400).json({
				error: "Semester start and end dates are required.",
			});
		}

		if (!offering_ids) {
			return res.status(200).json([]); // Return an empty array if no offering_ids are provided
		}

		const offering_ids_array = (offering_ids as string).split(",");
		let eventsToInsert: any[] = [];

		const promises = offering_ids_array.map(async (offering_id) => {
			// Get the offering data
			const { data: offeringData, error: offeringError } = await supabase
				.schema("course")
				.from("offerings")
				.select("*")
				.eq("id", offering_id)
				.maybeSingle();

			if (offeringError) {
				return res.status(400).json({ error: offeringError.message });
			}

			if (!offeringData || offeringData.length === 0) {
				return res.status(400).json({
					error: "Invalid offering_id or course offering not found.",
				});
			}

			// Generate event details
			const courseEventName = ` ${offeringData.code} - ${offeringData.meeting_section} `;
			let courseDay = offeringData.day;
			let courseStartTime = offeringData.start;
			let courseEndTime = offeringData.end;

			// Some offerings do not have a day, start time, or end time in the database, so we set default values
			if (!courseDay || !courseStartTime || !courseEndTime) {
				courseDay = "MO";
				courseStartTime = "08:00:00";
				courseEndTime = "09:00:00";
			}

			const mockCalendarId = "1";
			const events = generateWeeklyCourseEvents(
				user_id,
				courseEventName,
				courseDay,
				courseStartTime,
				courseEndTime,
				mockCalendarId,
				offering_id as string,
				semester_start_date as string,
				semester_end_date as string
			);
			eventsToInsert = [...eventsToInsert, ...events];
		});

		await Promise.all(promises);

		if (eventsToInsert.length === 0) {
			return res.status(400).json({
				error: "Failed to generate course events",
			});
		}

		// Return the generated events
		return res.status(200).json(eventsToInsert);
	}),

	/**
	 * Get a list of offerings based on course code and semester.
	 *
	 * @param {Request} req - The request object containing query parameters.
	 * @param {Response} res - The response object to send the offerings data.
	 * @returns {Promise<Response>} - The response object with the offerings data.
	 */
	getOfferings: asyncHandler(async (req: Request, res: Response) => {
		try {
			const { course_code, semester } = req.query;

			let offeringsQuery = supabase
				.schema("course")
				.from("offerings")
				.select()
				.eq("code", course_code)
				.eq("offering", semester);

			// Get the data and errors from the query
			const { data: offeringsData, error: offeringsError } =
				await offeringsQuery;

			const offerings = offeringsData || [];

			res.status(200).json(offerings);
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal Server Error" });
		}
	}),
};
