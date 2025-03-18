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

      // Owner cannot share a timetable to themselves
      if (shared_email === owner_email) {
        return res
          .status(400)
          .json({ error: "Users cannot share a timetable with themselves" });
      }

      const { data: sharedUser, error: sharedError } = await supabase.rpc(
        "get_user_id_by_email",
        { email: shared_email },
      );

      if (sharedError) {
        return res.status(400).json({ Error: sharedError.message });
      }

      if (!sharedUser || sharedUser.length === 0) {
        return res
          .status(400)
          .json({ error: "User with provided email not found" });
      }
      const shared_id = sharedUser[0].id;

      // Check if the calendar exists and belongs to the owner
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

      // Check if the sharing already exists
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

      // Insert the shared timetable entry
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
   * Get all timetables that the owner has shared
   */
  getOwnerShare: asyncHandler(async (req: Request, res: Response) => {
    try {
      const user_id = (req as any).user.id;

      //Fetch all shared calendar IDs where user is the owner who share
      const { data: shareData, error: sharedError } = await supabase
        .schema("timetable")
        .from("shared")
        .select(
          "id,calendar_id, owner_id, shared_id, timetables!inner(id, user_id, timetable_title, semester, favorite)",
        )
        .eq("owner_id", user_id);

      if (sharedError) {
        return res.status(400).json({ error: sharedError.message });
      }

      if (!shareData || shareData.length === 0) {
        return res
          .status(404)
          .json({ error: "This user has not shared any timetables" });
      }

      return res.status(200).json(shareData);
    } catch (error) {
      return res.status(500).send({ error });
    }
  }),

  /**
   * Get all timetables shared with the current user
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
          "id, calendar_id, owner_id, shared_id, timetables!inner(id, user_id, timetable_title, semester, favorite)",
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
   * @route DELETE /api/shared/owner/:id?
   */

  deleteOwnerShare: asyncHandler(async (req: Request, res: Response) => {
    try {
      const owner_id = (req as any).user.id;
      const { id } = req.params;
      const { calendar_id, shared_email } = req.body;

      if (!id) {
        if (calendar_id && !shared_email) {
          // Check if the provided calendar_id belong to the current user
          const { data: existingTimetable, error: existingTimetableError } =
            await supabase
              .schema("timetable")
              .from("shared")
              .select("*")
              .eq("calendar_id", calendar_id)
              .eq("owner_id", owner_id);

          if (existingTimetableError) {
            return res
              .status(500)
              .json({ error: existingTimetableError.message });
          }

          if (!existingTimetable || existingTimetable.length === 0) {
            return res
              .status(404)
              .json({ error: "Provided timetable for delete does not found" });
          }

          //Delete all shares belong to the owner for a specific table
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
            message: `All sharing records for the timetable: ${calendar_id} of user: ${
              (req as any).user.email
            } have been deleted successfully`,
          });
        }

        if (!calendar_id && shared_email) {
          // Delete all shares belonging to the owner shared with a specific person

          // Get Person id via email
          const { data: sharedUser, error: sharedError } = await supabase.rpc(
            "get_user_id_by_email",
            { email: shared_email },
          );

          if (sharedError) {
            return res.status(400).json({ error: sharedError.message });
          }

          if (!sharedUser || sharedUser.length === 0) {
            return res
              .status(400)
              .json({ error: "User with provided email not found" });
          }

          const shared_id = sharedUser[0].id;

          //Check if the curernt owner has shared with the provided user
          const { data: existingTimetable, error: existingTimetableError } =
            await supabase
              .schema("timetable")
              .from("shared")
              .select("*")
              .eq("shared_id", shared_id)
              .eq("owner_id", owner_id);

          if (existingTimetableError) {
            return res
              .status(500)
              .json({ error: existingTimetableError.message });
          }

          if (!existingTimetable || existingTimetable.length === 0) {
            return res.status(404).json({
              error: "You have not shared any timetable with the provided user",
            });
          }

          const { error: deleteError } = await supabase
            .schema("timetable")
            .from("shared")
            .delete()
            .eq("owner_id", owner_id)
            .eq("shared_id", shared_id);

          if (deleteError) {
            return res.status(400).json({ error: deleteError.message });
          }

          return res.status(200).json({
            message: `All sharing records of user: ${
              (req as any).user.email
            } to user: ${shared_email} have been deleted successfully`,
          });
        }

        if (calendar_id && shared_email) {
          // Get Person id via email
          const { data: sharedUser, error: sharedError } = await supabase.rpc(
            "get_user_id_by_email",
            { email: shared_email },
          );

          if (sharedError) {
            return res.status(400).json({ error: sharedError.message });
          }

          if (!sharedUser || sharedUser.length === 0) {
            return res
              .status(400)
              .json({ error: "User with provided email not found" });
          }

          const shared_id = sharedUser[0].id;

          //Check if the curernt owner has shared with the provided user
          const { data: existingTimetable, error: existingTimetableError } =
            await supabase
              .schema("timetable")
              .from("shared")
              .select("*")
              .eq("calendar_id", calendar_id)
              .eq("shared_id", shared_id)
              .eq("owner_id", owner_id);

          if (existingTimetableError) {
            return res
              .status(500)
              .json({ error: existingTimetableError.message });
          }

          if (!existingTimetable || existingTimetable.length === 0) {
            return res.status(404).json({
              error:
                "You have not shared the provided timetable with the provided user",
            });
          }

          const { error: deleteError } = await supabase
            .schema("timetable")
            .from("shared")
            .delete()
            .eq("calendar_id", calendar_id)
            .eq("owner_id", owner_id)
            .eq("shared_id", shared_id);

          if (deleteError) {
            return res.status(400).json({ error: deleteError.message });
          }

          return res.status(200).json({
            message: `All sharing records of table: ${calendar_id} from user: ${
              (req as any).user.email
            } to user: ${shared_email} have been deleted successfully`,
          });
        }
        return res.status(400).json({
          error: "Calendar_id, shared_email or share id is required",
        });
      } else {
        if (!calendar_id) {
          return res.status(400).json({
            error: "Calendar_id is requried to delete a specific share entry",
          });
        }

        const { data: existingShare, error: existingShareError } =
          await supabase
            .schema("timetable")
            .from("shared")
            .select("*")
            .eq("id", id)
            .eq("calendar_id", calendar_id)
            .eq("owner_id", owner_id);

        if (existingShareError) {
          return res.status(400).json({ error: existingShareError.message });
        }

        if (!existingShare || existingShare.length === 0) {
          return res
            .status(404)
            .json({ error: "Cannot find the provided share entry" });
        }

        const { error: deleteError } = await supabase
          .schema("timetable")
          .from("shared")
          .delete()
          .eq("id", id)
          .eq("calendar_id", calendar_id)
          .eq("owner_id", owner_id);

        if (deleteError) {
          return res.status(400).json({ error: deleteError.message });
        }

        return res.status(200).json({
          message: `Share number ${id} of calendar: ${calendar_id} has been sucessfully deleted`,
        });
      }
    } catch (error) {
      return res.status(500).send({ error });
    }
  }),

  /**
   * Delete a shared entryas shared userd
   * @route DELETE /api/shared/:id?
   */
  deleteShare: asyncHandler(async (req: Request, res: Response) => {
    try {
      const shared_id = (req as any).user.id;
      const { id } = req.params;
      const { calendar_id } = req.body;

      const { data: existingTimetable, error: existingTimetableError } =
        await supabase
          .schema("timetable")
          .from("shared")
          .select("*")
          .eq("id", id)
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
        .eq("id", id)
        .eq("calendar_id", calendar_id)
        .eq("shared_id", shared_id);
      if (deleteError) {
        return res.status(400).json({ error: deleteError.message });
      }

      return res.status(200).json({
        message: `Sharing record: ${id} of calendar: ${calendar_id} deleted successfully`,
      });
    } catch (error) {
      return res.status(500).send({ error });
    }
  }),
};
