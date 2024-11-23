/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
import { DenkiError, ERR_CODE } from '../errors.js';
import { measurementService } from '../services/measurementService.js';


//TODO separar la logica a un servicio
async function getMeasurementOptions(req, res) {

  try {
    const response = await measurementService.getMeasurementOptions();
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getAllSessions(req, res) {

  try {
    const response = await measurementService.getAll();
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function deleteSession(req, res){
  try {
    const resp = await measurementService.deleteSession(req.params.sesionId);
    res.json(resp);
  } catch (error) {
    if (error.code === ERR_CODE.FORBIDDEN) return res.status(403).json({ error: error.message });
    if (error.code === ERR_CODE.RESOURCE_NOT_FOUND) return res.status(404).json({ error: error.message });
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

export { getMeasurementOptions, getAllSessions, deleteSession };