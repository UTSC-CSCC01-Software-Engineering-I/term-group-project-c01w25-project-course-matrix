import express, { Express } from "express";
import { Server } from "http";
import config from "./config/config";
import swaggerjsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { swaggerOptions } from "./config/swaggerOptions";
import {errorConverter, errorHandler} from "./middleware/errorHandler";
import asyncHandler from "./middleware/asyncHandler";
import cors from 'cors';
import { supabase } from "./db/setupDb";
import { coursesRouter } from "./routes/courseRouter";

const app: Express = express();
const HOST = "localhost";
let server: Server;
const swaggerDocs = swaggerjsdoc(swaggerOptions);

app.use(cors({
  origin: config.CLIENT_APP_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorConverter);
app.use(errorHandler);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/api/courses", coursesRouter);

app.get("/", asyncHandler( async (_, response) =>
  response.json({ info: "Testing course matrix backend server" })
));

// Test get data from db
app.get("/post", asyncHandler(async (_, res) => {
  try {
    const { data, error } = await supabase.from("posts").select();
    console.log("Got posts", data);
    return res.status(200).send(data);
  } catch(err) {
    return res.status(500).send({ err })
  }
}))

server = app.listen(config.PORT, () => {
  console.log(`Server is running at http://${HOST}:${config.PORT}`);
});

// graceful shutdown
const exitHandler = () => {
  if (server) {
      server.close(() => {
          console.info("Server closed");
          process.exit(1);
      })
  }
  else {
      process.exit(1);
  }
}

const unexpectedErrorHandler = (error: unknown) => {
  console.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);