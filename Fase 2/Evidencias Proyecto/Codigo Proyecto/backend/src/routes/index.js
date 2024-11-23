import express from 'express';
import { logger } from '../utils/index.js';
import { userRouter } from './userRoute.js';
import { authRouter } from './authRoute.js';
import { planRouter } from './planRoute.js';
import { measurementRouter } from './measurementsRoute.js';
import { paymentRouter } from './paymentsRoute.js';
import { attendanceRouter } from './attendanceRoute.js';
import { authJWT } from '../middlewares/authJWT.js';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';
import { dashboardMetrics } from '../controllers/dashboardController.js';
const router = express.Router();

//TODO: ajustar rutas antiguas para que sean REST y reorganizar rutas para que tengan mas sentido sus relaciones
router.use('/users', authJWT, userRouter);
router.use('/auth', authRouter);
router.use('/plans', authJWT, verifyAdmin, planRouter);
router.use('/payments', authJWT, paymentRouter);
router.use('/measurements', authJWT, verifyAdmin, measurementRouter);
router.use('/attendances', attendanceRouter);
router.get('/dashboard', authJWT, verifyAdmin, dashboardMetrics); 

router.use('/*', (req, res) => {
  logger.info({url: req.originalUrl}, "Se intenta acceder a ruta inexistente");
  res.status(404).json({message: 'ruta no existe'});
});

export default router;