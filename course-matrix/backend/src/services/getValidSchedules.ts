import {CategorizedOfferingList, Offering} from '../types/generatorTypes';
import {canInsertList, getFrequencyTable, getMinHour} from '../utils/generatorHelpers';

// Function to generate all valid schedules based on offerings and restrictions

export function getValidSchedules(
    validSchedules: Offering[][],
    courseOfferingsList: CategorizedOfferingList[], curList: Offering[],
    cur: number, len: number, maxdays: number, maxhours: number) {
  // Base case: if all courses have been considered
  if (cur == len) {
    const freq: Map<string, number> = getFrequencyTable(curList);

    // If the number of unique days is within the allowed limit, add the current
    // schedule to the list, also checks if max gap is being violated
    if (freq.size <= maxdays && getMinHour(curList) <= maxhours) {
      console.log()
      validSchedules.push([...curList]);  // Push a copy of the current list
    }
    return;
  }

  const offeringsForCourse = courseOfferingsList[cur];

  // Recursively attempt to add offerings for the current course
  for (const [groupKey, offerings] of Object.entries(
           offeringsForCourse.offerings,
           )) {
    if (canInsertList(offerings, curList)) {
      const count = offerings.length;
      curList.push(...offerings);  // Add offering to the current list

      // Recursively generate schedules for the next course
      getValidSchedules(
          validSchedules, courseOfferingsList, curList, cur + 1, len, maxdays,
          maxhours);

      // Backtrack: remove the last offering if no valid schedule was found
      for (let i = 0; i < count; i++) curList.pop();
    }
  }
}
