/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

import { planService } from '../services/planService.js';

async function getPlan(req, res) {
  const id_plan = req.params.id;
  try {
    const resp = await planService.getOne(id_plan);
    res.json(resp);
  } catch (error) {
    return res.status(500).json({ error: 'error al procesar la solicitud' });
  }
}

async function getPlanes(req, res) {
  const status = req.query.status;
  try {
    const resp = await planService.getAll(status);
    res.json(resp);
  } catch (error) {
    return res.status(500).json({ error: 'error al procesar la solicitud' });
  }
}

async function createPlan(req, res) {
  try {
    const resp = await planService.create(req.body);
    res.json(resp);
  } catch (error) {
    if (error.message === 'ZOD') return res.status(400).json({ error: 'validación fallida' });

    return res.status(500).json({ error: 'error al procesar la solicitud' });
  }
}

async function updatePlan(req, res){
  try {
    const response = await planService.update({id_plan: req.params.id, ...req.body});
    res.json(response);
  } catch (error) {
    if (error.message === 'ZOD') return res.status(400).json({ error: 'validación fallida' });
    return res.status(500).json({ error: 'error al procesar la solicitud' });
  }
}

export { getPlan, getPlanes, createPlan, updatePlan };