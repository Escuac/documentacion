import { DenkiError, ERR_CODE } from '../errors.js';
import { logger } from '../utils/logger.js';

export function verifyOwnerOrAdmin(req, res, next) {
  try {
    const userId = req.session.id_usuario;
    const reqUserId = req.params.userId;

    if (req.session.id_rol === 1){
      return next();
    }

    if (userId !== reqUserId) {
      throw new DenkiError(ERR_CODE.FORBIDDEN);
    }

    next();
  } catch (error) {
    logger.error({caller: 'middlewares/verifyAdmin.js', err: error});
    
    if (error.code === ERR_CODE.FORBIDDEN) return res.status(403).json({ error: error.message });
    res.status(500).json({ error: "Error al procesar la solicitud"});
  }
}