import {
  EButtonMessageStyle,
  EMarkdownType,
  EMessageComponentType,
  MezonClient,
} from 'mezon-sdk';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { User } from 'src/bot/models/user.entity';
import { EmbeddedButtonType } from 'src/bot/constants/config';
import { MezonBotMessage } from 'src/bot/models/mezonBotMeassage.entity';
import { MezonClientService } from 'src/mezon/client.service';
import { UserCacheService } from 'src/bot/services/user-cache.service';
import { MAX_BET, MAX_PLAYERS, MIN_BET } from 'src/bot/constants/constants';

@Injectable()
export class BaicaoService {
  private client: MezonClient;
  private baicaoCanceled: Map<string, boolean> = new Map();

  private baicaoClickQueue: Map<
    string,
    { user_id: string; username: string; timestamp: number }[]
  > = new Map();
  private baicaoProcessingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private baicaoCompleted: Map<string, boolean> = new Map();
  private baicaoProcessing: Map<string, boolean> = new Map();

  constructor(
    @InjectRepository(MezonBotMessage)
    private mezonBotMessageRepository: Repository<MezonBotMessage>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private clientService: MezonClientService,
    private userCacheService: UserCacheService,
  ) {
    this.client = this.clientService.getClient();
  }

  generateButtonComponents(data, baicao?) {
    return [
      {
        components: [
          {
            id: `baicao_CANCEL_${data.sender_id}_${data.clan_id}_${data.mode}_${data.is_public}_${data?.color}_${data.clan_nick || data.username}_${baicao.numPlayer}`,
            type: EMessageComponentType.BUTTON,
            component: {
              label: `Cancel`,
              style: EButtonMessageStyle.SECONDARY,
            },
          },
          {
            id: `baicao_CHIABAI_${data.sender_id}_${data.clan_id}_${data.mode}_${data.is_public}_${data?.color}_${data.clan_nick || data.username}_${baicao.numPlayer}`,
            type: EMessageComponentType.BUTTON,
            component: {
              label: `Chia Bài`,
              style: EButtonMessageStyle.SUCCESS,
            },
          },
        ],
      },
    ];
  }

