import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendshipDocument, FriendshipDto, NFT, NFTDocument, NFTDto, NFTSchema } from '@pay-wallet/domain';
import { NFTController } from './nft.controller';
import { NFTService } from './nft.service';
import { createMap } from '@pay-wallet/common';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NFT.name, schema: NFTSchema },
    ]),
  ],
  controllers: [NFTController],
  providers: [NFTService],
  exports: [NFTService],
})
export class NFTModule implements OnModuleInit {
  onModuleInit() {
    createMap<NFTDocument, NFTDto>(
      'NFTDocument',
      'NFTDto'
    );
    createMap<NFTDto, NFTDocument>(
      'NFTDto',
      'NFTDocument'
    );
  }
}