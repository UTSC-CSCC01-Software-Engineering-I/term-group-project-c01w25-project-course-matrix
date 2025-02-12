import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { supabaseCourseClient } from "../db/setupDb";

export default {
    getDepartments: asyncHandler(async (req: Request, res: Response) => {
        try {
            // Query the departments table from the database
            let departmentsQuery = supabaseCourseClient.from("departments").select();

            // Get the data and errors from the query
            const { data: departmentsData, error: departmentsError } = await departmentsQuery;

            // Set the departments data
            const departments = departmentsData || [];

            // Return the departments
            res.status(200).json(departments);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }),
}