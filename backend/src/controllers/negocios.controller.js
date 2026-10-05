import * as negociosService from '../services/negocios.service.js';
import {
  crearNegocioSchema,
  actualizarNegocioSchema,
  idSchema,
} from '../validators/negocios.schema.js';

export async function listar(req, res) {
  const negocios = await negociosService.listar();
  res.json(negocios);
}

export async function obtener(req, res) {
  const id = idSchema.parse(req.params.id);
  const negocio = await negociosService.obtenerPorId(id);
  res.json(negocio);
}

export async function crear(req, res) {
  const datos = crearNegocioSchema.parse(req.body);
  const negocio = await negociosService.crear(datos);
  res.status(201).json(negocio);
}

export async function actualizar(req, res) {
  const id = idSchema.parse(req.params.id);
  const datos = actualizarNegocioSchema.parse(req.body);
  const negocio = await negociosService.actualizar(id, datos);
  res.json(negocio);
}

export async function desactivar(req, res) {
  const id = idSchema.parse(req.params.id);
  const negocio = await negociosService.desactivar(id);
  res.json(negocio);
}
