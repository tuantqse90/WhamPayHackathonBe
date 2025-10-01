import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@pay-wallet/common';
import {
  BaseResultDto,
  RegisterRequestDto,
  RegisterResponseDto,
  UserDocument,
  UserRole,
} from '@pay-wallet/domain';
import { Request } from 'express';
import { ListUsersDto, UpdateUserDto } from './models';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
@Controller('user')
@ApiTags('User')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
// @SetMetadata('isPublic', true)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

  @Get()
  async listUsers(@Query() params: ListUsersDto) {
    return await this.userService.listUsers(params);
  }

  @Get('me')
  async getUserInfo(@Req() req: Request): Promise<BaseResultDto<UserDocument>> {
    const user = await this.userService.findById(req.user['id']);
    return new BaseResultDto(user, 'User info fetched successfully', true);
  }
  @Post()
  async createUser(
    @Body() body: RegisterRequestDto
  ): Promise<BaseResultDto<RegisterResponseDto>> {
    const { user } = await this.authService.register(body);
    return new BaseResultDto({ user }, 'Create successful', true);
  }
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto
  ): Promise<BaseResultDto<{ user: UserDocument | null }>> {
    const user = await this.userService.updateUser({ userId: id, ...body });
    return new BaseResultDto({ user }, 'User updated successfully', true);
  }
}
