import {Request, Response} from 'express';

import {supabase} from '../db/setupDb';
import asyncHandler from '../middleware/asyncHandler';

async function getOfferings(course_id: number, semester: string) {
  let {data: offeringData, error: offeringError} = await supabase
                                                       .schema('course')
                                                       .from('offerings')
                                                       .select(`
    id, 
    course_id, 
    meeting_section, 
    offering, 
    day, 
    start, 
    end, 
    location, 
    current, 
    max, 
    is_waitlisted, 
    delivery_mode, 
    instructor, 
    notes, 
    code
  `).eq('course_id', course_id).eq('offering', semester);
  console.log(course_id);
  console.log(semester);
  console.log(offeringData);

  return offeringData;
}

export default {
  generateTimetable: asyncHandler(async (req: Request, res: Response) => {
    try {
      // Retrieve event properties from the request body
      const {name, date, semester, search, courses, restrictions} = req.body;
      const courseOfferingsList = [];
      // Retrieve the authenticated user
      const user_id = (req as any).user.id;

      // extracting offerings from each course
      for (const course of courses) {
        const {id, code, name} = course;
        courseOfferingsList.push(
            {course_id: id, offerings: await getOfferings(id, semester)});
      }

      return res.status(200).json(courseOfferingsList);
    } catch (error) {
      return res.status(500).send({error});
    }
  }),
};