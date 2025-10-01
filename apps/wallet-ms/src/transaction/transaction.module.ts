import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { createMap } from '@pay-wallet/common';
import {
  Transaction,
  TransactionDocument,
  TransactionDto,
  TransactionSchema,
} from '@pay-wallet/domain';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  providers: [TransactionService],
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
  }
}
