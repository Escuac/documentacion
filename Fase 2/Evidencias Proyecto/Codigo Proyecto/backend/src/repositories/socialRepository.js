import con from '../config/db.js';

export const socialRepository = {
  async create({ id_usuario, id_tipo_red, handle }, dbCon = null) {
    const connection = dbCon || con;
    
    const [response] = await connection.query(`
      INSERT INTO redes_sociales (id_usuario, id_tipo_red, handle) 
      VALUES(?, ?, ?);
    `, [id_usuario, id_tipo_red, handle]);

    return response;
  },
  async getUserSocials(id_usuario, dbCon = null) {
    const connection = dbCon || con;
    const [resp] = await connection.query(`
      SELECT id_red_social, id_tipo_red, handle FROM redes_sociales
      WHERE id_usuario = ?;
    `, [id_usuario]);
    
    return resp;
  },
  async delete(id_usuario, id_red_social, dbCon = null){
    const connection = dbCon || con;

    const [response] = await connection.query(`
      DELETE FROM redes_sociales
      WHERE id_red_social IN (?) AND id_usuario = ?
      `, [id_red_social, id_usuario]);

      return {id_red_social, affectedRows: response.affectedRows};
  },

  async update(id_usuario, {id_red_social, id_tipo_red, handle}, dbCon = null){
    const connection = dbCon || con;

    const [response] = await connection.query(`
      UPDATE denki.redes_sociales
      SET id_tipo_red = ?, handle = ?
      WHERE id_red_social = ? AND id_usuario = ?;
      `, [id_tipo_red, handle, id_red_social, id_usuario]);

    return {
      updatedId: id_red_social,
      changedRows: response.changedRows,
      warningStatus: response.warningStatus
    };
  }
};