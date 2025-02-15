import express from "express";
import coursesController from "../controllers/coursesController";
import departmentsController from "../controllers/departmentsController";
import offeringsController from "../controllers/offeringsController";
import { authHandler } from "../middleware/authHandler";

export const coursesRouter = express.Router();
export const departmentsRouter = express.Router();
export const offeringsRouter = express.Router();

coursesRouter.get("/", authHandler, coursesController.getCourses);
departmentsRouter.get("/", authHandler, departmentsController.getDepartments);
offeringsRouter.get("/", authHandler, offeringsController.getOfferings)