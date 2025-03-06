import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { supabase } from "../db/setupDb";

export default {
  /**
   * Create, Read (Get), Update, and Delete user's timetables
   */

  /**
   * Create a new timetbale
   * @route POST api/timetables
   */

  createTimetable: asyncHandler(async (req: Request, res: Response) => {
    try {
      //Get user id from session authentication to insert in the user_id col
      const user_id = (req as any).user.id;

      //Retrieve timetable title
      const { timetable_title, semester } = req.body;
      if (!timetable_title) {
        return res.status(400).json({ error: "timetable title is required" });
      }

      if (!semester) {
        return res
          .status(400)
          .json({ error: "timetable semester is required" });
      }

      //Create query to insert the user_id and timetable_title into the db
      let insertTimetable = supabase
        .schema("timetable")
        .from("timetables")
        .insert([{ user_id, timetable_title, semester }])
        .select();

      const { data: timetableData, error: timetableError } =
        await insertTimetable;
      if (timetableError) {
        return res.status(400).json({ error: timetableError.message });
      }

      return res.status(201).json(timetableData);
    } catch (error) {
      return res.status(500).send({ error });
    }
  }),

  /**
   * Get all timetables for a user
   * @route GET /api/timetables
   */

  getTimetables: asyncHandler(async (req: Request, res: Response) => {
    try {
      //Retrieve user_id
      const user_id = (req as any).user.id;

      //Retrieve user timetable item based on user_id
      let timeTableQuery = supabase
        .schema("timetable")
        .from("timetables")
        .select()
        .eq("user_id", user_id);
      const { data: timetableData, error: timetableError } =
        await timeTableQuery;

      if (timetableError)
        return res.status(400).json({ error: timetableError.message });

      //Validate timetable validity:
      if (!timetableData) {
        return res.status(404).json({ error: "Calendar id not found" });
      }

      return res.status(200).json(timetableData);
    } catch (error) {
      return res.status(500).send({ error });
    }
  }),

  /**
   * Update a timetable
   * @route PUT /api/timetables/:id
   */

  updateTimetable: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      //Retrieve timetable title
      const { timetable_title, semester } = req.body;
      if (!timetable_title && !semester) {
        return res.status(400).json({
          error:
            "New timetable title or semester is required when updating a timetable",
        });
      }

      //Retrieve the authenticated user
      const user_id = (req as any).user.id;

      //Retrieve users allowed to access the timetable
      const { data: timetableUserData, error: timetableUserError } =
        await supabase
          .schema("timetable")
          .from("timetables")
          .select("*")
          .eq("id", id)
          .eq("user_id", user_id)
          .maybeSingle();

      const timetable_user_id = timetableUserData?.user_id;

      if (timetableUserError)
        return res.status(400).json({ error: timetableUserError.message });

      //Validate timetable validity:
      if (!timetableUserData || timetableUserData.length === 0) {
        return res.status(404).json({ error: "Calendar id not found" });
      }

      //Validate user access
      if (user_id !== timetable_user_id) {
        return res
          .status(401)
          .json({ error: "Unauthorized access to timetable events" });
      }

      let updateData: any = {};
      if (timetable_title) updateData.timetable_title = timetable_title;
      if (semester) updateData.semester = semester;

      //Update timetable title, for authenticated user only
      let updateTimetableQuery = supabase
        .schema("timetable")
        .from("timetables")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user_id)
        .select();

      const { data: timetableData, error: timetableError } =
        await updateTimetableQuery;

      if (timetableError)
        return res.status(400).json({ error: timetableError.message });

      // If no records were updated due to non-existence timetable or it doesn't belong to the user.
      if (!timetableData || timetableData.length === 0) {
        return res.status(404).json({
          error: "Timetable not found or you are not authorized to update it",
        });
      }
      return res.status(200).json(timetableData);
    } catch (error) {
      return res.status(500).send({ error });
    }
  }),

  /**
   * Delete a timetable
   * @route DELETE /api/timetables/:id
   */
  deleteTimetable: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Retrieve the authenticated user
      const user_id = (req as any).user.id;

      //Retrieve users allowed to access the timetable
      const { data: timetableUserData, error: timetableUserError } =
        await supabase
          .schema("timetable")
          .from("timetables")
          .select("*")
          .eq("id", id)
          .eq("user_id", user_id)
          .maybeSingle();
      const timetable_user_id = timetableUserData?.user_id;

      if (timetableUserError)
        return res.status(400).json({ error: timetableUserError.message });

      //Validate timetable validity:
      if (!timetableUserData || timetableUserData.length === 0) {
        return res.status(404).json({ error: "Calendar id not found" });
      }

      //Validate user access
      if (user_id !== timetable_user_id) {
        return res
          .status(401)
          .json({ error: "Unauthorized access to timetable events" });
      }

      // Delete only if the timetable belongs to the authenticated user
      let deleteTimetableQuery = supabase
        .schema("timetable")
        .from("timetables")
        .delete()
        .eq("id", id)
        .eq("user_id", user_id);

      const { error: timetableError } = await deleteTimetableQuery;

      if (timetableError)
        return res.status(400).json({ error: timetableError.message });

      return res.status(200).send("Timetable successfully deleted");
    } catch (error) {
      return res.status(500).send({ error });
    }
  }),
};
