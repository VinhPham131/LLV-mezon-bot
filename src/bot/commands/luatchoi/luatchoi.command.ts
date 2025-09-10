import { CommandMessage } from 'src/bot/base/command.abstract';
import { Command } from 'src/bot/base/commandRegister.decorator';
import { ChannelMessage, EMarkdownType } from 'mezon-sdk';
import { MezonClientService } from 'src/mezon/client.service';
import { CommandStorage } from 'src/bot/base/storage';


@Command('luatchoi')
export class LuatchoiCommand extends CommandMessage {
  constructor(clientService: MezonClientService) {
    super(clientService);
  }

  async execute(args: string[], message: ChannelMessage) {
    const messageChannel = await this.getChannelMessage(message);

    const allCommands = CommandStorage.getAllCommands();
    const allCommandKeys = Array.from(allCommands.keys());
    const messageContent = `BaiCao - luatchoi
      Người dùng nộp tiền vào bot để có thể chơi
      Phí ván chơi:
      - Tối thiểu: 1k
      - Tối đa: 200k
      - Maximum: 3tr4
      - Hơn 5tr là công an bắt quy tội hình sự =))

      Người dùng nhắn *Baicao để tạo ván chơi*

      - Hướng 1: Người host nhập time kết thúc ván đấu:
      + Form sẽ bao gồm: Số tiền cược (người host nhập), time limit (vd: người host nhập 3’ thì ván đấu sẽ chỉ được mở trong 3’), nút Cancel và nút "Bắt đầu" cho người host hoặc "Tham gia" cho người chơi khác.
      + Hết 3’ sẽ chốt người chơi và bắt đầu chia bài hiển thị ra bài của mình và bài của người chiến thắng + bên dưới là bài của những người tham gia khác

      • BaiCao (${allCommandKeys.length})
      ${allCommandKeys.join(', ')}`;

    const messageSent = await messageChannel?.reply({
      t: messageContent,
      mk: [{ type: EMarkdownType.PRE, s: 0, e: messageContent.length }],
    });
    return messageSent;
  }
}
