import {
  afterAll,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import {
  instanceOfErrorResponse,
  Json,
} from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/db_control";
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import restrictionsController from "../../src/controllers/restrictionsController";
import { supabase } from "../../src/db/setupDb";
import app from "../../src/index";
import { server } from "../../src/index";
import { authHandler } from "../../src/middleware/authHandler";
import { errorConverter } from "../../src/middleware/errorHandler";

// Handle AI import from index.ts
jest.mock("@ai-sdk/openai", () => ({
  createOpenAI: jest.fn(() => ({
    chat: jest.fn(),
  })),
}));

jest.mock("ai", () => ({
  streamText: jest.fn(() =>
    Promise.resolve({ pipeDataStreamToResponse: jest.fn() }),
  ),
}));

jest.mock("@pinecone-database/pinecone", () => ({
  Pinecone: jest.fn(() => ({
    Index: jest.fn(() => ({
      query: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    })),
  })),
}));

jest.mock("node-cron", () => ({
  schedule: jest.fn(), // Mock the `schedule` function
}));

afterAll(async () => {
  server.close();
});

// Function to create authenticated session dynamically based as provided
// user_id
const mockAuthHandler = (user_id: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    (req as any).user = { id: user_id }; // Inject user_id dynamically
    next();
  };
};

// Mock authHandler globally
jest.mock("../../src/middleware/authHandler", () => ({
  authHandler: jest.fn() as jest.MockedFunction<typeof authHandler>,
}));

const USER1 = "testuser04-f84fd0da-d775-4424-ad88-d9675282453c";
const USER2 = "testuser05-f84fd0da-d775-4424-ad88-d9675282453c";

// Mock timetables dataset
const mockRestriction = {
  id: 1,
  restriction_type: "Restrict Between",
  user_id: USER1,
  start_time: "13:30:00",
  end_time: "14:30:00",
  days: ["MO", "TUE"],
  disabled: false,
};

const mockRestriction2 = {
  id: 1,
  calendar_id: 1,
  restriction_type: "Restrict Between",
  user_id: USER2,
  start_time: "13:30:00",
  end_time: "14:30:00",
  days: ["MO", "TUE"],
  disabled: false,
};

const mockTimetables1 = {
  id: 1,
  user_id: USER1,
};

const mockTimetables2 = {
  id: 1,
  user_id: USER2,
};

// Spy on the createRestriction method
jest
  .spyOn(restrictionsController, "createRestriction")
  .mockImplementation(restrictionsController.createRestriction);

// Spy on the createTimetable method
jest
  .spyOn(restrictionsController, "getRestriction")
  .mockImplementation(restrictionsController.getRestriction);

// Spy on the updateTimetable method
jest
  .spyOn(restrictionsController, "updateRestriction")
  .mockImplementation(restrictionsController.updateRestriction);

// Spy on the deleteTimetable method
jest
  .spyOn(restrictionsController, "deleteRestriction")
  .mockImplementation(restrictionsController.deleteRestriction);

