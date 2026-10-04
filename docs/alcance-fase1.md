# Alcance – Fase 1: Menú digital

## Proyecto
Sistema de menú digital para tiendas de bebidas (licuados, frappés y similares), diseñado para que lo usen varios negocios.

## Objetivo
Que un negocio tenga su menú en línea, accesible por código QR, y que el dueño y sus trabajadores puedan mantenerlo actualizado sin ayuda técnica.

## Usuarios y roles

| Rol | Descripción | Qué puede hacer |
|---|---|---|
| Cliente | Persona que visita el negocio | Ver el menú desde su celular, sin crear cuenta |
| Superadmin | Administrador de la plataforma | Crear, editar y desactivar negocios; crear la cuenta del dueño |
| Dueño | Propietario del negocio | Gestionar menú, configuración del negocio y cuentas de sus empleados |
| Empleado | Trabajador del negocio | Marcar productos como agotados o disponibles |

## Requisitos funcionales

### Menú público (cliente)
1. El cliente ve el menú organizado por categorías.
2. Cada producto muestra nombre, descripción, foto y precio.
3. Un producto puede tener uno o varios tamaños con precio propio, y extras opcionales con costo adicional.
4. Los productos agotados se muestran como no disponibles; los ocultos no aparecen.
5. La página muestra logo, horario, ubicación y WhatsApp del negocio.

### Panel de administración
6. Los usuarios inician y cierran sesión con correo y contraseña.
7. El superadmin crea negocios y la cuenta del dueño de cada uno.
8. El dueño crea, edita y elimina categorías, productos, tamaños y extras.
9. El dueño personaliza colores y logo de su menú.
10. El dueño crea, edita y desactiva cuentas de empleados.
11. El empleado marca productos como agotados o disponibles.

## Requisitos no funcionales
1. El menú público está diseñado primero para celular.
2. El menú carga en menos de 3 segundos con internet lento.
3. Cada usuario solo accede a los datos de su propio negocio.
4. Cada usuario solo puede realizar las acciones permitidas por su rol.
5. Las contraseñas se guardan cifradas con hash (bcrypt).
6. El sistema soporta varios negocios desde el inicio.

## Tecnologías
- Frontend: Angular (standalone)
- Backend: Node.js con Express
- Base de datos: PostgreSQL
- Entorno: Docker y Docker Compose
- Control de versiones: Git y GitHub

## Fuera de esta fase
- Pedidos en línea
- Punto de venta (POS)
- Inventario y recetas
- Programa de lealtad
- Integración automática con WhatsApp
- Permisos configurables o roles adicionales (cajero, preparador)
