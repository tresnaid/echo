import { createApp } from './app';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const { app, db } = createApp();

const server = app.listen(PORT, HOST, () => {
  console.log(`[Echo Server] API server listening on http://${HOST}:${PORT}`);
});

function gracefulShutdown() {
  console.log('[Echo Server] Shutting down gracefully...');
  server.close(() => {
    db.close();
    console.log('[Echo Server] Database connection closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
