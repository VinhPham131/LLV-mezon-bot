import { OnEvent } from '@nestjs/event-emitter';
import { EMarkdownType, Events, MezonClient, TokenSentEvent } from 'mezon-sdk';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/bot/models/user.entity';
import { Repository, DataSource } from 'typeorm';
import { MezonClientService } from 'src/mezon/client.service';
import { UserCacheService } from 'src/bot/services/user-cache.service';
import { RedisCacheService } from 'src/bot/services/redis-cache.service';
import { BaseQueueProcessor } from 'src/bot/base/queue-processor.base';

@Injectable()
export class ListenerTokenSend extends BaseQueueProcessor<TokenSentEvent> {
    private client: MezonClient;

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private clientService: MezonClientService,
        private dataSource: DataSource,
        private userCacheService: UserCacheService,
        private redisCacheService: RedisCacheService,
    ) {
        super('ListenerTokenSend', 1, 15000);
        this.client = this.clientService.getClient();
    }

    @OnEvent(Events.TokenSend)
    async handleRecharge(tokenEvent: TokenSentEvent) {
        if (tokenEvent.amount <= 0) return;

        const botId = process.env.BOT_ID;
        if (!botId) {
            console.error('BOT_ID is not defined');
            return;
        }

        if (tokenEvent.receiver_id === botId && tokenEvent.sender_id) {
            await this.addToQueue(tokenEvent);
        }
    }

    protected async processItem(tokenEvent: TokenSentEvent): Promise<void> {
        const amount = Number(tokenEvent.amount) || 0;
        const botId = process.env.BOT_ID;

        if (!botId) {
            throw new Error('BOT_ID is not defined');
        }

        const lockKey = `recharge_${tokenEvent.transaction_id}`;
        const lockAcquired = await this.redisCacheService.acquireLock(lockKey, 10);

        if (!lockAcquired) {
            this.logger.warn(
                `Duplicate recharge attempt detected: ${tokenEvent.transaction_id}`,
            );
            return;
        }

        try {
            const senderCache = await this.userCacheService.createUserIfNotExists(
                tokenEvent.sender_id as string,
            );

            if (!senderCache) {
                throw new Error('Failed to create or get user cache');
            }

            const balanceResult = await this.userCacheService.updateUserBalance(
                tokenEvent.sender_id as string,
                amount,
                0,
                10,
            );

            if (!balanceResult.success) {
                throw new Error(
                    `Failed to update user balance: ${balanceResult.error}`,
                );
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
                amount,
                0,
                10,
            );

            if (!botBalanceResult.success) {
                this.logger.error(
                    `Failed to update bot balance: ${botBalanceResult.error}`,
                );
            }

            const clan = this.client.clans.get('0');
            const user = await clan?.users.fetch(tokenEvent.sender_id as string);
            const successMessage = `💸Nạp ${tokenEvent.amount.toLocaleString('vi-VN')} token thành công`;
            await user?.sendDM({
                t: successMessage,
                mk: [{ type: EMarkdownType.PRE, s: 0, e: successMessage.length }],
            });

            this.logger.log(
                `Token recharge processed successfully: ${tokenEvent.transaction_id}, Amount: ${amount}, User: ${tokenEvent.sender_id}, Bot Balance Updated: ${botBalanceResult.success}`,
            );
        } catch (error) {
            try {
                await this.userCacheService.updateUserBalance(
                    tokenEvent.sender_id as string,
                    -amount,
                    0,
                    5,
                );
            } catch (rollbackError) {
                this.logger.error('Error rolling back recharge:', rollbackError);
            }

            throw error;
        } finally {
            await this.redisCacheService.releaseLock(lockKey);
        }
    }

    protected async handleProcessingError(
        tokenEvent: TokenSentEvent,
        error: any,
    ): Promise<void> {
        this.logger.error(`Failed to process token recharge:`, {
            transactionId: tokenEvent.transaction_id,
            amount: tokenEvent.amount,
            senderId: tokenEvent.sender_id,
            error: error.message,
        });
    }
}
