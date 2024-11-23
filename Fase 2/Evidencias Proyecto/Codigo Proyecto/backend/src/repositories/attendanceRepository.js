import con from '../config/db.js';
// TODO: corregir manejo de fechas.
export const attendanceRepository = {
  async getAllAttendances(limit = null, dbCon = null) {
    const connection = dbCon || con;
    const query = `
    SELECT 
    du.id_usuario,
    CONCAT(du.nombres, ' ', du.apellidos) as nombre_completo,
    a.id_asistencia,
    DATE_FORMAT(CONVERT_TZ(a.created_at, 'UTC', 'America/Santiago'), '%Y-%m-%d %H:%i:%s') AS fecha_asistencia,
    p.id_pago,
      p.id_plan,
      p2.nombre as nombre_plan, 
      p2.modalidad_acceso,
      p.fecha_inicio, 
      p.fecha_vencimiento,
      (SELECT COUNT(*) FROM asistencias WHERE id_pago = p.id_pago AND fecha_asistencia > created_at) + 1 as dias_ocupados
    FROM asistencias a 
    JOIN pagos p ON a.id_pago = p.id_pago
    JOIN planes p2 ON p.id_plan = p2.id_plan
    JOIN detalle_usuarios du ON p.id_usuario = du.id_usuario
    ORDER BY a.created_at DESC
    LIMIT ${limit ? limit : 1000};`;
    const [rows] = await connection.query(query);
    return rows;
  },
  async getAttendanceByPaymentId(id_pago, dbCon = null) {
    const connection = dbCon || con;
    const query = `
    SELECT 
      id_asistencia, 
      a.created_at AS fecha_asistencia,
      (SELECT COUNT(*) FROM asistencias WHERE id_pago = id_pago AND fecha_asistencia > created_at) + 1 as dias_ocupados
    FROM asistencias a
    JOIN pagos p ON a.id_pago = p.id_pago
    JOIN planes p2 ON p.id_plan = p2.id_plan
    WHERE a.id_pago = ?
    ORDER BY a.created_at DESC;`;

    const [rows] = await connection.query(query, [id_pago]);

    return rows;
  },
  async getAttendanceByUserId(userId, dbCon = null) {
    const connection = dbCon || con;

    const query = `
      SELECT 
      du.id_usuario,
      CONCAT(du.nombres, ' ', du.apellidos) as nombre_completo,
      a.id_asistencia,
      CONVERT_TZ(a.created_at, 'UTC', 'America/Santiago') AS fecha_asistencia,
      p.id_pago,
      p.id_plan,
      p2.nombre as nombre_plan, 
      p2.modalidad_acceso,
      p.fecha_inicio, 
      p.fecha_vencimiento,
      (SELECT COUNT(*) FROM asistencias WHERE id_pago = p.id_pago AND fecha_asistencia > created_at) + 1 as dias_ocupados
      FROM asistencias a 
      JOIN pagos p ON a.id_pago = p.id_pago
      JOIN planes p2 ON p.id_plan = p2.id_plan
      JOIN detalle_usuarios du ON p.id_usuario = du.id_usuario
      WHERE du.id_usuario = ?
      ;`;

    const [rows] = await connection.query(query, [userId]);

    return rows;
  },
  async getAttendancesByDate(date, dbCon = null) {
    const connection = dbCon || con;
    const query = `
    SELECT * 
    FROM asistencias 
    WHERE DATE_FORMAT(CONVERT_TZ(created_at, 'UTC', 'America/Santiago'), '%Y-%m-%d') = ? ;`;
    const [rows] = await connection.query(query, [date]);
    return rows;
  },
  async createAttendance(id_pago, dbCon = null) {
    const connection = dbCon || con;
    const query = `INSERT INTO asistencias (id_pago) VALUES(?);`;
    const response = await connection.query(query, [id_pago]);
    return response;
  },
  async updateAttendance(attendanceData, dbCon = null) {
    const connection = dbCon || con;
  },
  async deleteAttendance(id_asistencia, dbCon = null) {
    const connection = dbCon || con;
    const query = `DELETE FROM asistencias WHERE id_asistencia = ?;`;
    const response = await connection.query(query, [id_asistencia]);
    return response;
  },
};