// Mock data set response to qeury
jest.mock("../../src/db/setupDb", () => ({
  supabase: {
    // Mock return from schema, from and select to chain the next query
    // command
    schema: jest.fn().mockReturnThis(),
    from: jest.fn().mockImplementation((key, value) => {
      if (key === "timetables") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockImplementation((key, value) => {
            // Each test case is codded by the user_id in session
            // DB response 3: Combine .eq and .maybeSingle to signify that
            // the return value could be single: Return non null value
            if (
              key === "user_id" &&
              value === "testuser03-f84fd0da-d775-4424-ad88-d9675282453c"
            ) {
              return {
                eq: jest.fn().mockReturnThis(),
                maybeSingle: jest.fn().mockImplementation(() => {
                  return { data: null, error: null };
                }),
              };
            }
            // DB response 4: Combine .eq and .maybeSingle to signify that
            // the return value could be single: Return null value
            if (key === "user_id" && value === USER1) {
              return {
                eq: jest.fn().mockReturnThis(), // Allow further chaining
                // of eq if required
                maybeSingle: jest.fn().mockImplementation(() => {
                  return { data: mockTimetables1, error: null };
                }),
              };
            }

            if (key === "user_id" && value === USER2) {
              return {
                eq: jest.fn().mockReturnThis(), // Allow further chaining
                // of eq if required
                maybeSingle: jest.fn().mockImplementation(() => {
                  return { data: mockTimetables2, error: null };
                }),
              };
            }
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockImplementation((key, value) => {
          if (
            key === "user_id" &&
            value === "testuser03-f84fd0da-d775-4424-ad88-d9675282453c"
          ) {
            return {
              eq: jest.fn().mockImplementation((key, value) => {
                if (key === "calendar_id" && value === "1") {
                  return {
                    eq: jest.fn().mockReturnThis(),
                    maybeSingle: jest.fn().mockImplementation(() => {
                      return {
                        data: null,
                        error: null,
                      };
                    }),
                  };
                }
              }),
            };
          }
          if (key === "user_id" && value === USER1) {
            return {
              eq: jest.fn().mockImplementation((key, value) => {
                if (key === "calendar_id" && value === "1") {
                  return { data: mockRestriction, error: null };
                }
              }),
            };
          }
          if (key === "user_id" && value === USER2) {
            return {
              eq: jest.fn().mockImplementation((key, value) => {
                if (key === "calendar_id" && value === "1") {
                  return {
                    eq: jest.fn().mockReturnThis(),
                    maybeSingle: jest.fn().mockImplementation(() => {
                      return { data: mockRestriction2, error: null };
                    }),
                  };
                }
              }),
            };
          }
          return { data: null, error: null };
        }),
        insert: jest.fn().mockImplementation((data: Json) => {
          // DB response 5: Create timetable successfully, new timetable
          // data is responded
          if (data && data[0].user_id === USER1) {
            return {
              select: jest.fn().mockImplementation(() => {
                // Return the input data when select is called
                return {
                  data: data,
                  error: null,
                }; // Return the data passed to insert
              }),
            };
          }
          // DB response 6: Create timetable uncessfully, return
          // error.message
          return {
            select: jest.fn().mockImplementation(() => {
              return {
                data: null,
                error: { message: "Fail to create timetable" },
              };
            }),
          };
        }),
        update: jest.fn().mockImplementation((updatedata: Json) => {
          // DB response 7: Timetable updated successfully, db return
          // updated data in response
          if (updatedata && updatedata.start_time === "09:00:00.000Z") {
            return {
              eq: jest.fn().mockReturnThis(),
              select: jest.fn().mockImplementation(() => {
                return { data: updatedata, error: null };
              }),
            };
          }
          // DB response 8: Update timetable uncessfully, return
          // error.message
          return { data: null, error: { message: "Fail to update timetable" } };
        }),
        delete: jest.fn().mockImplementation(() => {
          // DB response 9: Delete timetable successfully
          return {
            eq: jest.fn().mockImplementation((key, value) => {
              if (key === "user_id" && value === USER2) {
                return {
                  eq: jest.fn().mockReturnThis(),
                  data: null,
                  error: null,
                };
              }
              return {
                data: null,
                error: { message: "Uncessful restriction delete" },
              };
            }),
          };
        }),
      };
    }),
    select: jest.fn().mockReturnThis(),
    // Mock db response to .eq query command
    eq: jest.fn().mockReturnThis(),
    // Mock db response to .insert query command
    insert: jest.fn().mockReturnThis(),

    // Mock db response to .update query command
    update: jest.fn().mockImplementation((updatedata: Json) => {}),
    // Mock db response to .delete query command
    delete: jest.fn().mockReturnThis(),
  },
}));

// Test block 1: Get endpoint
describe("GET /api/timetables/restrictions/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return timetables", async () => {
    // Initialize the authenticated session
    (
      authHandler as jest.MockedFunction<typeof authHandler>
    ).mockImplementationOnce(mockAuthHandler(USER1));

    const response = await request(app).get("/api/timetables/restrictions/1");

    // Check database interaction and response
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockRestriction);
  });

  test("should return 404 if no timetables found", async () => {
    // Initialize the authenticated session
    (
      authHandler as jest.MockedFunction<typeof authHandler>
    ).mockImplementationOnce(
      mockAuthHandler("testuser03-f84fd0da-d775-4424-ad88-d9675282453c"),
    );

    const response = await request(app).get("/api/timetables/restrictions/1");
    // Verify the response status and error message
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Calendar id not found",
    });
  });
});

