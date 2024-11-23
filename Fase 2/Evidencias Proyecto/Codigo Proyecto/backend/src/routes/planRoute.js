import express from 'express';
import { getPlan, getPlanes, createPlan, updatePlan } from '../controllers/planController.js';

export const planRouter = express.Router();

planRouter.get('/:id', getPlan);
planRouter.get('/', getPlanes);
planRouter.post('/', createPlan);
planRouter.put('/:id', updatePlan);