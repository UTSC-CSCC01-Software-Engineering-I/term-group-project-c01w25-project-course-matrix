import request from "supertest";
import timetablesController from "../../src/controllers/timetablesController";
import restrictionsController from "../../src/controllers/restrictionsController";
import { Request, Response, NextFunction } from "express";
import {
  jest,
  describe,
  test,
  expect,
  beforeEach,
  afterAll,
} from "@jest/globals";
import { authHandler } from "../../src/middleware/authHandler";
import { supabase } from "../../src/db/setupDb";
import { Json } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/db_control";
import app from "../../src/index";
import { server } from "../../src/index";

const USER1 = "testuser01-ab9e6877-f603-4c6a-9832-864e520e4d01";
const USER2 = "testuser02-1d3f02df-f926-4c1f-9f41-58ca50816a33";
const USER3 = "testuser03-f84fd0da-d775-4424-ad88-d9675282453c";
const USER4 = "testuser04-f84fd0da-d775-4424-ad88-d9675282453c";

//Handle AI import from index.ts
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

// Function to create authenticated session dynamically based as provided user_id
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

// Mock timetables dataset
const mockTimetables1 = [
  {
    id: 1,
    name: "Timetable 1",
    user_id: USER1,
  },
  {
    id: 2,
    name: "Timetable 2",
    user_id: USER1,
  },
];

// Spy on the getTimetables method
jest
  .spyOn(timetablesController, "getTimetables")
  .mockImplementation(timetablesController.getTimetables);

// Spy on the createTimetable method
jest
  .spyOn(timetablesController, "createTimetable")
  .mockImplementation(timetablesController.createTimetable);

// Spy on the updateTimetable method
jest
  .spyOn(timetablesController, "updateTimetable")
  .mockImplementation(timetablesController.updateTimetable);

// Spy on the deleteTimetable method
jest
  .spyOn(timetablesController, "deleteTimetable")
  .mockImplementation(timetablesController.deleteTimetable);

// Mock data set response to qeury
jest.mock("../../src/db/setupDb", () => ({
  supabase: {
    //Mock return from schema, from and select to chain the next query command
    schema: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    // Mock db response to .eq query command
    eq: jest.fn().mockImplementation((key, value) => {
      //Each test case is codded by the user_id in session
      //DB response 1: Query user timetable return non null value
      if (key === "user_id" && value === USER1) {
        // Return mock data when user_id matches
        return { data: mockTimetables1, error: null };
      }
      //DB response 2: Query user timetable return null value
      if (key === "user_id" && value === USER2) {
        // Return null for this user_id
        return { data: null, error: null };
      }

      //DB response 3: Combine .eq and .maybeSingle to signify that the return value could be single: Return non null value
      if (key === "user_id" && value === USER3) {
        return {
          eq: jest.fn().mockReturnThis(), // Allow further chaining of eq if required
          maybeSingle: jest.fn().mockImplementation(() => {
            return { data: null, error: null };
          }),
        };
      }
      //DB response 4: Combine .eq and .maybeSingle to signify that the return value could be single: Return null value
      if (key === "user_id" && value === USER4) {
        return {
          eq: jest.fn().mockReturnThis(), // Allow further chaining of eq if required
          neq: jest.fn().mockImplementation(() => ({
            maybeSingle: jest
              .fn()
              .mockImplementation(() => ({ data: null, error: null })),
          })),
          maybeSingle: jest.fn().mockImplementation(() => {
            return { data: mockTimetables1, error: null };
          }),
        };
      }
    }),
    // Mock db response to .insert query command
    insert: jest.fn().mockImplementation((data: Json) => {
      //DB response 5: Create timetable successfully, new timetable data is responded
      if (data && data[0].user_id === USER3) {
        return {
          select: jest.fn().mockImplementation(() => {
            // Return the input data when select is called
            return { data: data, error: null }; // Return the data passed to insert
          }),
        };
      }
      //DB response 6: Create timetable uncessfully, return error.message
      return {
        select: jest.fn().mockImplementation(() => {
          return { data: null, error: { message: "Fail to create timetable" } };
        }),
      };
    }),

    // Mock db response to .update query command
    update: jest.fn().mockImplementation((updatedata: Json) => {
      //DB response 7: Timetable updated successfully, db return updated data in response
      if (updatedata && updatedata.timetable_title === "Updated Title") {
        return {
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockImplementation((data) => {
            return { data: updatedata, error: null };
          }),
        };
      }
      //DB response 8: Update timetable uncessfully, return error.message
      return { data: null, error: { message: "Fail to update timetable" } };
    }),

    // Mock db response to .delete query command
    delete: jest.fn().mockImplementation(() => {
      //DB response 9: Delete timetable successfully
      return {
        eq: jest.fn().mockReturnThis(),
        data: null,
        error: null,
      };
    }),
  },
}));
