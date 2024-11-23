if (!process.env.SECRET_JWT_KEY) {
  throw new Error('Clave JWT no esta definida');
}

if (!process.env.SECRET_JWT_QR) {
  throw new Error('Clave JWT para QR no esta definida');
}

const config = {
  PORT: parseInt(process.env.PORT) || 3000,
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS) || 30,
  SECRET_JWT_KEY: process.env.SECRET_JWT_KEY,
  SECRET_JWT_QR: process.env.SECRET_JWT_QR,
  JWT_AUTH_TOKEN_EXP: process.env.JWT_AUTH_TOKEN_EXP || '8h',
  JWT_QR_TOKEN_EXP: process.env.JWT_QR_TOKEN_EXP || '1m'
};

export const {
  PORT, SALT_ROUNDS, SECRET_JWT_KEY, SECRET_JWT_QR, JWT_AUTH_TOKEN_EXP, JWT_QR_TOKEN_EXP
} = config;