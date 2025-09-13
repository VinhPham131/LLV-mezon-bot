import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { TABLE } from '../constants/tables';

export interface PollResult {
  username: string;
  emoji: string;
}

export interface BaicaoPlayer {
  user_id?: string;
  username: string;
  card?: string[];
}

export interface BaicaoRoom {
  amount: number;
  maxPlayers: number;
  players: BaicaoPlayer[];
  started: boolean;
}

@Index(['messageId', 'channelId', 'userId'])
@Entity(TABLE.MEZON_BOT_MESSAGE)
export class MezonBotMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  messageId: string;

  @Column({ type: 'text', nullable: true })
  userId: string;

  @Column({ type: 'text', nullable: true })
  channelId: string;

  @Column({ type: 'text', nullable: true, default: null })
  content: string;

  @Column('text', { array: true, nullable: true, default: null })
  pollResult: string[];

  @Column({ nullable: true, default: false })
  deleted: boolean;

  @Column({ type: 'decimal', default: null })
  createAt: number;

  @Column({ type: 'decimal', default: null })
  expireAt: number;

  @Column('text', { array: true, nullable: true, default: null })
  roleResult: string[];

  @Column({ type: 'jsonb', nullable: true, default: () => "'{}'" })
  baicaoRoom: BaicaoRoom;
}