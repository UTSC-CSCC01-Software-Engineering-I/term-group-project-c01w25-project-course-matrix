import express from "express";
import coursesController from "../controllers/coursesController";
import departmentsController from "../controllers/departmentsController";

export const coursesRouter = express.Router();
export const departmentsRouter = express.Router();

coursesRouter.get("/", coursesController.getCourses);
departmentsRouter.get("/", departmentsController.getDepartments);