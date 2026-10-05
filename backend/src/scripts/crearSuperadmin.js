// Crea el usuario superadmin inicial.
// Uso: docker compose exec backend node src/scripts/crearSuperadmin.js
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import bcrypt from 'bcryptjs';
import { z, ZodError } from 'zod';
import { pool } from '../config/db.js';

const esquema = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener mínimo 2 caracteres'),
  email: z.email('Correo inválido'),
  password: z.string().min(10, 'La contraseña debe tener mínimo 10 caracteres'),
});

const rl = readline.createInterface({ input, output });

try {
  const datos = esquema.parse({
    nombre: await rl.question('Nombre: '),
    email: (await rl.question('Correo: ')).trim().toLowerCase(),
    password: await rl.question('Contraseña (mínimo 10 caracteres): '),
  });

  // 12 = "costo" del hash: más alto es más seguro, pero más lento
  const passwordHash = await bcrypt.hash(datos.password, 12);

  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, email, password_hash, rol)
     VALUES ($1, $2, $3, 'superadmin')
     RETURNING id, nombre, email, rol`,
    [datos.nombre, datos.email, passwordHash]
  );

  console.log('\nSuperadmin creado correctamente:', rows[0]);
} catch (err) {
  if (err instanceof ZodError) {
    err.issues.forEach((issue) => console.error(`- ${issue.message}`));
  } else if (err.code === '23505') {
    console.error('Ya existe un usuario con ese correo.');
  } else {
    console.error(err);
  }
  process.exitCode = 1;
} finally {
  rl.close();
  await pool.end();
}
