import { ChannelMessage, EMarkdownType } from 'mezon-sdk';
import { Command } from 'src/bot/base/commandRegister.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EUserError } from 'src/bot/constants/error';
import { CommandMessage } from 'src/bot/base/command.abstract';
import { User } from 'src/bot/models/user.entity';
import { MezonClientService } from 'src/mezon/client.service';
import { UserCacheService } from 'src/bot/services/user-cache.service';
import { BaseQueueProcessor } from 'src/bot/base/queue-processor.base';

interface WithdrawRequest {
  message: ChannelMessage;
  amount: number;
}

@Command('rut')
export class RutCommand extends CommandMessage {
  private queueProcessor: BaseQueueProcessor<WithdrawRequest>;

  constructor(
    clientService: MezonClientService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
    private userCacheService: UserCacheService,
  ) {
    super(clientService);

    this.queueProcessor =
      new (class extends BaseQueueProcessor<WithdrawRequest> {
        constructor(private withdrawCommand: RutCommand) {
          super('RutCommand', 1, 20000);
        }

        protected async processItem(request: WithdrawRequest): Promise<void> {
          await this.withdrawCommand.processWithdrawal(
            request.message,
            request.amount,
          );
        }

        protected async handleProcessingError(
          request: WithdrawRequest,
          error: any,
        ): Promise<void> {
          this.logger.error(`Failed to process withdrawal:`, {
            userId: request.message.sender_id,
            amount: request.amount,
            error: error.message,
          });

          const messageChannel = await this.withdrawCommand.getChannelMessage(
            request.message,
          );
          const errorMessage =
            'Có lỗi xảy ra khi xử lý rút tiền. Vui lòng thử lại sau.';
          await messageChannel?.reply({
            t: errorMessage,
            mk: [{ type: EMarkdownType.PRE, s: 0, e: errorMessage.length }],
          });
        }
      })(this);
  }

  async execute(args: string[], message: ChannelMessage) {
    const messageChannel = await this.getChannelMessage(message);

    try {
      const money = parseInt(args[0], 10);
      if (args[0] === undefined || money <= 0 || isNaN(money)) {
        return await messageChannel?.reply({
          t: EUserError.INVALID_AMOUNT,
          mk: [
            {
              type: EMarkdownType.PRE,
              s: 0,
              e: EUserError.INVALID_AMOUNT.length,
            },
          ],
        });
      }

      await (this.queueProcessor as any).addToQueue({ message, amount: money });
    } catch (error) {
      console.error('Error in WithdrawTokenCommand:', error);

      const errorMessage =
        'Có lỗi xảy ra khi xử lý yêu cầu rút tiền. Vui lòng thử lại sau.';
      return await messageChannel?.reply({
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
  }

  public async processWithdrawal(message: ChannelMessage, money: number) {
    const messageChannel = await this.getChannelMessage(message);
    const userId = message.sender_id as string;
    const botId = process.env.BOT_ID;

    if (!botId) {
      throw new Error('BOT_ID is not defined');
    }

    try {
      const hasEnoughBalance = await this.userCacheService.hasEnoughBalance(
        userId,
        money,
      );
      if (!hasEnoughBalance) {
        return await messageChannel?.reply({
          t: EUserError.INVALID_AMOUNT,
          mk: [
            {
              type: EMarkdownType.PRE,
              s: 0,
              e: EUserError.INVALID_AMOUNT.length,
            },
          ],
        });
      }

      const balanceResult = await this.userCacheService.updateUserBalance(
        userId,
        -money,
        0,
        10,
      );

      if (!balanceResult.success) {
        const errorMessage = balanceResult.error || EUserError.INVALID_AMOUNT;
        return await messageChannel?.reply({
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

      const botCache = await this.userCacheService.createUserIfNotExists(
        botId,
        'BaiCao',
        'BaiCao',
      );

      if (!botCache) {
        throw new Error('Failed to create or get bot cache');
      }

      const botBalanceResult = await this.userCacheService.updateUserBalance(
        botId,
        -money,
        0,
        10,
      );

      if (!botBalanceResult.success) {
        await this.userCacheService.updateUserBalance(userId, money, 0, 5);
        throw new Error(
          `Failed to update bot balance: ${botBalanceResult.error}`,
        );
      }

      const dataSendToken = {
        sender_id: botId,
        sender_name: process.env.BOT_KOMU_NAME || 'BaiCao',
        receiver_id: userId,
        amount: money,
      };
      await this.client.sendToken(dataSendToken);

      const successMessage = `💰 Rút ${money.toLocaleString('vi-VN')} token thành công`;
      await messageChannel?.reply({
        t: successMessage,
        mk: [{ type: EMarkdownType.PRE, s: 0, e: successMessage.length }],
      });
    } catch (error) {
      console.error('Error processing withdrawal:', error);

      try {
        await this.userCacheService.updateUserBalance(userId, money, 0, 5);
      } catch (rollbackError) {
        console.error('Error rolling back withdrawal:', rollbackError);
      }

      const errorMessage =
        'Có lỗi xảy ra khi xử lý rút tiền. Số dư của bạn đã được hoàn lại.';
      await messageChannel?.reply({
        t: errorMessage,
        mk: [{ type: EMarkdownType.PRE, s: 0, e: errorMessage.length }],
      });
    }
  }

  public getQueueStats() {
    return this.queueProcessor.getQueueStats();
  }
}