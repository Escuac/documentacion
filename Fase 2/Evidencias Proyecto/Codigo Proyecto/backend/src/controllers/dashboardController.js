/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
import { DenkiError, ERR_CODE } from '../errors.js';
import { attendanceService } from '../services/attendanceService.js';
import { measurementService } from '../services/measurementService.js';
import { paymentService } from '../services/paymentService.js';

export async function dashboardMetrics(req, res){
  try {
    const dayAttendance = await attendanceService.getByDate(new Date());
    const monthIncome = await paymentService.getMonthIncome();
    const monthPayments = await paymentService.getMonthPayments();
    const monthMeasurements = await measurementService.getMonthMeasurements();

    res.json({dayAttendance: dayAttendance.length, monthIncome, monthPayments, monthMeasurements});
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
