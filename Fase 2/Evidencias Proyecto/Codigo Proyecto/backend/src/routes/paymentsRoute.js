import express from 'express';
import { getPaymentById, getPayments, updatePayment, createPayment, generateQR, scanQR, getPaymentsExpiringSoon } from '../controllers/paymentController.js';
import { verifyOwnerOrAdmin } from '../middlewares/verifyOwnerOrAdmin.js';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';
export const paymentRouter = express.Router();

paymentRouter.post('/generate-qr', generateQR);
//TODO: reponer middleware
paymentRouter.post('/scan-qr',  scanQR);
paymentRouter.get('/expiring-soon', verifyAdmin, getPaymentsExpiringSoon);
paymentRouter.get('/:id', verifyAdmin, getPaymentById);
paymentRouter.get('/', verifyAdmin, getPayments);
paymentRouter.put('/', verifyAdmin, updatePayment);
paymentRouter.post('/', verifyAdmin, createPayment);