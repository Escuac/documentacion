// export const BASE_API_URL = "https://dkapi.gimnasioapolo.com";
export const BASE_API_URL = "http://localhost:5000";

export const FORM_MODES = {
  CREATE: 0,
  EDIT: 1,
  VIEW: 2
};

export const USER_ROLES = {
  ADMIN: 1,
  OPERADOR: 2,
  ALUMNO: 3
};

export const SOCIAL_TYPE = {
  NONE: 0,
  INSTAGRAM: 1,
  FACEBOOK: 2
};

export const GENDER = {
  NONE: '',
  MASCULINO: 1,
  FEMENINO: 2
};

export const PHONE_TYPE = {
  NONE: 0,
  MOVIL: 1,
  FIJO: 2,
  EMERGENCIA: 3
};

export const TIMEOUTS = {
  REQUEST_TIMEOUT: 5000,
  DEBOUNCE_DELAY: 300
};

export const PAYMENT_METHOD = {
  CASH: 1,
  BANK_TRANSFER: 2,
  DEBIT_CARD: 3,
  CREDIT_CARD: 4,
  DEBT: 5,
};

export const ACCESS_TYPE = {
  1: '8 CL',
  2: '12 CL',
  3: 'MES'
}

export const MEASUREMENT_TYPE = {
  EDAD: 1,
  ALTURA: 2,
  PESO: 3,
  IMC: 4,
  GENERO: 5,
  P_SUPRAILIACO: 6,
  P_SUBESCAPULAR: 7,
  P_TRICIPITAL: 8,
  P_BICIPITAL: 9,
  ABDOMEN: 10,
  PECHO: 11,
  BICEPS: 12,
  HOMBROS: 13,
  GLUTEOS: 14,
  CINTURA: 15,
  MUSLOS: 16,
  PANTORRILLAS: 17,
  CUELLO: 18,
  ANTEBRAZO: 19,
  PORCENTAJE_GRASA: 20,
}

export const PAYMENT_STATE = {
  0: "Inactivo",
  1: "Activo",
  2: "Vencido (FE)",
  3: "Vencido (CL)"
}

export const defaultMeasurementFormValues = {
  id_usuario: null,
  nombre_completo: null,
  id_sesion: null,
  fecha: null,
  edad: {
    id_tipo_medicion: MEASUREMENT_TYPE.EDAD,
    valor: "",
    nota: "",
    type: 1,
  },
  genero: {
    id_tipo_medicion: MEASUREMENT_TYPE.GENERO,
    valor: "",
    nota: "",
    type: 1,
  },
  altura: {
    id_tipo_medicion: MEASUREMENT_TYPE.ALTURA,
    valor: "",
    nota: "",
    type: 1,
  },
  peso: {
    id_tipo_medicion: MEASUREMENT_TYPE.PESO,
    valor: "",
    nota: "",
    type: 1,
  },
  imc: {
    id_tipo_medicion: MEASUREMENT_TYPE.IMC,
    valor: "",
    nota: "",
    type: 1,
  },
  p_bicipital: {
    id_tipo_medicion: MEASUREMENT_TYPE.P_BICIPITAL,
    valor: "",
    nota: "",
    type: 1,
  },
  p_suprailiaco: {
    id_tipo_medicion: MEASUREMENT_TYPE.P_SUPRAILIACO,
    valor: "",
    nota: "",
    type: 1,
  },
  p_subescapular: {
    id_tipo_medicion: MEASUREMENT_TYPE.P_SUBESCAPULAR,
    valor: "",
    nota: "",
    type: 1,
  },
  p_tricipital: {
    id_tipo_medicion: MEASUREMENT_TYPE.P_TRICIPITAL,
    valor: "",
    nota: "",
    type: 1,
  },
  porcentaje_grasa: {
    id_tipo_medicion: MEASUREMENT_TYPE.PORCENTAJE_GRASA,
    valor: "",
    nota: "",
    type: 1,
  },
  mediciones: [
    {
      id_medicion: "n" + Date.now(),
      id_tipo_medicion: "",
      valor: "",
      nota: "",
    },
  ],
};