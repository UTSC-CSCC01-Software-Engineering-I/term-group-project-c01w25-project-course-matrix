import { afterAll, describe, expect, it, jest } from "@jest/globals";
import { Request, Response } from "express";
import request from "supertest";

import app, { server } from "../../src/index";

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

jest.mock("../../src/db/setupDb", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  },
}));

jest.mock("../../src/controllers/userController", () => ({
  signUp: jest.fn((req: Request, res: Response) => {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ error: "Email, password, and username are required" });
    }
    if (email === "existingUser@example.com") {
      return res.status(400).json({ error: "Email is already taken" });
    }
    res.status(201).json({
      message: "User registered successfully",
      user: { email, username },
    });
  }),
  login: jest.fn((req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (email === "validUser" && password === "validPassword") {
      res.status(200).json({ token: "mockedToken" });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  }),
  logout: jest.fn((req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.status(200).json({ message: "Logged out successfully" });
  }),
  session: jest.fn((req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token || token !== "mockedToken") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res
      .status(200)
      .json({ message: "Session valid", user: { email: "validUser" } });
  }),
  requestPasswordReset: jest.fn((req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    res.status(200).json({ message: "Password reset link sent" });
  }),
  resetPassword: jest.fn((req: Request, res: Response) => {
    const { password, token } = req.body;
    if (!password || !token) {
      return res.status(400).json({ error: "Password and token are required" });
    }
    res.status(200).json({ message: "Password reset successfully" });
  }),
  accountDelete: jest.fn((req: Request, res: Response) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    res.status(200).json({ message: "Account deletion requested" });
  }),
  updateUsername: jest.fn((req: Request, res: Response) => {
    const { userId, newUsername } = req.body;
    if (!userId || !newUsername) {
      return res
        .status(400)
        .json({ error: "User ID and new username are required" });
    }
    res.status(200).json({ message: "Username updated successfully" });
  }),
  usernameFromUserId: jest.fn((req: Request, res: Response) => {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    res.status(200).json({ username: "mockedUsername" });
  }),
}));

afterAll(async () => {
  server.close();
});

describe("Authentication API", () => {
  describe("POST /auth/signup", () => {
    it("should return 201 and a success message for valid signup data", async () => {
      const response = await request(app).post("/auth/signup").send({
        email: "newUser@example.com",
        password: "securePassword123",
        username: "newUser",
      });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "User registered successfully",
      );
      expect(response.body.user).toHaveProperty("email", "newUser@example.com");
      expect(response.body.user).toHaveProperty("username", "newUser");
    });

    it("should return 400 if email is already taken", async () => {
      const response = await request(app).post("/auth/signup").send({
        email: "existingUser@example.com",
        password: "securePassword123",
        username: "existingUser",
      });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Email is already taken");
    });

    it("should return 400 if required fields are missing", async () => {
      const response = await request(app).post("/auth/signup").send({
        email: "incompleteUser@example.com",
      });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Email, password, and username are required",
      );
    });
  });

  describe("POST /auth/login", () => {
    it("should return 200 and a token for valid credentials", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "validUser",
        password: "validPassword",
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
    });
    it("should return 401 for invalid credentials", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "invalidUser",
        password: "wrongPassword",
      });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Invalid credentials");
    });
    it("should return 400 if email or password is missing", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({ email: "validUser" });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Email and password are required",
      );
    });
  });

  describe("POST /auth/logout", () => {
    it("should return 200 for successful logout", async () => {
      const response = await request(app)
        .post("/auth/logout")
        .set("Authorization", "Bearer mockedToken");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Logged out successfully",
      );
    });
    it("should return 401 if token is missing", async () => {
      const response = await request(app).post("/auth/logout");
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Unauthorized");
    });
  });

  describe("GET /auth/session", () => {
    it("should return 200 and session info for valid token", async () => {
      const response = await request(app)
        .get("/auth/session")
        .set("Authorization", "Bearer mockedToken");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Session valid");
      expect(response.body.user).toHaveProperty("email", "validUser");
    });
    it("should return 401 if token is missing or invalid", async () => {
      const response = await request(app)
        .get("/auth/session")
        .set("Authorization", "Bearer invalidToken");
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Unauthorized");
    });
    it("should return 401 if token is missing", async () => {
      const response = await request(app).get("/auth/session");
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Unauthorized");
    });
  });

  describe("POST /auth/request-password-reset", () => {
    it("should return 200 and a success message when email is provided", async () => {
      const response = await request(app)
        .post("/auth/request-password-reset")
        .send({
          email: "user@example.com",
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Password reset link sent",
      );
    });

    it("should return 400 if email is missing", async () => {
      const response = await request(app)
        .post("/auth/request-password-reset")
        .send({});
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Email is required");
    });
  });

  describe("POST /auth/reset-password", () => {
    it("should return 200 and a success message when password and token are provided", async () => {
      const response = await request(app).post("/auth/reset-password").send({
        password: "newPassword123",
        token: "validToken",
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Password reset successfully",
      );
    });

    it("should return 400 if password or token is missing", async () => {
      const response = await request(app).post("/auth/reset-password").send({
        password: "newPassword123",
      });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Password and token are required",
      );
    });
  });

  describe("DELETE /auth/accountDelete", () => {
    it("should return 200 and a success message when userId is provided", async () => {
      const response = await request(app).delete("/auth/accountDelete").send({
        userId: "12345",
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Account deletion requested",
      );
    });

    it("should return 400 if userId is missing", async () => {
      const response = await request(app)
        .delete("/auth/accountDelete")
        .send({});
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "User ID is required");
    });
  });
});
