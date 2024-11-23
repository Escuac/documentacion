import express from 'express';
import {
  getUser, getUsers, createUser, getUserPhones,
  getUserSocials, updateUser, search, getPayments,
  createPayment, updatePayment, getMeasurements, updateSessionBundle, createSessionBundle, deletePayment
} from '../controllers/userController.js';
import { getAttendanceByUserId, registerAttendance, updateAttendance, deleteAttendance } from '../controllers/attendanceController.js';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';
import { verifyOwnerOrAdmin } from '../middlewares/verifyOwnerOrAdmin.js';

export const userRouter = express.Router();

userRouter.get('/search', verifyAdmin, search);
userRouter.get('/', verifyAdmin, getUsers);
userRouter.get('/:userId/phones', verifyOwnerOrAdmin, getUserPhones);
userRouter.get('/:userId/social', verifyOwnerOrAdmin, getUserSocials);
userRouter.get('/:userId', verifyOwnerOrAdmin, getUser);
userRouter.post('/', verifyAdmin, createUser);
userRouter.put('/', verifyAdmin, updateUser);

// rutas para pagos
userRouter.get('/:userId/payments', verifyOwnerOrAdmin, getPayments);
userRouter.post('/:userId/payments', verifyAdmin, createPayment);
userRouter.put('/:userId/payments/:paymentId', verifyAdmin, updatePayment);
userRouter.delete('/:userId/payments/:paymentId', verifyAdmin, deletePayment);

// rutas para mediciones
userRouter.get('/:userId/measurements', verifyOwnerOrAdmin, getMeasurements);
userRouter.post('/:userId/measurements', verifyAdmin, createSessionBundle);
userRouter.put('/:userId/measurements/:idSession', verifyAdmin, updateSessionBundle);

// rutas para asistencia
userRouter.get('/:userId/attendance', verifyOwnerOrAdmin, getAttendanceByUserId);
userRouter.post('/:userId/attendances', verifyAdmin, registerAttendance);
userRouter.put('/:userId/attendances/:idAttendance', verifyAdmin, updateAttendance);
userRouter.delete('/:userId/attendances/:idAttendance', verifyAdmin, deleteAttendance);