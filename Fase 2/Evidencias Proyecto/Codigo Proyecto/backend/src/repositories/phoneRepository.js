import con from '../config/db.js';

export const phoneModel = {
  async create({ id_tipo_telefono, id_usuario, nombre_contacto, relacion, correo, numero }, dbCon = null) {
    const connection = dbCon || con;
    const response = await connection.query(`
      INSERT INTO telefonos (id_tipo_telefono, id_usuario, nombre_contacto, relacion, correo, numero) 
      VALUES(?, ?, ?, ?, ?, ?);
    `, [id_tipo_telefono, id_usuario, nombre_contacto, relacion, correo, numero]);

    return response;
  }
  ,
  async getPhones(id_usuario, dbCon = null) {
    const connection = dbCon || con;

    const [response] = await connection.query(`
      SELECT id_telefono, id_tipo_telefono, nombre_contacto, relacion, correo, numero FROM telefonos
      WHERE id_usuario = ?
    `, [id_usuario]);
    
    return response;
  },

  async delete(id_usuario, id_telefono, dbCon = null){
    const connection = dbCon || con;

    const [response] = await connection.query(`
      DELETE FROM telefonos
      WHERE id_telefono IN (?) AND id_usuario = ?
      `, [id_telefono, id_usuario]);

      return {id_telefono, affectedRows: response.affectedRows};
  },

  async update(id_usuario, {id_telefono, id_tipo_telefono, numero}, dbCon = null){
    const connection = dbCon || con;
    const [response] = await connection.query(`
      UPDATE telefonos
      SET id_tipo_telefono = ?, numero = ?
      WHERE id_telefono = ? AND id_usuario = ?;
      `, [id_tipo_telefono, numero, id_telefono, id_usuario]);
      return {
        updatedId: id_telefono,
        changedRows: response.changedRows,
        warningStatus: response.warningStatus
      };
  }
};