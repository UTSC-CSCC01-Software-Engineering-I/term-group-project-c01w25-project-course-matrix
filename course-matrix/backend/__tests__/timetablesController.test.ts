import request from "supertest";
import timetablesController from "../src/controllers/timetablesController";
import { Request, Response, NextFunction } from "express";
import { jest, describe, test, expect, beforeEach, it } from "@jest/globals";
import { authHandler } from "../src/middleware/authHandler";
import { Json } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/db_control";
import app from "../src/index";

//Handle AI import from index.ts
jest.mock("@ai-sdk/openai", () => ({
  createOpenAI: jest.fn(() => ({
    chat: jest.fn(),
  })),
}));

jest.mock("ai", () => ({
  streamText: jest.fn(() =>
    Promise.resolve({ pipeDataStreamToResponse: jest.fn() })
  ),
}));

// Function to create authenticated session dynamically based as provided user_id
const mockAuthHandler = (user_id: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    (req as any).user = { id: user_id }; // Inject user_id dynamically
    next();
  };
};

// Mock authHandler globally
jest.mock("../src/middleware/authHandler", () => ({
  authHandler: jest.fn() as jest.MockedFunction<typeof authHandler>,
}));

// Mock timetables dataset
const mockTimetables1 = [
  {
    id: 1,
    name: "Timetable 1",
    user_id: "testuser01-ab9e6877-f603-4c6a-9832-864e520e4d01",
  },
  {
    id: 2,
    name: "Timetable 2",
    user_id: "testuser01-ab9e6877-f603-4c6a-9832-864e520e4d01",
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
jest.mock("../src/db/setupDb", () => ({
  supabase: {
    //Mock return from schema, from and select to chain the next query command
    schema: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    // Mock db response to .eq query command
    eq: jest.fn().mockImplementation((key, value) => {
      //Each test case is codded by the user_id in session
      //DB response 1: Query user timetable return non null value
      if (
        key === "user_id" &&
        value === "testuser01-ab9e6877-f603-4c6a-9832-864e520e4d01"
      ) {
        // Return mock data when user_id matches
        return { data: mockTimetables1, error: null };
      }
      //DB response 2: Query user timetable return null value
      if (
        key === "user_id" &&
        value === "testuser02-1d3f02df-f926-4c1f-9f41-58ca50816a33"
      ) {
        // Return null for this user_id
        return { data: null, error: null };
      }

      //DB response 3: Combine .eq and .maybeSingle to signify that the return value could be single: Return non null value
      if (
        key === "user_id" &&
        value === "testuser03-f84fd0da-d775-4424-ad88-d9675282453c"
      ) {
        return {
          eq: jest.fn().mockReturnThis(), // Allow further chaining of eq if required
          maybeSingle: jest.fn().mockImplementation(() => {
            return { data: null, error: null };
          }),
        };
      }
      //DB response 4: Combine .eq and .maybeSingle to signify that the return value could be single: Return null value
      if (
        key === "user_id" &&
        value === "testuser04-f84fd0da-d775-4424-ad88-d9675282453c"
      ) {
        return {
          eq: jest.fn().mockReturnThis(), // Allow further chaining of eq if required
          maybeSingle: jest.fn().mockImplementation(() => {
            return { data: mockTimetables1, error: null };
          }),
        };
      }
    }),
    // Mock db response to .insert query command
    insert: jest.fn().mockImplementation((data: Json) => {
      //DB response 5: Create timetable successfully, new timetable data is responded
      if (
        data &&
        data[0].user_id === "testuser03-f84fd0da-d775-4424-ad88-d9675282453c"
      ) {
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

//Test block 1: Get endpoint
describe("GET /api/timetables", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return timetables for user 1", async () => {
    // Initialize the authenticated session
    (
      authHandler as jest.MockedFunction<typeof authHandler>
    ).mockImplementationOnce(
      mockAuthHandler("testuser01-ab9e6877-f603-4c6a-9832-864e520e4d01")
    );

    const response = await request(app).get("/api/timetables");

    // Check database interaction and response
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockTimetables1);
  });

  test("should return 404 if no timetables found", async () => {
    // Initialize the authenticated session
    (
      authHandler as jest.MockedFunction<typeof authHandler>
    ).mockImplementationOnce(
      mockAuthHandler("testuser02-1d3f02df-f926-4c1f-9f41-58ca50816a33")
    );

    const response = await request(app).get("/api/timetables");
    // Verify the response status and error message
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Calendar id not found",
    });
  });
});

//Test block 2: POST endpoint
describe("POST /api/timetables", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return error code 400 and error message: 'timetable title and semester are required' when request body miss timetable_title or semester", async () => {
    const user_id = "testuser03-f84fd0da-d775-4424-ad88-d9675282453c";
    const newTimetable = {};

    (
      authHandler as jest.MockedFunction<typeof authHandler>
    ).mockImplementationOnce(mockAuthHandler(user_id));

    const response = await request(app)
      .post("/api/timetables")
      .send(newTimetable);
    // Check database interaction and response

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "timetable title and semester are required",
    });
  });

  test("should create a new timetable given timetable title, timetable semester, timetable favorite", async () => {
    const user_id = "testuser03-f84fd0da-d775-4424-ad88-d9675282453c";
    const newTimetable = {
      timetable_title: "Minh timetable",
      semester: "Fall 2025",
      favorite: false,
    };

    (
      authHandler as jest.MockedFunction<typeof authHandler>
    ).mockImplementationOnce(mockAuthHandler(user_id));

    const response = await request(app)
      .post("/api/timetables")
      .send(newTimetable);
    // Check database interaction and response

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual([
      {
        user_id,
        timetable_title: "Minh timetable",
        semester: "Fall 2025",
        favorite: false,
      },
    ]);
  });

  test("should return error code 400 and error message: A timetable with this title already exists when checkduplicate query return a value", async () => {
    const user_id = "testuser04-f84fd0da-d775-4424-ad88-d9675282453c";
    const newTimetable = {
      timetable_title: "Minh timetable",
      semester: "Fall 2025",
      favorite: false,
    };

    (
      authHandler as jest.MockedFunction<typeof authHandler>
    ).mockImplementationOnce(mockAuthHandler(user_id));

    const response = await request(app)
      .post("/api/timetables")
      .send(newTimetable);
    // Check database interaction and response

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "A timetable with this title already exists",
    });
  });
});

