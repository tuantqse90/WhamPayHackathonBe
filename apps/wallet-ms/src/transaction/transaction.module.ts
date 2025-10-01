import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { createMap } from '@pay-wallet/common';
import {
  Transaction,
  TransactionDocument,
  TransactionDto,
  TransactionSchema,
} from '@pay-wallet/domain';
import { CreateTransactionEvent, UpdateTransactionEvent } from './models';
import { TransactionController } from './transaction.controller';
import { TransactionEventHandler } from './transaction.event.handler';
import { TransactionService } from './transaction.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  providers: [TransactionService, TransactionEventHandler],
  exports: [TransactionService],
  controllers: [TransactionController],
})
export class TransactionModule implements OnModuleInit {
  async onModuleInit() {
    createMap<TransactionDocument, TransactionDto>(
      'TransactionDocument',
      'TransactionDto'
    );
    createMap<TransactionDto, TransactionDocument>(
      'TransactionDto',
      'TransactionDocument'
    );
    createMap<CreateTransactionEvent, TransactionDto>(
      'CreateTransactionEvent',
      'TransactionDto'
    );
    createMap<UpdateTransactionEvent, TransactionDto>(
      'UpdateTransactionEvent',
      'TransactionDto'
    );
  }
}
