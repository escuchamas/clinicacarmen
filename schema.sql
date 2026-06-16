-- Esquema completo · Clínica Carmen · Fisioterapia
-- Ejecuta en Neon: console.neon.tech → SQL Editor

CREATE TABLE IF NOT EXISTS pacientes (
  id               TEXT PRIMARY KEY,
  dni              TEXT NOT NULL,
  nombre           TEXT NOT NULL,
  apellidos        TEXT NOT NULL,
  email            TEXT,
  telefono         TEXT,
  fecha_nacimiento DATE,
  poblacion        TEXT,
  fecha_alta       DATE NOT NULL DEFAULT CURRENT_DATE,
  lopd_firmada     BOOLEAN NOT NULL DEFAULT FALSE,
  lopd_fecha       DATE
);

CREATE TABLE IF NOT EXISTS historia_clinica (
  id                                  SERIAL PRIMARY KEY,
  paciente_id                         TEXT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  profesion                           TEXT,
  alergias                            TEXT,
  ejercicio_fisico                    TEXT,
  motivo_consulta                     TEXT,
  antecedentes_personales_familiares  TEXT,
  calidad_sueno                       TEXT,
  patologias                          TEXT,
  tabaquismo                          TEXT,
  medicacion                          TEXT,
  implantes_metalicos                 TEXT,
  embarazo_lactancia                  TEXT,
  semanas_embarazo                    TEXT,
  banderas_rojas                      JSONB DEFAULT '[]',
  prueba_tipo                         TEXT,
  prueba_fecha                        DATE,
  prueba_diagnostico                  TEXT,
  prueba_imagen_url                   TEXT,
  fecha_creacion                      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(paciente_id)
);

CREATE TABLE IF NOT EXISTS tratamiento_evolucion (
  id             TEXT PRIMARY KEY,
  paciente_id    TEXT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  fecha          DATE NOT NULL DEFAULT CURRENT_DATE,
  n_sesion       INTEGER NOT NULL,
  contenido      TEXT,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS informe_post_sesion (
  id             TEXT PRIMARY KEY,
  paciente_id    TEXT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  sesion_id      TEXT NOT NULL REFERENCES tratamiento_evolucion(id) ON DELETE CASCADE,
  fecha          DATE NOT NULL DEFAULT CURRENT_DATE,
  ejercicios     JSONB DEFAULT '[]',
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS citas (
  id             TEXT PRIMARY KEY,
  paciente_id    TEXT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  fecha          DATE NOT NULL,
  hora           TIME NOT NULL,
  duracion       INTEGER NOT NULL DEFAULT 60,
  motivo         TEXT,
  estado         TEXT NOT NULL DEFAULT 'pendiente',
  notas          TEXT,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS costes (
  id             TEXT PRIMARY KEY,
  fecha          DATE NOT NULL DEFAULT CURRENT_DATE,
  concepto       TEXT NOT NULL,
  importe        NUMERIC(10,2) NOT NULL,
  categoria      TEXT NOT NULL DEFAULT 'otro',
  notas          TEXT,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_citas_fecha         ON citas (fecha);
CREATE INDEX IF NOT EXISTS idx_citas_paciente      ON citas (paciente_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_dni       ON pacientes (LOWER(dni));
CREATE INDEX IF NOT EXISTS idx_pacientes_nombre    ON pacientes (LOWER(nombre));
CREATE INDEX IF NOT EXISTS idx_pacientes_apellidos ON pacientes (LOWER(apellidos));
CREATE INDEX IF NOT EXISTS idx_pacientes_email     ON pacientes (LOWER(email));
