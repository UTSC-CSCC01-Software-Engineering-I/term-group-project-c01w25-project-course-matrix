import {
  BREADTH_REQUIREMENT_KEYWORDS,
  YEAR_LEVEL_KEYWORDS,
} from "../constants/promptKeywords";
import { convertBreadthRequirement } from "./convert-breadth-requirement";
import { convertYearLevel } from "./convert-year-level";

// Determines whether to apply metadata filtering based on user query.
export function includeFilters(query: string) {
  const lowerQuery = query.toLocaleLowerCase();
  const relaventBreadthRequirements: string[] = [];
  const relaventYearLevels: string[] = [];

  Object.entries(BREADTH_REQUIREMENT_KEYWORDS).forEach(
    ([namespace, keywords]) => {
      if (keywords.some((keyword) => lowerQuery.includes(keyword))) {
        relaventBreadthRequirements.push(convertBreadthRequirement(namespace));
      }
    },
  );

  Object.entries(YEAR_LEVEL_KEYWORDS).forEach(([namespace, keywords]) => {
    if (keywords.some((keyword) => lowerQuery.includes(keyword))) {
      relaventYearLevels.push(convertYearLevel(namespace));
    }
  });

  let filter = {};
  if (relaventBreadthRequirements.length > 0 && relaventYearLevels.length > 0) {
    filter = {
      $and: [
        {
          $or: relaventBreadthRequirements.map((req) => ({
            breadth_requirement: { $eq: req },
          })),
        },
        {
          $or: relaventYearLevels.map((yl) => ({ year_level: { $eq: yl } })),
        },
      ],
    };
  } else if (relaventBreadthRequirements.length > 0) {
    filter = {
      $or: relaventBreadthRequirements.map((req) => ({
        breadth_requirement: { $eq: req },
      })),
    };
  } else if (relaventYearLevels.length > 0) {
    filter = {
      $or: relaventYearLevels.map((yl) => ({ year_level: { $eq: yl } })),
    };
  }
  return filter;
}
