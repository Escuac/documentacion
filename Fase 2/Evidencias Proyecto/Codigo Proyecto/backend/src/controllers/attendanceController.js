/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

import { ERR_CODE } from '../errors.js';
import { measurementService } from '../services/measurementService.js';
import { paymentService } from '../services/paymentService.js';
import { userService } from '../services/userService.js';
import { attendanceService } from '../services/attendanceService.js';
import { paymentRepository } from '../repositories/paymentRepository.js';

export async function getAttendanceByUserId(req, res) {
  const userId = req.params.userId;
  const grouped = req.query.grouped;
  const fromActive = req.query.fromActive;
  try {
    const resp = await attendanceService.getByUserId(userId, grouped, fromActive);
    res.json(resp);
  } catch (error) {
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

export async function updateAttendance(req, res) {
  try {

  } catch (error) {
    res.status(500).json({ error: "error al procesar la solicitud" });
  }
} 

export async function deleteAttendance(req, res) {
  try {
    const resp = await attendanceService.delete(req.params.idAttendance);
    const attendances = await attendanceService.getAll(20);
    newAttendanceSendEvent({alumno: null, asistencias: attendances});
    res.json(resp);
  } catch (error) {
    res.status(500).json({ error: "error al procesar la solicitud" });
  }
}

export async function getAllAttendances(req, res){
  try {
    const resp = await attendanceService.getAll();
    res.json(resp);
  } catch (error) {
    res.status(500).json({ error: "error al procesar la solicitud" });
  }
}

let clients = [];
export async function newAttendanceEvent(req, res){
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Agregar la conexión a la lista de clientes
  clients.push(res);
  const attendances = await attendanceService.getAll(20);
  res.write(`data: ${JSON.stringify({alumno: null, asistencias: attendances})}\n\n`);

  // Eliminar la conexión cuando el cliente se desconecta
  req.on('close', () => {
    clients = clients.filter(client => client !== res);
    res.end();
  });
}

export function newAttendanceSendEvent(data) {
  clients.forEach(client => {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}