// Test block 2: POST endpoint
describe("POST /api/timetables/restrictions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return error code 400 and error message: 'calendar id is required'", async () => {
    const user_id = "testuser03-f84fd0da-d775-4424-ad88-d9675282453c";
    const newTimetable = {};

    (
      authHandler as jest.MockedFunction<typeof authHandler>
    ).mockImplementationOnce(mockAuthHandler(user_id));

    const response = await request(app)
      .post("/api/timetables/restrictions")
      .send(newTimetable);
    // Check database interaction and response

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "calendar id is required",
    });
  });

  test("should return error code 400 and error message: 'Start time or end time must be provided'", async () => {
    const user_id = "testuser03-f84fd0da-d775-4424-ad88-d9675282453c";
    const newTimetable = {
      calendar_id: "1",
    };

    (
      authHandler as jest.MockedFunction<typeof authHandler>
    ).mockImplementationOnce(mockAuthHandler(user_id));

    const response = await request(app)
      .post("/api/timetables/restrictions")
      .send(newTimetable);
    // Check database interaction and response

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "Start time or end time must be provided",
    });
  });

  test("should create a new timetable given calendar_id, start_time and end_time", async () => {
    const user_id = USER1;
    const newRestriction = {
      calendar_id: "1",
      start_time: "2025-03-04T09:00:00.000Z",
      end_time: "2025-03-04T10:00:00.000Z",
    };

    (
      authHandler as jest.MockedFunction<typeof authHandler>
    ).mockImplementationOnce(mockAuthHandler(user_id));

    const response = await request(app)
      .post("/api/timetables/restrictions")
      .send(newRestriction);
    // Check database interaction and response

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual([
      {
        user_id,
        calendar_id: "1",
        start_time: "09:00:00.000Z",
        end_time: "10:00:00.000Z",
      },
    ]);
  });

  test("should return error code 404 and error message: Calendar id not found", async () => {
    const user_id = "testuser03-f84fd0da-d775-4424-ad88-d9675282453c";
    const newRestriction = {
      calendar_id: "1",
      start_time: "2025-03-04T09:00:00.000Z",
      end_time: "2025-03-04T10:00:00.000Z",
    };

    (
      authHandler as jest.MockedFunction<typeof authHandler>
    ).mockImplementationOnce(mockAuthHandler(user_id));

    const response = await request(app)
      .post("/api/timetables/restrictions")
      .send(newRestriction);
    // Check database interaction and response

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Calendar id not found",
    });
  });
});

// Test block 3: Put endpoint
describe("PUT /api/timetables/restrictions/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("should return error code 400 and message: calendar id is required ", async () => {
    // Make sure the test user is authenticated
    const user_id = USER2;
    const timetableData = {
      start_time: "2025-03-04T09:00:00.000Z",
    };

    // Mock authHandler to simulate the user being logged in
    (
      authHandler as jest.MockedFunction<typeof authHandler>
    ).mockImplementationOnce(mockAuthHandler(user_id));

    const response = await request(app)
      .put("/api/timetables/restrictions/1")
      .send(timetableData);

    // Check that the `update` method was called
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "calendar id is required",
    });
  });

  test("should update the timetable successfully", async () => {
    // Make sure the test user is authenticated
    const user_id = USER2;
    const timetableData = {
      start_time: "2025-03-04T09:00:00.000Z",
    };

    // Mock authHandler to simulate the user being logged in
    (
      authHandler as jest.MockedFunction<typeof authHandler>
    ).mockImplementationOnce(mockAuthHandler(user_id));

    const response = await request(app)
      .put("/api/timetables/restrictions/1?calendar_id=1")
      .send(timetableData);

    // Check that the `update` method was called
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      start_time: "09:00:00.000Z",
    });
  });

  test("should return error code 404 and message: Restriction id does not exist", async () => {
    // Make sure the test user is authenticated
    const user_id = "testuser03-f84fd0da-d775-4424-ad88-d9675282453c";
    const timetableData = {
      start_time: "2025-03-04T09:00:00.000Z",
    };

    // Mock authHandler to simulate the user being logged in
    (
      authHandler as jest.MockedFunction<typeof authHandler>
    ).mockImplementationOnce(mockAuthHandler(user_id));

    const response = await request(app)
      .put("/api/timetables/restrictions/1?calendar_id=1")
      .send(timetableData);

    // Check that the `update` method was called
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Restriction id does not exist",
    });
  });
});

// Test block 4: Delete endpoint
describe("DELETE /api/timetables/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should delete the timetable successfully", async () => {
    // Make sure the test user is authenticated
    const user_id = USER2;

    // Mock authHandler to simulate the user being logged in
    (
      authHandler as jest.MockedFunction<typeof authHandler>
    ).mockImplementationOnce(mockAuthHandler(user_id));

    const response = await request(app).delete(
      "/api/timetables/restrictions/1?calendar_id=1",
    );

    // Check that the `update` method was called
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: "Restriction successfully deleted",
    });
  });

  test("should return error code 404 and message: Calendar id not found and id not found", async () => {
    // Make sure the test user is authenticated
    const user_id = "testuser03-f84fd0da-d775-4424-ad88-d9675282453c";

    // Mock authHandler to simulate the user being logged in
    (
      authHandler as jest.MockedFunction<typeof authHandler>
    ).mockImplementationOnce(mockAuthHandler(user_id));

    const response = await request(app).delete(
      "/api/timetables/restrictions/1?calendar_id=1",
    );

    // Check that the `update` method was called
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Restriction id does not exist",
    });
  });
});
