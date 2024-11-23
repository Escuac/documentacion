import {phoneModel} from './phoneRepository.js';
import {socialRepository} from './socialRepository.js';
import con from '../config/db.js';

export const userRepository = {
  async create(userData) {
    // se inicia y cierra manualmente la transaccion para hacer varias consultas en una sola transaccion y hacer rollback en caso de error
    const connection = await con.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(`
        INSERT INTO usuarios(id_usuario, id_rol, username, password, activo) 
        VALUES (?, ?, ?, ?, 1)
      `, [userData.id_usuario, userData.id_rol, userData.username, userData.password, userData.rol]);

      await connection.query(`
        INSERT INTO detalle_usuarios
          (id_usuario, nombres, apellidos, run, fecha_nacimiento, direccion, correo, genero)
          VALUES(?, ?, ?, ?, ?, ?, ?, ?);
      `, [
        userData.id_usuario,
        userData.nombres,
        userData.apellidos,
        userData.run,
        userData.fecha_nacimiento,
        userData.direccion,
        userData.correo,
        userData.genero]);

      if(userData.telefonos && userData.telefonos.length > 0){
        for (let i = 0; i < userData.telefonos.length; i++) {
          const fono = userData.telefonos[i];
          await connection.query(`
            INSERT INTO telefonos (id_usuario, id_tipo_telefono, numero) 
            VALUES(?, ?, ?);
          `, [userData.id_usuario, fono.id_tipo_telefono, fono.numero]);
        }
      }

      if(userData.redes && userData.redes.length > 0){

        for (let i = 0; i < userData.redes.length; i++) {
          const red = userData.redes[i];
          await connection.query(`
            INSERT INTO denki.redes_sociales (id_usuario, id_tipo_red, handle) 
            VALUES(?, ?, ?);
          `, [userData.id_usuario, red.id_tipo_red, red.handle]);
        }
      }

      await connection.commit(); 

      return { 
        id_usuario: userData.id_usuario, 
        username: userData.username 
      };
    } catch (error) {
      await connection.rollback();  // revierte si hay un error
      throw error;
    } finally {
      connection.release();  // libera la conexión
    }
  },

  async getById(idUsuario, dbCon = null) {
    const connection = dbCon || con;

    const [usuario] = await connection.query(
      `SELECT u.id_usuario, u.username, u.id_rol, u.activo, u.created_at,
	    du.nombres, du.apellidos, du.run, du.fecha_nacimiento, du.direccion, du.correo, du.genero
      FROM usuarios u
      JOIN detalle_usuarios du ON u.id_usuario = du.id_usuario
      WHERE u.id_usuario = ?;`, [idUsuario]);

      const telefonos =  await phoneModel.getPhones(idUsuario);  
      const redes = await socialRepository.getUserSocials(idUsuario);
    
    return {basic: {...usuario[0]}, telefonos, redes};
  },

  async getByIdBasic(idUsuario, dbCon = null) {
    const connection = dbCon || con;

    const [usuario] = await connection.query(
      `SELECT u.id_usuario, u.username, u.id_rol, u.activo, u.created_at,
	    du.nombres, du.apellidos, du.run, du.fecha_nacimiento, du.direccion, du.correo, du.genero
      FROM usuarios u
      JOIN detalle_usuarios du ON u.id_usuario = du.id_usuario
      WHERE u.id_usuario = ?;`, [idUsuario]);
    
    return {...usuario[0] };
  },

  async getUserCredentials(username) {
    const [resp] = await con.query(`
      SELECT id_usuario, username, password, id_rol FROM usuarios WHERE username = ?;
      `, [username]);

    return resp;
  },

  async getByUsernameExact(username) {
    try {
      const [resp] = await con.query(`
        SELECT u.id_usuario, u.username, u.id_rol, u.activo, u.created_at,
	    du.nombres, du.apellidos, du.run, du.fecha_nacimiento, du.direccion, du.correo, du.genero
      FROM usuarios u
      JOIN detalle_usuarios du ON u.id_usuario = du.id_usuario
      WHERE u.username = ?
        `, [username]);
      return resp;
    } catch (error) {
      throw error;
    }
  },

  async getByUsernameSimilar(username) {
    try {
      const [resp] = await con.query(`
        SELECT * FROM usuarios u
        JOIN detalle_usuarios du ON u.id_usuario = du.id_usuario
        WHERE u.username like ?
        ORDER BY username DESC;
        `, [`${username}%`]);
      return resp;
    } catch (error) {
      throw error;
    }
  },

  async getAll(limit, page) {
    //TODO: Usar un metodo mas robusto con cursores, aunque en principio OFFSET es suficiente.
    const offset = (page - 1) * limit;
    const [resp] = await con.query(`
      SELECT 
          u.id_usuario, u.activo, nombres, apellidos, run
        FROM usuarios u
        JOIN detalle_usuarios du ON u.id_usuario = du.id_usuario
        ORDER BY nombres, id_usuario DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);
    return resp;
  },

  async searchByNameOrRun(limit, page, query) {
    const offset = (page - 1) * limit;
    let baseQuery = 
    `SELECT 
    u.id_usuario, u.activo, username, nombres, apellidos, run, genero, fecha_nacimiento
    FROM usuarios u
    JOIN detalle_usuarios du ON u.id_usuario = du.id_usuario \n`;
    const queryValues = [];
  
    if (query) {
      baseQuery += 'WHERE nombres LIKE ? OR apellidos LIKE ? OR run LIKE ? \n';
      queryValues.push(`${query}%`, `${query}%`, `${query}%`);
    }
  
    baseQuery += 
    `ORDER BY nombres, id_usuario DESC
    LIMIT ? OFFSET ?;`;
    queryValues.push(limit, offset);

    const [resp] = await con.query(baseQuery, queryValues);
    return resp;
  },

  async getTotalSearchResult(query, dbCon = null) {
    const connection = dbCon || con;
    const [resp] = await connection.query(
      `SELECT COUNT(*) as total
      FROM detalle_usuarios
      WHERE nombres LIKE ? OR apellidos LIKE ? OR run LIKE ?
      `, [`${query}%`, `${query}%`, `${query}%`]);
      
      return resp[0].total;
  },

  async getTotalUsers(dbCon = null){
    const connection = dbCon || con;
    const [resp] = await connection.query(`
      SELECT COUNT(*) as total FROM usuarios;
      `);
      return resp[0].total;
  },

  async updateUser(userData, dbCon = null){
    const connection = dbCon || con;

    const [response] = await connection.query(`
      UPDATE usuarios
      SET id_rol=?, activo=?
      WHERE id_usuario = ?;
      `, [userData.id_rol, userData.activo, userData.id_usuario]);

      return {
        updatedId: userData.id_usuario,
        changedRows: response.changedRows,
        warningStatus: response.warningStatus
      };
  },

  async updateDetails(userData, dbCon = null) {
    const connection = dbCon || con;

    const [response] = await connection.query(`
      UPDATE detalle_usuarios
      SET nombres = ?, apellidos = ?, fecha_nacimiento = ?, run = ?,
          direccion = ?, correo = ?, genero = ?
      WHERE id_usuario = ?
    `,[
      userData.nombres,
      userData.apellidos,
      userData.fecha_nacimiento,
      userData.run,
      userData.direccion,
      userData.correo,
      userData.genero,
      userData.id_usuario
      ]);

      return {
        updatedId: userData.id_usuario,
        changedRows: response.changedRows,
        warningStatus: response.warningStatus
      };
  },

  async testQuery(text, dbCon = null) {
    const connection = dbCon || con;

    const [resp] = await connection.query(
      `INSERT INTO TEST
      (texto)
      VALUES(?)
      ;`, [text]);
    return resp;
  },

  async fullUpdate(changes) {
    const connection = await con.getConnection();

    try {
      await connection.beginTransaction();
      await this.updateUser(changes.toUpdate.basic, connection);
      await this.updateDetails(changes.toUpdate.basic, connection);

      // ========== AGREGAR ================
      //TODO: Hacer que con una query multiples inserciones en lugar de usar 1 query por elemento
      if(changes.toAdd.telefonos.length > 0){
        for(const fono of changes.toAdd.telefonos) {
          const response = await phoneModel.create(fono, connection);
        }
      }

      if(changes.toAdd.redes.length > 0){
        for(const red of changes.toAdd.redes) {
          const response = await socialRepository.create(red, connection);
        }
      }

      // ========== ACTUALIZAR ================
      if(changes.toUpdate.telefonos.length > 0){
        for(const phone of changes.toUpdate.telefonos){
          const response = await phoneModel.update(changes.id_usuario, phone, connection);
        }
      }

      if(changes.toUpdate.redes.length > 0){
        for(const red of changes.toUpdate.redes){
          const response = await socialRepository.update(changes.id_usuario, red, connection);
        }
      }

      //========== BORRAR ================
      if(changes.toDelete.telefonos.length > 0){
        const response = await phoneModel.delete(changes.id_usuario, changes.toDelete.telefonos, connection);
      }

      if(changes.toDelete.redes.length > 0){
        const response = await socialRepository.delete(changes.id_usuario, changes.toDelete.redes, connection);
      }
      
      await connection.commit(); 
      //TODO: devolver un summary con más información
      return {success: true};
    } catch (error) {
      connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
  async existsById(idUsuario) {
    const [resp] = await con.query(
      `SELECT 1 FROM usuarios WHERE id_usuario = ? LIMIT 1;`, [idUsuario]
    );
    return resp.length > 0;
  }
};