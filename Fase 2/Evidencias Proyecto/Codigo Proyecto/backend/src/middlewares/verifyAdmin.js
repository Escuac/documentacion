import { DenkiError, ERR_CODE } from '../errors.js';
import { logger } from '../utils/logger.js';

export function verifyAdmin(req, res, next) {
  try {
    if (req.session.id_rol === 1) {
      return next();
    }
    throw new DenkiError(ERR_CODE.FORBIDDEN);
  } catch (error) {
    logger.error({ caller: 'middlewares/verifyAdmin.js', err: error });

    if (error.code === ERR_CODE.FORBIDDEN) return res.status(403).json({ error: error.message });
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
}