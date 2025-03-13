import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { supabase } from "../db/setupDb";

export default {
  /**
   * Create a new share entry
   * @route POST /api/shared
   */
  createShare: asyncHandler(async (req: Request, res: Response) => {
    try {
      const owner_id = (req as any).user.id;
      const owner_email = (req as any).user.email;
      const { shared_email, calendar_id } = req.body;

      if (!shared_email || !calendar_id) {
        return res
          .status(400)
          .json({ error: "Shared user email and calendar ID are required" });
      }

      // Owner cannot share a timetable to themselve
      if (shared_email === owner_email) {
        return res
          .status(400)
          .json({ error: "Users cannot share timetable to themselves " });
      }

      // Query users for shared_id using email
      const { data: sharedUser, error: sharedError } = await supabase.rpc(
        "get_user_id_by_email",
        {
          email: shared_email,
        }
      );

      if (sharedError) {
        return res.status(500).json({ error: sharedError.message });
      }

      if (!sharedUser) {
        return res
          .status(404)
          .json({ error: "User with provided email not found" });
      }

      const shared_id = sharedUser[0].id;

      // Check for the calendar exists and belongs to the owner
      const { data: timeTable, error: timeTableError } = await supabase
        .schema("timetable")
        .from("timetables")
        .select("id")
        .eq("id", calendar_id)
        .eq("user_id", owner_id)
        .maybeSingle();

      if (timeTableError || !timeTable) {
        return res.status(404).json({
          error: "Timetable not found or user unauthorized to share",
        });
      }

      // Check if the sharing has already existed
      const { data: existingShare, error: existingShareError } = await supabase
        .schema("timetable")
        .from("shared")
        .select("id")
        .eq("calendar_id", calendar_id)
        .eq("owner_id", owner_id)
        .eq("shared_id", shared_id)
        .maybeSingle();

      if (existingShare) {
        return res.status(400).json({
          error: "This calendar has already been shared with the provided user",
        });
      }

      // Inser the shared timetable entry
      const { data: shareInsert, error: shareError } = await supabase
        .schema("timetable")
        .from("shared")
        .insert([{ owner_id, shared_id, calendar_id }])
        .select("*")
        .single();

      if (shareError) {
        return res.status(400).json({ error: shareError.message });
      }

      return res.status(201).json(shareInsert);
    } catch (error) {
      return res.status(500).send({ error });
    }
  }),

  /**
   * Get all share timetables for the current user
   * @route GET /api/shared
   */

  getShare: asyncHandler(async (req: Request, res: Response) => {
    try {
      const user_id = (req as any).user.id;

      //Fetch all shared calendar IDs where user is the shared recipient
      const { data: shareData, error: sharedError } = await supabase
        .schema("timetable")
        .from("shared")
        .select(
          "calendar_id, timetables!inner(id, user_id, timetable_title, semester, favorite)"
        )
        .eq("shared_id", user_id);

      if (sharedError) {
        return res.status(400).json({ error: sharedError.message });
      }

      if (!shareData || shareData.length === 0) {
        return res
          .status(404)
          .json({ error: "No shared timetables found for this user" });
      }

      return res.status(200).json(shareData);
    } catch (error) {
      return res.status(500).send({ error });
    }
  }),

  /**
   * Delete all shared record for a timetable as the timetable's owner
   * @route DELETE /api/shared/owner/:calendar_id
   */
  deleteOwnerShare: asyncHandler(async (req: Request, res: Response) => {
    try {
      const owner_id = (req as any).user.id;
      const { calendar_id } = req.params;

      const { data: existingTimetable, error: existingTimetableError } =
        await supabase
          .schema("timetable")
          .from("shared")
          .select("*")
          .eq("calendar_id", calendar_id)
          .eq("owner_id", owner_id);

      if (existingTimetableError) {
        return res.status(500).json({ error: existingTimetableError.message });
      }

      if (!existingTimetable || existingTimetable.length === 0) {
        return res
          .status(404)
          .json({ error: "Provided timetable for delete does not found" });
      }
      const { error: deleteError } = await supabase
        .schema("timetable")
        .from("shared")
        .delete()
        .eq("calendar_id", calendar_id)
        .eq("owner_id", owner_id);

      if (deleteError) {
        return res.status(400).json({ error: deleteError.message });
      }

      return res.status(200).send({
        message: "All sharing records for the timetable deleted successfully",
      });
    } catch (error) {
      return res.status(500).send({ error });
    }
  }),

  /**
   * Delete a shared entryas shared userd
   * @route DELETE /api/shared/:calendar_id
   */
  deleteShare: asyncHandler(async (req: Request, res: Response) => {
    try {
      const shared_id = (req as any).user.id;
      const { calendar_id } = req.params;

      const { data: existingTimetable, error: existingTimetableError } =
        await supabase
          .schema("timetable")
          .from("shared")
          .select("*")
          .eq("calendar_id", calendar_id)
          .eq("shared_id", shared_id);

      if (existingTimetableError) {
        return res.status(500).json({ error: existingTimetableError.message });
      }

      if (!existingTimetable || existingTimetable.length === 0) {
        return res.status(404).json({
          error: "Provided timetable for delete does not found",
        });
      }
      const { error: deleteError } = await supabase
        .schema("timetable")
        .from("shared")
        .delete()
        .eq("calendar_id", calendar_id)
        .eq("shared_id", shared_id);
      if (deleteError) {
        return res.status(400).json({ error: deleteError.message });
      }

      return res
        .status(200)
        .json({ message: "Sharing record deleted successfully" });
    } catch (error) {
      return res.status(500).send({ error });
    }
  }),
};
