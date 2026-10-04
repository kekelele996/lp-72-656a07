import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Get()
  async check() {
    const dbStatus = this.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
      },
      uptime: process.uptime(),
    };
  }
}
