import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotGateway } from './events/bot.gateway';
import { BaicaoCommand } from './commands/casino/baicao.command';
import { CommandBase } from './base/command.handle';
import { ListenerChannelMessage } from './listeners/onChannelMessage.listener';
import { HelpsCommand } from 'src/bot/commands/helps/helps.command';
import { RutCommand } from './commands/casino/rut.command';
import { User } from './models/user.entity';
import { BlockRut } from './models/blockrut.entity';
import { UserCacheService } from './services/user-cache.service';
import { RedisCacheService } from './services/redis-cache.service';
import { ExtendersService } from './services/extenders.services';
import { KTTKCommand } from './commands/casino/kttk.command';
import { ListenerTokenSend } from './listeners/tokensend.handle';

@Module({
  imports: [
    DiscoveryModule,
    TypeOrmModule.forFeature([User, BlockRut]),
  ],
  providers: [
    BotGateway,
    BaicaoCommand,
    CommandBase,
    ListenerChannelMessage,
    HelpsCommand,
    RutCommand,
    UserCacheService,
    RedisCacheService,
    ExtendersService,
    KTTKCommand,
    ListenerTokenSend
  ],
  controllers: [],
})
export class BotModule {}