# MiraKel Ventas

App de ventas, gastos y resumen del mes de MiraKel Accesorios.

- **Ventas:** artículo, piezas, monto, método de pago y lugar de venta. A las ventas con tarjeta se les descuenta solo el 4.5% de comisión de la terminal.
- **Gastos:** tipo (Empaques, Joyería, Insumo Café), monto y método de pago.
- **Resumen:** utilidad, margen, ventas por día, por método y por lugar, y gastos por tipo.

Se entra con usuario y contraseña. Las ventas, gastos y ajustes se guardan en el teléfono y se suben solos a Cloudflare (Worker + base D1), así que se ven en todos los dispositivos; sin internet se sigue trabajando y los cambios se suben al volver la conexión. La configuración de Cloudflare está en [`cloudflare/README.md`](cloudflare/README.md).

Cuando se publica una versión nueva (cambia `version.js`), la app muestra un aviso para actualizar.

## Publicar en GitHub Pages
1. Sube todos estos archivos a la raíz del repositorio.
2. Ve a **Settings → Pages → Deploy from a branch** y elige **main** y **/ (root)**.
