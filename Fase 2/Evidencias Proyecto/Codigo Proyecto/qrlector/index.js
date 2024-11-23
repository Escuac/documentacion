import { SerialPort } from 'serialport';
import { logger } from './logger.js';
import { API_BASE_URL, PASSWORD, PATH, USERNAME } from './config.js';


let accessToken = null;

const port = new SerialPort({
  path: PATH,
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  flowControl: false,
});

port.on('open', () => {
  logger.info('Puerto serial abierto');
});

port.on('data', async (data) => {
  await login();
  await registerAttendance(data.toString());
});

port.on('close', () => {
  logger.info('Puerto serial cerrado');
});

port.on('error', (err) => {
  logger.error(err.message, 'Error del puerto serial:');
});

async function login() {
  const credentials = {
    username: USERNAME,
    password: PASSWORD
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Error en la respuesta: ${response.statusText}`);
    }

    accessToken = data.token;

  } catch (error) {
    console.error('Error:', error);
  }
}

async function registerAttendance(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/scan-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `access_token=${accessToken}`
      },
      body: JSON.stringify({ token })
    });

    const data = await response.json();
    const time = new Date().toLocaleTimeString();
    // Verifica si la respuesta es exitosa
    if (!response.ok) {
      throw new Error(`Error en el registro de asistencia: ${data.error}`);
    }

    logger.info("Registro éxitoso para " + data.nombre_completo);

  } catch (error) {
    logger.error(error.message);
  }
}