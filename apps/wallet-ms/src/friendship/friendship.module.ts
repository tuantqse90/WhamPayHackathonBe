import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Friendship,
  FriendshipDocument,
  FriendshipDto,
  FriendshipSchema,
  User,
  UserSchema,
} from '@pay-wallet/domain';
import { FriendshipController } from './friendship.controller';
import { FriendshipService } from './friendship.service';
import { createMap } from '@pay-wallet/common';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Friendship.name, schema: FriendshipSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [FriendshipController],
  providers: [FriendshipService],
  exports: [FriendshipService],
})
export class FriendshipModule implements OnModuleInit {
  onModuleInit() {
    createMap<FriendshipDocument, FriendshipDto>(
      'FriendshipDocument',
      'FriendshipDto'
    );
    createMap<FriendshipDto, FriendshipDocument>(
      'FriendshipDto',
      'FriendshipDocument'
    );
  }
}
