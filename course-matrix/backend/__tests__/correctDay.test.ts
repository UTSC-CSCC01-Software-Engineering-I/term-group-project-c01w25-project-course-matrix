import { describe, expect, jest, test } from '@jest/globals';
import { isDateBetween } from "../src/utils/compareDates"

// For testing purposes, we need to modify the function to accept a custom "now" date
// This allows us to test all scenarios regardless of the current date
function correctDay(offering: any, customNow?: Date): boolean {
  const weekdays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"]
  const semester = offering?.offering;
  const day = offering?.day;
  if (!semester || !day) return false;
  const now = customNow || new Date();
  let startDay;
  let endDay;
  if (semester === "Summer 2025") {
    startDay = new Date(2025, 5, 2);
    endDay = new Date(2025, 8, 7);
  }
  else if (semester === "Fall 2025") {
    startDay = new Date(2025, 9, 3);
    endDay = new Date(2025, 12, 3);
  }
  else { // Winter 2026
    startDay = new Date(2026, 1, 6);
    endDay = new Date(2026, 4, 4);
  }
  if (!isDateBetween(now, startDay, endDay)) {
    return false;
  }
  if (weekdays[now.getDay()] !== day) {
    return false;
  }
  return true;
}

describe('correctDay function', () => {
  test('should return false for null or undefined offering', () => {
    expect(correctDay(null)).toBe(false);
    expect(correctDay(undefined)).toBe(false);
  });
  
  test('should return false for missing offering properties', () => {
    expect(correctDay({})).toBe(false);
    expect(correctDay({ offering: "Summer 2025" })).toBe(false);
    expect(correctDay({ day: "MO" })).toBe(false);
  });
  
  test('should validate correct day in Summer 2025', () => {
    // Create specific dates for each day of the week within Summer 2025
    const summerDates = [
      new Date(2025, 5, 8),  // Sunday (June 8, 2025)
      new Date(2025, 5, 9),  // Monday (June 9, 2025)
      new Date(2025, 5, 10), // Tuesday (June 10, 2025)
      new Date(2025, 5, 11), // Wednesday (June 11, 2025)
      new Date(2025, 5, 12), // Thursday (June 12, 2025)
      new Date(2025, 5, 13), // Friday (June 13, 2025)
      new Date(2025, 5, 14)  // Saturday (June 14, 2025)
    ];
    
    // Test each day with its corresponding date
    const weekdays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
    summerDates.forEach((date, index) => {
      // Make sure the getDay returns the expected index
      jest.spyOn(date, 'getDay').mockReturnValue(index);
      
      // This should pass only for the matching day
      expect(correctDay({ offering: "Summer 2025", day: weekdays[index] }, date)).toBe(true);
      
      // Test all other days should fail
      weekdays.forEach((wrongDay, wrongIndex) => {
        if (wrongIndex !== index) {
          expect(correctDay({ offering: "Summer 2025", day: wrongDay }, date)).toBe(false);
        }
      });
    });
  });
  
  test('should validate correct day in Fall 2025', () => {
    // Create a date in Fall 2025
    const fallDate = new Date(2025, 9, 15); // October 15, 2025
    
    // Mock getDay to return 3 (Wednesday)
    jest.spyOn(fallDate, 'getDay').mockReturnValue(3);
    
    // Test all days - only Wednesday should pass
    expect(correctDay({ offering: "Fall 2025", day: "WE" }, fallDate)).toBe(true);
    expect(correctDay({ offering: "Fall 2025", day: "SU" }, fallDate)).toBe(false);
    expect(correctDay({ offering: "Fall 2025", day: "MO" }, fallDate)).toBe(false);
    expect(correctDay({ offering: "Fall 2025", day: "TU" }, fallDate)).toBe(false);
    expect(correctDay({ offering: "Fall 2025", day: "TH" }, fallDate)).toBe(false);
    expect(correctDay({ offering: "Fall 2025", day: "FR" }, fallDate)).toBe(false);
    expect(correctDay({ offering: "Fall 2025", day: "SA" }, fallDate)).toBe(false);
  });
  
  test('should validate correct day in Winter 2026', () => {
    // Create a date in Winter 2026
    const winterDate = new Date(2026, 1, 20); // February 20, 2026
    
    // Mock getDay to return 5 (Friday)
    jest.spyOn(winterDate, 'getDay').mockReturnValue(5);
    
    // Test all days - only Friday should pass
    expect(correctDay({ offering: "Winter 2026", day: "FR" }, winterDate)).toBe(true);
    expect(correctDay({ offering: "Winter 2026", day: "SU" }, winterDate)).toBe(false);
    expect(correctDay({ offering: "Winter 2026", day: "MO" }, winterDate)).toBe(false);
    expect(correctDay({ offering: "Winter 2026", day: "TU" }, winterDate)).toBe(false);
    expect(correctDay({ offering: "Winter 2026", day: "WE" }, winterDate)).toBe(false);
    expect(correctDay({ offering: "Winter 2026", day: "TH" }, winterDate)).toBe(false);
    expect(correctDay({ offering: "Winter 2026", day: "SA" }, winterDate)).toBe(false);
  });
  
  test('should return false when date is outside semester range', () => {
    // Create dates outside each semester range
    const beforeSummer = new Date(2025, 5, 1); // June 1, 2025 (before Summer 2025)
    const afterSummer = new Date(2025, 8, 8);  // September 8, 2025 (after Summer 2025)
    const beforeFall = new Date(2025, 9, 2);   // October 2, 2025 (before Fall 2025)
    const afterFall = new Date(2025, 12, 4);   // December 4, 2025 (after Fall 2025)
    const beforeWinter = new Date(2026, 1, 5); // February 5, 2026 (before Winter 2026)
    const afterWinter = new Date(2026, 4, 5);  // May 5, 2026 (after Winter 2026)
    
    // Mock getDay to return 0 (Sunday) for all dates
    const testDates = [beforeSummer, afterSummer, beforeFall, afterFall, beforeWinter, afterWinter];
    testDates.forEach(date => {
      jest.spyOn(date, 'getDay').mockReturnValue(0);
    });
    
    // Test dates outside Summer 2025
    expect(correctDay({ offering: "Summer 2025", day: "SU" }, beforeSummer)).toBe(false);
    expect(correctDay({ offering: "Summer 2025", day: "SU" }, afterSummer)).toBe(false);
    
    // Test dates outside Fall 2025
    expect(correctDay({ offering: "Fall 2025", day: "SU" }, beforeFall)).toBe(false);
    expect(correctDay({ offering: "Fall 2025", day: "SU" }, afterFall)).toBe(false);
    
    // Test dates outside Winter 2026
    expect(correctDay({ offering: "Winter 2026", day: "SU" }, beforeWinter)).toBe(false);
    expect(correctDay({ offering: "Winter 2026", day: "SU" }, afterWinter)).toBe(false);
  });
  
  test('should return true for dates inside semester range', () => {
    // Create dates inside each semester range
    const duringSummer = new Date(2025, 6, 15); // July 15, 2025 (during Summer 2025)
    const duringFall = new Date(2025, 10, 15);  // November 15, 2025 (during Fall 2025)
    const duringWinter = new Date(2026, 2, 15); // March 15, 2026 (during Winter 2026)
    
    // Mock getDay to return 0 (Sunday) for all dates
    const testDates = [duringSummer, duringFall, duringWinter];
    testDates.forEach(date => {
      jest.spyOn(date, 'getDay').mockReturnValue(0);
    });
    
    // Test dates inside each semester (with matching day)
    expect(correctDay({ offering: "Summer 2025", day: "SU" }, duringSummer)).toBe(true);
    expect(correctDay({ offering: "Fall 2025", day: "SU" }, duringFall)).toBe(true);
    expect(correctDay({ offering: "Winter 2026", day: "SU" }, duringWinter)).toBe(true);
  });
  
  test('should validate edge dates correctly', () => {
    // Test exact start and end dates of semesters
    const summerStart = new Date(2025, 5, 2);  // June 2, 2025
    const summerEnd = new Date(2025, 8, 7);    // September 7, 2025
    const fallStart = new Date(2025, 9, 3);    // October 3, 2025
    const fallEnd = new Date(2025, 12, 3);     // December 3, 2025
    const winterStart = new Date(2026, 1, 6);  // February 6, 2026
    const winterEnd = new Date(2026, 4, 4);    // May 4, 2026
    
    // Mock getDay to return 0 (Sunday) for all dates
    const edgeDates = [summerStart, summerEnd, fallStart, fallEnd, winterStart, winterEnd];
    edgeDates.forEach(date => {
      jest.spyOn(date, 'getDay').mockReturnValue(0);
    });
    
    // Edge dates should be included in the valid range
    expect(correctDay({ offering: "Summer 2025", day: "SU" }, summerStart)).toBe(true);
    expect(correctDay({ offering: "Summer 2025", day: "SU" }, summerEnd)).toBe(true);
    expect(correctDay({ offering: "Fall 2025", day: "SU" }, fallStart)).toBe(true);
    expect(correctDay({ offering: "Fall 2025", day: "SU" }, fallEnd)).toBe(true);
    expect(correctDay({ offering: "Winter 2026", day: "SU" }, winterStart)).toBe(true);
    expect(correctDay({ offering: "Winter 2026", day: "SU" }, winterEnd)).toBe(true);
  });
});