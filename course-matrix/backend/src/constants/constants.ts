const codeToYearMap = new Map<string, number>([
  ["A", 1],
  ["B", 2],
  ["C", 3],
  ["D", 4],
]);

const yearToCodeMap = new Map<number, string>([
  [1, "A"],
  [2, "B"],
  [3, "C"],
  [4, "D"],
]);

export const codeToYear = (courseCode: string) => {
  const letter = courseCode.slice(3, 4);
  const year = codeToYearMap.get(letter);
  if (year === undefined) {
    throw new Error(`Invalid course code: ${courseCode}`);
  }
  return year;
};

export const yearToCode = (year: number) => {
  const letter = yearToCodeMap.get(year);
  if (letter === undefined) {
    throw new Error(`Invalid year: ${year}`);
  }
  return letter;
};

// true - notifications will be tested by mocking current Date
// false - normal application behavior
export const TEST_NOTIFICATIONS = false;
// Mock the current date
// Note: month index in date constructor is 0 indexed (0 - 11)
export const TEST_DATE_NOW = new Date(2025, 4, 14, 8, 45, 1);

// Set minimum results wanted for a similarity search on the associated
// namespace.
export const namespaceToMinResults = new Map();
namespaceToMinResults.set("courses_v3", 16);
namespaceToMinResults.set("offerings", 16); // Typically, more offering info is wanted.
namespaceToMinResults.set("prerequisites", 5);
namespaceToMinResults.set("corequisites", 5);
namespaceToMinResults.set("departments", 5);
namespaceToMinResults.set("programs", 5);

// Consider the last X messages in history to influence vector DB query
export const CHATBOT_MEMORY_THRESHOLD = 3;

export const CHATBOT_TIMETABLE_CMD = "/timetable";

export const CHATBOT_TOOL_CALL_MAX_STEPS = 5;
