import { supabase } from "../db/setupDb";
import { Request } from "express";

export type FunctionNames = "getTimetables"; // Add all possible function names here

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
      console.log(error)
      return { status: 400, error: error };
    }
  },
};