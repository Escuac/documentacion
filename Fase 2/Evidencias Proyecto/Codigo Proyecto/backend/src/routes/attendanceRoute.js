import express from 'express';
import { getAllAttendances, newAttendanceEvent } from '../controllers/attendanceController.js';
export const attendanceRouter = express.Router();

attendanceRouter.get('/', getAllAttendances);
attendanceRouter.get('/new-attendences-event', newAttendanceEvent);