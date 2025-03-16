import {
  NAMESPACE_KEYWORDS,
  DEPARTMENT_CODES,
  GENERAL_ACADEMIC_TERMS,
  ASSISTANT_TERMS,
} from "../constants/promptKeywords";

// Analyze query contents and pick out relavent namespaces to search.
export function analyzeQuery(query: string): {
  requiresSearch: boolean;
  relevantNamespaces: string[];
} {
  const lowerQuery = query.toLowerCase();

  // Check for course codes (typically 3 letters followed by numbers)
  const courseCodeRegex = /\b[a-zA-Z]{3}[a-zA-Z]?\d{2,3}[a-zA-Z]?\b/i;
  const containsCourseCode = courseCodeRegex.test(query);

  const relevantNamespaces: string[] = [];

  // Check each namespace's keywords
  Object.entries(NAMESPACE_KEYWORDS).forEach(([namespace, keywords]) => {
    if (keywords.some((keyword) => lowerQuery.includes(keyword))) {
      relevantNamespaces.push(namespace);
    }
  });

  // If a course code is detected, add tehse namespaces
  if (containsCourseCode) {
    if (!relevantNamespaces.includes("courses_v3"))
      relevantNamespaces.push("courses_v3");
    if (!relevantNamespaces.includes("offerings"))
      relevantNamespaces.push("offerings");
    if (!relevantNamespaces.includes("prerequisites"))
      relevantNamespaces.push("prerequisites");
  }

  // Check for dept codes
  if (DEPARTMENT_CODES.some((code) => lowerQuery.includes(code))) {
    if (!relevantNamespaces.includes("departments"))
      relevantNamespaces.push("departments");
    if (!relevantNamespaces.includes("courses_v3"))
      relevantNamespaces.push("courses_v3");
  }

  // If search is required at all
  const requiresSearch =
    relevantNamespaces.length > 0 ||
    GENERAL_ACADEMIC_TERMS.some((term) => lowerQuery.includes(term)) ||
    containsCourseCode;

  // If no specific namespaces identified & search required, then search all
  if (requiresSearch && relevantNamespaces.length === 0) {
    relevantNamespaces.push(
      "courses_v3",
      "offerings",
      "prerequisites",
      "corequisites",
      "departments",
      "programs",
    );
  }

  if (
    ASSISTANT_TERMS.some((term) => lowerQuery.includes(term)) &&
    relevantNamespaces.length === 0
  ) {
    return { requiresSearch: false, relevantNamespaces: [] };
  }

  return { requiresSearch, relevantNamespaces };
}
