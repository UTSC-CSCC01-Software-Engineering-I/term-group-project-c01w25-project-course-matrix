import exp from "constants";
import { Request, Response } from "express";

import {Offering, OfferingList, GroupedOfferingList} from "../types/generatorTypes"
import {getMaxDays, groupOfferings, getValidOfferings, categorizeValidOfferings, trim} from "../utils/generatorHelpers"
import getOfferings from "../services/getOfferings";
import { getValidSchedules } from "../services/getValidSchedules";

import asyncHandler from "../middleware/asyncHandler"; // Middleware to handle async route handlers

// Express route handler to generate timetables based on user input
export default {
  generateTimetable: asyncHandler(async (req: Request, res: Response) => {
    try {
      // Extract event details and course information from the request
      const {semester, courses, restrictions } = req.body;
      const courseOfferingsList: OfferingList[] = [];
      const validCourseOfferingsList: GroupedOfferingList[] = [];
      const maxdays = await getMaxDays(restrictions);
      const validSchedules: Offering[][] = [];
      // Fetch offerings for each course
      for (const course of courses) {
        const { id } = course;
        courseOfferingsList.push({
          course_id: id,
          offerings: (await getOfferings(id, semester)) ?? [],
        });
      }

      const groupedOfferingsList: GroupedOfferingList[] =
        await groupOfferings(courseOfferingsList);

      // console.log(JSON.stringify(groupedOfferingsList, null, 2));

      // Filter out invalid offerings based on the restrictions
      for (const { course_id, groups } of groupedOfferingsList) {
        validCourseOfferingsList.push({
          course_id: course_id,
          groups: await getValidOfferings(groups, restrictions),
        });
      }

      const categorizedOfferings = await categorizeValidOfferings(
        validCourseOfferingsList,
      );

      // console.log(typeof categorizedOfferings);
      // console.log(JSON.stringify(categorizedOfferings, null, 2));

      // Generate valid schedules for the given courses and restrictions
      await getValidSchedules(
        validSchedules,
        categorizedOfferings,
        [],
        0,
        categorizedOfferings.length,
        maxdays,
      );

      // Return error if no valid schedules are found
      if (validSchedules.length === 0) {
        return res.status(404).json({ error: "No valid schedules found." });
      }
      // Return the valid schedules
      return res
        .status(200)
        .json({
          amount: validSchedules.length,
          schedules: trim(validSchedules),
        });
    } catch (error) {
      // Catch any error and return the error message
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      return res.status(500).send({ error: errorMessage });
    }
  }),
};
