import { z } from 'zod';
import { logger, getZodPath } from '../utils/index.js';
import { DenkiError, ERR_CODE } from '../errors.js';
import { measurementRepository } from '../repositories/measurementRepository.js';
import { updateMeasurementSchema, updateMeasurementSessionSchema, createMeasurementSchema, createMeasurementSessionSchema } from '../schemas/measurementSchema.js';
import { userRepository } from '../repositories/userRepository.js';

export const measurementService = {
  async getMeasurementOptions() {
    try {
      const response = await measurementRepository.getTypes();
      return response;
    } catch (error) {
      logger.error({ caller: 'getTypes/measurementService.js', err: error });
      throw error;
    }
  },
  async getAll() {
    try {
      const response = await measurementRepository.getAllSessions();
      const groupedSessions = Object.values(groupSessions(response));
      groupedSessions.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      return groupedSessions.reverse();
    } catch (error) {
      logger.error({ caller: 'getAllSessions/measurementService.js', err: error });
      throw error;
    }
  },
  async getByUserId(id_usuario) {
    try {
      const userExists = await userRepository.existsById(id_usuario);
      if (!userExists) {
        throw new DenkiError(ERR_CODE.USER_NOT_FOUND);
      }
      const response = await measurementRepository.getByUserId(id_usuario);

      if (response.length === 0) {
        return [];
      }
      const groupedSessions = Object.values(groupSessions(response));
      groupedSessions.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      /* La respuesta de BD no incluye id_usuario ni nombre completo asi que a pesar de que
         groupSessions por defecto pone esas propiedades, al ser indefinido se omiten */
      return groupedSessions.reverse();

    } catch (error) {
      logger.error({ caller: 'getByUserId/measurementService.js', err: error });
      throw error;
    }
  },
  async deleteSession(id_sesion) {
    try {
      const session = await measurementRepository.getSessionById(id_sesion);
      if (session.length === 0) {
        throw new DenkiError(ERR_CODE.RESOURCE_NOT_FOUND);
      }
      const response = await measurementRepository.deleteSession(id_sesion);
      return {status: "ok"};
    } catch (error) {
      logger.error({ caller: 'deleteSession/measurementService.js', err: error });
      throw error;
    }
  },

  async createSessionBundle(sessionBundleData) {
    try {

      const userExists = await userRepository.existsById(sessionBundleData.id_usuario);

      if (!userExists) {
        throw new DenkiError(ERR_CODE.USER_NOT_FOUND);
      }

      const sessionData = {
        id_usuario: sessionBundleData.id_usuario,
        fecha: sessionBundleData.fecha
      };

      const validatedSessionData = createMeasurementSessionSchema.parse(sessionData);

      const validatedMeasurements = sessionBundleData.mediciones.map((medicion) => {
        const validatedMeasurement = createMeasurementSchema.parse(medicion);
        return validatedMeasurement;
      });
      const resp = await measurementRepository.createSessionBundle({ ...validatedSessionData, mediciones: validatedMeasurements });
      return resp;
    } catch (error) {
      logger.error({ caller: 'createSessionBundle/measurementService.js', err: error });

      if (error instanceof z.ZodError) {
        const path = getZodPath(error);
        throw new DenkiError(ERR_CODE.VALIDATION_FAIL, { path });
      }

      throw error;
    }
  },

  async updateSessionBundle(sessionBundleData) {
    try {
      const sessionData = {
        id_sesion: sessionBundleData.id_sesion,
        id_usuario: sessionBundleData.id_usuario,
        fecha: sessionBundleData.fecha
      };
      const validatedSessionData = updateMeasurementSessionSchema.parse(sessionData);
      const currentSession = await measurementRepository.getSessionBundleById(sessionBundleData.id_sesion);
      const currentSessionGrouped = listMeasurements(currentSession);
      
      // Limpiar mediciones vacías
      for(let i = 0; i < sessionBundleData.mediciones.length; i++) {
        if (Object.keys(sessionBundleData.mediciones[i]).length === 0) {
          sessionBundleData.mediciones.splice(i, 1);
          i--;
        }
      }

      const validatedMeasurements = sessionBundleData.mediciones.map((medicion) => {
        if (Object.keys(medicion).length === 0) return;

        const validatedMeasurement = updateMeasurementSchema.parse(medicion);
        return validatedMeasurement;
      });

      const compare = compareData(currentSessionGrouped, validatedMeasurements, sessionBundleData.toDelete);

      const updateResponse = await measurementRepository.updateSessionBundle({ ...validatedSessionData, ...compare });
      const updatedSessionBundle = await measurementRepository.getSessionBundleById(sessionData.id_sesion);
      
      const grouped = groupSessions(updatedSessionBundle);
      return Object.values(grouped)[0];
    } catch (error) {
      if (error instanceof z.ZodError) {
        const path = getZodPath(error);
        throw new DenkiError(ERR_CODE.VALIDATION_FAIL, { path });
      }
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new DenkiError(ERR_CODE.INVALID_ID);
      }
      logger.error({ caller: 'updateSessionBundle/measurementService.js', err: error });
    }
  },
  async getMonthMeasurements(){
    try {
      const response = await measurementRepository.getMonthMeasurements();
      return parseInt(response.total);
    } catch (error) {
      logger.error({ caller: 'getMonthMeasurements/measurementService.js', err: error });
    }
  }
};

function groupSessions(data) {
  const sessions = {};

  data.forEach((record) => {
    if (!sessions[record.id_sesion]) {
      sessions[record.id_sesion] = {
        id_sesion: record.id_sesion,
        id_usuario: record.id_usuario,
        nombre_completo: record.nombre_completo,
        fecha: record.fecha,
        mediciones: {}
      };
    }

    sessions[record.id_sesion].mediciones[record.nombre] = {
      id_medicion: record.id_medicion,
      id_tipo_medicion: record.id_tipo_medicion,
      valor: record.valor,
      nota: record.nota
    };
  });

  return sessions;
}

const listMeasurements = (data) => {
  const measurements = [];
  data.forEach(measurement => {
    measurements.push({
      id_medicion: measurement.id_medicion,
      id_tipo_medicion: measurement.id_tipo_medicion,
      valor: measurement.valor,
      nota: measurement.nota
    });
  });

  return measurements;
};

const compareData = (currentData, newData, toDelete = []) => {
  let toUpdate = [];
  const toAdd = [];

  // sección UPDATE
  currentData.forEach(currentMeasurement => {
    // parseInt(incomingMeasurement.id_medicion);
    newData.forEach(incomingMeasurement => {
      if (currentMeasurement.id_medicion === parseInt(incomingMeasurement.id_medicion)) {
        if (
          currentMeasurement.id_tipo_medicion !== incomingMeasurement.id_tipo_medicion ||
          currentMeasurement.valor !== incomingMeasurement.valor ||
          currentMeasurement.nota !== incomingMeasurement.nota
        ) {
          toUpdate.push(incomingMeasurement);
        }
      }
    });
  });

  // Sección ADD
  newData.forEach(incomingMeasurement => {
    if (
      (typeof incomingMeasurement.id_medicion === 'string' && incomingMeasurement.id_medicion.charAt(0) === 'n') ||
      !incomingMeasurement.id_medicion
    ) {
      toAdd.push(incomingMeasurement);
    }
  });

  const validUpdates = [];

  toUpdate.forEach(measurement => {
    if (!toDelete.includes(measurement.id_medicion)) {
      validUpdates.push(measurement);
    }
  });

  toUpdate = [...validUpdates];
  return { toAdd, toUpdate, toDelete };
};