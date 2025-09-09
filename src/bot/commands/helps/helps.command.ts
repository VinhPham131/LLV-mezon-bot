import { CommandMessage } from 'src/bot/base/command.abstract';
import { Command } from 'src/bot/base/commandRegister.decorator';
import { ChannelMessage, EMarkdownType } from 'mezon-sdk';
import { MezonClientService } from 'src/mezon/client.service';
import { CommandStorage } from 'src/bot/base/storage';


@Command('helps')
export class HelpsCommand extends CommandMessage {
  constructor(clientService: MezonClientService) {
    super(clientService);
  }

  async execute(args: string[], message: ChannelMessage) {
    const messageChannel = await this.getChannelMessage(message);

    const allCommands = CommandStorage.getAllCommands();
    const allCommandKeys = Array.from(allCommands.keys());
    const messageContent =
      'BaiCao - Help Menu' +
      '\n' +
      '• BaiCao (' +
      allCommandKeys.length +
      ')' +
      '\n' +
      allCommandKeys.join(', ');
    const messageSent = await messageChannel?.reply({
      t: messageContent,
      mk: [{ type: EMarkdownType.PRE, s: 0, e: messageContent.length }],
    });
    return messageSent;
  }
}
