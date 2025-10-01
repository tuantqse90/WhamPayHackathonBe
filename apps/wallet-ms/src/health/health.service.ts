import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { HealthResponseDto, HealthStatus } from './models';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectConnection() private readonly mongoConnection: Connection
  ) {}

  async check(): Promise<HealthResponseDto> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkMemory(),
    ]);

    const dbCheck = checks[0];
    const memoryCheck = checks[1];

    const isHealthy =
      dbCheck.status === 'fulfilled' &&
      dbCheck.value &&
      memoryCheck.status === 'fulfilled' &&
      memoryCheck.value;

    return {
      status: isHealthy ? HealthStatus.UP : HealthStatus.DOWN,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: dbCheck.status === 'fulfilled' && dbCheck.value,
        memory: memoryCheck.status === 'fulfilled' && memoryCheck.value,
      },
    };
  }

  async readiness(): Promise<HealthResponseDto> {
    // For readiness, we check if all external dependencies are available
    const dbHealthy = await this.checkDatabase();

    return {
      status: dbHealthy ? HealthStatus.UP : HealthStatus.DOWN,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: dbHealthy,
      },
    };
  }

  async liveness(): Promise<HealthResponseDto> {
    // For liveness, we just check if the application is running
    return {
      status: HealthStatus.UP,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        application: true,
      },
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      // Check MongoDB connection
      if (this.mongoConnection.readyState !== 1) {
        this.logger.warn('MongoDB connection is not ready');
        return false;
      }

      // Perform a simple ping to ensure the database is responsive
      await this.mongoConnection.db.admin().ping();
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return false;
    }
  }

  private async checkMemory(): Promise<boolean> {
    try {
      const memoryUsage = process.memoryUsage();
      const maxMemory = 1024 * 1024 * 1024; // 1GB threshold
      
      if (memoryUsage.heapUsed > maxMemory) {
        this.logger.warn(`High memory usage: ${memoryUsage.heapUsed} bytes`);
        return false;
      }
      
      return true;
    } catch (error) {
      this.logger.error('Memory health check failed:', error);
      return false;
    }
  }
} 