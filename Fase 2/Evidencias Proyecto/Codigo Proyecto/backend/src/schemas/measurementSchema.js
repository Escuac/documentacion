import { z } from 'zod';

export const updateMeasurementSessionSchema = z.object({
  id_sesion: z.coerce.number().int().positive(),
  id_usuario: z.string().uuid(),
  fecha: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    { message: "Invalid date format" }
  )
});

export const updateMeasurementSchema = z.object({
  id_medicion: z.any().optional(),
  id_tipo_medicion: z.coerce.number().int().positive(),
  valor: z.coerce.number().positive(),
  nota: z.coerce.string().max(200).nullable().optional()
});

export const createMeasurementSessionSchema = z.object({
  id_usuario: z.string().uuid(),
  fecha: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    { message: "Invalid date format" }
  )
});

export const createMeasurementSchema = z.object({
  id_tipo_medicion: z.coerce.number().int().positive(),
  valor: z.coerce.number().positive(),
  nota: z.coerce.string().max(200).nullable().optional()
});