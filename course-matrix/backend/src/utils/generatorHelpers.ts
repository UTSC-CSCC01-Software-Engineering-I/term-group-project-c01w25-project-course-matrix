import {
  CategorizedOfferingList,
  GroupedOfferingList,
  Offering,
  OfferingList,
  Restriction,
  RestrictionType,
} from "../types/generatorTypes";

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

export function getFreq(groupedOfferings: GroupedOfferingList) {
  for (const [groupKey, offerings] of Object.entries(groupedOfferings.groups)) {
    if (groupKey && groupKey.startsWith("PRA")) {
      groupedOfferings.practicals++;
    } else if (groupKey && groupKey.startsWith("TUT")) {
      groupedOfferings.tutorials++;
    } else {
      groupedOfferings.lectures++;
    }
  }
  return groupedOfferings;
}

// Function to group offerings with the same meeting section together
export function groupOfferings(courseOfferingsList: OfferingList[]) {
  const groupedOfferingsList: GroupedOfferingList[] = [];
  for (const offering of courseOfferingsList) {
    let groupedOfferings: GroupedOfferingList = {
      course_id: offering.course_id,
      groups: {},
      lectures: 0,
      tutorials: 0,
      practicals: 0,
    };
    offering.offerings.forEach((offering) => {
      if (!groupedOfferings.groups[offering.meeting_section]) {
        groupedOfferings.groups[offering.meeting_section] = [];
      }
      groupedOfferings.groups[offering.meeting_section].push(offering);
    });
    groupedOfferings = getFreq(groupedOfferings);
    groupedOfferingsList.push(groupedOfferings);
  }
  return groupedOfferingsList;
}

// Function to get the maximum number of days allowed based on restrictions
export function getMaxDays(restrictions: Restriction[]) {
  for (const restriction of restrictions) {
    if (restriction.disabled) continue;
    if (restriction.type == RestrictionType.RestrictDaysOff) {
      return 5 - restriction.numDays; // Subtract the restricted days from the total days
    }
  }
  return 5; // Default to 5 days if no restrictions
}

// Function to get the hour for max gap
export function getMaxHour(restrictions: Restriction[]) {
  for (const restriction of restrictions) {
    if (restriction.disabled) continue;
    if (restriction.type == RestrictionType.RestrictMaxGap) {
      return restriction.maxGap;
    }
  }
  return 24; // Default to 5 days if no restrictions
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

  return true;
}

// Function to get valid offerings by filtering them based on the restrictions
export function getValidOfferings(
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
export function categorizeValidOfferings(offerings: GroupedOfferingList[]) {
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

function maxString(a: string, b: string): string {
  return a.localeCompare(b) >= 0 ? a : b;
}

function minString(a: string, b: string): string {
  return a.localeCompare(b) <= 0 ? a : b;
}

// Function to check if an offering can be inserted into the current list of
// offerings without conflicts
export function canInsert(toInsert: Offering, curList: Offering[]) {
  for (const offering of curList) {
    if (offering.day == toInsert.day) {
      if (
        maxString(offering.start, toInsert.start) <
        minString(offering.end, toInsert.end)
      ) {
        return false; // Check if the time overlaps
      }
    }
  }

  return true; // No conflict found
}

// Function to check if an ever offerings in toInstList can be inserted into
// the current list of offerings without conflicts
export function canInsertList(toInsertList: Offering[], curList: Offering[]) {
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
  const trim_schedule: Offering[][] = [];
  for (const value of uniqueNumbers) trim_schedule.push(schedules[value]);

  return trim_schedule;
}

export function getMinHourDay(schedule: Offering[], maxhours: number): boolean {
  if (schedule.length <= 1) return true;
  schedule.sort((a, b) => a.start.localeCompare(b.start));
  for (let i = 1; i < schedule.length; i++) {
    const cur = parseInt(schedule[i].start.split(":")[0]);
    const prev = parseInt(schedule[i - 1].end.split(":")[0]);
    if (cur - prev > maxhours) {
      return false;
    }
  }
  return true;
}

export function getMinHour(schedule: Offering[], maxhours: number): boolean {
  if (maxhours == 24) return true;
  const scheduleByDay: Record<string, Offering[]> = {};
  schedule.forEach((offering) => {
    if (!scheduleByDay[offering.day]) {
      scheduleByDay[offering.day] = [];
    }
    scheduleByDay[offering.day].push(offering);
  });
  return Object.values(scheduleByDay).every((x) => getMinHourDay(x, maxhours));
}

export function shuffle(
  array: CategorizedOfferingList[],
): CategorizedOfferingList[] {
  const shuffled = [...array]; // Create a copy to avoid mutating the original array
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
  }
  return shuffled;
}
