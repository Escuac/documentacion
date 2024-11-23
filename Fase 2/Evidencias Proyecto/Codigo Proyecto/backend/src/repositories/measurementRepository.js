import con from '../config/db.js';

export const measurementRepository = {
  async getTypes(dbCon = null) {
    const connection = dbCon || con;

    const query =
      `SELECT id_tipo_medicion, nombre FROM tipo_medicion;`;

    const [resp] = await connection.query(query);
    return resp;
  },
  async getSessionById(idSesion, dbCon = null) {
    const connection = dbCon || con;

    const query = `SELECT * FROM sesiones_medicion WHERE id_sesion = ?;`;

    const [resp] = await connection.query(query, [idSesion]);
    return resp;
  },
  async getByUserId(userId, dbCon = null) {
    const connection = dbCon || con;

    const query =
      `SELECT 
	    sm.id_sesion,
      sm.id_usuario,
	    sm.fecha,
      CONCAT(du.nombres, ' ', du.apellidos) as nombre_completo,
	    m.id_medicion,
	    tm.id_tipo_medicion,
	    tm.nombre,
	    m.valor,
	    m.nota
    FROM sesiones_medicion sm
    JOIN mediciones m ON m.id_sesion = sm.id_sesion 
    JOIN tipo_medicion tm ON m.id_tipo_medicion = tm.id_tipo_medicion
    JOIN detalle_usuarios du ON du.id_usuario = sm.id_usuario
    WHERE sm.id_usuario = ?
    ORDER BY sm.fecha DESC
    ;`;

    const [resp] = await connection.query(query, [userId]);
    return resp;
  },
  async deleteSession(id, dbCon = null) {
    const connection = dbCon || con;
    const query = `DELETE FROM sesiones_medicion WHERE id_sesion = ?;`;
    const response = await connection.query(query, [id]);

    return response;
  },
  async createSession(sessionData, dbCon = null) {
    const connection = dbCon || con;
    const { fecha, id_usuario } = sessionData;
    const query = `INSERT INTO sesiones_medicion (fecha, id_usuario) VALUES (?, ?);`;
    const response = await connection.query(query, [fecha, id_usuario]);
    return response;
  },
  async createMeasurement(measurementData, dbCon = null) {
    const connection = dbCon || con;
    const { id_sesion, id_tipo_medicion, valor, nota } = measurementData;
    const query = `INSERT INTO mediciones (id_sesion, id_tipo_medicion, valor, nota) VALUES (?, ?, ?, ?);`;
    const response = await connection.query(query, [id_sesion, id_tipo_medicion, valor, nota]);

    return response;
  },
  async createSessionBundle(sessionBundleData) {
    const connection = await con.getConnection();
    const { id_usuario, fecha } = sessionBundleData;
    const { mediciones } = sessionBundleData;

    try {
      await connection.beginTransaction();
      const createSessionResponse = await this.createSession({ id_usuario, fecha }, connection);
      const id_sesion = createSessionResponse[0].insertId;

      for (const medicion of mediciones) {
        await this.createMeasurement({ id_sesion, ...medicion }, connection);
      }

      await connection.commit();
      return { status: 'ok' };
    } catch (error) {
      connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
  async updateSession({ id_sesion, fecha }, dbCon = null) {
    const connection = dbCon || con;
    const query = `UPDATE sesiones_medicion SET fecha=? WHERE id_sesion=?;`;
    const response = await connection.query(query, [fecha, id_sesion]);

    return response;
  },

  async updateMeasurement({ id_tipo_medicion, id_medicion, valor, nota }, dbCon = null) {
    const connection = dbCon || con;
    const query = `UPDATE mediciones SET id_tipo_medicion=?, valor=?, nota=? WHERE id_medicion=?;`;
    const response = await connection.query(query, [id_tipo_medicion, valor, nota, id_medicion]);

    return response;
  },

  async deleteMeasurement(id_medicion, dbCon = null) {
    const connection = dbCon || con;
    const query = `DELETE FROM mediciones WHERE id_medicion = ?;`;
    const response = await connection.query(query, [id_medicion]);

    return response;
  },

  async updateSessionBundle(sessionBundleData) {
    // return;
    const connection = await con.getConnection();
    const { id_sesion, fecha } = sessionBundleData;
    const { toUpdate, toDelete, toAdd } = sessionBundleData;
    try {
      await connection.beginTransaction();
      await this.updateSession({ id_sesion, fecha }, connection);

      if (toDelete.length > 0) {
        for (const id_medicion of toDelete) {
          await this.deleteMeasurement(id_medicion, connection);
        }
      }

      if (toAdd.length > 0) {
        for (const medicion of toAdd) {
          await this.createMeasurement({id_sesion, ...medicion}, connection);
        }
      }

      if (toUpdate.length > 0) {
        for (const medicion of toUpdate) {
          await this.updateMeasurement(medicion, connection);
        }
      }

      await connection.commit();
      return { status: 'ok' };
    } catch (error) {
      connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
  async getAllSessions(dbCon = null) {
    const connection = dbCon || con;
    const query = `
    SELECT 
	    sm.id_sesion,
	    sm.id_usuario,
      CONCAT(du.nombres, ' ', du.apellidos) as nombre_completo,
      DATE_FORMAT(sm.fecha, '%Y-%m-%d') AS fecha,
	    m.id_medicion,
	    m.id_tipo_medicion,
	    tm.nombre,
	    m.valor,
	    m.nota
    FROM sesiones_medicion sm
    JOIN mediciones m ON m.id_sesion = sm.id_sesion 
    JOIN tipo_medicion tm ON tm.id_tipo_medicion = m.id_tipo_medicion
    JOIN detalle_usuarios du ON du.id_usuario = sm.id_usuario
    ORDER BY sm.id_sesion DESC;`;
    const [resp] = await connection.query(query);
    return resp;
  },
  async getSessionBundleById(id_sesion, dbCon = null) {
    const connection = dbCon || con;
    const query = `
    SELECT 
	    sm.id_sesion,
	    sm.id_usuario,
      CONCAT(du.nombres, ' ', du.apellidos) as nombre_completo,
      sm.fecha,
	    m.id_medicion,
	    m.id_tipo_medicion,
	    tm.nombre,
	    m.valor,
	    m.nota
    FROM sesiones_medicion sm
    JOIN mediciones m ON m.id_sesion = sm.id_sesion 
    JOIN tipo_medicion tm ON tm.id_tipo_medicion = m.id_tipo_medicion
    JOIN detalle_usuarios du ON du.id_usuario = sm.id_usuario
    WHERE sm.id_sesion = ?;`;
    const [resp] = await connection.query(query, [id_sesion]);
    return resp;
  },
  async getMonthMeasurements(dbCon = null){
    const connection = dbCon || con;
    const query = `
    SELECT COUNT(*) AS total
    FROM sesiones_medicion
    WHERE MONTH(fecha) = MONTH(CURRENT_DATE());`;
    const [resp] = await connection.query(query);
    return resp[0];
  }
};
