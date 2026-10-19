-- Base D1 de MiraKel Ventas: una fila por venta, gasto o ajuste.
-- "borrado" marca los registros eliminados para que otro dispositivo no los vuelva a crear;
-- "editado" (milisegundos) decide qué versión gana cuando dos dispositivos cambian el mismo registro.
CREATE TABLE IF NOT EXISTS registros (
  coleccion TEXT NOT NULL,
  id TEXT NOT NULL,
  datos TEXT,
  borrado INTEGER NOT NULL DEFAULT 0,
  editado INTEGER NOT NULL,
  usuario TEXT,
  PRIMARY KEY (coleccion, id)
);
