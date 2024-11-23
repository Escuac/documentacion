import { z } from 'zod';

export const newUserSchema = z.object({
    id_usuario: z.string().uuid(),
    activo: z.number().int().default(1),
    username: z.string().min(3).max(20),
    password: z.string().max(255).optional(),
    id_rol: z.coerce.number().int().min(1).max(3).default(3),
    nombres: z.string().min(2).max(50),
    apellidos: z.string().min(2).max(50),
    run: z.string().max(11).nullable(),
    direccion: z.string().max(150).nullable(),
    correo: z.string().email().max(100).nullable(),
    genero: z.coerce.number().int().min(0).max(3).default(3),
    fecha_nacimiento: z.string().refine(
        (date) => !isNaN(Date.parse(date)),
        { message: "Formato de fecha invalido" }
    ).optional().nullable()
});

export const updateUserSchema = z.object({
    id_usuario: z.string().uuid(),
    activo: z.number().int().optional(),
    username: z.string().min(3).max(20).optional(),
    password: z.string().max(255).optional(),
    id_rol: z.coerce.number().int().min(1).max(3).optional(),
    nombres: z.string().min(2).max(50).optional(),
    apellidos: z.string().min(2).max(50).optional(),
    run: z.string().max(11).nullable().optional(),
    direccion: z.string().max(150).nullable().optional(),
    correo: z.string().email().max(100).nullable().optional(),
    genero: z.coerce.number().int().min(0).max(3).nullable().optional(),
    fecha_nacimiento: z.string().refine(
        (date) => !isNaN(Date.parse(date)),
        { message: "Formato de fecha invalido" }
    ).optional().nullable()
});

export const socialSchema = z.object({
    id_usuario: z.string().uuid(),
    id_tipo_red: z.number().int().min(1),
    handle: z.string().max(100),
});

export const phoneSchema = z.object({
    id_usuario: z.string().uuid(),
    id_tipo_telefono: z.number().int().min(1),
    numero: z.string().max(20),
});