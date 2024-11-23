DROP TABLE IF EXISTS `asistencias`;
DROP TABLE IF EXISTS `telefonos`;
DROP TABLE IF EXISTS `redes_sociales`;
DROP TABLE IF EXISTS `pagos`;
DROP TABLE IF EXISTS `mediciones`;
DROP TABLE IF EXISTS `detalle_usuarios`;
DROP TABLE IF EXISTS `usuarios`;
DROP TABLE IF EXISTS `tipos_telefonos`;
DROP TABLE IF EXISTS `tipos_roles`;
DROP TABLE IF EXISTS `tipo_red_social`;
DROP TABLE IF EXISTS `tipo_medicion`;
DROP TABLE IF EXISTS `planes`;

-- denki.planes definition
CREATE TABLE `planes` (
  `id_plan` int(11) NOT NULL AUTO_INCREMENT,
  `modalidad_acceso` tinyint(4) NOT NULL COMMENT '1 = 8 CL\r\n2 = 12 CL\r\n3 = Mes',
  `nombre` varchar(100) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `valor_base` mediumint(9) NOT NULL,
  `descripcion` varchar(250) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT current_timestamp(),
  `updated_at` TIMESTAMP DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_plan`)
);

-- denki.tipo_medicion definition
CREATE TABLE `tipo_medicion` (
  `id_tipo_medicion` INT NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT current_timestamp(),
  `updated_at` TIMESTAMP DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_tipo_medicion`)
);

-- denki.tipo_red_social definition
CREATE TABLE `tipo_red_social` (
  `id_tipo_red` INT NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT current_timestamp(),
  `updated_at` TIMESTAMP DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_tipo_red`)
);

-- denki.tipos_roles definition
CREATE TABLE `tipos_roles` (
  `id_tipo_rol` INT NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT current_timestamp(),
  `updated_at` TIMESTAMP DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_tipo_rol`)
);

-- denki.tipos_telefonos definition
CREATE TABLE `tipos_telefonos` (
  `id_tipo_telefono` INT NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT current_timestamp(),
  `updated_at` TIMESTAMP DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_tipo_telefono`)
);

-- denki.usuarios definition
CREATE TABLE `usuarios` (
  `id_usuario` char(36) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT current_timestamp(),
  `updated_at` TIMESTAMP DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `username` (`username`),
  KEY `id_rol` (`id_rol`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `tipos_roles` (`id_tipo_rol`)
);

-- denki.detalle_usuarios definition
CREATE TABLE `detalle_usuarios` (
  `id_usuario` char(36) NOT NULL,
  `nombres` varchar(50) DEFAULT NULL,
  `apellidos` varchar(50) DEFAULT NULL,
  `run` varchar(11) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `genero` tinyint(4) DEFAULT 3,
  `created_at` TIMESTAMP DEFAULT current_timestamp(),
  `updated_at` TIMESTAMP DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_usuario`),
  CONSTRAINT `detalle_usuarios_usuarios_FK` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
);

