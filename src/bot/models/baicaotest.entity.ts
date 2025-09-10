import { Column, Entity, Index, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { TABLE } from '../constants/tables';

@Index(['id', 'deleted'])
@Entity(TABLE.BAICAO_GAME)
export class BaiCaoGame {
  @PrimaryGeneratedColumn()
  id: number;

  // ID của người chơi (Discord user ID hoặc ID trong DB)
  @Column({ nullable: false })
  playerId: string;

  // Bộ bài gồm 3 lá, lưu JSON
  @Column({ type: 'jsonb', nullable: false })
  cards: string[];

  // Điểm cuối cùng (0-9 nút hoặc giá trị đặc biệt như "3 tiên")
  @Column({ type: 'numeric', nullable: false })
  score: number;

  // Kết quả: win / lose / draw
  @Column({ type: 'text', nullable: false })
  result: string;

  // Tổng tiền cược của người chơi trong ván này
  @Column({ type: 'numeric', nullable: false })
  betAmount: number;

  // Thời điểm tạo bản ghi
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  // Đánh dấu đã bị xóa (soft delete)
  @Column({ default: false })
  deleted: boolean;
}
