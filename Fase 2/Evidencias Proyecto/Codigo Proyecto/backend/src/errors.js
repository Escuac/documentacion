export class DenkiError extends Error {
  constructor(code, data=null) {
    super(errMsg[code]);
    this.data = data;
    this.code = code;
  }
}

const errMsg = {
  VALIDATION_FAIL: 'Validación de los campos fallida.',
  RESOURCE_NOT_FOUND: 'El recurso no existe.',
  MISSING_ID: 'Falta el id del recurso.',
  INVALID_ID: 'El id de uno de los recursos proporcionados es inválido.',
  NO_RECORDS_FOR_USER: 'No se encontraron registros para el usuario.',
  FORBIDDEN: 'Forbidden.',
  USER_NOT_FOUND: 'El usuario no existe.',
  NO_ACTIVE_PAYMENT: 'No hay pagos activos para el alumno.',
  MAX_SESSIONS: 'No se pueden registrar más sesiones para el alumno.',
  MAX_DAILY_ATTENDANCE: 'No se pueden registrar más asistencias para el alumno en el día.',
  FUTURE_ACTIVE_PAYMENT: 'Ya existe un pago registrado a futuro para el alumno.',
  OVERLAPING_PAYMENTS: 'El pago ingresado se superpone con otro pago existente.'
};

export const ERR_CODE = {
  VALIDATION_FAIL: 'VALIDATION_FAIL',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  MISSING_ID: 'MISSING_ID',
  INVALID_ID: 'INVALID_ID',
  NO_RECORDS_FOR_USER: 'NO_RECORDS_FOR_USER',
  FORBIDDEN: 'FORBIDDEN',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  NO_ACTIVE_PAYMENT: 'NO_ACTIVE_PAYMENT',
  MAX_SESSIONS: 'MAX_SESSIONS',
  MAX_DAILY_ATTENDANCE: 'MAX_DAILY_ATTENDANCE',
  FUTURE_ACTIVE_PAYMENT: 'FUTURE_ACTIVE_PAYMENT',
  OVERLAPING_PAYMENTS: 'OVERLAPING_PAYMENTS'
};
