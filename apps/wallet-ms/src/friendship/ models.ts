import { FriendshipStatus } from "@pay-wallet/domain";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SendFriendRequestDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  message?: string;
}

export class RespondToFriendRequestDto {
  @IsNotEmpty()
  @IsString()
  friendshipId: string;

  @IsEnum(FriendshipStatus)
  status: FriendshipStatus.ACCEPTED | FriendshipStatus.REJECTED;
}

export class ListFriendsDto {
  @IsOptional()
  @IsEnum(FriendshipStatus)
  status?: FriendshipStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  size?: number = 20;
}

export class SearchUsersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  size?: number = 20;
}
