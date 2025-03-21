export const codeToYear = (courseCode: string) => {
  const letter = courseCode.slice(3, 4);
  switch (letter) {
    case "A":
      return 1;
      break;
    case "B":
      return 2;
      break;
    case "C":
      return 3;
      break;
    case "D":
      return 4;
      break;
    default:
      break;
  }
};

export const yearToCode = (year: number) => {
  switch (year) {
    case 1:
      return "A";
      break;
    case 2:
      return "B";
      break;
    case 3:
      return "C";
      break;
    case 4:
      return "D";
      break;
    default:
      break;
  }
};

// true - notifications will be tested by mocking current Date
// false - normal application behavior
export const TEST_NOTIFICATIONS = false;
// Mock the current date
// Note: month index in date constructor is 0 indexed (0 - 11)
export const TEST_DATE_NOW = new Date(2025, 4, 14, 8, 45, 1);

// Set minimum results wanted for a similarity search on the associated namespace.
export const namespaceToMinResults = new Map();
namespaceToMinResults.set("courses_v3", 10);
namespaceToMinResults.set("offerings", 16); // Typically, more offering info is wanted.
namespaceToMinResults.set("prerequisites", 5);
namespaceToMinResults.set("corequisites", 5);
namespaceToMinResults.set("departments", 5);
namespaceToMinResults.set("programs", 5);

// Consider the last X messages in history to influence vector DB query
export const CHATBOT_MEMORY_THRESHOLD = 3;

export const CHATBOT_TIMETABLE_CMD = "/timetable";

export const CHATBOT_TOOL_CALL_MAX_STEPS = 5;
