import { supabase } from "../db/setupDb";
import { Request } from "express";

// Add all possible function names here
export type FunctionNames = "getTimetables" | "updateTimetable" | "deleteTimetable"; 

type AvailableFunctions = {
  [K in FunctionNames]: (args: any, req: Request) => Promise<any>;
};

// Functions used for OpenAI function calling
export const availableFunctions: AvailableFunctions = {
  getTimetables: async (args: any, req: Request) => {
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
      // console.log("Timetables: ", timetableData)

      if (timetableError) return { status: 400, error: timetableError.message };

      // If no records were updated due to non-existence timetable or it doesn't belong to the user.
      if (!timetableData || timetableData.length === 0) {
        return {
          status: 404,
          error: "Timetable not found or you are not authorized to update it",
        };
      }

      return { status: 200, data: timetableData };
    } catch (error) {
      console.log(error);
      return { status: 400, error: error };
    }
  },
  updateTimetable: async (args: any, req: Request) => {
    try {
      const { id, timetable_title, semester  } = args;

      if (!timetable_title && !semester) {
        return {
          status: 400,
          error:
            "New timetable title or semester is required when updating a timetable",
        };
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
        return {status: 400, error: timetableUserError.message };

      //Validate timetable validity:
      if (!timetableUserData || timetableUserData.length === 0) {
        return {status: 404, error: "Calendar id not found" };
      }

      //Validate user access
      if (user_id !== timetable_user_id) {
        return { status: 401,  error: "Unauthorized access to timetable events" };
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
        return { status: 400, error: timetableError.message };

      // If no records were updated due to non-existence timetable or it doesn't belong to the user.
      if (!timetableData || timetableData.length === 0) {
        return {
          status: 404,
          error: "Timetable not found or you are not authorized to update it",
        };
      }
      return { status: 200, data: timetableData };
    } catch (error) {
      return { status: 500,  error: error };
    }
  },
  deleteTimetable: async (args: any, req: Request) => {
    try {
      const { id } = args;

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
        return { status: 400, error: timetableUserError.message };

      //Validate timetable validity:
      if (!timetableUserData || timetableUserData.length === 0) {
        return { status: 404,  error: "Calendar id not found" };
      }

      //Validate user access
      if (user_id !== timetable_user_id) {
        return  { status: 401, error: "Unauthorized access to timetable events" };
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
        return { status: 400, error: timetableError.message };

      return { status: 200, data: "Timetable successfully deleted"};
    } catch (error) {
      return { status: 500, error: error };
    }
  }
};
