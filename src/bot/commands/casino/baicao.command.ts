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
const MIN_BET = 1000;
const MAX_BET = 50000;
const MAX_PLAYERS = 20;

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

      let betAmount = Number(args[0]) || MIN_BET;
    let numPlayers = Number(args[1]) || 1;
    const messageContentRangePrice = `💵 Mệnh giá cược phải từ ${MIN_BET.toLocaleString()} đến ${MAX_BET.toLocaleString()}!`;
    const messageContentLimitPerson = `👥 Số người chơi phải ít hơn ${MAX_PLAYERS}!`;

    if (betAmount < MIN_BET || betAmount > MAX_BET) {
      return await messageChannel?.reply({
        t: messageContentRangePrice,
        mk: [{ type: EMarkdownType.PRE, s: 0, e: messageContentRangePrice.length }],
      });
    }
    if (numPlayers < 1 || numPlayers > MAX_PLAYERS) {
      return await messageChannel?.reply({
        t: messageContentLimitPerson,
        mk: [{ type: EMarkdownType.PRE, s: 0, e: messageContentLimitPerson.length }],
      });
    }

    const embed: any = [
      {
        color: '#FF69B4',
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
      lixiResult: [[], 0, []],
    };
    await this.mezonBotMessageRepository.insert(dataMezonBotMessage);
    return;
  }
}