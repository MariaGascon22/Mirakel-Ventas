# Instrucciones para Claude

## Flujo de trabajo
- Después de cada cambio: haz commit, push, abre un PR y haz merge a `main` sin preguntar. La dueña del repositorio dio permiso para hacer merges sin revisión.
- `main` se publica en GitHub Pages, así que hacer merge a `main` es publicar.
- Antes de hacer merge, verifica que el JavaScript no tenga errores de sintaxis (`node --check`) y que la página cargue sin errores en el navegador.
- Escribe los PR y las respuestas en español.

## Proyecto
- App estática sin compilación: `index.html` (HTML, CSS y JS en un solo archivo), `sw.js` (service worker), `vendor/supabase.js`.
- Los datos están en Supabase (tablas `ventas` y `gastos`, protegidas con RLS). La misma base la usa la app de apartados.
- Si cambias archivos que el service worker guarda en caché (`ARCHIVOS` en `sw.js`), sube `VERSION` en `sw.js` para que los teléfonos descarguen la versión nueva.
