import express from 'express';
import { getMeasurementOptions, getAllSessions, deleteSession } from '../controllers/measurementController.js';
export const measurementRouter = express.Router();

measurementRouter.get('/types', getMeasurementOptions);
measurementRouter.get('/', getAllSessions);
measurementRouter.delete('/:sesionId', deleteSession);
