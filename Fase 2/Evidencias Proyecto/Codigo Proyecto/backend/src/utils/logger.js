import pino from 'pino';

const logToFile = pino.destination('./logs/app.log'); // Archivo de logs
const transport = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: true,
  },
});

// Configuración del logger para múltiples destinos (consola y archivo)
export const logger = pino(
  {
    level: 'debug',
  },
  pino.multistream([
    { stream: logToFile, level: 'debug' },
    { stream: transport, level: 'debug' },
  ])
);