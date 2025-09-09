import { CommandMessage } from 'src/bot/base/command.abstract';
import { Command } from 'src/bot/base/commandRegister.decorator';
import { ChannelMessage } from 'mezon-sdk';
import { MezonClientService } from 'src/mezon/client.service';
import { EMessageComponentType, EButtonMessageStyle } from 'mezon-sdk';

@Command('baicao')
export class BaicaoCommand extends CommandMessage {
  constructor(clientService: MezonClientService) {
    super(clientService);
  }

  async execute(args: string[], message: ChannelMessage) {
    const messageChannel = await this.getChannelMessage(message);

    const messageid = message.message_id;
    const embed: any = [
      {
        color: '#FF69B4',
        title: `[Bai Cao]`,
        fields: [
          {
            name: 'Tiền cược:',
            value: '',
            inputs: {
              id: `lixi-${messageid}-totalAmount-ip`,
              type: EMessageComponentType.INPUT,
              component: {
                id: `lixi-${messageid}-totalAmount-plhder`,
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
              id: `lixi-${messageid}-numLixi`,
              type: EMessageComponentType.INPUT,
              component: {
                id: `lixi-${messageid}-numLixi-plhder`,
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
            id: `lixi_CANCEL_${message.sender_id}_${message.clan_id}_${message.mode}_${message.is_public}_${message.clan_nick || message.username}_${0}_${0}_${messageid}`,
            type: EMessageComponentType.BUTTON,
            component: {
              label: `Cancel`,
              style: EButtonMessageStyle.SECONDARY,
            },
          },
          {
            id: `lixi_SUBMITCREATE_${message.sender_id}_${message.clan_id}_${message.mode}_${message.is_public}_${message.clan_nick || message.username}_${0}_${0}_${messageid}`,
            type: EMessageComponentType.BUTTON,
            component: {
              label: `Chia bài`,
              style: EButtonMessageStyle.SUCCESS,
            },
          },
        ],
      },
    ];

    if (args.length === 0) {
      return await messageChannel?.reply({
        embed,
        components,
      });
    }
  }
}
