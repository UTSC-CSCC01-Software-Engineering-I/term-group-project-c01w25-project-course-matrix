import { TimetableFormSchema } from "@/models/timetable-form";
import { z } from "zod";

export function dateToTimeString(date: Date) {
  return date.toTimeString().split(" ")[0];
}

export function convertRestrictionTimes(
  values: z.infer<typeof TimetableFormSchema>,
) {
  let newValues: any = { ...values };
  let newRestrictions: any[] = [];
  for (const restriction of values.restrictions) {
    let newRestriction: any = { ...restriction };
    if (restriction.endTime) {
      newRestriction.endTime = dateToTimeString(restriction.endTime);
      console.log(newRestriction.endTime);
    }
    if (restriction.startTime) {
      newRestriction.startTime = dateToTimeString(restriction.startTime);
      console.log(newRestriction.startTime);
    }
    newRestrictions.push(newRestriction);
  }
  newValues.restrictions = newRestrictions;
  return newValues;
}
