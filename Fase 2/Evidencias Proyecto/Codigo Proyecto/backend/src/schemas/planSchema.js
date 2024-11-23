import { z } from 'zod';

export const newPlanSchema = z.object({
  nombre: z.string().max(100),
  activo: z.coerce.boolean().default(true),
  modalidad_acceso: z.coerce.number().refine(val => [1, 2, 3].includes(val), {
    message: "Debe ser uno de los valores permitidos: 1, 2, 3"
  }),
  valor_base: z.coerce.number().int().min(0).max(1000000),
  descripcion: z.string().max(250).nullable().optional()
});

export const updatePlanSchema = z.object({
  id_plan: z.coerce.number().int(),
  nombre: z.string().max(100).optional(),
  activo: z.coerce.boolean().default(true).optional(),
  modalidad_acceso: z.coerce.number().refine(val => [1, 2, 3].includes(val), {
    message: "Debe ser uno de los valores permitidos: 1, 2, 3"
  }).optional(),
  valor_base: z.coerce.number().int().min(0).max(1000000).optional(),
  descripcion: z.string().max(250).nullable().optional()
});