import jwt from 'jsonwebtoken';
import { SECRET_JWT_KEY } from '../config/config.js';
import { logger } from '../utils/logger.js';

export function authJWT(req, res, next) {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized", authenticated: false });
  }

  try {
    const data = jwt.verify(token, SECRET_JWT_KEY);
    req.session = data;
    next();
  } catch (error) {
    logger.error({caller: 'routes/index.js/authJWT', err: error});
    res.status(403).json({ error: "Forbidden"});
  }
}