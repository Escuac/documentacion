/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
import jwt from 'jsonwebtoken';
import { logger } from '../utils/index.js';
import { userService } from '../services/userService.js';
import { SECRET_JWT_KEY, JWT_AUTH_TOKEN_EXP } from '../config/config.js';

//TODO configurar duración del token como variable de entorno
const oneHourMs = 1000 * 60 * 60;

//TODO separar la logica a un servicio
async function login(req, res) {
  const { username, password } = req.body;

  try {
    const user = await userService.login({ username, password });
    const token = jwt.sign(
      {
         id_usuario: user.id_usuario,
         username: user.username,
         id_rol: user.id_rol
      },
      SECRET_JWT_KEY,
      { expiresIn: JWT_AUTH_TOKEN_EXP, algorithm: 'HS256' }
   );

    //TODO configuración de la cookie controlada segun ambiente
    res.cookie('access_token', token, {
      httpOnly: true,
      // secure: true,
      sameSite: 'strict',
      maxAge: oneHourMs * 8
    })
      .send({ ...user, token });
  } catch (error) {
    logger.error({caller: 'login/authController.js', err: error});

    if (error.message === 'username no existe') {
      return res.status(404).json({ error: error.message });
    }

    if (error.message === 'password invalido') {
      return res.status(401).json({ error: error.message });
    }

    return res.status(500).json({ error: "error al iniciar sesion" });
  }
}

function check(req, res) {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json({
      authenticated: false,
      error: "No token provided"
    });
  }

  try {
    res.status(200).json({
      authenticated: true,
      user: {
        id_usuario: req.session.id_usuario,
        username: req.session.username
      }
    });
  } catch (error) {
    logger.error({caller: 'check/authController.js', err: error});
    res.json({ error: "error al procesar la solicitud" });
  }
}

async function logout(req, res) {
  try {    
    res
      .clearCookie('access_token')
      .json({ message: 'Logout exitoso' });
  } catch (error) {
    logger.error({caller: 'logout/authController.js', err: error});
    res.json({error: "Error al procesar la solicitud"});
  }
}

export { login, logout, check };