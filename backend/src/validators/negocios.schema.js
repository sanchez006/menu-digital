import { z } from 'zod';

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Mínimo 3 caracteres')
  .max(80, 'Máximo 80 caracteres')
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Solo minúsculas, números y guiones (ej: frappes-la-esquina)');

const color = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Color hexadecimal inválido (ej: #6B4F3A)');

export const crearNegocioSchema = z.object({
  nombre: z.string().trim().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),
  slug,
  logo_url: z.url('URL inválida').nullable().optional(),
  color_primario: color.optional(),
  color_secundario: color.optional(),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{8,15}$/, 'Solo números, de 8 a 15 dígitos (ej: +50212345678)')
    .nullable()
    .optional(),
  direccion: z.string().trim().max(500, 'Máximo 500 caracteres').nullable().optional(),
});

// Para editar: todos los campos son opcionales, pero debe venir al menos uno
export const actualizarNegocioSchema = crearNegocioSchema
  .partial()
  .extend({ activo: z.boolean().optional() })
  .refine((datos) => Object.keys(datos).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar',
  });

// El id viene en la URL como texto ("5"); lo convertimos a número y validamos
export const idSchema = z.coerce.number().int().positive();
