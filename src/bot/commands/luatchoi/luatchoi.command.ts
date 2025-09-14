import { CommandMessage } from 'src/bot/base/command.abstract';
import { Command } from 'src/bot/base/commandRegister.decorator';
import { ChannelMessage, EMarkdownType } from 'mezon-sdk';
import { MezonClientService } from 'src/mezon/client.service';
import { CommandStorage } from 'src/bot/base/storage';


@Command('luatchoi')
export class LuatChoiCommand extends CommandMessage {
  constructor(clientService: MezonClientService) {
    super(clientService);
  }

  async execute(args: string[], message: ChannelMessage) {
    const messageChannel = await this.getChannelMessage(message);
    const messageContent = `🎴 LUẬT CHƠI BÀI CÀO (BA CÂY) 🎴
      💰 Mệnh Giá Đặt Cược
      - Tối thiểu: \`1,000\`  
      - Tối đa: \`50,000\`  
      - Số người chơi tối đa trong 1 bàn: \`17\`
      🕹️ Cách Tham Gia
      - Nhập lệnh \`*baicao\`để bắt đầu.
      Host sẽ chọn:
      - Mệnh giá cược 💵
      - Số lượng người chơi (≤ 17)
      -> Sau khi host bấm bắt đầu,hệ thống sẽ mở poll cho người chơi tham gia.  
      -> Nếu số lượng người tham gia đạt giới hạn, hệ thống sẽ tự động chia bài sau 5 giây. ⏳
      🃏 Cách Xét Bài & Thứ Tự Ưu Tiên Thắng
      Mỗi người được chia 3 lá bài.  
      So sánh bài theo thứ tự từ cao → thấp:
       1. Sam (3 lá giống nhau)  
      -> Ví dụ: ♥️7 ♥️7 ♥️7
       2. 3 Tiên 
      -> Ví dụ: ♠️J ♥️Q ♦️K
       3. Điểm Đôi
      -> Ví dụ:
      -> ♦️8 ♠️8 ♥️3 → 9 điểm đôi 8
      -> ♦️9 ♠️9 ♥️1 → 9 điểm đôi 9
      -> 9 điểm đôi 9 > 9 điểm đôi 8
       4. Điểm (Tổng Nút 3 Lá, Chỉ Tính Hàng Đơn Vị)
      - Các lá từ 2 → 9 giữ nguyên giá trị.  
      - 10, J, Q, K = 0 điểm.  
      - A = 1 điểm.  
      - Điểm cao nhất là 9 nút.
      -> Ví dụ: ♦️2 ♥️7 ♣️K → 2 + 7 + 0 = 9 nút
      🏆 Luật So Chất Khi Bằng Điểm / Bằng Đôi
      -> Thứ tự ưu tiên chất bài:  
      -> ♥️ Cơ > ♦️ Rô > ♣️ Chuồn > ♠️ Bích
      ✨ Mẹo:  
      Chơi có trách nhiệm, đừng để công an mời uống trà nhé! 🚓🤣
      `;
    const messageSent = await messageChannel?.reply({
      t: messageContent,
      mk: [{ type: EMarkdownType.PRE, s: 0, e: messageContent.length }],
    });
    return messageSent;
  }
}
