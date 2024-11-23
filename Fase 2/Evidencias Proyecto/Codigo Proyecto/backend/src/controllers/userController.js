/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

import { ERR_CODE } from '../errors.js';
import { attendanceService } from '../services/attendanceService.js';
import { measurementService } from '../services/measurementService.js';
import { paymentService } from '../services/paymentService.js';
import { userService } from '../services/userService.js';

export async function getUser(req, res) {
  const user_id = req.params.userId;
  try {
    const user = await userService.getById(user_id);
    if (!user) throw new Error('usuario no encontrado');
    res.json(user);
  } catch (error) {
    if (error.message === 'usuario no encontrado') {
      return res.status(404).json({ error: 'usuario no encontrado' });
    }
    return res.status(500).json({ error: 'Error al procesar la solicitud.' });
  }
}

export async function getUsers(req, res) {
  const {limit, page} = req.query;
  try {
    const resp = await userService.getAll(
      parseInt(limit), 
      parseInt(page)
    );
    return res.json(resp);
  } catch (error) {
    res.json({ error: error.message });
  }
}

export async function createUser(req, res) {
  try {
    const user = await userService.create(req.body);
    res.json(user);
  } catch (error) {
    if(error.code === ERR_CODE.VALIDATION_FAIL) return res.status(400).json({error: error.message, fields: error.data});
    return res.status(500).json({ error: "Error al procesar la solicitud." });
  }
}

export async function getUserPhones(req, res){
  const id_usuario = req.params.userId;

  try {
    const phones = await userService.getUserPhones(id_usuario);
    res.json({data: phones});
  } catch (error) {
    if (error.message === 'usuario no encontrado') {
      return res.status(404).json({ error: 'usuario no encontrado' });
    }
    res.status(500).json({ error: "Error al procesar la solicitud." });
  }
}

export async function getUserSocials(req, res) {
  const id_usuario = req.params.userId;

  try {
    const socials = await userService.getUserSocials(id_usuario);
    res.json({data: socials});
  } catch (error) {
    if (error.message === 'usuario no encontrado') {
      return res.status(404).json({ error: 'usuario no encontrado' });
    }
    res.status(500).json({ error: "Error al procesar la solicitud." });
  }
}

export async function search(req, res){
  const {limit, page, q, lastPayment} = req.query;
  try {
    const resp = await userService.searchByNameOrRun(
      parseInt(limit), 
      parseInt(page), 
      q,
      lastPayment
    );
    res.json(resp);
  } catch (error) {
    res.status(500).json({ error: "Error al procesar la solicitud." });
  }
}

export async function updateUser(req, res){
  const body = req.body;
  
  if(body.correo === ''){
    body.correo = null;
  }

  try {
    const resp = await userService.update(req.body);
    res.json(resp);
  } catch (error) {
    //TODO: escribir respuestas de errores al usuario en lugar de enviar el error tal cual
    if(error.code === ERR_CODE.VALIDATION_FAIL) return res.status(400).json({error: error.message, fields: error.data});
    res.json({ error: "Error al procesar la solicitud." });
  }
}

export async function getPayments (req, res) {
  const userId = req.params.userId;
  try {
    const payments = await paymentService.getByUserId(userId, req.query.active);
    res.json(payments);
  } catch (error) {
    res.json({ error: "Error al procesar la solicitud." });
  }
}

export async function createPayment(req, res) {
  try {
    const payment = await paymentService.createPayment({id_usuario: req.params.userId, ...req.body});
    res.json(payment);
  } catch (error) {
    if(error.code === "INVALID_ID") return res.status(400).json({error: "el id de uno de los campos no existe"});
    if(error.code === "VALIDATION_FAIL") return res.status(400).json({error: error.message, fields: error.data});
    if(error.code === "FUTURE_ACTIVE_PAYMENT") return res.status(409).json({error: error.message});
    if(error.code === ERR_CODE.OVERLAPING_PAYMENTS) return res.status(409).json({error: error.message, overlap: error.data});
    res.status(500).json({ error: "Error al procesar la solicitud." });
  }
}

export async function updatePayment(req, res){
  const body = {
    id_usuario: req.params.userId,
    id_pago: req.params.paymentId,
    ...req.body
  };
  
  try {
    const resp = await paymentService.updatePayment(body);
    res.json({ resp });
  } catch (error) {
    if(error.code === "RESOURCE_NOT_FOUND") return res.status(404).json({error: error.message});
    if(error.code === "VALIDATION_FAIL") return res.status(400).json({error: error.message, fields: error.data});
    if(error.code === "INVALID_ID") return res.status(400).json({error: error.message});
    if(error.code === ERR_CODE.OVERLAPING_PAYMENTS) return res.status(409).json({error: error.message});
    res.status(500).json({ error: error.message });
  }
}

export async function getMeasurements(req, res){

  try {
    const resp = await measurementService.getByUserId(req.params.userId);
    res.json(resp);
  } catch (error) {
    if(error.code === ERR_CODE.USER_NOT_FOUND) return res.status(400).json({error: error.message});
    res.status(500).json({ error: 'Error al procesar la solicitud.' });
  }
}

//TODO: implementar como PATH en lugar de PUT. Actualmente tienes que enviar la medicion completa para actualizarla
// ya que la reemplaza completamente
export async function updateSessionBundle(req, res){
  req.body.id_usuario = req.params.userId;
  req.body.id_sesion = req.params.idSession;
  try {
    const resp = await measurementService.updateSessionBundle(req.body);
    res.json(resp);
  } catch (error) {
    if(error.code === "VALIDATION_FAIL") return res.status(400).json({error: error.message, fields: error.data});
    if(error.code === "INVALID_ID") return res.status(400).json({error: error.message});
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function createSessionBundle(req, res){
  req.body.id_usuario = req.params.userId;
  try {
    const resp = await measurementService.createSessionBundle(req.body);
    res.json(resp);
  } catch (error) {
    if(error.code === ERR_CODE.USER_NOT_FOUND) return res.status(400).json({error: error.message});
    if(error.code === "VALIDATION_FAIL") return res.status(400).json({error: error.message, fields: error.data});
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export async function deletePayment(req, res){
  try {
    const response = await paymentService.deletePayment(req.params.paymentId);
    res.json({status: "ok"});
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar la solicitud.' });
  }
}