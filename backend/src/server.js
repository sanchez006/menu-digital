import app from './app.js';

// Si falta una variable crítica, es mejor no arrancar que arrancar inseguro
const requeridas = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const faltantes = requeridas.filter((nombre) => !process.env[nombre]);

if (faltantes.length > 0) {
  console.error(`Faltan variables de entorno: ${faltantes.join(', ')}`);
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API escuchando en el puerto ${PORT}`);
});
