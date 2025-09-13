import { CommandMessage } from 'src/bot/base/command.abstract';
import { Command } from 'src/bot/base/commandRegister.decorator';
import { ChannelMessage, EMarkdownType } from 'mezon-sdk';
import { MezonClientService } from 'src/mezon/client.service';
import { EMessageComponentType, EButtonMessageStyle } from 'mezon-sdk';
import { InjectRepository } from '@nestjs/typeorm';
import { MezonBotMessage } from 'src/bot/models/mezonBotMeassage.entity';
import { Repository } from 'typeorm';
import { User } from 'src/bot/models/user.entity';
import { UserCacheService } from 'src/bot/services/user-cache.service';

@Command('baicao')
export class BaicaoCommand extends CommandMessage {
  constructor(
    clientService: MezonClientService,
    @InjectRepository(MezonBotMessage)
    private mezonBotMessageRepository: Repository<MezonBotMessage>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private userCacheService: UserCacheService,
  ) {
    super(clientService);
  }

  async execute(args: string[], message: ChannelMessage) {
    const messageChannel = await this.getChannelMessage(message);
    const messageid = message.message_id;

    const embed: any = [
      {
        title: `[Bài Cào]`,
        fields: [
          {
            name: 'Tiền cược:',
            value: '',
            inputs: {
              id: `baicao-${messageid}-amount-ip`,
              type: EMessageComponentType.INPUT,
              component: {
                id: `baicao-${messageid}-amount-plhder`,
                required: true,
                defaultValue: 10000,
                type: 'number',
              },
            },
          },
          {
            name: 'Số người chơi:',
            value: '',
            inputs: {
              id: `player-${messageid}-numPlayer`,
              type: EMessageComponentType.INPUT,
              component: {
                id: `player-${messageid}-numPlayer-plhder`,
                required: true,
                defaultValue: 1,
                type: 'number',
              },
            },
          },
        ],
        timestamp: new Date().toISOString(),
        footer: 'Powered by LLV Bot',
      },
    ];

    const components = [
      {
        components: [
          {
            id: `baicao_CANCEL_${message.sender_id}_${messageid}`,
            type: EMessageComponentType.BUTTON,
            component: {
              label: `Cancel`,
              style: EButtonMessageStyle.SECONDARY,
            },
          },
          {
            id: `baicao_SUBMITCREATE_${message.sender_id}_${messageid}`,
            type: EMessageComponentType.BUTTON,
            component: {
              label: `Bắt đầu`,
              style: EButtonMessageStyle.SUCCESS,
            },
          },
        ],
      },
    ];

    const mess = await messageChannel?.reply({
      embed,
      components,
    });
    if (!mess) return;
    const dataMezonBotMessage = {
      messageId: mess.message_id,
      userId: message.sender_id,
      clanId: message.clan_id,
      isChannelPublic: message.is_public,
      modeMessage: message.mode,
      channelId: message.channel_id,
      createAt: Date.now(),
    };
    await this.mezonBotMessageRepository.insert(dataMezonBotMessage);
    return;
  }
}