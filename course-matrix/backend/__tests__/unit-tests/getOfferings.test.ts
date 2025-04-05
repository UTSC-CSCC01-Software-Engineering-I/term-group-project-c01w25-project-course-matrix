import { describe, expect, it, jest, test } from "@jest/globals";

import { supabase } from "../../src/db/setupDb";
import getOfferings from "../../src/services/getOfferings";

jest.mock("../../src/db/setupDb", () => ({
  supabase: {
    schema: jest.fn(),
  },
}));

type SupabaseQueryResult = Promise<{ data: any; error: any }>;

describe("getOfferings", () => {
  it("returns offering data for a valid course and semester", async () => {
    const mockData = [
      {
        id: 1,
        course_id: 123,
        meeting_section: "L01",
        offering: "Fall 2025",
        day: "Mon",
        start: "10:00",
        end: "11:00",
        location: "Room 101",
        current: 30,
        max: 40,
        is_waitlisted: false,
        delivery_mode: "In-Person",
        instructor: "Dr. Smith",
        notes: "",
        code: "ABC123",
      },
    ];

    // Build the method chain mock
    const eqMock2 = jest.fn<() => SupabaseQueryResult>().mockResolvedValue({
      data: mockData,
      error: null,
    });
    const eqMock1 = jest.fn(() => ({ eq: eqMock2 }));
    const selectMock = jest.fn(() => ({ eq: eqMock1 }));
    const fromMock = jest.fn(() => ({ select: selectMock }));
    const schemaMock = jest.fn(() => ({ from: fromMock }));

    // Replace supabase.schema with our chain
    (supabase.schema as jest.Mock).mockImplementation(schemaMock);

    // Act
    const result = await getOfferings(123, "Fall 2025");

    // Assert
    expect(schemaMock).toHaveBeenCalledWith("course");
    expect(fromMock).toHaveBeenCalledWith("offerings");
    expect(selectMock).toHaveBeenCalled();
    expect(eqMock1).toHaveBeenCalledWith("course_id", 123);
    expect(eqMock2).toHaveBeenCalledWith("offering", "Fall 2025");
    expect(result).toEqual(mockData);
  });
});
