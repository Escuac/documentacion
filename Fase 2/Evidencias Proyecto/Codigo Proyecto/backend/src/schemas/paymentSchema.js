import { z } from 'zod';

export const newPaymentSchema = z.object({
  id_plan: z.coerce.number().int().positive(),
  id_usuario: z.string().uuid(),
  fecha_inicio: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    { message: "Formato de fecha invalido" }
  ),
  fecha_vencimiento: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    { message: "Formato de fecha invalido" }
  ),
  duracion_meses: z.coerce.number().int().min(1).default(1),
  porcentaje_descuento: z
    .coerce
    .number()
    .refine((val) => val === null || (val >= 0 && val <= 100), {
      message: "El descuento debe estar entre 0 y 100",
    })
    .nullable()
    .optional(),
  detalle_descuento: z.string().nullable().optional(),
  monto_pagado: z.coerce.number().int().min(0).max(1000000),
  metodo_pago: z.coerce.number().int().min(1).max(5),
  notas: z.string().max(200).nullable().optional(),
  estado: z.coerce.number().int().min(0).max(3).default(1),
});

export const updatePaymentSchema = newPaymentSchema
  .partial()
  .extend({
    id_pago: z.coerce.number().int().positive(),
  });