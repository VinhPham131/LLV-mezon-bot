import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { BotGateway } from './events/bot.gateway';
import { BaicaoCommand } from '../commands/casino/baicao.command';
import { CommandBase } from './base/command.handle';
import { ListenerChannelMessage } from '../listeners/onChannelMessage.listener';

@Module({
  imports: [DiscoveryModule],
  providers: [BotGateway, BaicaoCommand, CommandBase, ListenerChannelMessage],
  controllers: [],
})
export class BotModule {}
