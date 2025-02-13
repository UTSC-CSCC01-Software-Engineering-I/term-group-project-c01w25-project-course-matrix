import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { supabaseCourseClient } from "../db/setupDb";

export default {
    getOfferings: asyncHandler(async (req: Request, res: Response) => {
        try {
            const { course_code, semester } = req.query;
            
            let departmentsQuery = supabaseCourseClient
                .from("offerings")
                .select()
                .eq("code", course_code)
                .eq("offering", semester);

            // Get the data and errors from the query
            const { data: departmentsData, error: departmentsError } = await departmentsQuery;

            const departments = departmentsData || [];

            res.status(200).json(departments);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }),
}