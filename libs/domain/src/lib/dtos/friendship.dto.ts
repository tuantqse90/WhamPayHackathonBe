import { FriendshipStatus } from '../enums';

export class FriendshipDto {
  id: string;
  requesterId: string;
  requesterUsername: string;
  responserId: string;
  responserUsername: string;
  status: FriendshipStatus;
  acceptedAt?: Date;
  rejectedAt?: Date;
  blockedAt?: Date;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SearchUsersDto {
  search?: string;
  page?: number = 1;
  size?: number = 20;
}

export class UserSummaryDto {
  id: string;
  username: string;
  name?: string;
  email?: string;
  createdAt?: Date;
}