  async handleSubmitCreate(
    data,
    authId,
    msgId,
    clanId,
    color,
    authorName,
  ) {
    if (data.user_id !== authId) {
      return;
    }

    const channel = await this.client.channels.fetch(data.channel_id);
    const messsage = await channel.messages.fetch(data.message_id);

    let parsedExtraData;

    try {
      parsedExtraData = JSON.parse(data.extra_data);
    } catch (error) {
      const content = 'Invalid form data provided';
      return await messsage.update({
        t: content,
        mk: [{ type: EMarkdownType.PRE, s: 0, e: content.length }],
      });
    }

    const amountStr =parsedExtraData[`baicao-${msgId}-amount-ip`] || '0';
    const numPlayerStr = parsedExtraData[`player-${msgId}-numPlayer`] || '0';


    const amountValue = parseInt(amountStr, 10);
    const numPlayerValue = parseInt(numPlayerStr, 10);

    const messageContentRangePrice = `💵 Mệnh giá cược phải từ ${MIN_BET.toLocaleString()} đến ${MAX_BET.toLocaleString()}!`;
    const messageContentLimitPerson = `👥 Số người chơi phải ít hơn ${MAX_PLAYERS}!`;

    if (amountStr < MIN_BET || amountStr > MAX_BET) {
      return await messsage?.reply({
        t: messageContentRangePrice,
        mk: [{ type: EMarkdownType.PRE, s: 0, e: messageContentRangePrice.length }],
      });
    }
    if (numPlayerStr < 1 || numPlayerStr > MAX_PLAYERS) {
      return await messsage?.reply({
        t: messageContentLimitPerson,
        mk: [{ type: EMarkdownType.PRE, s: 0, e: messageContentLimitPerson.length }],
      });
    }
    const players = [{ user_id: authId, username: authorName }];

    const resultEmbed = {
      color: color,
      title: `[Bài Cào]`,
      fields: [
        {
          name: 'Tiền cược:',
          value: `${amountValue.toLocaleString()}đ`,
        },
        {
          name: 'Số người chơi:',
          value: `1/${numPlayerValue}`,
        },
        {
          name: 'Người tham gia:',
          value: players.map(p => p.username).join(', '),
        },
      ],
    };

    const baicaoDetail = {
      amount: amountValue,
      numPlayer: numPlayerValue,
    };

    const components = this.generateButtonComponents(
      {
        sender_id: authId,
        clan_id: clanId,
        color: color,
        clan_nick: authorName,
        amount: amountValue,
        numPlayer: numPlayerValue,
      },
      baicaoDetail,
    );

    try {
      // const findUser = await this.userCacheService.getUserFromCache(authId);

      // if (!findUser) {
      //   return await messsage.update({
      //     t: EUserError.INVALID_USER,
      //     mk: [
      //       {
      //         type: EMarkdownType.PRE,
      //         s: 0,
      //         e: EUserError.INVALID_USER.length,
      //       },
      //     ],
      //   });
      // }

      // const currentBalance = findUser.amount || 0;
      // if (currentBalance < amountValue || isNaN(currentBalance)) {
      //   return await messsage.update({
      //     t: EUserError.INVALID_AMOUNT,
      //     mk: [
      //       {
      //         type: EMarkdownType.PRE,
      //         s: 0,
      //         e: EUserError.INVALID_AMOUNT.length,
      //       },
      //     ],
      //   });
      // }

      // const balanceResult = await this.userCacheService.updateUserBalance(
      //   authId,
      //   -amountValue,
      //   0,
      //   10,
      // );

      // if (!balanceResult.success) {
      //   const errorMessage = balanceResult.error || 'Failed to update balance';
      //   return await messsage.update({
      //     t: errorMessage,
      //     mk: [
      //       {
      //         type: EMarkdownType.PRE,
      //         s: 0,
      //         e: errorMessage.length,
      //       },
      //     ],
      //   });
      // }

      await messsage.update({
        embed: [resultEmbed],
        components,
      });

      await this.mezonBotMessageRepository.update(
        {
          messageId: data.message_id,
          channelId: data.channel_id,
        },
        {
          baicaoRoom: {
            amount: amountValue,
            maxPlayers: numPlayerValue,
            players: [{ user_id: authId, username: authorName }],
            started: false,
          },
        },
      );
    } catch (error) {
      console.error('Error in handleSubmitCreate:', error);
      const errorMessage = 'Có lỗi xảy ra khi tạo bài cào. Vui lòng thử lại.';
      return await messsage.update({
        t: errorMessage,
        mk: [
          {
            type: EMarkdownType.PRE,
            s: 0,
            e: errorMessage.length,
          },
        ],
      });
    }

    return;
  }

