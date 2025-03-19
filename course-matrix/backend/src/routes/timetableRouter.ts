import express from 'express';

import eventController from '../controllers/eventsController';
import generatorController from '../controllers/generatorController';
import restrictionsController from '../controllers/restrictionsController';
import sharesController from '../controllers/sharesController';
import timetableController from '../controllers/timetablesController';
import {authHandler} from '../middleware/authHandler';

export const timetableRouter = express.Router();
/**
 * Route to create a new timetable
 * @route POST /api/timetables
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
timetableRouter.post('/', authHandler, timetableController.createTimetable);

/**
 * Route to get all tiemtables for a user
 * @route GET /api/timetables
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
timetableRouter.get('/', authHandler, timetableController.getTimetables);

/**
 * Route to update a timetable
 * @route PUT /api/timetable/:id
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
timetableRouter.put('/:id', authHandler, timetableController.updateTimetable);

/**
 * Route to delete a timetable
 * @route DELETE api/timetable/:id
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
timetableRouter.delete(
    '/:id',
    authHandler,
    timetableController.deleteTimetable,
);

/**
 * Route to create an event
 * @route POST /api/timetables/events
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
timetableRouter.post('/events', authHandler, eventController.createEvent);

/**
 * Route to get all events in a calendar
 * @route GET /api/timetables/events/:calendar_id
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
timetableRouter.get(
    '/events/:calendar_id',
    authHandler,
    eventController.getEvents,
);

/**
 * Route to update an event
 * @route PUT /api/timetables/events/:id
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
timetableRouter.put('/events/:id', authHandler, eventController.updateEvent);

/**
 * Route to delete events
 * @route DELETE /api/timetables/events/:id
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
timetableRouter.delete('/events/:id', authHandler, eventController.deleteEvent);

/**
 * Route to create restriction
 * @route POST /api/timetables/restriction
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
timetableRouter.post(
    '/restrictions',
    authHandler,
    restrictionsController.createRestriction,
);

/**
 * Route to get restriction
 * @route GET /api/restrictions/:calendar_id
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
timetableRouter.get(
    '/restrictions/:calendar_id',
    authHandler,
    restrictionsController.getRestriction,
);

/**
 * Route to update restriction
 * @route PUT /api/restriction/:id
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
timetableRouter.put(
    '/restrictions/:id',
    authHandler,
    restrictionsController.updateRestriction,
);

/**
 * Route to delete restriction
 * @route DELETE /api/restriction/:id
 * @middleware authHandler - Middleware to check if the user is authenticated.
 */
timetableRouter.delete(
    '/restrictions/:id',
    authHandler,
    restrictionsController.deleteRestriction,
);


timetableRouter.post(
    '/generate',
    authHandler,
    generatorController.generateTimetable,
);
/**
 * Route to create shared entry
 * @route POST /api/timetables/shared
 * @middleware authHandler - Middleware to check if the user is authenticated
 */
timetableRouter.post('/shared', authHandler, sharesController.createShare);

/**
 * Route to get all shared entry of authenticated user
 * @route GET /api/timetables/shared/owner
 * @middleware authHandler - Middleware to check if the user is authenticated
 */
timetableRouter.get(
    '/shared/owner',
    authHandler,
    sharesController.getOwnerShare,
);

/**
 * Route to get all shared entry with authenticated user
 * @route GET /api/timetables/shared
 * @middleware authHandler - Middleware to check if the user is authenticated
 */
timetableRouter.get('/shared', authHandler, sharesController.getShare);

/**
 * Route to delete all shared entries for a timetable as timetable's owner
 * @route DELETE /api/timetables/shared/owner/:calendar_id
 * @middleware authHandler - Middleware to check if the user is authenticated
 */
timetableRouter.delete(
    '/shared/owner/:id?',
    authHandler,
    sharesController.deleteOwnerShare,
);

/**
 * Route to delete a single entry for the authneticate user
 * @route DELETE /api/timetables/shared/:calendar_id
 * @middleware authHandler - Middleware to check if the user is authenticated
 */
timetableRouter.delete(
    '/shared/:id',
    authHandler,
    sharesController.deleteShare,
);
