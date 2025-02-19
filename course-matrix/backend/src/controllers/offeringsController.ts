import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { supabase } from "../db/setupDb";

export default {
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
        .schema('course')
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
