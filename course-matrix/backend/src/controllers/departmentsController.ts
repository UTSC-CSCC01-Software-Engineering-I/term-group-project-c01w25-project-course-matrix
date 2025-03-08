import { Request, Response } from "express";

import { supabase } from "../db/setupDb";
import asyncHandler from "../middleware/asyncHandler";

export default {
  /**
   * Get a list of departments from the database.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object to send the departments data.
   * @returns {Promise<Response>} - The response object with the departments data.
   */
  getDepartments: asyncHandler(async (req: Request, res: Response) => {
    try {
      // Query the departments table from the database
      let departmentsQuery = supabase
        .schema("course")
        .from("departments")
        .select();

      // Get the data and errors from the query
      const { data: departmentsData, error: departmentsError } =
        await departmentsQuery;

      // Set the departments data
      const departments = departmentsData || [];

      // Return the departments
      res.status(200).json(departments);
    } catch (error) {
      console.error(error);
      res.status(500).json({message: 'Internal Server Error'});
    }
  }),
}
