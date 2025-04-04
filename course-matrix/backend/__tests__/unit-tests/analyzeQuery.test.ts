import { analyzeQuery } from "../../src/utils/analyzeQuery";
import { describe, test, expect, jest } from "@jest/globals";
import {
  NAMESPACE_KEYWORDS,
  ASSISTANT_TERMS,
  DEPARTMENT_CODES,
} from "../../src/constants/promptKeywords";

// Mock the constants if needed
jest.mock("../../src/constants/promptKeywords", () => ({
  NAMESPACE_KEYWORDS: {
    courses_v3: ["course", "class", "description"],
    offerings: ["offering", "schedule", "timetable"],
    prerequisites: ["prerequisite", "prereq"],
    corequisites: ["corequisite", "coreq"],
    departments: ["department", "faculty"],
    programs: ["program", "major", "minor"],
  },
  ASSISTANT_TERMS: ["you", "your", "morpheus", "assistant"],
  DEPARTMENT_CODES: ["cs", "math", "eng"],
  GENERAL_ACADEMIC_TERMS: ["academic", "study", "education"],
}));

describe("analyzeQuery", () => {
  test("should return no search required for assistant-related queries", () => {
    const result = analyzeQuery("Can you help me with something?");
    expect(result).toEqual({
      requiresSearch: false,
      relevantNamespaces: [],
    });
  });

  test("should detect course-related keywords and return appropriate namespaces", () => {
    const result = analyzeQuery("Tell me about this course");
    expect(result.requiresSearch).toBe(true);
    expect(result.relevantNamespaces).toContain("courses_v3");
  });

  test("should detect course codes and include relevant namespaces", () => {
    const result = analyzeQuery("What is CSC108 about?");
    expect(result.requiresSearch).toBe(true);
    expect(result.relevantNamespaces).toContain("courses_v3");
    expect(result.relevantNamespaces).toContain("offerings");
    expect(result.relevantNamespaces).toContain("prerequisites");
  });

  test("should detect department codes and include relevant namespaces", () => {
    const result = analyzeQuery("What math courses are available?");
    expect(result.requiresSearch).toBe(true);
    expect(result.relevantNamespaces).toContain("departments");
    expect(result.relevantNamespaces).toContain("courses_v3");
  });

  test("should detect offering-related keywords", () => {
    const result = analyzeQuery("What is the schedule for winter semester?");
    expect(result.requiresSearch).toBe(true);
    expect(result.relevantNamespaces).toContain("offerings");
  });

  test("should detect prerequisite-related keywords", () => {
    const result = analyzeQuery("What are the prerequisites for this class?");
    expect(result.requiresSearch).toBe(true);
    expect(result.relevantNamespaces).toContain("prerequisites");
  });

  test("should detect corequisite-related keywords", () => {
    const result = analyzeQuery("Are there any corequisites for this course?");
    expect(result.requiresSearch).toBe(true);
    expect(result.relevantNamespaces).toContain("corequisites");
  });

  test("should return all namespaces when search is required but no specific namespaces identified", () => {
    // Assuming GENERAL_ACADEMIC_TERMS includes 'academic'
    const result = analyzeQuery("I need academic information");
    expect(result.requiresSearch).toBe(true);
    expect(result.relevantNamespaces).toEqual([
      "courses_v3",
      "offerings",
      "prerequisites",
      "corequisites",
      "departments",
      "programs",
    ]);
  });

  test("should be case insensitive", () => {
    const result = analyzeQuery("TELL ME ABOUT THIS COURSE");
    expect(result.requiresSearch).toBe(true);
    expect(result.relevantNamespaces).toContain("courses_v3");
  });

  test("should detect multiple namespaces in a single query", () => {
    const result = analyzeQuery(
      "What are the prerequisites and schedule for CSC108?",
    );
    expect(result.requiresSearch).toBe(true);
    expect(result.relevantNamespaces).toContain("prerequisites");
    expect(result.relevantNamespaces).toContain("offerings");
    expect(result.relevantNamespaces).toContain("courses_v3");
  });

  test("should correctly identify course codes with different formats", () => {
    const formats = [
      "CSC108", // Standard format
      "CSC108H", // With suffix
      "CSCA08", // Four letters
      "MAT224", // Different department
      "ECO100Y", // Another format
    ];

    formats.forEach((code) => {
      const result = analyzeQuery(`Tell me about ${code}`);
      expect(result.requiresSearch).toBe(true);
      expect(result.relevantNamespaces).toContain("courses_v3");
      expect(result.relevantNamespaces).toContain("offerings");
      expect(result.relevantNamespaces).toContain("prerequisites");
    });
  });
});
