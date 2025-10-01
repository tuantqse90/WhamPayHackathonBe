import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
    JwtPayloadDto,
    LoginRequestDto,
    LoginResponseDto,
    RefreshTokenRequestDto,
    RefreshTokenResponseDto,
    RegisterRequestDto,
    RegisterResponseDto,
    TwitterLoginDto,
    UserDocument,
    UserDto,
    UserRole,
} from '@pay-wallet/domain';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserService } from '../user/user.service';
import { WalletService } from '../wallet/wallet.service';
import { mapObject } from '@pay-wallet/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly walletService: WalletService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(
    registerRequest: RegisterRequestDto
  ): Promise<RegisterResponseDto> {
    const { name, email, password } = registerRequest;
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email existed');
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await this.userService.createUser({
      name,
      email,
      password: hash,
    });
    const walletResult = await this.walletService.createMainWallet(user.id);
    if (!walletResult.success) {
      throw new BadRequestException('Failed to create wallet');
    }
    const response = mapObject<UserDocument, UserDto>(
      'UserDocument',
      'UserDto',
      user.toJSON()
    );
    response.address = walletResult.data.address;
    return { user: response };
  }

  async validateUser(loginRequest: LoginRequestDto): Promise<UserDocument> {
    const { email, password } = loginRequest;
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   throw new BadRequestException('Invalid email or password');
    // }
    return user;
  }

  async login(user: UserDocument): Promise<LoginResponseDto> {
    const wallet = await this.walletService.exportMainWallet(
      user.id ?? user._id?.toString()
    );
    const payload: JwtPayloadDto = {
      id: user.id ?? user._id?.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      status: user.status,
      role: user.role,
      twitterId: user.twitterId,
      address: wallet.data.address,
      provider: user.provider,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken();
    await this.userService.updateRefreshToken(
      user.id ?? user._id?.toString(),
      refreshToken
    );
    return { accessToken, refreshToken, user };
  }

  async refreshTokens(
    refreshTokenDto: RefreshTokenRequestDto
  ): Promise<RefreshTokenResponseDto> {
    const { refreshToken } = refreshTokenDto;
    const user = await this.userService.findByRefreshToken(refreshToken);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }
    const wallet = await this.walletService.exportMainWallet(
      user.id ?? user._id?.toString()
    );
    const payload: JwtPayloadDto = {
      id: user.id ?? user._id?.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      status: user.status,
      role: user.role,
      twitterId: user.twitterId,
      address: wallet.data.address,
      provider: user.provider,
    };

    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = this.generateRefreshToken();
    await this.userService.updateRefreshToken(
      user.id ?? user._id?.toString(),
      newRefreshToken
    );
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    await this.userService.clearRefreshToken(userId);
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  async loginOrCreateTwitterUser(
    twitterUser: TwitterLoginDto
  ): Promise<LoginResponseDto> {
    let user = await this.userService.findByTwitterId(twitterUser.twitterId);
    let isCreatedWallet = false;

    if (!user) {
      user = await this.userService.findByUsername(twitterUser.username);
      if (user) {
        if (!user.twitterId) {
          user.name = twitterUser.name;
          user.twitterId = twitterUser.twitterId;
          user.provider = twitterUser.provider;
          await user.save();      
        }
      }
    }

    let address = '';
    if (!user) {
      const isEnableRegister = this.configService.get('guard.isEnableRegister');
      if (!isEnableRegister) {
        throw new ForbiddenException('Register is currently disabled!');
      }
      user = await this.userService.createUser({
        name: twitterUser.name,
        username: twitterUser.username,
        email: twitterUser.email || `${twitterUser.twitterId}@twitter.com`,
        password: '',
        twitterId: twitterUser.twitterId,
        provider: twitterUser.provider,
        status: 'active',
        role: UserRole.USER,
      });
      const walletResult = await this.walletService.createMainWallet(
        user.id
      );
      if (!walletResult.success) {
        throw new BadRequestException('Failed to create wallet');
      }
      address = walletResult.data.address;
      isCreatedWallet = walletResult.success;
    } else {
      const wallet = await this.walletService.exportMainWallet(
        user.id ?? user._id?.toString()
      );
      address = wallet.data.address;
    }

    const payload: JwtPayloadDto = {
      id: user.id ?? user._id?.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      status: user.status,
      role: user.role,
      twitterId: user.twitterId,
      address: address,
      provider: user.provider,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken();
    await this.userService.updateRefreshToken(
      user.id ?? user._id?.toString(),
      refreshToken
    );
    return { accessToken, refreshToken, user, isCreatedWallet };
  }
}