//Test block 3: Put endpoint
describe("PUT /api/timetables/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("should return error code 400 and message 'New timetable title or semester or updated favorite status is required when updating a timetable' if request body is empty", async () => {
    // Make sure the test user is authenticated
    const user_id = "testuser04-f84fd0da-d775-4424-ad88-d9675282453c";
    const timetableData = {};

    // Mock authHandler to simulate the user being logged in
    (
      authHandler as jest.MockedFunction<typeof authHandler>
    ).mockImplementationOnce(mockAuthHandler(user_id));

    const response = await request(app)
      .put("/api/timetables/1")
      .send(timetableData);

    // Check that the `update` method was called
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error:
        "New timetable title or semester or updated favorite status is required when updating a timetable",
    });
  });

  test("should update the timetable successfully", async () => {
    // Make sure the test user is authenticated
    const user_id = "testuser04-f84fd0da-d775-4424-ad88-d9675282453c";
    const timetableData = {
      timetable_title: "Updated Title",
      semester: "Spring 2025",
    };

    // Mock authHandler to simulate the user being logged in
    (
      authHandler as jest.MockedFunction<typeof authHandler>
    ).mockImplementationOnce(mockAuthHandler(user_id));

    const response = await request(app)
      .put("/api/timetables/1")
      .send(timetableData);

    // Check that the `update` method was called
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      timetable_title: "Updated Title",
      semester: "Spring 2025",
    });
  });

  test("should return error code 404 and message: Calendar id not found and id not found", async () => {
    // Make sure the test user is authenticated
    const user_id = "testuser03-f84fd0da-d775-4424-ad88-d9675282453c";
    const timetableData = {
      timetable_title: "Updated Title",
      semester: "Spring 2025",
    };

    // Mock authHandler to simulate the user being logged in
    (
      authHandler as jest.MockedFunction<typeof authHandler>
    ).mockImplementationOnce(mockAuthHandler(user_id));

    const response = await request(app)
      .put("/api/timetables/1")
      .send(timetableData);

    // Check that the `update` method was called
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Calendar id not found",
    });
  });
});

//Test block 4: Delete endpoint
describe("DELETE /api/timetables/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should delete the timetable successfully", async () => {
    // Make sure the test user is authenticated
    const user_id = "testuser04-f84fd0da-d775-4424-ad88-d9675282453c";

    // Mock authHandler to simulate the user being logged in
    (
      authHandler as jest.MockedFunction<typeof authHandler>
    ).mockImplementationOnce(mockAuthHandler(user_id));

    const response = await request(app).delete("/api/timetables/1");

    // Check that the `update` method was called
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: "Timetable successfully deleted",
    });
  });

  test("should return error code 404 and message: Calendar id not found and id not found", async () => {
    // Make sure the test user is authenticated
    const user_id = "testuser03-f84fd0da-d775-4424-ad88-d9675282453c";

    // Mock authHandler to simulate the user being logged in
    (
      authHandler as jest.MockedFunction<typeof authHandler>
    ).mockImplementationOnce(mockAuthHandler(user_id));

    const response = await request(app).delete("/api/timetables/1");

    // Check that the `update` method was called
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Calendar id not found",
    });
  });
});
