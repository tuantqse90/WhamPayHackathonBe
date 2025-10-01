import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CreateTransactionEvent, UpdateTransactionEvent } from './models';
import { TransactionDto } from '@pay-wallet/domain';
import { TransactionService } from './transaction.service';
import { mapObject } from '@pay-wallet/common';

@Injectable()
export class TransactionEventHandler {
  private readonly logger = new Logger(TransactionEventHandler.name);
  constructor(private readonly transactionService: TransactionService) {}

  @OnEvent('transaction.created')
  async handleTransactionCreatedEvent(event: CreateTransactionEvent) {
    try {
      const transaction = mapObject<CreateTransactionEvent, TransactionDto>(
        'CreateTransactionEvent',
        'TransactionDto',
        event
      );

      await this.transactionService.create(transaction);
      this.logger.log(
        `Transaction created: ${transaction.id} with type: ${transaction.type}`
      );
    } catch (error) {
      this.logger.error(`Error creating transaction: ${error}`);
    }
  }

  @OnEvent('transaction.updated')
  async handleTransactionUpdatedEvent(event: UpdateTransactionEvent) {
    try {
      const updateProps = mapObject<UpdateTransactionEvent, TransactionDto>(
        'UpdateTransactionEvent',
        'TransactionDto',
        event
      );
      
      // remove id from updateProps as it's used for lookup
      delete updateProps.id;

      await this.transactionService.partialUpdate(event.id, updateProps);
      this.logger.log(`Transaction updated: ${event.id}`);
    } catch (error) {
      this.logger.error(`Error updating transaction: ${error}`);
    }
  }
}