  async handleSelectBaicao(data: any) {
    try {
      const key = `${data.message_id}-${data.channel_id}`;

      const [
        _,
        typeButtonRes,
        authId,
        msgId,
        color,
        clanId,
      ] = data.button_id.split('_');

      if (!data.user_id) return;

      const user = await this.userCacheService.getUserFromCache(data.user_id);

      if (!user) return;

      const message = await this.mezonBotMessageRepository.findOne({
        where: {
          messageId: data.message_id,
          channelId: data.channel_id,
          deleted: false,
        },
      });

      const authorName = user.username;
      if (!message) return;

      switch (typeButtonRes) {
        case EmbeddedButtonType.CANCEL:
          await this.handleCancelBaicao(data, message, authId);
          break;
        case EmbeddedButtonType.SUBMITCREATE:
          await this.handleSubmitCreate(
            data,
            authId,
            msgId,
            clanId,
            color,
            authorName,
          );
          break;
        case EmbeddedButtonType.CHIABAI:
          await this.handleBaicao(
            data,
            key,
            message,
            authId,
            authorName as string,
            message.baicaoRoom,
          );
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error in handleSelectBaicao:', error);
    }
  }

  private async handleCancelBaicao(
    data: any,
    findMessage: any,
    authId: string,
  ) {
    if (data.user_id !== authId) return;

    const key = `${data.message_id}-${data.channel_id}`;
    const amount = findMessage.baicaoRoom.amount;

    this.baicaoCanceled.set(key, true);
    this.markBaicaoCompleted(key);

    try {
      const channel = await this.client.channels.fetch(data.channel_id);
      const messsage = await channel.messages.fetch(data.message_id);

      const textCancel = 'Cancel chơi bài cào thành công ❤️';
      const msgCancel = {
        t: textCancel,
        mk: [{ type: EMarkdownType.PRE, s: 0, e: textCancel.length }],
      };

      await this.mezonBotMessageRepository.update(
        { id: findMessage.id },
        { deleted: true },
      );

      await messsage.update(msgCancel);

      const refundResult = await this.userCacheService.updateUserBalance(
        authId,
        Number(amount),
        0,
        10,
      );

      if (!refundResult.success) {
        console.error('Failed to refund baicao money:', refundResult.error);
      }

      this.cleanupBaicao(key);
    } catch (error) {
      console.error('Error cancelling baicao:', error);
    }
  }

  private async handleBaicao(
    data: any,
    key: string,
    message: any,
    authId: string,
    authorName: string,
    room: any,
  ) {
    if (data.user_id === authId) return;
    if (this.baicaoCanceled.get(key)) return;
    if (this.baicaoCompleted.get(key)) return;
    if (room.started) return;
    if (room.players.length >= room.maxPlayers) return;
    if (room.players.some(p => p.user_id === data.user_id)) return;

    room.players.push({ user_id: data.user_id, username: authorName });

    if (room.players.length === room.maxPlayers) {
      room.started = true;
      // TODO: Xử lý chia bài
    }

    await this.mezonBotMessageRepository.update(
      { id: message.id },
      { baicaoRoom: room },
    );

    await this.updateBaicaoMessage(data, room);
  }

  private async updateBaicaoMessage(data: any, room: any) {
    const channel = await this.client.channels.fetch(data.channel_id);
    if (!channel) return;
    const message = await channel.messages.fetch(data.message_id);
    if (!message) return;

    const embed = {
      color: '#FF69B4',
      title: `[Bài Cào]`,
      fields: [
        { name: 'Tiền cược:', value: `${room.amount.toLocaleString()}đ` },
        { name: 'Số người chơi:', value: `${room.players.length}/${room.maxPlayers}` },
        { name: 'Người tham gia:', value: room.players.map(p => p.username).join(', ') },
      ],
    };

    const amount = room.amount;
    const numPlayer = room.maxPlayers;

    const baicaoDetail = {
      amount: amount,
      numPlayer: numPlayer,
    };

    const components = this.generateButtonComponents(
      {
        sender_id: data.user_id,
        clan_id: data.clan_id,
        mode: 'mode',
        is_public: true,
        color: data.color,
        clan_nick: data.clan_nick || data.username,
        amount,
        numPlayer,
      },
      baicaoDetail,
    );

    await message.update({ embed: [embed], components });
  }

  private markBaicaoCompleted(key: string) {
    this.baicaoCompleted.set(key, true);
    const processingTimeout = this.baicaoProcessingTimeouts.get(key);
    if (processingTimeout) {
      clearTimeout(processingTimeout);
      this.baicaoProcessingTimeouts.delete(key);
    }

    this.baicaoClickQueue.delete(key);
    this.baicaoProcessing.delete(key);
  }

  private cleanupBaicao(key: string) {
    this.baicaoCanceled.delete(key);
    this.baicaoClickQueue.delete(key);
    this.baicaoCompleted.delete(key);
    this.baicaoProcessing.delete(key);

    const processingTimeout = this.baicaoProcessingTimeouts.get(key);
    if (processingTimeout) {
      clearTimeout(processingTimeout);
      this.baicaoProcessingTimeouts.delete(key);
    }
  }
}