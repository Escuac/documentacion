import { z } from 'zod';
import { planRepository } from '../repositories/planRepository.js';
import { newPlanSchema, updatePlanSchema } from '../schemas/planSchema.js';
import { DenkiError, ERR_CODE } from '../errors.js';
import { logger, getZodPath } from '../utils/index.js';

export const planService = {
  async getAll(status = null) {
    try {
      const response = await planRepository.getAll(status);
      return response;
    } catch (error) {
      logger.error({ caller: 'getAll/planService.js', err: error });
      throw error;
    }
  },

  async getOne(id_plan) {
    try {
      const response = await planRepository.getOne(id_plan);
      return response;
    } catch (error) {
      logger.error({ caller: 'getOne/planService.js', err: error });
      throw error;
    }
  },

  async create(planData) {
    try {
      const validatedPlanData = newPlanSchema.parse(planData);

      const resp = await planRepository.create(validatedPlanData);
      return resp;
    } catch (error) {
      logger.error({ caller: 'planService.js/create', err: error.errors });
      if (error instanceof z.ZodError) {
        throw new DenkiError(ERR_CODE.VALIDATION_FAIL, getZodPath(error));
      }
      throw error;
    }
  },

  async update(planData) {
    try {
      const validPlanData = updatePlanSchema.parse(planData);
      
      const currentPlanData = await planRepository.getOne(planData.id_plan);
      if(!currentPlanData) throw new DenkiError(ERR_CODE.RESOURCE_NOT_FOUND);

      const info = {
        id_plan: validPlanData.id_plan,
        modalidad_acceso: validPlanData.modalidad_acceso,
        nombre: validPlanData.nombre,
        activo: validPlanData.activo,
        valor_base: validPlanData.valor_base,
        descripcion: validPlanData.descripcion
      };

      
      for(const property in info){
        if(info[property] === undefined) {
          info[property] = currentPlanData[property];
        }
      }

      await planRepository.update(info);
      const modifiedPlan = await planRepository.getOne(planData.id_plan);

      return modifiedPlan;
    } catch (error) {
      logger.error({ caller: 'planService.js/update', err: error.errors });
      if (error instanceof z.ZodError) {
        throw new DenkiError(ERR_CODE.VALIDATION_FAIL, getZodPath(error));
      }

      throw error;
    }
  }
};