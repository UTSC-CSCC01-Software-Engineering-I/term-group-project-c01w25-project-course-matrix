import exp from 'constants';
import {Request, Response} from 'express';

import asyncHandler from '../middleware/asyncHandler'; // Middleware to handle async route handlers
import getOfferings from '../services/getOfferings';
import {getValidSchedules} from '../services/getValidSchedules';
import {GroupedOfferingList, Offering, OfferingList,} from '../types/generatorTypes';
import {categorizeValidOfferings, getFreq, getMaxDays, getValidOfferings, groupOfferings, trim} from '../utils/generatorHelpers';

// Express route handler to generate timetables based on user input
export default {
  generateTimetable: asyncHandler(async (req: Request, res: Response) => {
    try {
      // Extract event details and course information from the request
      const {semester, courses, restrictions} = req.body;

      const courseOfferingsList: OfferingList[] = [];
      const validCourseOfferingsList: GroupedOfferingList[] = [];
      const maxdays = getMaxDays(restrictions);
      const validSchedules: Offering[][] = [];
      // Fetch offerings for each course
      for (const course of courses) {
        const {id} = course;
        courseOfferingsList.push({
          course_id: id,
          offerings: (await getOfferings(id, semester)) ?? []
        });
      }
      const groupedOfferingsList: GroupedOfferingList[] =
          groupOfferings(courseOfferingsList);

      // console.log(JSON.stringify(groupedOfferingsList, null, 2));
      console.log(restrictions);
      // Filter out invalid offerings based on the restrictions
      for (const {course_id, groups, lectures, tutorials, practicals} of
               groupedOfferingsList) {
        const group: Record<string, Offering[]> =
            getValidOfferings(groups, restrictions);
        let groupedOfferings = {
          course_id: course_id,
          groups: group,
          lectures: 0,
          tutorials: 0,
          practicals: 0
        };
        groupedOfferings = getFreq(groupedOfferings);
        console.log(groupedOfferings);
        console.log(groups);
        console.log('%d %d', lectures, groupedOfferings.lectures);
        console.log('%d %d', tutorials, groupedOfferings.tutorials);
        console.log('%d %d', practicals, groupedOfferings.practicals);
        if ((lectures != 0 && groupedOfferings.lectures == 0) ||
            (tutorials != 0 && groupedOfferings.tutorials == 0) ||
            (practicals != 0 && groupedOfferings.practicals == 0)) {
          return res.status(404).json(
              {error: 'No valid schedules found. (restriction)'});
        }

        validCourseOfferingsList.push(groupedOfferings);
      }

      // console.log(JSON.stringify(validCourseOfferingsList, null, 2));
      const categorizedOfferings = categorizeValidOfferings(
          validCourseOfferingsList,
      );
      console.log('=======');
      console.log('CategorizedOfferings');
      console.log(JSON.stringify(categorizedOfferings, null, 2));
      console.log('=======');
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
        return res.status(404).json({error: 'No valid schedules found.'});
      }
      // Return the valid schedules
      return res.status(200).json({
        amount: validSchedules.length,
        schedules: trim(validSchedules),
      });
    } catch (error) {
      // Catch any error and return the error message
      const errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(500).send({error: errorMessage});
    }
  }),
};