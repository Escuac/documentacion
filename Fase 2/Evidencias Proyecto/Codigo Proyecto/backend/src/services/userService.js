import bcrypt from 'bcrypt';
import { z } from 'zod';
import { logger, generatePassphrase, getZodPath } from '../utils/index.js';
import { DenkiError, ERR_CODE } from '../errors.js';
import { SALT_ROUNDS } from '../config/config.js';
import { userRepository } from '../repositories/userRepository.js';
import { phoneModel } from '../repositories/phoneRepository.js';
import { socialRepository } from '../repositories/socialRepository.js';
import { newUserSchema, updateUserSchema, socialSchema, phoneSchema } from '../schemas/userSchema.js';
import { paymentRepository } from '../repositories/paymentRepository.js';

export const userService = {
  async getAll(limit = null, page = null) {
    limit = limit !== null ? limit : undefined;
    page = page !== null ? page : undefined;

    if (!Number.isInteger(limit) || limit > 100) {
      limit = 100;
    }
    if (!Number.isInteger(page)) {
      page = 1;
    }

    try {
      const totalUsers = await userRepository.getTotalUsers();
      if (totalUsers === 0) return {
        totalEntries: 0,
        pages: 0,
        users: []
      };

      const users = await userRepository.getAll(limit, page);
      const totalPages = Math.ceil(totalUsers / limit);

      return {
        totalEntries: totalUsers,
        totalPages: totalPages,
        currentPage: page,
        limit,
        users
      };

    } catch (error) {
      logger.error({ caller: 'userService.js/getAll', err: error });
      throw new Error("error al obtener usuarios");
    }
  },
  async getByUsername(username) {
    try {
      const [resp] = await userRepository.getByUsernameExact(username);
      if (!resp) throw new Error('usuario no encontrado');

      delete resp.password;
      delete resp.id_detalle_usuario;
      delete resp.id_rol;
      delete resp.activo;

      return resp;
    } catch (error) {
      logger.error({ caller: 'userService.js/getByUsername', err: error });
      throw error;
    }
  },

  async create(userInfo) {
    //TODO: nombres y apellidos no deben tener numeros 

    try {
      let { username, password } = createCredentials(userInfo);
      const existingUser = await userRepository.getByUsernameExact(username);

      /* si existe un usuario con el mismo nombre, se busca el resto de usuarios con nombres
      similares y se busca el que termina con el número más alto. Si no hay un número, se añade '1' 
      al nombre de usuario original. Si ya hay un número, se incrementa en 1 y se usa ese número
      para generar un nombre de usuario único. */

      if (existingUser[0]) {
        const similarUsers = await userRepository.getByUsernameSimilar(username);
        const lasUsernameMatch = similarUsers[0].username;
        const lastUsernameDiff = lasUsernameMatch.split(username)[1];
        const lastUsernameNumber = parseInt(lastUsernameDiff);

        //TODO: validar que el resultado de username no excede los caracteres de la columna username en BD
        if (isNaN(lastUsernameNumber)) {
          username = username + '1';
        } else {
          username = username + (lastUsernameNumber + 1);
        }
      }

      const id_usuario = crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const validatedNewUserData = validateNewUserData({ id_usuario, hashedPassword, username, ...userInfo });

      const respDetalle = await userRepository.create(validatedNewUserData);

      return { ...respDetalle, password };
    } catch (error) {
      logger.error({ caller: 'userService.js/create', err: error });
      
      if (error instanceof z.ZodError) {
        throw new DenkiError(ERR_CODE.VALIDATION_FAIL, getZodPath(error));
      }
      throw error;
    }
  },

  async getUserPhones(id_usuario) {
    try {
      const user = await userRepository.getById(id_usuario);
      if (user.length === 0) throw new Error('usuario no encontrado');

      const resp = await phoneModel.getPhones(id_usuario);
      return resp;
    } catch (error) {
      logger.error({ caller: 'userService.js/getUserPhones', err: error });
      throw error;
    }
  }
  ,
  async getUserSocials(id_usuario) {
    try {
      const user = await userRepository.getById(id_usuario);
      if (user.length === 0) throw new Error('usuario no encontrado');

      const resp = await socialRepository.getUserSocials(id_usuario);
      return resp;
    } catch (error) {
      logger.error({ caller: 'userService.js/getUserSocials', err: error });
      throw error;
    }
  },

  async searchByNameOrRun(limit = null, page = null, query = '', lastPayment = null) {
    limit = limit !== null ? limit : undefined;
    page = page !== null ? page : undefined;

    if (!Number.isInteger(limit) || limit > 100) {
      limit = 100;
    }
    if (!Number.isInteger(page)) {
      page = 1;
    }

    try {
      //  total resultados query
      const totalUsers = await userRepository.getTotalSearchResult(query);
      if (totalUsers === 0) return {
        totalEntries: 0,
        pages: 0,
        users: []
      };

      const users = await userRepository.searchByNameOrRun(limit, page, query);
      
      if (lastPayment === 'true'){
        for (const user of users) {
          const userLastPayment = await paymentRepository.getUserLastPayment(user.id_usuario);
          if(userLastPayment.length > 0) user.lastPayment = userLastPayment[0];
        }
      }

      const totalPages = Math.ceil(totalUsers / limit);

      return {
        totalEntries: totalUsers,
        totalPages: totalPages,
        currentPage: page,
        limit,
        users
      };
    } catch (error) {
      logger.error({ caller: 'userService.js/searchByNameOrRun', err: error });
      throw error;
    }
  },

  async login({ username, password }) {
    try {
      const [newUser] = await userRepository.getUserCredentials(username);
      if (!newUser) throw new Error('username no existe');

      const isValid = await bcrypt.compare(password, newUser.password);
      if (!isValid) throw new Error('password invalido');

      return {
        id_usuario: newUser.id_usuario,
        username: newUser.username,
        id_rol: newUser.id_rol,
      };
    } catch (error) {
      logger.error({ caller: 'userService.js/login', err: error });
      throw error;
    }

  },
  async deletePhones(id) {
    try {
      const response = await phoneModel.delete(id);
      if (response.affectedRows === 0) {
        throw new Error('NO_ROWS_AFFECTED');
      }

      if (response.affectedRows < id.length) {
        const error = {
          message: 'PARTIAL_DELETION',
          affectedRows: response.affectedRows
        };

        throw error;
      }

      return response;

    } catch (error) {
      logger.error({ caller: 'userService.js/deletePhones', err: error });
      throw error;
    }
  },
  async update(userData) {
    try {
      const validatedUserData = validateUpdatedUserData(userData);
      const currentData = await userRepository.getById(userData.id_usuario);

      const dataDiff = compareData(currentData, validatedUserData);

      const basicInfo = {
        id_usuario: validatedUserData.id_usuario,
        id_rol: validatedUserData.id_rol,
        activo: validatedUserData.activo,
        nombres: validatedUserData.nombres,
        apellidos: validatedUserData.apellidos,
        run: validatedUserData.run,
        fecha_nacimiento: validatedUserData.fecha_nacimiento,
        direccion: validatedUserData.direccion,
        correo: validatedUserData.correo,
        genero: validatedUserData.genero,
      };

      for (const prop in basicInfo) {
        if (basicInfo[prop] === undefined) {
          basicInfo[prop] = currentData.basic[prop];
        }
      }

      dataDiff.toUpdate.basic = { ...basicInfo };

      const response = await userRepository.fullUpdate({
        id_usuario: validatedUserData.id_usuario,
        ...dataDiff
      });

      if (response.success) {
        const updatedData = await userRepository.getById(userData.id_usuario);
        return updatedData;
      } else {
        throw new Error("actualización salio mal");
      }
    } catch (error) {
      logger.error({ caller: 'userService.js/update', err: error });
      if (error instanceof z.ZodError) {
        throw new DenkiError(ERR_CODE.VALIDATION_FAIL, getZodPath(error));
      }
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await userRepository.getById(id);
      return response;
    } catch (error) {
      logger.error({ caller: 'userService.js/getById', err: error });
      throw error;
    }
  }
};

