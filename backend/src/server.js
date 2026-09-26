import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './db.js';

const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('📦 Connected to SQLite database successfully');

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Codeyoung Booking API running on port ${env.PORT}`);
      console.log(`🌐 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 Health check available at: http://localhost:${env.PORT}/api/health`);
    });

    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('✅ Server and database connections closed cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
