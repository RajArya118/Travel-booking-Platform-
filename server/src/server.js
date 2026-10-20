const app = require('./app');
const prisma = require('./utils/prisma');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Verify database connectivity
    await prisma.$connect();
    console.log('✓ Successfully connected to PostgreSQL database via Prisma.');

    const server = app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 TravelAI Server listening on port ${PORT}`);
      console.log(`🌍 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`=========================================`);
    });

    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('PostgreSQL connection closed. Process exiting.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start TravelAI server:', error);
    process.exit(1);
  }
};

startServer();
