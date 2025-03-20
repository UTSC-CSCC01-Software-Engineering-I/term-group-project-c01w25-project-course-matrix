import { supabase } from "../db/setupDb";

// Function to fetch offerings from the database for a given course and semester
export default async function getOfferings(course_id: number, semester: string) {
    let { data: offeringData, error: offeringError } = await supabase
      .schema("course")
      .from("offerings")
      .select(
        `
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
    `,
      )
      .eq("course_id", course_id)
      .eq("offering", semester);
  
    return offeringData;
  }