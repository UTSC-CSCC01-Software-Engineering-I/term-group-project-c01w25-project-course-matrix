import express from "express";
import coursesController from "../controllers/coursesController";
import departmentsController from "../controllers/departmentsController";
import offeringsController from "../controllers/offeringsController";

export const coursesRouter = express.Router();
export const departmentsRouter = express.Router();
export const offeringsRouter = express.Router();

coursesRouter.get("/", coursesController.getCourses);
departmentsRouter.get("/", departmentsController.getDepartments);
offeringsRouter.get("/", offeringsController.getOfferings)