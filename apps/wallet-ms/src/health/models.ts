import { ApiProperty } from '@nestjs/swagger';

export enum HealthStatus {
  UP = 'UP',
  DOWN = 'DOWN',
}

export class HealthResponseDto {
  @ApiProperty({
    enum: HealthStatus,
    description: 'Overall health status',
    example: HealthStatus.UP,
  })
  status: HealthStatus;

  @ApiProperty({
    description: 'Timestamp of the health check',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Application uptime in seconds',
    example: 3600,
  })
  uptime: number;

  @ApiProperty({
    description: 'Application version',
    example: '1.0.0',
  })
  version: string;

  @ApiProperty({
    description: 'Environment the application is running in',
    example: 'production',
  })
  environment: string;

  @ApiProperty({
    description: 'Individual health check results',
    example: {
      database: true,
      memory: true,
      application: true,
    },
  })
  checks: Record<string, boolean>;
} 