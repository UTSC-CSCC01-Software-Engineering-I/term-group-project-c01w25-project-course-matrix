import express from "express";
import coursesController from "../controllers/coursesController";
import departmentsController from "../controllers/departmentsController";
import offeringsController from "../controllers/offeringsController";
import { authHandler } from "../middleware/authHandler";

export const coursesRouter = express.Router();
export const departmentsRouter = express.Router();
export const offeringsRouter = express.Router();

/**
 * Route to get a list of courses.
 * @route GET /
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
coursesRouter.get("/", authHandler, coursesController.getCourses);

/**
 * Route to get the total number of sections from a list of courses.
 * @route GET /total-courses
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
coursesRouter.get(
  "/total-sections",
  authHandler,
  coursesController.getNumberOfSections,
);

/**
 * Route to get a list of departments.
 * @route GET /
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
departmentsRouter.get("/", authHandler, departmentsController.getDepartments);

/**
 * Route to get a list of events for an offering.
 * @route GET /events/:offering_id
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
offeringsRouter.get(
  "/events",
  authHandler,
  offeringsController.getOfferingEvents,
);

/**
 * Route to get a list of offerings.
 * @route GET /
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
offeringsRouter.get("/", authHandler, offeringsController.getOfferings);
