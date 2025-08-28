import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { RoundsController } from './rounds.controller';
import { PrismaService } from './prisma.service';
import { RedisService } from './redis.service';
import { AuthMiddleware } from './auth.middleware';

@Module({
  controllers: [AuthController, RoundsController],
  providers: [PrismaService, RedisService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}

