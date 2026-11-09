# Agente de pedidos para restaurante

MVP web mobile-first para consultar el menú diario, registrar pedidos y enviar una comanda PDF por correo. El frontend usa React y Vite; el backend usa Node.js y Express, con Google Sheets para datos y Gmail para el envío.

## Requisitos

- Node.js 20 o superior
- npm
- Credenciales configuradas en `.env` (ver `.env.example`)

## Instalación y arranque

Desde la raíz del proyecto, instala las dependencias con `npm install`. Para arrancar frontend y backend juntos usa `npm run dev`. También puedes ejecutarlos por separado:

```bash
cd backend
npm install
npm run dev
```

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`. Backend: `http://localhost:3001`.

> Los comandos de arranque quedarán operativos al implementar los puntos de entrada de cada aplicación.

