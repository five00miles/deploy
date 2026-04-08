import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { LoggerModule } from './logger/logger.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [LoggerModule, PrismaModule, HealthModule, UsersModule],
})
export class AppModule {}
