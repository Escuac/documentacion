import { z } from 'zod';
import { logger } from '../utils/index.js';
import { DenkiError, ERR_CODE } from '../errors.js';
import { attendanceRepository } from '../repositories/attendanceRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { paymentRepository } from '../repositories/paymentRepository.js';
import { isSameDay, format, parseISO } from 'date-fns';

export const attendanceService = {
  async registerAttendance(id_usuario) {
    try {

      const activeFuturePayment = await paymentRepository.getActivePaymentByUserId(id_usuario);
      const activePayment = activeFuturePayment.find((row) => row.estado === 1);

      if(!activePayment) {
        throw new DenkiError(ERR_CODE.NO_ACTIVE_PAYMENT);
      }
      const activePaymentAttendance = await attendanceRepository.getAttendanceByPaymentId(activePayment.id_pago);
      const totalMonthClasses = classesPerMonthMap[activePayment.modalidad_acceso];
      
      if(activePaymentAttendance.length > 0) {
        if(activePaymentAttendance.length >= totalMonthClasses) throw new DenkiError(ERR_CODE.MAX_SESSIONS);
        
        const lastAttendance = activePaymentAttendance[0];
        const lastAttendanceDate = new Date(lastAttendance.fecha_asistencia);
        const today = new Date();
        if(lastAttendance && isSameDay(today, lastAttendanceDate)) {
          throw new DenkiError(ERR_CODE.MAX_DAILY_ATTENDANCE);
        }
      }
      const userDetails = await userRepository.getByIdBasic(id_usuario);
      await attendanceRepository.createAttendance(activePayment.id_pago);
      return {status: "ok", nombre_completo: userDetails.nombres + ' ' + userDetails.apellidos};

    } catch (error) {
      logger.error({ caller: 'registerAttendance/attendanceService.js', err: error });
      throw error;
    }
  },
  async delete(id_asistencia) {
    try {
      await attendanceRepository.deleteAttendance(id_asistencia);
      return {status: "ok"};
    } catch (error) {
      logger.error({ caller: 'delete/attendanceService.js', err: error });
      throw error;
    }
  },
  async getAll(limit = null) {
    try {
      const response = await attendanceRepository.getAllAttendances(limit);
      const attendance = [];

      response.forEach((row) => {
        attendance.push({
          id_asistencia: row.id_asistencia,
          fecha_asistencia: row.fecha_asistencia,
          dias_totales: classesPerMonthMap[row.modalidad_acceso],
          dias_ocupados: row.dias_ocupados,
          id_usuario: row.id_usuario,
          nombre_completo: row.nombre_completo,
          pago_info: {
            id_pago: row.id_pago,
            id_plan: row.id_plan,
            nombre_plan: row.nombre_plan,
            fecha_inicio: row.fecha_inicio,
            fecha_vencimiento: row.fecha_vencimiento
          }
        });
      });

      return attendance;
    } catch (error) {
      logger.error({ caller: 'getAll/attendanceService.js', err: error });
      throw error;
    }
  },
  async getById(id) {
    try {

    } catch (error) {
      logger.error({ caller: 'getById/attendanceService.js', err: error });
      throw error;
    }
  },
  async getByUserId(userId, grouped = false, fromActive = false) {
    try {
      const userExists = await userRepository.existsById(userId);

      if (!userExists) {
        throw new DenkiError(ERR_CODE.USER_NOT_FOUND);
      }
      // si fromActive es true, se obtiene la asistencia del pago activo
      if(fromActive) {
        const activePayment = await paymentRepository.getActivePaymentByUserId(userId);
        if(!activePayment) {
          throw new DenkiError(ERR_CODE.NO_ACTIVE_PAYMENT);
        }
        
        const activePaymentAttendance = await attendanceRepository.getAttendanceByPaymentId(activePayment.id_pago);
        return activePaymentAttendance;
      }

      // si fromActive es falso, se obtienen todas las asistencias del usuario
      const response = await attendanceRepository.getAttendanceByUserId(userId);
      if(response.length === 0) return response;
      
      // si grouped es false, se retorna la respuesta con la misma estructura aunque sin los campos id_usuario y nombre_completo
      if(!grouped) {
        response.forEach((row) => {
          delete row.id_usuario;
          delete row.nombre_completo;
        });
        return response;
      };

      // si grouped es true, se agrupan las asistencias por pago
      const payments = {};
      response.forEach((row) => {
        if(!payments[row.id_pago]){
          payments[row.id_pago] = {
            id_pago: row.id_pago,
            id_plan: row.id_plan,
            nombre_plan: row.nombre_plan,
            fecha_inicio: row.fecha_inicio,
            fecha_vencimiento: row.fecha_vencimiento,
            dias_totales: classesPerMonthMap[row.modalidad_acceso],
            asistencia: []
          };
        }

        payments[row.id_pago].asistencia.push({
          id_asistencia: row.id_asistencia,
          fecha_asistencia: row.fecha_asistencia,
          dias_ocupados: row.dias_ocupados,
        });
      });

      return Object.values(payments);
    } catch (error) {
      logger.error({ caller: 'getByUserId/attendanceService.js', err: error });
      throw error;
    }
  },
  async getByDate(date) {
    try {
      const response = await attendanceRepository.getAttendancesByDate(format(date, 'yyyy-MM-dd'));
      return response;
    } catch (error) {
      logger.error({ caller: 'getByDate/attendanceService.js', err: error });
      throw error;
    }
  },
};

const classesPerMonthMap = {
  "1": 8,
  "2": 12,
  "3": 31
};

