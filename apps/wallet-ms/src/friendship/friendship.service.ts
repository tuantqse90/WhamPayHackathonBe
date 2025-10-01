import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { mapArray, mapObject } from '@pay-wallet/common';
import {
	BasePaginationResultDto,
	Friendship,
	FriendshipDocument,
	FriendshipDto,
	FriendshipStatus,
	User,
	UserDocument,
	UserSummaryDto,
} from '@pay-wallet/domain';
import { Model, Types } from 'mongoose';
import {
	ListFriendsDto,
	RespondToFriendRequestDto,
	SendFriendRequestDto,
} from './ models';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectModel(Friendship.name)
    private readonly friendshipModel: Model<FriendshipDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>
  ) {}

  async sendFriendRequest(
    requesterId: string,
    sendFriendRequestDto: SendFriendRequestDto
  ): Promise<FriendshipDto> {
    const { username, message } = sendFriendRequestDto;
    const addressee = await this.userModel.findOne({
      username: username.toLowerCase(),
    });
    if (!addressee) {
      throw new NotFoundException('User not found');
    }

    if (requesterId === addressee._id.toString()) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }
    const existingFriendship = await this.friendshipModel.findOne({
      $or: [
        {
          requesterId: new Types.ObjectId(requesterId),
          responserId: addressee._id,
        },
        {
          requesterId: addressee._id,
          responserId: new Types.ObjectId(requesterId),
        },
      ],
    });

    if (existingFriendship) {
      if (existingFriendship.status === FriendshipStatus.PENDING) {
        throw new ConflictException('Friend request already pending');
      }
      if (existingFriendship.status === FriendshipStatus.ACCEPTED) {
        throw new ConflictException('Users are already friends');
      }
      if (existingFriendship.status === FriendshipStatus.BLOCKED) {
        throw new BadRequestException(
          'Cannot send friend request to blocked user'
        );
      }
    }

    const requester = await this.userModel.findById(requesterId);
    if (!requester) {
      throw new NotFoundException('Requester not found');
    }
    const friendship = new this.friendshipModel({
      requesterId: new Types.ObjectId(requesterId),
      requesterUsername: requester.username,
      responserId: addressee._id,
      responserUsername: addressee.username,
      status: FriendshipStatus.PENDING,
      message,
    });

    await friendship.save();

    return mapObject<FriendshipDocument, FriendshipDto>(
      'FriendshipDocument',
      'FriendshipDto',
      friendship.toJSON()
    );
  }

  async respondToFriendRequest(
    userId: string,
    respondDto: RespondToFriendRequestDto
  ): Promise<FriendshipDto> {
    const { friendshipId, status } = respondDto;

    const friendship = await this.friendshipModel.findById(friendshipId);
    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    if (friendship.responserId.toString() !== userId) {
      throw new BadRequestException(
        'You can only respond to friend requests sent to you'
      );
    }

    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new BadRequestException('Friend request is no longer pending');
    }

    friendship.status = status;
    if (status === FriendshipStatus.ACCEPTED) {
      friendship.acceptedAt = new Date();
    } else if (status === FriendshipStatus.REJECTED) {
      friendship.rejectedAt = new Date();
    }

    await friendship.save();

    return mapObject<FriendshipDocument, FriendshipDto>(
      'FriendshipDocument',
      'FriendshipDto',
      friendship.toJSON()
    );
  }

  async getFriends(
    userId: string,
    listFriendsDto: ListFriendsDto
  ): Promise<BasePaginationResultDto<FriendshipDto[]>> {
    const {
      status = FriendshipStatus.ACCEPTED,
      search,
      page = 1,
      size = 20,
    } = listFriendsDto;
    const skip = (page - 1) * size;

    const filter: Record<string, unknown> = {
      $or: [
        { requesterId: new Types.ObjectId(userId) },
        { responserId: new Types.ObjectId(userId) },
      ],
      status,
    };

    if (search) {
      filter.$and = [
        {
          $or: [
            { requesterUsername: { $regex: search, $options: 'i' } },
            { responserUsername: { $regex: search, $options: 'i' } },
          ],
        },
      ];
    }

    const total = await this.friendshipModel.countDocuments(filter);
    const friendships = await this.friendshipModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean();

    const friendshipDtos = mapArray<FriendshipDocument, FriendshipDto>(
      'FriendshipDocument',
      'FriendshipDto',
      friendships
    );

    return new BasePaginationResultDto(friendshipDtos, total, page, size);
  }

  async getPendingRequests(
    userId: string,
    page = 1,
    size = 20
  ): Promise<BasePaginationResultDto<FriendshipDto[]>> {
    const skip = (page - 1) * size;

    const filter = {
      responserId: new Types.ObjectId(userId),
      status: FriendshipStatus.PENDING,
    };
    const total = await this.friendshipModel.countDocuments(filter);
		console.log('filter:', filter);
    const friendships = await this.friendshipModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .lean();

    const friendshipDtos = mapArray<FriendshipDocument, FriendshipDto>(
      'FriendshipDocument',
      'FriendshipDto',
      friendships
    );

    return new BasePaginationResultDto(friendshipDtos, total, page, size);
  }

  async removeFriend(userId: string, friendUsername: string): Promise<void> {
    const friend = await this.userModel.findOne({
      username: friendUsername.toLowerCase(),
    });
    if (!friend) {
      throw new NotFoundException('User not found');
    }

    const friendship = await this.friendshipModel.findOne({
      $or: [
        { requesterId: new Types.ObjectId(userId), responserId: friend._id },
        { requesterId: friend._id, responserId: new Types.ObjectId(userId) },
      ],
      status: FriendshipStatus.ACCEPTED,
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    await this.friendshipModel.deleteOne({ _id: friendship._id });
  }

  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    const friendship = await this.friendshipModel.findOne({
      $or: [
        {
          requesterId: new Types.ObjectId(userId1),
          responserId: new Types.ObjectId(userId2),
        },
        {
          requesterId: new Types.ObjectId(userId2),
          responserId: new Types.ObjectId(userId1),
        },
      ],
      status: FriendshipStatus.ACCEPTED,
    });

    return !!friendship;
  }

  async getUsersNotInFriendList(
    userId: string,
    search?: string,
    page = 1,
    size = 20
  ): Promise<BasePaginationResultDto<UserSummaryDto[]>> {
    const skip = (page - 1) * size;
    const friendships = await this.friendshipModel.find({
      $or: [
        { requesterId: new Types.ObjectId(userId) },
        { responserId: new Types.ObjectId(userId) },
      ],
    }, { requesterId: 1, responserId: 1 });

    const relatedUserIds = new Set<string>();
    friendships.forEach(friendship => {
      if (friendship.requesterId.toString() !== userId) {
        relatedUserIds.add(friendship.requesterId.toString());
      }
      if (friendship.responserId.toString() !== userId) {
        relatedUserIds.add(friendship.responserId.toString());
      }
    });
    relatedUserIds.add(userId);
    const userQuery: Record<string, unknown> = {
      _id: { $nin: Array.from(relatedUserIds).map(id => new Types.ObjectId(id)) }
    };
    if (search && search.trim()) {
      userQuery.$or = [
        { username: { $regex: search.trim(), $options: 'i' } },
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const total = await this.userModel.countDocuments(userQuery);
    const users = await this.userModel
      .find(userQuery, { username: 1, name: 1, email: 1, createdAt: 1 })
      .sort({ username: 1 })
      .skip(skip)
      .limit(size)
      .lean();

    const userSummaries = users.map(user => ({
      id: user._id.toString(),
      username: user.username,
      name: user.name,
      email: user.email,
    }));

    return new BasePaginationResultDto(userSummaries, total, page, size);
  }

  async getFriendshipStatus(userId: string, username: string): Promise<{ status: FriendshipStatus | null, friendship?: FriendshipDto }> {
    const user = await this.userModel.findOne({
      username: username.toLowerCase()
    });
    
    if (!user) {
      return { status: null };
    }

    const friendship = await this.friendshipModel.findOne({
      $or: [
        { requesterId: new Types.ObjectId(userId), responserId: user._id },
        { requesterId: user._id, responserId: new Types.ObjectId(userId) }
      ]
    });

    if (!friendship) {
      return { status: null };
    }

    const friendshipDto = mapObject<FriendshipDocument, FriendshipDto>(
      'FriendshipDocument',
      'FriendshipDto',
      friendship.toJSON()
    );

    return { 
      status: friendship.status,
      friendship: friendshipDto
    };
  }
}
