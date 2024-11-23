import { z } from 'zod';
import { logger, getZodPath } from '../utils/index.js';
import { DenkiError, ERR_CODE } from '../errors.js';
import { newPaymentSchema, updatePaymentSchema } from '../schemas/paymentSchema.js';
import { paymentRepository } from '../repositories/paymentRepository.js';
import { isFuture, areIntervalsOverlapping, isBefore, isPast } from 'date-fns';
import { PAYMENT_STATUS } from '../constants.js';

export const paymentService = {
  async getAll() {
    try {
      const response = await paymentRepository.getAll();
      return response;
    } catch (error) {
      logger.error({ caller: 'getAll/paymentService.js', err: error });
      throw error;
    }
  },

  async getOne(id_pago) {
    try {
      const idPago = parseInt(id_pago);

      if (isNaN(idPago)) {
        throw new DenkiError(ERR_CODE.INVALID_ID);
      }

      const response = await paymentRepository.getOne(id_pago);

      if (!response) {
        throw new DenkiError(ERR_CODE.RESOURCE_NOT_FOUND);
      }
      return response;
    } catch (error) {
      logger.error({ caller: 'getOne/paymentService.js', err: error });
      throw error;
    }
  },

  async getByUserId(id_usuario, active = false) {
    try {
      if (!active) {
        const response = await paymentRepository.getByUserId(id_usuario);
        return response;
      }

      const futureOrActivePayments = await paymentRepository.getActivePaymentByUserId(id_usuario);
      const response = {};

      futureOrActivePayments.forEach(payment => {
        if (payment.estado === PAYMENT_STATUS.ACTIVE) response.activo = payment;
        if (payment.estado === PAYMENT_STATUS.FUTURE) response.futuro = payment;
      });

      return response;

    } catch (error) {
      logger.error({ caller: 'getByUserId/paymentService.js', err: error });
      throw error;
    }
  },

  async createPayment(paymentData) {
    try {
      const checkPaymentOverlap = await isPaymentOverlaping(paymentData, paymentData.id_usuario);
      
      if (checkPaymentOverlap.length > 0) {
        throw new DenkiError(ERR_CODE.OVERLAPING_PAYMENTS, checkPaymentOverlap);
      }

      const isFuturePayment = isFuture(new Date(paymentData.fecha_inicio));
      const isPastPayment = isPast(new Date(paymentData.fecha_vencimiento));
      
      if (isFuturePayment) {
        paymentData.estado = PAYMENT_STATUS.FUTURE;
      } else if (isPastPayment) {
        paymentData.estado = PAYMENT_STATUS.EXPIRED_DATE;
      } else {
        paymentData.estado = PAYMENT_STATUS.ACTIVE;
      }

      const activePayment = await paymentRepository.getActivePaymentByUserId(paymentData.id_usuario);
      const futureActivePayment = await paymentRepository.getFutureActivePaymentByUserId(paymentData.id_usuario);
      if (futureActivePayment) {
        throw new DenkiError(ERR_CODE.FUTURE_ACTIVE_PAYMENT);
      }

      //TODO: comparar con todos los pagos y no solo el activo
      if (activePayment) {
        const areOverlaping = areIntervalsOverlapping(
          { start: new Date(activePayment.fecha_inicio), end: new Date(activePayment.fecha_vencimiento) },
          { start: new Date(paymentData.fecha_inicio), end: new Date(paymentData.fecha_vencimiento) }
        );

        if (areOverlaping) {
          throw new DenkiError(ERR_CODE.OVERLAPING_PAYMENTS);
        }
      }
      const validatedPaymentData = newPaymentSchema.parse(paymentData);
      const createdPayment = await paymentRepository.create(validatedPaymentData);
      return { createdPayment };
    } catch (error) {
      logger.error({ caller: 'createPayment/paymentService.js', err: error });
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new DenkiError(ERR_CODE.INVALID_ID);
      }
      if (error instanceof z.ZodError) {
        throw new DenkiError(ERR_CODE.VALIDATION_FAIL, getZodPath(error));
      }
      throw error;
    }
  },

  async updatePayment(paymentData) {
    try {
      const overlapingPayments = await isPaymentOverlaping(paymentData, paymentData.id_usuario, true);
      if (overlapingPayments.length > 0){
        throw new DenkiError(ERR_CODE.OVERLAPING_PAYMENTS, overlapingPayments);
      }
      
      const validatedPaymentData = updatePaymentSchema.parse(paymentData);
      const existingPayment = await paymentRepository.getOne(paymentData.id_pago);

      if (!existingPayment) {
        throw new DenkiError(ERR_CODE.RESOURCE_NOT_FOUND);
      }

      const updatedPaymentData = {
        id_pago: validatedPaymentData.id_pago,
        id_plan: validatedPaymentData.id_plan || existingPayment.id_plan,
        fecha_inicio: validatedPaymentData.fecha_inicio || existingPayment.fecha_inicio,
        fecha_vencimiento: validatedPaymentData.fecha_vencimiento || existingPayment.fecha_vencimiento,
        duracion_meses: validatedPaymentData.duracion_meses || existingPayment.duracion_meses,
        porcentaje_descuento: validatedPaymentData.porcentaje_descuento || existingPayment.porcentaje_descuento,
        detalle_descuento: validatedPaymentData.detalle_descuento || existingPayment.detalle_descuento,
        monto_pagado: validatedPaymentData.monto_pagado || existingPayment.monto_pagado,
        metodo_pago: validatedPaymentData.metodo_pago || existingPayment.metodo_pago,
        notas: validatedPaymentData.notas || existingPayment.notas
      };

      const updatedPayment = await paymentRepository.update(updatedPaymentData);
      const modifiedPaymentData = await paymentRepository.getOne(paymentData.id_pago);

      return { modifiedPaymentData };
    } catch (error) {
      logger.error({ caller: 'updatePayment/paymentService.js', err: error });
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new DenkiError(ERR_CODE.INVALID_ID);
      }
      if (error instanceof z.ZodError) {
        throw new DenkiError(ERR_CODE.VALIDATION_FAIL, getZodPath(error));
      }

      throw error;
    }
  },

  async deletePayment(id_pago) {
    try {
      await paymentRepository.delete(id_pago);
      return {status: "ok"};
    } catch (error) {
      logger.error({ caller: 'deletePayment/paymentService.js', err: error });
      throw error;
    }
  },

  async getActivePayment() {
    try {
      const response = await paymentRepository.getActivePaymentByUserId();
      return response;
    } catch (error) {
      logger.error({ caller: 'getActivePayment/paymentService.js', err: error });
      throw error;
    }
  },

  async updatePaymentsStates() {
    try {
      const dateExpiredPayments = [];
      const maxSessionsExpiredPayments = [];
      const futureActivePayments = [];
      const activePayments = [];

      const payments = await paymentRepository.getAll();

        // allPayments.forEach(payment => {
  //   for (const i = 0; i < payment.length; i++) {
  //     for (const j = i + 1; j < payment.length; j++) {
  //       const areOverlaping = areIntervalsOverlapping(
  //         { start: new Date(payment[i].fecha_inicio), end: new Date(payment[i].fecha_vencimiento) },
  //         { start: new Date(payment[j].fecha_inicio), end: new Date(payment[j].fecha_vencimiento) }
  //       );
  //       if (areOverlaping) return true;
  //     }
  //   }
  // });


      // const response = await paymentRepository.updatePaymentsStates();
      return payments;
    } catch (error) {
      logger.error({ caller: 'updatePaymentsStates/paymentService.js', err: error });
    }
  },

  async getMonthIncome(){
    try {
      const response = await paymentRepository.getMonthIncome();
      return parseInt(response.total);
    } catch (error) {
      logger.error({ caller: 'getMonthIncome/paymentService.js', err: error });
      throw error;
    } 

  },

  async getMonthPayments(){
    try {
      const response = await paymentRepository.getMonthPayments();
      return parseInt(response.total);
    } catch (error) {
      logger.error({ caller: 'getMonthPayments/paymentService.js', err: error });
      throw error;
    } 
  },

  async getPaymentsExpiringSoon(daysInterval = 7){
    try {
      const response = await paymentRepository.getPaymentsExpiringSoon(daysInterval);
      return response;
    } catch (error) {
      logger.error({ caller: 'getUpcomingPayments/paymentService.js', err: error });
      throw error;
    }
  }
};

async function isPaymentOverlaping(paymentData, userId, isUpdate = false) {

  const allPayments = await paymentRepository.getByUserId(userId);
  let paymentsOverlaping = [];

  allPayments.forEach(payment => {
    if(isUpdate && parseInt(paymentData.id_pago) === payment.id_pago) return;

    const isOverlaping = areIntervalsOverlapping(
      {start: new Date(paymentData.fecha_inicio), end: new Date(paymentData.fecha_vencimiento)},
      {start: new Date(payment.fecha_inicio), end: new Date(payment.fecha_vencimiento)}
    );

    if(isOverlaping) paymentsOverlaping.push(payment);
  });
  
  return paymentsOverlaping;
}