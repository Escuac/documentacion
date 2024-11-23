/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

import jwt from 'jsonwebtoken';
import { ERR_CODE } from '../errors.js';
import { paymentService } from '../services/paymentService.js';
import { SECRET_JWT_QR, JWT_QR_TOKEN_EXP } from '../config/config.js';
import { attendanceService } from '../services/attendanceService.js';
import { newAttendanceSendEvent } from './attendanceController.js';

export async function getPaymentById(req, res) {
  try {
    const resp = await paymentService.getOne(req.params.userId);
    res.json(resp);
  } catch (error) {
    if (error.code === "RESOURCE_NOT_FOUND") return res.status(404).json({ error: error.message });
    if (error.code === "INVALID_ID") return res.status(400).json({ error: error.message });
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
}

export async function getPayments(req, res) {
  try {
    const resp = await paymentService.getAll();
    res.json(resp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updatePayment(req, res) {
  try {
    const resp = await paymentService.updatePayment(req.body);
    res.json({ resp });
  } catch (error) {
    if (error.code === "RESOURCE_NOT_FOUND") return res.status(404).json({ error: error.message });
    if (error.code === "VALIDATION_FAIL") return res.status(400).json({ error: error.message, fields: error.data });
    if (error.code === "INVALID_ID") return res.status(400).json({ error: error.message });
    res.status(500).json({ error: error.message });
  }
}

export async function createPayment(req, res) {
  try {
    const resp = await paymentService.createPayment(req.body);
    res.json({ resp });
  } catch (error) {
    if (error.code === "INVALID_ID") return res.status(400).json({ error: "el id de uno de los campos no existe" });
    if (error.code === "VALIDATION_FAIL") return res.status(400).json({ error: error.message, fields: error.data });
    res.status(500).json({ error: error.message });
  }
}

export async function generateQR(req, res) {
  try {
    const token = jwt.sign(
      {
        id_usuario: req.session.id_usuario,
      },
      SECRET_JWT_QR,
      { expiresIn: JWT_QR_TOKEN_EXP, algorithm: 'HS256' }
    );

    res.json(token);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function scanQR(req, res) {
  try {
    const token = req.body.token;
    if(!token) return res.status(400).json({ error: 'token no recibido' });
    const data = jwt.verify(token, SECRET_JWT_QR);
    const response = await attendanceService.registerAttendance(data.id_usuario);
    const attendances = await attendanceService.getAll(20);
    newAttendanceSendEvent({alumno: response.nombre_completo, asistencias: attendances});
    res.json(response);
  } catch (error) {
    if(error.message === 'invalid signature' || error.message === 'jwt malformed') return res.status(401).json({ error: 'token invalido' });
    if(error.message === 'jwt expired') return res.status(401).json({ error: 'token expirado' });
    if (error.code === ERR_CODE.NO_ACTIVE_PAYMENT) return res.status(403).json({ error: error.message });
    if (error.code === ERR_CODE.MAX_SESSIONS) return res.status(409).json({ error: error.message });
    if (error.code === ERR_CODE.MAX_DAILY_ATTENDANCE) return res.status(409).json({ error: error.message });
    res.status(500).json({ error: "error al procesar la solicitud" });
  }
}

export async function registerAttendance(req, res){
  try {
    const response = await attendanceService.registerAttendance(req.params.userId);
    const attendances = await attendanceService.getAll(20);
    newAttendanceSendEvent({alumno: response.nombre_completo, asistencias: attendances});
    res.json(response);
  } catch (error) {
    if (error.code === ERR_CODE.NO_ACTIVE_PAYMENT) return res.status(403).json({ error: error.message });
    if (error.code === ERR_CODE.MAX_SESSIONS) return res.status(409).json({ error: error.message });
    if (error.code === ERR_CODE.MAX_DAILY_ATTENDANCE) return res.status(409).json({ error: error.message });
    res.status(500).json({ error: "error al procesar la solicitud" });
  }
}

export async function getPaymentsExpiringSoon(req, res){
  try {
    const upcomingPayments = await paymentService.getPaymentsExpiringSoon();
    res.json(upcomingPayments);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}