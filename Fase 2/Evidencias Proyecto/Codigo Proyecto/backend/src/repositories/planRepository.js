import con from '../config/db.js';

export const planRepository = {
  async create({modalidad_acceso, nombre, activo = 1, valor_base, descripcion}, dbCon = null) {
    const connection = dbCon || con;

    const query =
    `INSERT INTO planes
    (modalidad_acceso, nombre, activo, valor_base, descripcion)
    VALUES(?, ?, ?, ?, ?);`;

    const [resp] = await connection.query(query, [modalidad_acceso, nombre, activo, valor_base, descripcion]);

    const {affectedRows, insertId} = resp;
    return {affectedRows, insertId};
  },

  async update({ id_plan, modalidad_acceso, nombre, activo, valor_base, descripcion }, dbCon = null) {
    const connection = dbCon || con;

    const query = `
    UPDATE planes
    SET modalidad_acceso = ?, nombre = ?, activo = ?, valor_base = ?, descripcion = ?
    WHERE id_plan = ?;`;

    const [resp] = await connection.query(query, [modalidad_acceso, nombre, activo, valor_base, descripcion, id_plan]);
    const { affectedRows, changedRows } = resp;

    return {affectedRows, changedRows};
  },

  async delete(id_plan, dbCon = null) {
    const connection = dbCon || con;
    const resp = await connection.query(`DELETE FROM planes WHERE id_plan = ?;`, [id_plan]);
    return resp;
  },

  async getAll(status = null, dbCon = null) {
    const connection = dbCon || con;
    let query = `
    SELECT id_plan, modalidad_acceso, nombre, activo, valor_base, descripcion, created_at
    FROM planes`;

    if (status === 'active') {
      query += "\nWHERE activo = 1;";
    }

    const [resp] = await connection.query(query);
    return resp;
  },

  async getOne(id_plan, dbCon = null) {
    const connection = dbCon || con;
    const [resp] = await connection.query(`
    SELECT id_plan, modalidad_acceso, nombre, activo, valor_base, descripcion, created_at
    FROM planes
    WHERE id_plan = ?
    ;`, [id_plan]);
    return resp[0];
  }
};