# MiraKel Ventas

App de ventas, gastos y resumen del mes de MiraKel Accesorios.

- **Ventas:** artículo, piezas, monto, método de pago y lugar de venta. A las ventas con tarjeta se les descuenta solo el 4.5% de comisión de la terminal.
- **Gastos:** tipo (Empaques, Joyería, Insumo Café), monto y método de pago.
- **Resumen:** utilidad, margen, ventas por día, por método y por lugar, y gastos por tipo.

Los datos se guardan en Supabase, en las tablas `ventas` y `gastos`, protegidas por inicio de sesión.

## Publicar en GitHub Pages
1. Sube todos estos archivos a la raíz del repositorio.
2. Ve a **Settings → Pages → Deploy from a branch** y elige **main** y **/ (root)**.
