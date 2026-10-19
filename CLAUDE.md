# Instrucciones para Claude

## Flujo de trabajo
- Después de cada cambio: haz commit, push, abre un PR y haz merge a `main` sin preguntar. La dueña del repositorio dio permiso para hacer merges sin revisión.
- `main` se publica en GitHub Pages, así que hacer merge a `main` es publicar.
- Antes de hacer merge, verifica que el JavaScript no tenga errores de sintaxis (`node --check`) y que la página cargue sin errores en el navegador.
- Escribe los PR y las respuestas en español.

## Proyecto
- App estática sin compilación: `index.html` (HTML, CSS y JS en un solo archivo), `sw.js` (service worker), `version.js`. Se publica en GitHub Pages.
- La nube es Cloudflare: `cloudflare/worker.js` (Worker: `/login` y `/sync`) y `cloudflare/schema.sql` (base D1, tabla `registros`). Guía de configuración en `cloudflare/README.md`. Los cambios al Worker los publica la dueña desde el panel de Cloudflare; dile qué pegar.
- La app guarda primero en `localStorage` y, si `NUBE_URL` (en `index.html`) tiene la dirección del Worker, sube los cambios pendientes y baja todos los datos. Cada registro lleva `editado`; en el servidor gana el más reciente y los eliminados quedan marcados (`borrado`) para que no reaparezcan. Si `NUBE_URL` está vacía, la app funciona solo en el dispositivo con la lista `USUARIOS` de `index.html`.
- Usuarios: con nube, en el secreto `USUARIOS` del Worker. La contraseña se guarda como huella SHA-256 de `mirakel-ventas|<usuario en minúsculas>|<contraseña>`, nunca en texto.
- Con cada cambio que se publique, sube `APP_VERSION` y `APP_FECHA` en `version.js` (se muestran al final de Ajustes): el último número para correcciones, el de en medio para funciones nuevas. Ese cambio es el que hace que los teléfonos muestren el aviso de nueva versión.
- Si agregas archivos que la app necesita sin internet, agrégalos a `ARCHIVOS` en `sw.js`.
- Para probar la nube sin Cloudflare: corre `worker.js` en Node con `node:sqlite` imitando D1 y pon `NUBE_URL` a ese servidor en una copia de la app.
