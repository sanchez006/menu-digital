import { pool } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

// Columnas que devolvemos. Nunca usamos SELECT * para no exponer
// por accidente columnas que se agreguen en el futuro.
const COLUMNAS = `
  id, nombre, slug, logo_url, color_primario, color_secundario,
  whatsapp, direccion, activo, creado_en, actualizado_en
`;

export async function listar() {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS} FROM negocios ORDER BY nombre`
  );
  return rows;
}

export async function obtenerPorId(id) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS} FROM negocios WHERE id = $1`,
    [id]
  );
  if (rows.length === 0) throw new AppError(404, 'Negocio no encontrado');
  return rows[0];
}

// "datos" ya viene validado por Zod, que elimina cualquier campo
// desconocido. Por eso es seguro usar sus claves como nombres de columna.
export async function crear(datos) {
  const campos = Object.keys(datos);
  const valores = Object.values(datos);
  const marcadores = campos.map((_, i) => `$${i + 1}`); // $1, $2, $3...

  const { rows } = await pool.query(
    `INSERT INTO negocios (${campos.join(', ')})
     VALUES (${marcadores.join(', ')})
     RETURNING ${COLUMNAS}`,
    valores
  );
  return rows[0];
}

export async function actualizar(id, datos) {
  const campos = Object.keys(datos);
  const valores = Object.values(datos);
  const asignaciones = campos.map((campo, i) => `${campo} = $${i + 1}`);

  const { rows } = await pool.query(
    `UPDATE negocios
     SET ${asignaciones.join(', ')}
     WHERE id = $${campos.length + 1}
     RETURNING ${COLUMNAS}`,
    [...valores, id]
  );
  if (rows.length === 0) throw new AppError(404, 'Negocio no encontrado');
  return rows[0];
}

// No borramos el negocio: lo desactivamos (borrado lógico)
export async function desactivar(id) {
  const { rows } = await pool.query(
    `UPDATE negocios SET activo = FALSE WHERE id = $1 RETURNING ${COLUMNAS}`,
    [id]
  );
  if (rows.length === 0) throw new AppError(404, 'Negocio no encontrado');
  return rows[0];
}