const createCredentials = (reqBody) => {
  if (reqBody.username) {
    return {
      username: reqBody.username,
      password: reqBody.password
    };
  }

  //TODO: quitar caracteres especiales
  const inicialNombre = reqBody.nombres.charAt(0);
  const apellido = reqBody.apellidos.split(' ');
  const newUsername = (inicialNombre + apellido[0]).toLowerCase();

  return {
    username: newUsername,
    password: generatePassphrase()
  };
};

const validateNewUserData = (userInfo) => {

  const newUserData = {
    id_usuario: userInfo.id_usuario,
    username: userInfo.username,
    activo: userInfo.activo,
    id_rol: userInfo.id_rol,
    password: userInfo.hashedPassword,
    nombres: nullifyEmptyFields(userInfo.nombres),
    apellidos: nullifyEmptyFields(userInfo.apellidos),
    run: nullifyEmptyFields(userInfo.run),
    direccion: nullifyEmptyFields(userInfo.direccion),
    correo: nullifyEmptyFields(userInfo.correo),
    genero: userInfo.genero || 0,
    telefonos: nullifyEmptyFields(userInfo.telefonos),
    redes: nullifyEmptyFields(userInfo.redes),
    fecha_nacimiento: nullifyEmptyFields(userInfo.fecha_nacimiento)
  };

  const validatedNewUserData = newUserSchema.parse(newUserData);

  validatedNewUserData.redes = [];
  if (Array.isArray(userInfo.redes)) {
    userInfo.redes.forEach((red) => {
      if (red.handle.length === 0) return;
      const social = {
        id_red_social: red.id_red_social,
        id_usuario: userInfo.id_usuario,
        id_tipo_red: parseInt(red.id_tipo_red),
        handle: red.handle
      };

      socialSchema.parse(social);
      validatedNewUserData.redes.push(social);
    });
  };

  validatedNewUserData.telefonos = [];

  if (Array.isArray(userInfo.telefonos)) {
    userInfo.telefonos.forEach((tel) => {
      const phone = {
        id_telefono: tel.id_telefono,
        id_usuario: userInfo.id_usuario,
        id_tipo_telefono: parseInt(tel.id_tipo_telefono),
        numero: tel.numero
      };
      phoneSchema.parse(phone);
      validatedNewUserData.telefonos.push(phone);
    });
  };

  return validatedNewUserData;
};

