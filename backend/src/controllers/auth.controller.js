import * as authService from '../services/auth.service.js';
import { loginSchema } from '../validators/auth.schema.js';

export async function login(req, res) {
  const { email, password } = loginSchema.parse(req.body);
  const resultado = await authService.login(email, password);
  res.json(resultado);
}

// req.usuario lo coloca el middleware "autenticar"
export async function perfil(req, res) {
  const usuario = await authService.obtenerPerfil(req.usuario.id);
  res.json(usuario);
}
