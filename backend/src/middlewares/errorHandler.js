import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

// Traduce cada tipo de error a una respuesta clara para el cliente.
// Los detalles internos solo se muestran en la consola del servidor.
export function errorHandler(err, req, res, next) {
  // Datos que no pasaron la validación de Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Datos inválidos',
      detalles: err.issues.map((issue) => ({
        campo: issue.path.join('.'),
        mensaje: issue.message,
      })),
    });
  }

  // Errores que lanzamos nosotros (404, etc.)
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }

  // JSON mal escrito en el cuerpo de la petición
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El JSON enviado no es válido' });
  }

  // Errores de PostgreSQL
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Ya existe un registro con ese valor',
      regla: err.constraint,
    });
  }
  if (err.code === '23514' || err.code === '23503') {
    return res.status(400).json({
      error: 'Los datos no cumplen las reglas de la base de datos',
      regla: err.constraint,
    });
  }

  // Cualquier otro error: no exponemos detalles
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}
