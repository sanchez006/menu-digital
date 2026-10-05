// Error con código HTTP, para errores que nosotros lanzamos a propósito
// (por ejemplo: "Negocio no encontrado" → 404)
export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
