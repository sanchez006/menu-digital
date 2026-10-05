import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

// Verifica que la petición traiga un token válido.
// El token llega en el encabezado:  Authorization: Bearer <token>
export function autenticar(req, res, next) {
  const encabezado = req.headers.authorization ?? '';
  const [tipo, token] = encabezado.split(' ');

  if (tipo !== 'Bearer' || !token) {
    throw new AppError(401, 'Debes iniciar sesión');
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // Token alterado, mal formado o expirado
    throw new AppError(401, 'Sesión inválida o expirada');
  }

  // Dejamos los datos del usuario disponibles para lo que sigue
  req.usuario = {
    id: Number(payload.sub),
    rol: payload.rol,
    negocioId: payload.negocioId,
  };
  next();
}

// Verifica que el usuario tenga uno de los roles permitidos.
// Uso: autorizar('superadmin')  o  autorizar('dueno', 'empleado')
export function autorizar(...rolesPermitidos) {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario?.rol)) {
      throw new AppError(403, 'No tienes permiso para realizar esta acción');
    }
    next();
  };
}
