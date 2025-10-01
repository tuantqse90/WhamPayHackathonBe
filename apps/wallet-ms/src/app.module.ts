import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import {
  authConfig,
  commonConfig,
  mongodbConfig,
  MongoDbModule,
} from '@pay-wallet/common';
import { AuthModule } from './auth/auth.module';
import { appConfig } from './config/config';
import { FriendshipModule } from './friendship/friendship.module';
import { HealthModule } from './health/health.module';
import { NFTModule } from './nft/nft.module';
import { TokenModule } from './token/token.module';
import { TransactionModule } from './transaction/transaction.module';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, commonConfig, mongodbConfig],
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    MongoDbModule,
    WalletModule,
    TransactionModule,
    AuthModule,
    UserModule,
    HealthModule,
    TokenModule,
    FriendshipModule,
    NFTModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
