import { createApp } from './app.js';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const { app, db } = createApp();

const server = app.listen(PORT, HOST, () => {
  console.log(`[Echo Server] API server listening on http://${HOST}:${PORT}`);
});

function gracefulShutdown() {
  console.log('[Echo Server] Shutting down gracefully...');

  // Hard timeout fallback (8s) inside Docker default 10s SIGKILL
  const forceExit = setTimeout(() => {
    console.error('[Echo Server] Forced exit after shutdown timeout.');
    process.exit(1);
  }, 8000);
  forceExit.unref();

  server.close(() => {
    try {
      db.close();
      console.log('[Echo Server] Database connection closed.');
    } catch (err) {
      console.error('[Echo Server] Error closing database connection:', err);
    }
    clearTimeout(forceExit);
    process.exit(0);
  });
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
