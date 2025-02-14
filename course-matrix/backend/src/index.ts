import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, {Express} from 'express';
import {Server} from 'http';
import swaggerjsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import config from './config/config';
import {swaggerOptions} from './config/swaggerOptions';
import {supabase} from './db/setupDb';
import asyncHandler from './middleware/asyncHandler';
import {errorConverter, errorHandler} from './middleware/errorHandler';
import {authRouter} from './routes/authRouter';
import {coursesRouter, departmentsRouter, offeringsRouter} from './routes/courseRouter';

const app: Express = express();
const HOST = 'localhost';
let server: Server;
const swaggerDocs = swaggerjsdoc(swaggerOptions);

app.use(cors({origin: config.CLIENT_APP_URL, credentials: true}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
app.use(errorConverter);
app.use(errorHandler);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/auth', authRouter);

app.use('/api/courses', coursesRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/offerings', offeringsRouter);

app.get('/', asyncHandler(async (_, response) => response.json({
          info: 'Testing course matrix backend server'
        })));

// Test get data from db
app.get('/post', asyncHandler(async (_, res) => {
          try {
            const {data, error} = await supabase.from('posts').select();
            console.log('Got posts', data);
            return res.status(200).send(data);
          } catch (err) {
            return res.status(500).send({err})
          }
        }))

server = app.listen(config.PORT, () => {
  console.log(`Server is running at http://${HOST}:${config.PORT}`);
});

// graceful shutdown
const exitHandler =
    () => {
      if (server) {
        server.close(() => {
          console.info('Server closed');
          process.exit(1);
        })
      } else {
        process.exit(1);
      }
    }

const unexpectedErrorHandler = (error: unknown) => {
  console.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);