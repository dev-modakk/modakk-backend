import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { connectDB, closeDB } from './config/database';
import { specs, swaggerUiOptions } from './config/swagger';

import kidsGiftBoxRoutes from "./routes/kids-gift-box.route";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';


app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});


app.use(`/api/${API_VERSION}/kids-gift-boxes`, kidsGiftBoxRoutes);


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));


app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Node.js PostgreSQL API',
    version: API_VERSION,
    documentation: '/api-docs',
    health: '/health',
    endpoints: {
      kidsGiftBoxes: `/api/${API_VERSION}/kids-gift-boxes`
    }
  });
});


app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.originalUrl,
  });
});


app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
});


const startServer = async (): Promise<void> => {
  try {

    await connectDB();
    console.log('✅ Database connected successfully');

    const server = app.listen(PORT, () => {
      console.log('🚀 Server started successfully!');
      console.log(`📍 Server running on: http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`🎁 Kids Gift Boxes API: http://localhost:${PORT}/api/${API_VERSION}/kids-gift-boxes`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    const gracefulShutdown = async (signal: string): Promise<void> => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('✅ HTTP server closed');

        try {

          await closeDB();
          console.log('✅ Database connections closed');
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });


      setTimeout(() => {
        console.error('❌ Graceful shutdown timed out, forcing exit');
        process.exit(1);
      }, 30000);
    };


    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error('❌ Fatal error during startup:', error);
    process.exit(1);
  });
}

export default app;