# Agente de pedidos para restaurante

Aplicación web para consultar el menú del día, registrar pedidos, guardar comandas en Google Sheets y enviarlas como PDF por Gmail.

## Requisitos

- Node.js 20 o superior y npm.
- `.env` configurado a partir de `.env.example`.
- JSON de una cuenta de servicio de Google con acceso a los dos documentos.
- Contraseña de aplicación Gmail y correo destinatario para enviar comandas.

## Preparar y ejecutar

Desde esta carpeta, instala las dependencias y arranca frontend y backend:

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. El backend usa `http://localhost:3001`; también puedes comprobarlo en `http://localhost:3001/api/health`.

Al abrir la página se consulta el menú de Google Sheets. Para probar un pedido real, agrega platos, completa nombre, dirección y teléfono ecuatoriano (`09XXXXXXXX` o `+5939XXXXXXXX`) y confirma. El pedido se guarda en Sheets y se envía en PDF por correo si Gmail está configurado.

## Hoja del menú

La primera pestaña del documento indicado por `GOOGLE_SHEET_MENU_ID` debe tener encabezados en la primera fila. Se requieren `Nombre` y `Precio`. Son opcionales `Descripción`, `Categoría` y `Disponible`. La pestaña del documento `GOOGLE_SHEET_PEDIDOS_ID` recibe las comandas; si está vacía, se crean sus encabezados. Si ya tiene filas, la primera debe contener `ID`, `Fecha`, `Nombre`, `Dirección`, `Teléfono`, `Detalle`, `Total` y `Estado`, en ese orden.

No publiques `.env` ni la carpeta `credentials/`.
