# Instrucciones para Claude

## Flujo de trabajo
- Después de cada cambio: haz commit, push, abre un PR y haz merge a `main` sin preguntar. La dueña del repositorio dio permiso para hacer merges sin revisión.
- `main` se publica en GitHub Pages, así que hacer merge a `main` es publicar.
- Antes de hacer merge, verifica que el JavaScript no tenga errores de sintaxis (`node --check`) y que la página cargue sin errores en el navegador.
- Escribe los PR y las respuestas en español.

## Proyecto
- App estática sin compilación ni servidor: `index.html` (HTML, CSS y JS en un solo archivo), `sw.js` (service worker), `version.js`.
- No usa Supabase ni ninguna base de datos: ventas, gastos y ajustes se guardan en `localStorage` del dispositivo. El respaldo JSON (Ajustes) es la única forma de pasarlos a otro dispositivo.
- Usuarios en `USUARIOS` (`index.html`): la contraseña se guarda como huella SHA-256 de `mirakel-ventas|<usuario en minúsculas>|<contraseña>`, nunca en texto.
- Con cada cambio que se publique, sube `APP_VERSION` y `APP_FECHA` en `version.js` (se muestran al final de Ajustes): el último número para correcciones, el de en medio para funciones nuevas. Ese cambio es el que hace que los teléfonos muestren el aviso de nueva versión.
- Si agregas archivos que la app necesita sin internet, agrégalos a `ARCHIVOS` en `sw.js`.
