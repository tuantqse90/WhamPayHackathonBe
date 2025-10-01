import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { mapObject } from '@pay-wallet/common';
import {
  BasePaginationResultDto,
  User,
  UserDocument,
  UserDto,
} from '@pay-wallet/domain';
import * as bcrypt from 'bcrypt';
import _ from 'lodash';
import { Model, Types } from 'mongoose';
import { ListUsersDto, UpdateUserDto } from './models';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>
  ) {}

  /**
   * Creates a new User
   * @param userData - The User data to create
   * @returns The created UserDto
   */
  async createUser(userData: Partial<User>){
    const user = await this.userModel.create(userData);
    return user;
  }

  /**
   * Finds a user by email
   * @param email - The user's email
   * @returns The UserDocument or null
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  /**
   * Finds a user by username
   * @param username - The user's username
   * @returns The UserDocument or null
   */
  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username });
  }

  async findByEmailOrUsername(identifier: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
  }   

  /**
   * Finds a user by Twitter ID
   * @param twitterId - The user's Twitter ID
   * @returns The UserDocument or null
   */
  async findByTwitterId(twitterId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ twitterId });
  }

  /**
   * Retrieves all Users
   * @returns Array of all UserDto
   */
  async getAllUsers(): Promise<UserDto[]> {
    const users = await this.userModel.find({}).sort({ createdAt: 1 });
    return users.map((user) =>
      mapObject<UserDocument, UserDto>('UserDocument', 'UserDto', user.toJSON())
    );
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      _id: new Types.ObjectId(id),
    });
  }

  async listUsers(params: ListUsersDto) {
    const { email, desc, page, size } = params;
    const query = {};
    if (params.email && params.email != '') {
      query['email'] = email;
    }
    const total = await this.userModel.countDocuments(query);
    if (total == 0) {
      return new BasePaginationResultDto([], 0, 1, size);
    }
    const pages = Math.ceil(total / size);
    let currentPage = page;
    if (page > pages) {
      currentPage = pages;
    }
    const users = await this.userModel.find(
      query,
      {},
      {
        skip: (currentPage - 1) * size,
        limit: size,
        sort: { createdAt: desc ? -1 : 1 },
      }
    );
    return new BasePaginationResultDto(users, total, currentPage, size);
  }

  async updateUser(updateUserDto: UpdateUserDto) {
    const fields = _.omitBy(updateUserDto, _.isNil);
    if (fields.password && fields.password != '') {
      const hash = await bcrypt.hash(fields.password, 10);
      fields.password = hash;
    }

    if (fields.role) {
      fields.refreshToken = null;
      fields.refreshTokenExpiresAt = null;
    }

    const user = await this.userModel.findOneAndUpdate(
      { _id: updateUserDto.userId },
      { $set: fields },
      { new: true }
    );
    return user;
  }

  async findByRefreshToken(refreshToken: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({
      refreshToken,
      refreshTokenExpiresAt: { $gt: new Date() },
    });
    if (!user) {
      return null;
    }
    return user;
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    await this.userModel.updateOne(
      { _id: userId },
      {
        $set: {
          refreshToken,
          refreshTokenExpiresAt: expiresAt,
        },
      }
    );
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      {
        $unset: {
          refreshToken: 1,
          refreshTokenExpiresAt: 1,
        },
      }
    );
  }
}