const validateUpdatedUserData = (userInfo) => {

  const validatedNewUserData = updateUserSchema.parse(userInfo);

  validatedNewUserData.redes = [];
  validatedNewUserData.telefonos = [];

  //TODO: extraer logica reutilizable de telefonos y redes
  if (Array.isArray(userInfo.redes)) {
    userInfo.redes.forEach((red) => {
      if (red.handle.length === 0) return;
      const social = {
        id_red_social: red.id_red_social,
        id_usuario: userInfo.id_usuario,
        id_tipo_red: parseInt(red.id_tipo_red),
        handle: red.handle
      };

      socialSchema.parse(social);
      validatedNewUserData.redes.push(social);
    });
  };

  if (Array.isArray(userInfo.telefonos)) {
    userInfo.telefonos.forEach((tel) => {
      const phone = {
        id_telefono: tel.id_telefono,
        id_usuario: userInfo.id_usuario,
        id_tipo_telefono: parseInt(tel.id_tipo_telefono),
        numero: tel.numero
      };
      phoneSchema.parse(phone);
      validatedNewUserData.telefonos.push(phone);
    });
  };

  if (userInfo.toDelete) {
    if (!Array.isArray(userInfo.toDelete.telefonos)) {
      userInfo.toDelete.telefonos = [];
    }

    if (!Array.isArray(userInfo.toDelete.redes)) {
      userInfo.toDelete.redes = [];
    }
  } else {
    userInfo.toDelete = {
      telefonos: [],
      redes: []
    };
  }


  return { ...validatedNewUserData, toDelete: userInfo.toDelete };
};

const nullifyEmptyFields = (property) => {
  if (typeof property === 'string') {
    return property.trim() === '' ? null : property;
  } else if (property === undefined || property === null) {
    return null;
  } else if (Array.isArray(property) && property.length === 0) {
    return null;
  }

  return property;
};

const compareData = (currentData, newData) => {
  /*TODO: No tomar en cuenta cambios a telefonos o redes que no son del mismo usuario
  osea si se intenta cambiar el telefono con id 1 y este telefono no pertenece al id_usuario
  que se envio en el body de la request, saltarlo o lanzar error*/

  const toDelete = {
    telefonos: [],
    redes: []
  };

  let toUpdate = {
    telefonos: [],
    redes: []
  };

  const toAdd = {
    telefonos: [],
    redes: []
  };

  // sección UPDATE
  currentData.telefonos.forEach(cfono => {

    newData.telefonos.forEach(ufono => {
      if (cfono.id_telefono === ufono.id_telefono) {
        if (cfono.id_tipo_telefono !== ufono.id_tipo_telefono || cfono.numero !== ufono.numero) {
          toUpdate.telefonos.push(ufono);
        }
      }
    });
  });

  currentData.redes.forEach(cred => {
    newData.redes.forEach(ured => {
      if (cred.id_red_social === ured.id_red_social) {
        if (cred.id_tipo_red !== ured.id_tipo_red || cred.handle !== ured.handle) {
          toUpdate.redes.push(ured);
        }
      }
    });
  });

  // Sección ADD
  newData.telefonos.forEach(phone => {
    if (typeof phone.id_telefono === 'string' && phone.id_telefono.charAt(0) === 'n') {
      toAdd.telefonos.push(phone);
    }
  });

  newData.redes.forEach(red => {
    if (typeof red.id_red_social === 'string' && red.id_red_social.charAt(0) === 'n') {
      toAdd.redes.push(red);
    }
  });

  // Sección DELETE

  toDelete.telefonos = [...newData.toDelete.telefonos];
  toDelete.redes = [...newData.toDelete.redes];

  /* cabe la posibilidad de que en la request se envie para actualizar un elemento y al mismo tiempo el mismo
  este marcado para eliminar, en tal caso se filtran los elementos para update, dejando solo los que 
  NO estan marcados para borrado */

  const validUpdates = {
    telefonos: [],
    redes: []
  };

  toUpdate.telefonos.forEach(fono => {
    if (!newData.toDelete.telefonos.includes(fono.id_telefono)) {
      validUpdates.telefonos.push(fono);
    }
  });

  toUpdate.redes.forEach(red => {
    if (!newData.toDelete.redes.includes(red.id_red_social)) {
      validUpdates.redes.push(red);
    }
  });

  toUpdate = { ...validUpdates };

  return { toAdd, toUpdate, toDelete };
};