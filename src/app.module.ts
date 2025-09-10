import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import Joi from 'joi';
import { MezonModule } from './mezon/mezon.module';
import { BotModule } from './bot/bot.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaiCaoGame } from './bot/models/baicaotest.entity';

@Module({
  imports: [
    // Config global
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Event emitter
    EventEmitterModule.forRoot(),

    // TypeORM config qua env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        autoLoadEntities: true, // Tự động load entities
        synchronize: false,     // Luôn false trong production
      }),
    }),

    // Mezon bot
    MezonModule.forRootAsync({
      imports: [ConfigModule],
    }),

    // Bot module
    BotModule,

    // BaiCaoGame entity
    TypeOrmModule.forFeature([BaiCaoGame]),
  ],
})
export class AppModule {}
