import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@pay-wallet/common';
import { BasePaginationResultDto, FriendshipDto, UserSummaryDto } from '@pay-wallet/domain';
import { Request } from 'express';
import {
  ListFriendsDto,
  RespondToFriendRequestDto,
  SendFriendRequestDto,
} from './ models';
import { FriendshipService } from './friendship.service';

@ApiTags('Friendship')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Get('')
  @ApiOperation({ summary: 'Get friends list' })
  async getFriends(
    @Req() req: Request,
    @Query() listFriendsDto: ListFriendsDto
  ): Promise<BasePaginationResultDto<FriendshipDto[]>> {
    return this.friendshipService.getFriends(req.user['id'], listFriendsDto);
  }

  @Post('request')
  @ApiOperation({ summary: 'Send a friend request' })
  async sendFriendRequest(
    @Req() req: Request,
    @Body() sendFriendRequestDto: SendFriendRequestDto
  ): Promise<FriendshipDto> {
    return this.friendshipService.sendFriendRequest(
      req.user['id'],
      sendFriendRequestDto
    );
  }

  @Put('respond')
  @ApiOperation({ summary: 'Accept or reject a friend request' })
  async respondToFriendRequest(
    @Req() req: Request,
    @Body() respondDto: RespondToFriendRequestDto
  ): Promise<FriendshipDto> {
    return this.friendshipService.respondToFriendRequest(
      req.user['id'],
      respondDto
    );
  }

  @Get('requests/pending')
  @ApiOperation({ summary: 'Get pending friend requests' })
  async getPendingRequests(
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('size') size?: number
  ): Promise<BasePaginationResultDto<FriendshipDto[]>> {
    return this.friendshipService.getPendingRequests(
      req.user['id'],
      page,
      size
    );
  }

  @Delete('remove/:username')
  @ApiOperation({ summary: 'Remove a friend' })
  async removeFriend(
    @Req() req: Request,
    @Param('username') username: string
  ): Promise<void> {
    return this.friendshipService.removeFriend(req.user['id'], username);
  }

  @Get('/not-friends')
  @ApiOperation({ summary: 'Get users not in friend list' })
  async getUsersNotInFriendList(
    @Req() req: Request,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('size') size?: number
  ): Promise<BasePaginationResultDto<UserSummaryDto[]>> {
    return this.friendshipService.getUsersNotInFriendList(
      req.user['id'],
      search,
      page,
      size
    );
  }

  @Get('status/:username')
  @ApiOperation({ summary: 'Get friendship status with a user' })
  async getFriendshipStatus(
    @Req() req: Request,
    @Param('username') username: string
  ): Promise<{ status: string | null, friendship?: FriendshipDto }> {
    return this.friendshipService.getFriendshipStatus(req.user['id'], username);
  }
}
