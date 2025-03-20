import {Offering, OfferingList, GroupedOfferingList, Restriction, RestrictionType, CategorizedOfferingList} from "../types/generatorTypes"

// Utility function to create an Offering object with optional overrides
export function createOffering(overrides: Partial<Offering> = {}): Offering {
    return {
      id: overrides.id ?? -1,
      course_id: overrides.course_id ?? -1,
      meeting_section: overrides.meeting_section ?? "No Section",
      offering: overrides.offering ?? "No Offering",
      day: overrides.day ?? "N/A",
      start: overrides.start ?? "00:00:00",
      end: overrides.end ?? "00:00:00",
      location: overrides.location ?? "No Room",
      current: overrides.current ?? -1,
      max: overrides.max ?? -1,
      is_waitlisted: overrides.is_waitlisted ?? false,
      delivery_mode: overrides.delivery_mode ?? "N/A",
      instructor: overrides.instructor ?? "N/A",
      notes: overrides.notes ?? "N/A",
      code: overrides.code ?? "N/A",
    };
}

// Function to group offerings with the same meeting section together
export async function groupOfferings(courseOfferingsList: OfferingList[]) {
    const groupedOfferingsList: GroupedOfferingList[] = [];
    for (const offering of courseOfferingsList) {
      const groupedOfferings: GroupedOfferingList = {
        course_id: offering.course_id,
        groups: {},
      };
      offering.offerings.forEach((offering) => {
        if (!groupedOfferings.groups[offering.meeting_section]) {
          groupedOfferings.groups[offering.meeting_section] = [];
        }
        groupedOfferings.groups[offering.meeting_section].push(offering);
      });
      groupedOfferingsList.push(groupedOfferings);
    }
  
    return groupedOfferingsList;
  }
  
  // Function to get the maximum number of days allowed based on restrictions
  export async function getMaxDays(restrictions: Restriction[]) {
    for (const restriction of restrictions) {
      if (restriction.disabled) continue;
      if (restriction.type == RestrictionType.RestrictDaysOff) {
        return 5 - restriction.numDays; // Subtract the restricted days from the total days
      }
    }
    return 5; // Default to 5 days if no restrictions
  }
  
  // Function to check if an offering satisfies the restrictions
  export function isValidOffering(
    offering: Offering,
    restrictions: Restriction[],
  ) {
    for (const restriction of restrictions) {
      if (restriction.disabled) continue;
      if (!restriction.days.includes(offering.day)) continue;
      // Check based on the restriction type
      switch (restriction.type) {
        case RestrictionType.RestrictBefore:
          if (offering.start < restriction.endTime) return false;
          break;
  
        case RestrictionType.RestrictAfter:
          console.log("====");
          console.log(offering.end);
          console.log(restriction.endTime);
          if (offering.end > restriction.startTime) return false;
          break;
  
        case RestrictionType.RestrictBetween:
          if (
            offering.start < restriction.endTime &&
            restriction.startTime < offering.end
          ) {
            return false;
          }
          break;
  
        case RestrictionType.RestrictDay:
          if (restriction.days.includes(offering.day)) {
            return false;
          }
          break;
      }
    }
  
    console.log(offering);
    return true;
  }
  
  // Function to get valid offerings by filtering them based on the restrictions
  export async function getValidOfferings(
    groups: Record<string, Offering[]>,
    restrictions: Restriction[],
  ) {
    const validGroups: Record<string, Offering[]> = {};
  
    // Loop through each group in the groups object
    for (const [groupKey, offerings] of Object.entries(groups)) {
      // Check if all offerings in the group are valid
      const allValid = offerings.every((offering) =>
        isValidOffering(offering, restrictions),
      );
  
      // Only add the group to validGroups if all offerings are valid
      if (allValid) {
        validGroups[groupKey] = offerings;
      }
    }
  
    // Return the object with valid groups
    return validGroups;
  }
  
  // Function to categorize offerings into lectures, tutorials, and practicals
  export async function categorizeValidOfferings(
    offerings: GroupedOfferingList[],
  ) {
    const lst: CategorizedOfferingList[] = [];
  
    for (const offering of offerings) {
      const lectures: CategorizedOfferingList = {
        course_id: offering.course_id,
        category: "LEC",
        offerings: {},
      };
      const tutorials: CategorizedOfferingList = {
        course_id: offering.course_id,
        category: "TUT",
        offerings: {},
      };
      const practicals: CategorizedOfferingList = {
        course_id: offering.course_id,
        category: "PRA",
        offerings: {},
      };
  
      for (const [meeting_section, offerings] of Object.entries(
        offering.groups,
      )) {
        if (meeting_section && meeting_section.startsWith("PRA")) {
          practicals.offerings[meeting_section] = offerings;
        } else if (meeting_section && meeting_section.startsWith("TUT")) {
          tutorials.offerings[meeting_section] = offerings;
        } else {
          lectures.offerings[meeting_section] = offerings;
        }
      }
  
      for (const x of [lectures, practicals, tutorials]) {
        if (Object.keys(x.offerings).length > 0) {
          lst.push(x);
        }
      }
    }
    return lst;
  }
  
  // Function to check if an offering can be inserted into the current list of
  // offerings without conflicts
  export async function canInsert(toInsert: Offering, curList: Offering[]) {
    for (const offering of curList) {
      if (offering.day == toInsert.day) {
        if (offering.start < toInsert.end && toInsert.start < offering.end) {
          return false; // Check if the time overlaps
        }
      }
    }
  
    return true; // No conflict found
  }
  
  // Function to check if an ever offerings in toInstList can be inserted into
  // the current list of offerings without conflicts
  export async function canInsertList(
    toInsertList: Offering[],
    curList: Offering[],
  ) {
    console.log(toInsertList);
    return toInsertList.every((x) => canInsert(x, curList));
  }
  
  // Function to generate a frequency table of days from a list of offerings
  export function getFrequencyTable(arr: Offering[]): Map<string, number> {
    const freqMap = new Map<string, number>();
  
    for (const item of arr) {
      const count = freqMap.get(item.day) || 0;
      freqMap.set(item.day, count + 1);
    }
    return freqMap;
}

// Trims the list of scheules to only return 10 random schedule if there is more
// than 10 available options.
export function trim(schedules: Offering[][]) {
    if (schedules.length <= 10) return schedules;
    const num = schedules.length;
  
    const uniqueNumbers = new Set<number>();
    while (uniqueNumbers.size < 10) {
      uniqueNumbers.add(Math.floor(Math.random() * num));
    }
    // console.log(uniqueNumbers);
    const trim_schedule: Offering[][] = [];
    for (const value of uniqueNumbers) trim_schedule.push(schedules[value]);
  
    return trim_schedule;
}