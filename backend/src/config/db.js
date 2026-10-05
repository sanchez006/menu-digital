import pg from 'pg';

const { Pool, types } = pg;

// Por defecto, pg devuelve las columnas BIGINT como texto ("1" en vez de 1),
// porque JavaScript no puede representar todos los enteros de 64 bits.
// Nuestros ids nunca llegarán a ese tamaño, así que los convertimos a número.
types.setTypeParser(20, (valor) => parseInt(valor, 10));

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
