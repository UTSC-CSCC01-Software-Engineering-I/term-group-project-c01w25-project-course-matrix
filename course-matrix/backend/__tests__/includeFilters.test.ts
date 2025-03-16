import {
  BREADTH_REQUIREMENT_KEYWORDS,
  YEAR_LEVEL_KEYWORDS
} from '../src/constants/promptKeywords'; 
import { includeFilters } from '../src/utils/includeFilters';
import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import * as ModuleType from '../src/utils/convert-breadth-requirement';
import * as ModuleType0 from '../src/utils/convert-year-level';

// Create mock functions
const mockConvertBreadthRequirement = jest.fn((namespace) => `converted_${namespace}`);
const mockConvertYearLevel = jest.fn((namespace) => `converted_${namespace}`);

// Mock the modules
jest.mock('../src/utils/convert-breadth-requirement', () => ({
  convertBreadthRequirement: (namespace: string) => mockConvertBreadthRequirement(namespace)
}));

jest.mock('../src/utils/convert-year-level', () => ({
  convertYearLevel: (namespace: string) => mockConvertYearLevel(namespace)
}));

describe('includeFilters', () => {
  beforeEach(() => {
    // Clear mock data before each test
    mockConvertBreadthRequirement.mockClear();
    mockConvertYearLevel.mockClear();
  });

  test('should return empty object when no filters match', () => {
    const query = 'something random';
    const result = includeFilters(query);
    expect(result).toEqual({});
  });

  test('should match breadth requirement keywords case-insensitively', () => {
    const query = 'I want to study ART Literature';
    const result = includeFilters(query);
    expect(result).toEqual({
      $or: [
        { breadth_requirement: { $eq: 'converted_ART_LIT_LANG' } }
      ]
    });
  });

  test('should match year level keywords case-insensitively', () => {
    const query = 'Looking for A-level courses';
    const result = includeFilters(query);
    expect(result).toEqual({
      $or: [
        { year_level: { $eq: 'converted_first_year' } }
      ]
    });
  });

  test('should combine both breadth and year level filters with $and when both are present', () => {
    const query = 'Natural Science First-Year courses';
    const result = includeFilters(query);
    expect(result).toEqual({
      $and: [
        {
          $or: [
            { breadth_requirement: { $eq: 'converted_NAT_SCI' } }
          ]
        },
        {
          $or: [
            { year_level: { $eq: 'converted_first_year' } }
          ]
        }
      ]
    });
  });

  test('should handle multiple breadth requirements', () => {
    const query = 'social science or quantitative reasoning';
    const result = includeFilters(query);
    expect(result).toEqual({
      $or: [
        { breadth_requirement: { $eq: 'converted_SOCIAL_SCI' } },
        { breadth_requirement: { $eq: 'converted_QUANT' } }
      ]
    });
  });

  test('should handle multiple year levels', () => {
    const query = 'third year or fourth-year courses';
    const result = includeFilters(query);
    expect(result).toEqual({
      $or: [
        { year_level: { $eq: 'converted_third_year' } },
        { year_level: { $eq: 'converted_fourth_year' } }
      ]
    });
  });

  test('should handle multiple breadth requirements and year levels', () => {
    const query = 'history philosophy B-level or C-level';
    const result = includeFilters(query);
    console.log(result)
    expect(result).toEqual({
      $and: [
        {
          $or: [
            { breadth_requirement: { $eq: 'converted_HIS_PHIL_CUL' } }
          ]
        },
        {
          $or: [
            { year_level: { $eq: 'converted_second_year' } },
            { year_level: { $eq: 'converted_third_year' } }
          ]
        }
      ]
    });
  });

  test('should ignore partial keyword matches', () => {
    // "art" alone shouldn't match "art literature language"
    const query = 'art courses';
    const result = includeFilters(query);
    // This should not match any specific filter since "art" alone isn't in the keywords
    expect(result).toEqual({});
  });

  test('should handle edge case with empty query', () => {
    const query = '';
    const result = includeFilters(query);
    expect(result).toEqual({});
  });
});