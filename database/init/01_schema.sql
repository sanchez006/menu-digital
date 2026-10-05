-- =============================================================
-- Menú digital - Fase 1
-- Esquema inicial de la base de datos
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- Función que actualiza automáticamente la columna actualizado_en
-- cada vez que se modifica un registro
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



-- -------------------------------------------------------------
-- NEGOCIOS: cada tienda que usa el sistema
-- -------------------------------------------------------------
CREATE TABLE negocios (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre            VARCHAR(120) NOT NULL,
    slug              VARCHAR(80)  NOT NULL UNIQUE,
    logo_url          TEXT,
    color_primario    VARCHAR(7)   NOT NULL DEFAULT '#6B4F3A',
    color_secundario  VARCHAR(7)   NOT NULL DEFAULT '#F5EFE6',
    whatsapp          VARCHAR(20),
    direccion         TEXT,
    activo            BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_en         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    actualizado_en    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    -- solo minúsculas, números y guiones: "frappes-la-esquina"
    CONSTRAINT chk_negocios_slug
        CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    -- colores en formato hexadecimal: "#6B4F3A"
    CONSTRAINT chk_negocios_color_primario
        CHECK (color_primario ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT chk_negocios_color_secundario
        CHECK (color_secundario ~ '^#[0-9A-Fa-f]{6}$')
);


-- -------------------------------------------------------------
-- HORARIOS: horario de atención por día de la semana
-- (0 = domingo, 6 = sábado). Se permiten varios turnos por día.
-- -------------------------------------------------------------
CREATE TABLE horarios (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    negocio_id      BIGINT      NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    dia_semana      SMALLINT    NOT NULL,
    hora_apertura   TIME        NOT NULL,
    hora_cierre     TIME        NOT NULL,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_horarios_dia   CHECK (dia_semana BETWEEN 0 AND 6),
    CONSTRAINT chk_horarios_horas CHECK (hora_cierre > hora_apertura)
);

CREATE INDEX idx_horarios_negocio ON horarios (negocio_id);


-- -------------------------------------------------------------
-- USUARIOS: superadmin, dueños y empleados
-- -------------------------------------------------------------
CREATE TABLE usuarios (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    negocio_id      BIGINT       REFERENCES negocios(id) ON DELETE CASCADE,
    nombre          VARCHAR(120) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    password_hash   TEXT         NOT NULL,
    rol             VARCHAR(20)  NOT NULL,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_usuarios_rol
        CHECK (rol IN ('superadmin', 'dueno', 'empleado')),
    -- el superadmin no pertenece a ningún negocio;
    -- dueños y empleados siempre pertenecen a uno
    CONSTRAINT chk_usuarios_negocio
        CHECK (
            (rol = 'superadmin' AND negocio_id IS NULL)
            OR (rol <> 'superadmin' AND negocio_id IS NOT NULL)
        )
);

-- correo único sin importar mayúsculas: Juan@x.com = juan@x.com
CREATE UNIQUE INDEX uq_usuarios_email ON usuarios (LOWER(email));
CREATE INDEX idx_usuarios_negocio ON usuarios (negocio_id);


-- -------------------------------------------------------------
-- CATEGORIAS: frappés, licuados, smoothies...
-- -------------------------------------------------------------
CREATE TABLE categorias (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    negocio_id      BIGINT      NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    nombre          VARCHAR(80) NOT NULL,
    orden           INTEGER     NOT NULL DEFAULT 0,
    activa          BOOLEAN     NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_categorias_nombre UNIQUE (negocio_id, nombre),
    -- necesaria para que productos pueda validar que la categoría
    -- pertenece al mismo negocio
    CONSTRAINT uq_categorias_id_negocio UNIQUE (id, negocio_id)
);


-- -------------------------------------------------------------
-- PRODUCTOS: cada bebida del menú
-- -------------------------------------------------------------
CREATE TABLE productos (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    negocio_id      BIGINT       NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    categoria_id    BIGINT       NOT NULL,
    nombre          VARCHAR(120) NOT NULL,
    descripcion     TEXT,
    imagen_url      TEXT,
    estado          VARCHAR(20)  NOT NULL DEFAULT 'disponible',
    orden           INTEGER      NOT NULL DEFAULT 0,
    creado_en       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_productos_estado
        CHECK (estado IN ('disponible', 'agotado', 'oculto')),
    -- la categoría debe ser del MISMO negocio que el producto.
    -- No se puede borrar una categoría que todavía tiene productos.
    CONSTRAINT fk_productos_categoria
        FOREIGN KEY (categoria_id, negocio_id)
        REFERENCES categorias (id, negocio_id),
    CONSTRAINT uq_productos_id_negocio UNIQUE (id, negocio_id)
);

CREATE INDEX idx_productos_categoria ON productos (categoria_id, negocio_id);
CREATE INDEX idx_productos_negocio   ON productos (negocio_id);


-- -------------------------------------------------------------
-- VARIANTES: tamaños y precios de cada producto.
-- Si el producto tiene un solo precio, tendrá una variante "Único".
-- -------------------------------------------------------------
CREATE TABLE variantes (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    producto_id     BIGINT        NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    nombre          VARCHAR(50)   NOT NULL DEFAULT 'Único',
    precio          NUMERIC(10,2) NOT NULL,
    orden           INTEGER       NOT NULL DEFAULT 0,
    creado_en       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_variantes_precio CHECK (precio >= 0),
    CONSTRAINT uq_variantes_nombre  UNIQUE (producto_id, nombre)
);


-- -------------------------------------------------------------
-- EXTRAS: crema, shot de café, toppings...
-- -------------------------------------------------------------
CREATE TABLE extras (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    negocio_id      BIGINT        NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    nombre          VARCHAR(80)   NOT NULL,
    precio          NUMERIC(10,2) NOT NULL,
    activo          BOOLEAN       NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_extras_precio    CHECK (precio >= 0),
    CONSTRAINT uq_extras_nombre     UNIQUE (negocio_id, nombre),
    CONSTRAINT uq_extras_id_negocio UNIQUE (id, negocio_id)
);


-- -------------------------------------------------------------
-- PRODUCTO_EXTRAS: qué extras se pueden agregar a qué producto
-- (relación muchos a muchos). Producto y extra deben ser
-- del mismo negocio.
-- -------------------------------------------------------------
CREATE TABLE producto_extras (
    producto_id  BIGINT NOT NULL,
    extra_id     BIGINT NOT NULL,
    negocio_id   BIGINT NOT NULL,

    PRIMARY KEY (producto_id, extra_id),
    CONSTRAINT fk_pe_producto
        FOREIGN KEY (producto_id, negocio_id)
        REFERENCES productos (id, negocio_id) ON DELETE CASCADE,
    CONSTRAINT fk_pe_extra
        FOREIGN KEY (extra_id, negocio_id)
        REFERENCES extras (id, negocio_id) ON DELETE CASCADE
);

CREATE INDEX idx_producto_extras_extra ON producto_extras (extra_id);


-- -------------------------------------------------------------
-- Triggers para mantener actualizado_en al día
-- -------------------------------------------------------------
CREATE TRIGGER trg_negocios_actualizado
    BEFORE UPDATE ON negocios
    FOR EACH ROW EXECUTE FUNCTION set_actualizado_en();

CREATE TRIGGER trg_horarios_actualizado
    BEFORE UPDATE ON horarios
    FOR EACH ROW EXECUTE FUNCTION set_actualizado_en();

CREATE TRIGGER trg_usuarios_actualizado
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION set_actualizado_en();

CREATE TRIGGER trg_categorias_actualizado
    BEFORE UPDATE ON categorias
    FOR EACH ROW EXECUTE FUNCTION set_actualizado_en();

CREATE TRIGGER trg_productos_actualizado
    BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION set_actualizado_en();

CREATE TRIGGER trg_variantes_actualizado
    BEFORE UPDATE ON variantes
    FOR EACH ROW EXECUTE FUNCTION set_actualizado_en();

CREATE TRIGGER trg_extras_actualizado
    BEFORE UPDATE ON extras
    FOR EACH ROW EXECUTE FUNCTION set_actualizado_en();

COMMIT;
