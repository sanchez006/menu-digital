import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export async function login(email, password) {
  // Traemos al usuario y, si tiene negocio, si ese negocio está activo
  const { rows } = await pool.query(
    `SELECT u.id, u.nombre, u.email, u.password_hash, u.rol,
            u.negocio_id, u.activo, n.activo AS negocio_activo
     FROM usuarios u
     LEFT JOIN negocios n ON n.id = u.negocio_id
     WHERE LOWER(u.email) = LOWER($1)`,
    [email]
  );
  const usuario = rows[0];

  // Mismo mensaje si el correo no existe o si la contraseña es incorrecta.
  // Así nadie puede averiguar qué correos están registrados.
  const passwordCorrecta =
    usuario && (await bcrypt.compare(password, usuario.password_hash));

  if (!passwordCorrecta) {
    throw new AppError(401, 'Correo o contraseña incorrectos');
  }

  const negocioInactivo =
    usuario.rol !== 'superadmin' && !usuario.negocio_activo;

  if (!usuario.activo || negocioInactivo) {
    throw new AppError(403, 'Tu cuenta está desactivada');
  }

  // Lo que va dentro del token. No incluir datos sensibles:
  // el contenido de un JWT se puede leer, solo no se puede modificar.
  const token = jwt.sign(
    { sub: String(usuario.id), rol: usuario.rol, negocioId: usuario.negocio_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      negocioId: usuario.negocio_id,
    },
  };
}

export async function obtenerPerfil(id) {
  const { rows } = await pool.query(
    `SELECT id, nombre, email, rol, negocio_id AS "negocioId", activo
     FROM usuarios
     WHERE id = $1`,
    [id]
  );
  if (rows.length === 0) throw new AppError(404, 'Usuario no encontrado');
  return rows[0];
}
