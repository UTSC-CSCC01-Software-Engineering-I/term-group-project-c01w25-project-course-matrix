import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import app from "../src/index";

describe("Sum function", () => {
	test("Returns correct value", () => {
		expect(2 + 3).toEqual(5);
	});
});


// Will finish the rest of the tests below in Sprint 3

// describe("GET /auth/session", () => {
// 	test("It should respond with 200 status", async () => {
// 		const response = await request(app).get("/auth/session");
// 		expect(response.statusCode).toBe(200);
// 	});
// });
