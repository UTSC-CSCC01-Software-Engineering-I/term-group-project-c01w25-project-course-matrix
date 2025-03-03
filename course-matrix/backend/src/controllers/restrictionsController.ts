import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { supabase } from "../db/setupDb";
import { error } from "console";

export default {
  /**
   * Create, Read, Update and Delete restrictions
   *
   */

  /**
   * Create a new restriction
   * @route POST /api/restrictions
   */
  createRestriction: asyncHandler(async (req: Request, res: Response) => {
    try {
      const {
        type,
        days,
        start_time,
        end_time,
        disabled,
        num_days,
        calendar_id,
      } = req.body;

      const user_id = (req as any).user.id;

      //Check for calendar_id
      if (!calendar_id) {
        return res.status(400).json({ error: "calendar id is required" });
      }

      //Retrieve users allowed to access the timetable
      const { data: timetableData, error: timetableError } = await supabase
        .schema("timetable")
        .from("timetables")
        .select("*")
        .eq("id", calendar_id)
        .eq("user_id", user_id)
        .maybeSingle();

      if (timetableError)
        return res.status(400).json({ error: timetableError.message });

      //Validate timetable validity:
      if (!timetableData || timetableData.length === 0) {
        return res.status(404).json({ error: "Calendar id not found" });
      }

      const timetable_user_id = timetableData.user_id;

      //Validate user access
      if (user_id !== timetable_user_id) {
        return res
          .status(401)
          .json({ error: "Unauthorized access to timetable restriction" });
      }

      const { data: restrictionData, error: restrictionError } = await supabase
        .schema("timetable")
        .from("restriction")
        .insert([
          {
            user_id,
            type,
            days,
            start_time,
            end_time,
            disabled,
            num_days,
            calendar_id,
          },
        ])
        .select();

      if (restrictionError) {
        return res.status(400).json({ error: restrictionError.message });
      }

      return res.status(201).json(restrictionData);
    } catch (error) {
      return res.status(500).send({ error });
    }
  }),

  /**
   * Get all restrictions for a given calendar_id
   * @route GET /api/restrictions/:calendar_id
   */

  getRestriction: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { calendar_id } = req.params;
      const user_id = (req as any).user.id;

      //Check for calendar_id
      if (!calendar_id) {
        return res.status(400).json({ error: "calendar id is required" });
      }

      //Retrieve users allowed to access the timetable
      const { data: timetableData, error: timetableError } = await supabase
        .schema("timetable")
        .from("timetables")
        .select("*")
        .eq("id", calendar_id)
        .eq("user_id", user_id)
        .maybeSingle();

      if (timetableError)
        return res.status(400).json({ error: timetableError.message });

      //Validate timetable validity:
      if (!timetableData || timetableData.length === 0) {
        return res.status(404).json({ error: "Calendar id not found" });
      }

      const timetable_user_id = timetableData.user_id;

      //Validate user access
      if (user_id !== timetable_user_id) {
        return res
          .status(401)
          .json({ error: "Unauthorized access to timetable restriction" });
      }

      const { data: restrictionData, error: restrictionError } = await supabase
        .schema("timetable")
        .from("restriction")
        .select()
        .eq("calendar_id", calendar_id);

      if (restrictionError) {
        return res.status(400).json({ error: restrictionError.message });
      }

      return res.status(200).json(restrictionData);
    } catch (error) {
      return res.status(500).send({ error });
    }
  }),

  /**
   * Update a restriction
   * @route PUT /api/restriction/:id
   */

  updateRestriction: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { calendar_id } = req.query;
      const updateData = req.body;
      const user_id = (req as any).user.id;

      //Check for calendar_id
      if (!calendar_id) {
        return res.status(400).json({ error: "calendar id is required" });
      }

      //Check restriction id
      const { data: restrictionCurrData, error: restrictionCurrError } =
        await supabase
          .schema("timetable")
          .from("restriction")
          .select("*")
          .eq("id", id)
          .eq("user_id", user_id)
          .eq("calendar_id", calendar_id)
          .maybeSingle();

      if (restrictionCurrError)
        return res.status(400).json({ error: restrictionCurrError.message });

      if (!restrictionCurrData || restrictionCurrData.length === 0) {
        return res.status(404).json({ error: "Restriction id does not exist" });
      }

      //Retrieve users allowed to access the timetable
      const { data: timetableData, error: timetableError } = await supabase
        .schema("timetable")
        .from("timetables")
        .select("*")
        .eq("id", calendar_id)
        .eq("user_id", user_id)
        .maybeSingle();

      if (timetableError)
        return res.status(400).json({ error: timetableError.message });

      //Validate timetable validity:
      if (!timetableData || timetableData.length === 0) {
        return res.status(404).json({ error: "Calendar id not found" });
      }

      const timetable_user_id = timetableData.user_id;

      //Validate user access
      if (user_id !== timetable_user_id) {
        return res
          .status(401)
          .json({ error: "Unauthorized access to timetable restriction" });
      }

      //Validate mapping restriction id to calendar id
      if (restrictionCurrData.calendar_id !== timetableData.id) {
        return res.status(400).json({
          error: "Restriction id does not belong to the provided calendar id",
        });
      }

      if (!Object.keys(updateData).length) {
        return res
          .status(400)
          .json({ error: "At least one field is required to update" });
      }

      const { data: restrictionData, error: restrictionError } = await supabase
        .schema("timetable")
        .from("restriction")
        .update(updateData)
        .eq("id", id)
        .select();

      if (restrictionError) {
        return res.status(400).json({ error: restrictionError.message });
      }

      if (!restrictionData || restrictionData.length === 0) {
        return res.status(404).json({ error: "Restriction not found" });
      }
      return res.status(200).json(restrictionData);
    } catch (error) {
      return res.status(500).send({ error });
    }
  }),

  /**
   * Delete a restriction
   * @route DELETE /api/restriction/:id
   */

  deleteRestriction: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { calendar_id } = req.query;
      const user_id = (req as any).user.id;

      //Check for calendar_id
      if (!calendar_id) {
        return res.status(400).json({ error: "calendar id is required" });
      }

      //Check restriction id
      const { data: restrictionCurrData, error: restrictionCurrError } =
        await supabase
          .schema("timetable")
          .from("restriction")
          .select("*")
          .eq("id", id)
          .eq("user_id", user_id)
          .eq("calendar_id", calendar_id)
          .maybeSingle();

      if (restrictionCurrError) {
        return res.status(400).json({ error: restrictionCurrError.message });
      }

      if (!restrictionCurrData || restrictionCurrData.length === 0) {
        return res.status(404).json({ error: "Restriction id does not exist" });
      }

      //Retrieve users allowed to access the timetable
      const { data: timetableData, error: timetableError } = await supabase
        .schema("timetable")
        .from("timetables")
        .select("*")
        .eq("id", calendar_id)
        .eq("user_id", user_id)
        .maybeSingle();

      if (timetableError) {
        return res.status(400).json({ error: timetableError.message });
      }

      //Validate timetable validity:
      if (!timetableData || timetableData.length === 0) {
        return res.status(404).json({ error: "Calendar id not found" });
      }

      //Validate mapping restriction id to calendar id
      if (restrictionCurrData.calendar_id !== timetableData.id) {
        return res.status(400).json({
          error: "Restriction id does not belong to the provided calendar id",
        });
      }

      const timetable_user_id = timetableData.user_id;

      //Validate user access
      if (user_id !== timetable_user_id) {
        return res
          .status(401)
          .json({ error: "Unauthorized access to timetable restriction" });
      }

      const { error: restrictionError } = await supabase
        .schema("timetable")
        .from("restriction")
        .delete()
        .eq("id", id);

      if (restrictionError) {
        return res.status(400).json({ error: restrictionError.message });
      }

      return res.status(200).send("Restriction successfully deleted");
    } catch (error) {
      return res.status(500).send({ error });
    }
  }),
};