CREATE TABLE sesiones_medicion (
	`id_sesion` INT auto_increment NOT NULL,
	`id_usuario` char(36) NOT NULL,
	`fecha` date NOT NULL,
  `created_at` TIMESTAMP DEFAULT current_timestamp(),
  `updated_at` TIMESTAMP DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	CONSTRAINT sesion_medicion_pk PRIMARY KEY (`id_sesion`),
	CONSTRAINT sesion_medicion_usuarios_FK FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- denki.mediciones definition
CREATE TABLE `mediciones` (
  `id_medicion` INT NOT NULL AUTO_INCREMENT,
  `id_tipo_medicion` INT NOT NULL,
  `id_sesion` INT NOT NULL,
  `valor` float NOT NULL,
  `nota` text DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT current_timestamp(),
  `updated_at` TIMESTAMP DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_medicion`),
  KEY `id_tipo_medicion` (`id_tipo_medicion`),
  CONSTRAINT `mediciones_ibfk_1` FOREIGN KEY (`id_tipo_medicion`) REFERENCES `tipo_medicion` (`id_tipo_medicion`),
  CONSTRAINT `mediciones_ibfk_2` FOREIGN KEY (`id_sesion`) REFERENCES `sesiones_medicion` (`id_sesion`) ON DELETE CASCADE
);

-- denki.pagos definition
CREATE TABLE `pagos` (
  `id_pago` int(11) NOT NULL AUTO_INCREMENT,
  `id_plan` int(11) NOT NULL,
  `id_usuario` char(36) NOT NULL,
  `estado` TINYINT DEFAULT 0 NOT NULL COMMENT '0 = pago inactivo\r\n1 = pago activo\r\n2 = pago vencido',
  `fecha_inicio` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `duracion_meses` int(11) NOT NULL,
  `porcentaje_descuento` decimal(5,2) DEFAULT NULL,
  `detalle_descuento` varchar(200) DEFAULT NULL,
  `monto_pagado` mediumint(9) NOT NULL,
  `metodo_pago` int(11) NOT NULL COMMENT '1=efectivo\r\n2=transferencia\r\n3=debito\r\n4=credito\r\n5=deuda',
  `notas` varchar(200) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT current_timestamp(),
  `updated_at` TIMESTAMP DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_pago`),
  KEY `id_plan` (`id_plan`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`id_plan`) REFERENCES `planes` (`id_plan`),
  CONSTRAINT `pagos_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
);

-- denki.redes_sociales definition
CREATE TABLE `redes_sociales` (
  `id_red_social` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` char(36) NOT NULL,
  `id_tipo_red` INT NOT NULL,
  `handle` varchar(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT current_timestamp(),
  `updated_at` TIMESTAMP DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_red_social`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_tipo_red` (`id_tipo_red`),
  CONSTRAINT `redes_sociales_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `detalle_usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `redes_sociales_ibfk_2` FOREIGN KEY (`id_tipo_red`) REFERENCES `tipo_red_social` (`id_tipo_red`)
);

-- denki.telefonos definition
CREATE TABLE `telefonos` (
  `id_telefono` INT NOT NULL AUTO_INCREMENT,
  `id_tipo_telefono` INT NOT NULL,
  `id_usuario` char(36) NOT NULL,
  `nombre_contacto` varchar(100) DEFAULT NULL,
  `relacion` varchar(50) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT current_timestamp(),
  `updated_at` TIMESTAMP DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_telefono`),
  KEY `id_tipo_telefono` (`id_tipo_telefono`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `telefonos_ibfk_1` FOREIGN KEY (`id_tipo_telefono`) REFERENCES `tipos_telefonos` (`id_tipo_telefono`),
  CONSTRAINT `telefonos_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `detalle_usuarios` (`id_usuario`) ON DELETE CASCADE
);

-- denki.asistencias definition
CREATE TABLE `asistencias` (
  `id_ingreso` INT NOT NULL AUTO_INCREMENT,
  `id_pago` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT current_timestamp(),
  `updated_at` TIMESTAMP DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_ingreso`),
  KEY `id_pago` (`id_pago`),
  CONSTRAINT `asistencias_ibfk_1` FOREIGN KEY (`id_pago`) REFERENCES `pagos` (`id_pago`) ON DELETE CASCADE
);

INSERT INTO tipos_roles (id_tipo_rol, nombre) VALUES(1, 'ADMI');
INSERT INTO tipos_roles (id_tipo_rol, nombre) VALUES(2, 'OPER');
INSERT INTO tipos_roles (id_tipo_rol, nombre) VALUES(3, 'ALUM');

INSERT INTO tipo_red_social (id_tipo_red, nombre) VALUES(1, 'instagram');
INSERT INTO tipo_red_social (id_tipo_red, nombre) VALUES(2, 'facebook');

INSERT INTO tipos_telefonos (id_tipo_telefono, nombre) VALUES(1, 'movil');
INSERT INTO tipos_telefonos (id_tipo_telefono, nombre) VALUES(2, 'fijo');
INSERT INTO tipos_telefonos (id_tipo_telefono, nombre) VALUES(3, 'emergencia');

INSERT INTO usuarios
(id_usuario, id_rol, username, password, activo)
VALUES('8d7729a0-4bb7-4f69-85b2-035eb5e621f0', 1, 'admin', '$2b$10$EHUSF/gcvvZpvYXqrx1I6ePeAQeB2TdT/ya5b.odQI.DaFKIgpAxu', 1);

INSERT INTO detalle_usuarios
(id_usuario, nombres, apellidos)
VALUES('8d7729a0-4bb7-4f69-85b2-035eb5e621f0', 'Administrador', 'Global');

INSERT INTO tipo_medicion (id_tipo_medicion, nombre) VALUES(1, 'edad');
INSERT INTO tipo_medicion (id_tipo_medicion, nombre) VALUES(2, 'altura');
INSERT INTO tipo_medicion (id_tipo_medicion, nombre) VALUES(3, 'peso');
INSERT INTO tipo_medicion (id_tipo_medicion, nombre) VALUES(4, 'imc');
INSERT INTO tipo_medicion (id_tipo_medicion, nombre) VALUES(5, 'genero');
INSERT INTO tipo_medicion (id_tipo_medicion, nombre) VALUES(6, 'p_suprailiaco');
INSERT INTO tipo_medicion (id_tipo_medicion, nombre) VALUES(7, 'p_subescapular');
INSERT INTO tipo_medicion (id_tipo_medicion, nombre) VALUES(8, 'p_tricipital');
INSERT INTO tipo_medicion (id_tipo_medicion, nombre) VALUES(9, 'p_bicipital');
INSERT INTO tipo_medicion (id_tipo_medicion, nombre) VALUES(10, 'abdomen');
INSERT INTO tipo_medicion (id_tipo_medicion, nombre) VALUES(11, 'pecho');
INSERT INTO tipo_medicion (id_tipo_medicion, nombre) VALUES(12, 'biceps');
INSERT INTO tipo_medicion (id_tipo_medicion, nombre) VALUES(13, 'hombros');
INSERT INTO tipo_medicion (id_tipo_medicion, nombre) VALUES(14, 'gluteos');
INSERT INTO tipo_medicion (id_tipo_medicion, nombre) VALUES(15, 'cintura');
INSERT INTO tipo_medicion (id_tipo_medicion, nombre) VALUES(16, 'muslos');
INSERT INTO tipo_medicion (id_tipo_medicion, nombre) VALUES(17, 'pantorrillas');
INSERT INTO tipo_medicion (id_tipo_medicion, nombre) VALUES(18, 'cuello');
INSERT INTO tipo_medicion (id_tipo_medicion, nombre) VALUES(19, 'antebrazo');
INSERT INTO tipo_medicion (id_tipo_medicion, nombre) VALUES(20, 'porcentaje_grasa');