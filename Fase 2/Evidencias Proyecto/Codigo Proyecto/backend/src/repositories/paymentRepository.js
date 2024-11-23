import con from '../config/db.js';

export const paymentRepository = {
  async create(paymentData, dbCon = null) {
    const connection = dbCon || con;

    const {
      id_plan,
      id_usuario,
      fecha_inicio,
      fecha_vencimiento,
      duracion_meses,
      porcentaje_descuento,
      detalle_descuento,
      monto_pagado,
      metodo_pago,
      notas,
      estado
    } = paymentData;

    const query = `
      INSERT INTO pagos 
      (id_plan, id_usuario, fecha_inicio, fecha_vencimiento, duracion_meses, porcentaje_descuento, 
      detalle_descuento, monto_pagado, metodo_pago, notas, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute(query, [
      id_plan,
      id_usuario,
      fecha_inicio,
      fecha_vencimiento,
      duracion_meses,
      porcentaje_descuento || null,
      detalle_descuento || null,
      monto_pagado,
      metodo_pago,
      notas || null,
      estado
    ]);

    return { id_pago: result.insertId, ...paymentData };
  },

  async update(paymentData, dbCon = null) {
    const connection = dbCon || con;

    const {
      id_pago,
      id_plan,
      fecha_inicio,
      fecha_vencimiento,
      duracion_meses,
      porcentaje_descuento,
      detalle_descuento,
      monto_pagado,
      metodo_pago,
      notas,
    } = paymentData;

    const query =
      `UPDATE pagos 
    SET id_plan = ?, fecha_inicio = ?, fecha_vencimiento = ?, duracion_meses = ?, porcentaje_descuento = ?, detalle_descuento = ?, monto_pagado = ?, metodo_pago = ?, notas = ? 
    WHERE id_pago = ?`;

    const [resp] = await connection.query(query, [
      id_plan,
      fecha_inicio,
      fecha_vencimiento,
      duracion_meses,
      porcentaje_descuento,
      detalle_descuento,
      monto_pagado,
      metodo_pago,
      notas,
      id_pago,
    ]);

    return resp;
  },

  async delete(id_pago, dbCon = null) {
    const connection = dbCon || con;

    const query =
      `DELETE FROM pagos WHERE id_pago = ?`;
    const [resp] = await connection.query(query, [id_pago]);

    return resp;
  },

  async getAll(dbCon = null) {
    const connection = dbCon || con;

    const query =
      `SELECT 
        pg.id_pago, 
        pg.id_plan, 
        (SELECT COUNT(*) FROM asistencias WHERE id_pago = pg.id_pago) as dias_ocupados,
        CONCAT(IFNULL(du.nombres, ""), ' ', IFNULL(du.apellidos, "")) as nombre_completo, 
        pl.nombre as nombre_plan, 
        pl.modalidad_acceso, 
        pg.id_usuario, 
        fecha_inicio, 
        fecha_vencimiento, 
        duracion_meses, 
        porcentaje_descuento, 
        detalle_descuento, 
        monto_pagado, 
        metodo_pago, 
        notas, 
        CONVERT_TZ(pg.created_at, 'UTC', 'America/Santiago') AS created_at,
        estado
      FROM pagos pg
      JOIN planes pl ON pg.id_plan = pl.id_plan
      JOIN detalle_usuarios du ON pg.id_usuario = du.id_usuario
      ORDER BY pg.created_at DESC`;
    const [resp] = await connection.query(query);

    return resp;
  },

  async getOne(id_pago, dbCon = null) {
    const connection = dbCon || con;

    const query =
      `SELECT 
        id_pago, 
        pg.id_plan, 
        CONCAT(du.nombres, ' ', du.apellidos) as nombre_completo, 
        pl.nombre as nombre_plan, 
        pl.modalidad_acceso, 
        pg.id_usuario, 
        fecha_inicio, 
        fecha_vencimiento,
        duracion_meses, 
        porcentaje_descuento, 
        detalle_descuento, 
        monto_pagado, 
        metodo_pago, 
        notas, 
        CONVERT_TZ(pg.created_at, 'UTC', 'America/Santiago') AS created_at,
        estado
    FROM pagos pg
    JOIN planes pl ON pg.id_plan = pl.id_plan
    JOIN detalle_usuarios du ON pg.id_usuario = du.id_usuario
    WHERE id_pago = ?`;
    const [resp] = await connection.query(query, [id_pago]);

    return resp[0];
  },

  async getByUserId(id_usuario, dbCon = null) {
    const connection = dbCon || con;

    const query = `
    SELECT 
        pg.id_pago, 
        pg.id_plan, 
        (SELECT COUNT(*) FROM asistencias WHERE id_pago = pg.id_pago) as dias_ocupados,
        CONCAT(IFNULL(du.nombres, ""), ' ', IFNULL(du.apellidos, "")) as nombre_completo, 
        pl.nombre as nombre_plan, 
        pl.modalidad_acceso, 
        pg.id_usuario, 
        fecha_inicio, 
        fecha_vencimiento, 
        duracion_meses, 
        porcentaje_descuento, 
        detalle_descuento, 
        monto_pagado, 
        metodo_pago, 
        notas, 
        CONVERT_TZ(pg.created_at, 'UTC', 'America/Santiago') AS created_at,
        estado
      FROM pagos pg
      JOIN planes pl ON pg.id_plan = pl.id_plan
      JOIN detalle_usuarios du ON pg.id_usuario = du.id_usuario
      WHERE pg.id_usuario = ?
      ORDER BY pg.created_at DESC
    `;
    const [resp] = await connection.query(query, [id_usuario]);

    return resp;
  },
  async getUserLastPayment(id_usuario, dbCon = null) {
    const connection = dbCon || con;

    const query = `
    SELECT 
      id_pago, 
	    p.id_plan, 
	    p2.nombre as "nombre_plan",
	    id_usuario,
	    CONVERT_TZ(p.created_at, 'UTC', 'America/Santiago') AS created_at,
	    DATE_FORMAT(fecha_inicio, '%Y-%m-%d') AS fecha_inicio,
	    DATE_FORMAT(fecha_vencimiento, '%Y-%m-%d') AS fecha_vencimiento,
	    porcentaje_descuento, 
	    monto_pagado, 
	    metodo_pago, 
	    notas, 
      estado,
    (SELECT 
    DATE_FORMAT(CONVERT_TZ(a.created_at, 'UTC', 'America/Santiago'), '%Y-%m-%d %H:%i:%s')
    FROM asistencias a
    WHERE a.id_pago = p.id_pago
    ORDER BY p.created_at DESC
    LIMIT 1) as ultima_asistencia
    FROM 
	    pagos p
    JOIN planes p2 ON p.id_plan = p2.id_plan 
    WHERE 
      id_usuario = ?
    ORDER BY
      fecha_inicio desc
    LIMIT 1;`;
    const [resp] = await connection.query(query, [id_usuario]);
    return resp;
  },

  async getActivePaymentByUserId(id_usuario, dbCon = null) {
    const connection = dbCon || con;
    const query = `
    SELECT 
	    id_pago,
      estado,
	    p.id_plan,
	    p2.nombre as nombre_plan,
      p2.modalidad_acceso,
	    id_usuario,
	    fecha_inicio,
	    fecha_vencimiento,
	    porcentaje_descuento,
	    detalle_descuento,
	    monto_pagado,
	    metodo_pago,
	    notas,
      CONVERT_TZ(p.created_at, 'UTC', 'America/Santiago') AS created_at,
      CONVERT_TZ(p.updated_at, 'UTC', 'America/Santiago') AS updated_at
    FROM pagos p 
    JOIN planes p2 ON p.id_plan = p2.id_plan
    WHERE id_usuario = ? AND estado IN(0,1)
    ORDER BY estado DESC
    LIMIT 2;`;
    const [resp] = await connection.query(query, [id_usuario]);
    return resp;
  },

  async getFutureActivePaymentByUserId(id_usuario, dbCon = null) {
    const connection = dbCon || con;
    const query = `
    SELECT 
	    id_pago,
	    p.id_plan,
	    p2.nombre as nombre_plan,
      p2.modalidad_acceso,
	    id_usuario,
	    fecha_inicio,
	    fecha_vencimiento,
	    porcentaje_descuento,
	    detalle_descuento,
	    monto_pagado,
	    metodo_pago,
	    notas,
      CONVERT_TZ(p.created_at, 'UTC', 'America/Santiago') AS created_at,
	    p.updated_at
    FROM pagos p 
    JOIN planes p2 ON p.id_plan = p2.id_plan
    WHERE id_usuario = ? AND estado=0 LIMIT 1;`;
    const [resp] = await connection.query(query, [id_usuario]);
    return resp[0];
  },
  async getMonthIncome(){
    const query = `
    SELECT
    SUM(monto_pagado) AS total
    FROM pagos WHERE EXTRACT( MONTH FROM DATE(created_at)) = EXTRACT(MONTH FROM CURRENT_DATE);`;
    const [resp] = await con.query(query);
    return resp[0];
  },
  async getMonthPayments(dbCon = null){
    const connection = dbCon || con;
    const query = `
    SELECT
    COUNT(*) AS total
    FROM pagos WHERE EXTRACT( MONTH FROM DATE(created_at)) = EXTRACT(MONTH FROM CURRENT_DATE);`;
    const [resp] = await connection.query(query);
    return resp[0];
  },
  async getPaymentsExpiringSoon(daysInterval, dbCon = null){
    const connection = dbCon || con;
    const query = `
    SELECT
      pg.id_pago,
      CONCAT(du.nombres, ' ', du.apellidos) as nombre_completo,
      pg.fecha_vencimiento,
      pl.nombre as nombre_plan
    FROM pagos pg
    JOIN planes pl ON pg.id_plan = pl.id_plan
    JOIN detalle_usuarios du ON du.id_usuario = pg.id_usuario
    WHERE pg.fecha_vencimiento >= CURRENT_DATE()
    AND pg.fecha_vencimiento <= DATE_ADD(CURRENT_DATE(), INTERVAL ? DAY);`;
    const [resp] = await connection.query(query, [daysInterval]);
    
    return resp;
  }

};