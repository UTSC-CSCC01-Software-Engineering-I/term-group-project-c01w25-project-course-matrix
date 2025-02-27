import express from "express";
import timetableController from "../controllers/timetableController";
import eventController from "../controllers/eventController";
import { authHandler } from "../middleware/authHandler";

export const timetableRouter = express.Router();

/**
 * Route to create a new timetable
 * @route POST /api/timetables
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
timetableRouter.post("/", authHandler, timetableController.createTimetable);

/**
 * Route to get all tiemtables for a user
 * @route GET /api/timetables
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
timetableRouter.get("/", authHandler, timetableController.getTimetables);

/**
 * Route to update a timetable
 * @route PUT /api/timetable/:id
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
timetableRouter.put("/:id", authHandler, timetableController.updateTimetable);

/**
 * Route to delete a timetable
 * @route DELETE api/timetable/:id
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
timetableRouter.delete(
  "/:id",
  authHandler,
  timetableController.deleteTimetable,
);

/**
 * Route to create an event
 * @route POST /api/timetables/events
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
timetableRouter.post("/events", authHandler, eventController.createEvent);

/**
 * Route to get all events in a calendar
 * @route GET /api/timetables/events?calendar_id=:calendar_id
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
timetableRouter.get("/events", authHandler, eventController.getEvents);

/**
 * Route to update an event
 * @route PUT /api/timetables/events/:id
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
timetableRouter.put("/events/:id", authHandler, eventController.updateEvent);

/**
 * Route to delete events
 * @route /api/timetables/events/:id
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
timetableRouter.delete("/events/:id", authHandler, eventController.deleteEvent);
