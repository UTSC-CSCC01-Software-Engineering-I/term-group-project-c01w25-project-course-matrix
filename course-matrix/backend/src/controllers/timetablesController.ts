import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { supabase } from "../db/setupDb";
import { coreToolMessageSchema } from "ai";

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
      const { timetable_title, semester, favorite = false } = req.body;
      if (!timetable_title || !semester) {
        return res
          .status(400)
          .json({ error: "timetable title and semester are required" });
      }
      // Timetables cannot be longer than 50 characters.
      if (timetable_title.length > 50) {
        return res
          .status(400)
          .json({ error: "Timetable Title cannot be over 50 characters long" });
      }
      // Timetables cannot exceed the size of 25. 
      const{count: timetable_count, error: timetableCountError} = 
        await supabase
        .schema("timetable")
        .from("timetables")
        .select('*', { count: 'exact', head: true })
        .eq("user_id", user_id);

      console.log(timetable_count);
      
      if ((timetable_count ?? 0) >=25){
        return res.status(400).json({ error: "You have exceeded the limit of 25 timetables" });
      }

      // Check if a timetable with the same title already exist for this user
      const { data: existingTimetable, error: existingTimetableError } =
        await supabase
          .schema("timetable")
          .from("timetables")
          .select("id")
          .eq("user_id", user_id)
          .eq("timetable_title", timetable_title)
          .maybeSingle();

      if (existingTimetableError) {
        return res.status(400).json({ error: existingTimetableError.message });
      }

      if (existingTimetable) {
        return res
          .status(400)
          .json({ error: "A timetable with this title already exists" });
      }
      //Create query to insert the user_id and timetable_title into the db
      
      let insertTimetable = supabase
        .schema("timetable")
        .from("timetables")
        .insert([
          {
            user_id,
            timetable_title,
            semester,
            favorite,
          },
        ])
        .select("*");

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
   * Get a single timetable for a user
   * @route GET /api/timetables/:id
   */

  getTimetable: asyncHandler(async (req: Request, res: Response) => {
    try {
      //Retrieve user_id and timetable_id
      const user_id = (req as any).user.id;
      const { id: timetable_id } = req.params;

      // Retrieve based on user_id and timetable_id
      let timeTableQuery = supabase
        .schema("timetable")
        .from("timetables")
        .select()
        .eq("user_id", user_id)
        .eq("id", timetable_id);

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
      const {
        timetable_title,
        semester,
        favorite,
        email_notifications_enabled,
      } = req.body;
      if (
        !timetable_title &&
        !semester &&
        favorite === undefined &&
        email_notifications_enabled === undefined
      ) {
        return res.status(400).json({
          error:
            "New timetable title or semester or updated favorite status or email notifications enabled is required when updating a timetable",
        });
      }

      // Timetables cannot be longer than 50 characters.
      if (timetable_title && timetable_title.length > 50) {
        return res
          .status(400)
          .json({ error: "Timetable Title cannot be over 50 characters long" });
      }

      //Retrieve the authenticated user
      const user_id = (req as any).user.id;
      //Retrieve users allowed to access the timetable
      const { data: timetableUserData, error: timetableUserError } =
        await supabase
          .schema("timetable")
          .from("timetables")
          .select("*")
          .eq("user_id", user_id)
          .eq("id", id)
          .maybeSingle();
      if (timetableUserError)
        return res.status(400).json({ error: timetableUserError.message });

      //Validate timetable validity:
      if (!timetableUserData || timetableUserData.length === 0) {
        return res.status(404).json({ error: "Calendar id not found" });
      }
      // Check if another timetable with the same title already exist for this user
      const { data: existingTimetable, error: existingTimetableError } =
        await supabase
          .schema("timetable")
          .from("timetables")
          .select("id")
          .eq("user_id", user_id)
          .eq("timetable_title", timetable_title)
          .neq("id", id)
          .maybeSingle();
      if (existingTimetableError) {
        return res.status(400).json({ error: existingTimetableError.message });
      }

      if (existingTimetable) {
        return res
          .status(400)
          .json({ error: "Another timetable with this title already exists" });
      }
      let updateData: any = {};
      if (timetable_title) updateData.timetable_title = timetable_title;
      if (semester) updateData.semester = semester;
      if (favorite !== undefined) updateData.favorite = favorite;
      if (email_notifications_enabled !== undefined)
        updateData.email_notifications_enabled = email_notifications_enabled;

      //Update timetable title, for authenticated user only
      let updateTimetableQuery = supabase
        .schema("timetable")
        .from("timetables")
        .update(updateData)
        .eq("user_id", user_id)
        .eq("id", id)
        .select()
        .single();
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
      console.error(error);
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
          .eq("user_id", user_id)
          .eq("id", id)
          .maybeSingle();

      if (timetableUserError)
        return res.status(400).json({ error: timetableUserError.message });

      //Validate timetable validity:
      if (!timetableUserData || timetableUserData.length === 0) {
        return res.status(404).json({ error: "Calendar id not found" });
      }

      // Delete only if the timetable belongs to the authenticated user
      let deleteTimetableQuery = supabase
        .schema("timetable")
        .from("timetables")
        .delete()
        .eq("user_id", user_id)
        .eq("id", id);

      const { error: timetableError } = await deleteTimetableQuery;

      if (timetableError)
        return res.status(400).json({ error: timetableError.message });

      return res
        .status(200)
        .json({ message: "Timetable successfully deleted" });
    } catch (error) {
      return res.status(500).send({ error });
    }
  }),
};
