import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { createMap } from '@pay-wallet/common';
import {
  Transaction,
  TransactionSchema,
  User,
  UserSchema,
  Wallet,
  WalletDocument,
  WalletDto,
  WalletSchema,
} from '@pay-wallet/domain';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: User.name, schema: UserSchema },
      { name: Wallet.name, schema: WalletSchema },
    ]),
    // RedisModule,
  ],
  controllers: [WalletController],
  providers: [
    WalletService,
    // RedisService,
  ],
  exports: [WalletService],
})
export class WalletModule implements OnModuleInit {
  async onModuleInit() {
    createMap<WalletDocument, WalletDto>('WalletDocument', 'WalletDto');
  }
}
