import express from "express";
import coursesController from "../controllers/coursesController";

export const coursesRouter = express.Router();

coursesRouter.get("/", coursesController.getCourses);