# Nube de MiraKel Ventas (Cloudflare)

La app (en GitHub Pages) guarda cada venta y gasto en el teléfono y los sube sola a Cloudflare.
Cloudflare tiene dos piezas:

- **D1**: la base de datos donde quedan las ventas, gastos y la meta.
- **Worker**: el programa que revisa usuario y contraseña y lee/guarda en D1 (`worker.js`).

Todo cabe en el plan gratuito de Cloudflare.

## Configurarlo desde el panel (sin terminal)

1. **Crear la base de datos**
   - Entra a https://dash.cloudflare.com → **Storage & Databases → D1 SQL Database → Create**.
   - Nombre: `mirakel-ventas` → **Create**.
   - Abre la base → pestaña **Console** → pega el contenido de `schema.sql` → **Execute**.

2. **Crear el Worker**
   - **Compute (Workers) → Workers & Pages → Create → Start with Hello World** → nombre `mirakel-ventas` → **Deploy**.
   - **Edit code** → borra todo, pega el contenido de `worker.js` → **Deploy**.

3. **Conectar el Worker con la base**
   - En el Worker: **Settings → Bindings → Add → D1 database**.
   - Variable name: `DB` · Database: `mirakel-ventas` → **Add binding**.

4. **Usuarios y clave secreta** (Worker → **Settings → Variables and Secrets → Add**)
   - `USUARIOS` (tipo **Secret**):
     ```
     {"karina":{"nombre":"Karina","huella":"36cb81a916299a755b2f75885800bcb4e17ec7e71354cfb2c8579024aa9e5150"}}
     ```
   - `TOKEN_SECRET` (tipo **Secret**): un texto largo al azar (por ejemplo, 40 letras y números). No lo compartas.
   - `ORIGEN` (tipo **Text**): `https://mariagascon22.github.io`
   - **Deploy** para aplicar los cambios.

5. **Probar**: abre la dirección del Worker (algo como `https://mirakel-ventas.<tu-cuenta>.workers.dev`).
   Debe mostrar `{"ok":true,"app":"MiraKel Ventas"}`.

6. Pon esa dirección en `NUBE_URL` dentro de `index.html` y publica la app.

## Agregar o cambiar usuarios

Edita el secreto `USUARIOS` en el Worker. La huella es el SHA-256 de `mirakel-ventas|<usuario en minúsculas>|<contraseña>`.
Para calcularla en la consola del navegador:

```js
crypto.subtle.digest('SHA-256', new TextEncoder().encode('mirakel-ventas|karina|Karinarazo'))
  .then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('')))
```

Si quitas a una usuaria de `USUARIOS`, su sesión deja de funcionar en todos sus dispositivos.

## Con terminal (opcional)

```sh
cd cloudflare
npx wrangler d1 create mirakel-ventas        # copia el database_id en wrangler.toml
npx wrangler d1 execute mirakel-ventas --remote --file=schema.sql
npx wrangler secret put USUARIOS
npx wrangler secret put TOKEN_SECRET
npx wrangler deploy
```
