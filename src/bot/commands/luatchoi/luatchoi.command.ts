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
    const messageContent = `Luật Chơi Bài Cào (Ba Cây)
      Mệnh giá đặt cược
      Tối thiểu: 1,000
      Tối đa: 50,000
      Số người chơi tối đa trong 1 bàn: 20
      Cách tham gia
      Nhập lệnh *baicao để bắt đầu.
      Host sẽ chọn:
      - Mệnh giá cược
      - Số lượng người chơi (≤ 20)
      Sau khi host bấm bắt đầu, hệ thống sẽ mở poll cho người chơi tham gia.
      Nếu số người chơi tham gia đạt đủ giới hạn, hệ thống sẽ tự động chia bài sau 5 giây.
      Cách xét bài & thứ tự ưu tiên thắng
      Mỗi người được chia 3 lá bài. Luật so sánh như sau (ưu tiên từ cao xuống thấp):
      1. **Sam (3 lá giống nhau)**  
        Ví dụ: ♥️7 ♥️7 ♥️7
      2. **3 Tiên**  
        Ví dụ: ♠️J ♥️Q ♦️K
      3. **Điểm đôi**  
        Ví dụ:
        ♦️8 ♠️8 ♥️3 → 9 điểm đôi 8  
        ♦️9 ♠️9 ♥️1 → 9 điểm đôi 9  
        → 9 điểm đôi 9 > 9 điểm đôi 8
      4. **Điểm (tổng nút 3 lá, chỉ tính hàng đơn vị)**  
        - Các lá từ 2 → 9 giữ nguyên giá trị.  
        - 10, J, Q, K tính = 0 điểm.  
        - A tính = 1 điểm.  
        - Điểm cao nhất là 9 nút.  
        Ví dụ: ♦️2 ♥️7 ♣️K → 2 + 7 + 0 = 9 nút.
      Nếu bằng điểm, bằng đôi thì so chất theo thứ tự ưu tiên:  
      ♥️ Cơ > ♦️ Rô > ♣️ Chuồn > ♠️ Bích
      `;

      console.log(messageContent);

    const messageSent = await messageChannel?.reply({
      t: messageContent,
      mk: [{ type: EMarkdownType.PRE, s: 0, e: messageContent.length }],
    });
    return messageSent;
  }
}
