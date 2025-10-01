import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@pay-wallet/common';
import {
  BaseResultDto,
  LoginRequestDto,
  LoginResponseDto,
  LogoutResponseDto,
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
  UserDto,
  MobileTwitterLoginDto,
  TwitterLoginDto,
} from '@pay-wallet/domain';
import { Request, Response } from 'express';
import { UserService } from '../user/user.service';
import { WalletService } from '../wallet/wallet.service';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly walletService: WalletService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  // @Post('register')
  // async register(
  //   @Body() body: RegisterRequestDto
  // ): Promise<BaseResultDto<RegisterResponseDto>> {
  //   const isEnableRegister = this.configService.get('guard.isEnableRegister');
  //   if (!isEnableRegister) {
  //     throw new ForbiddenException('Register is currently disabled!');
  //   }

  //   const { user } = await this.authService.register(body);
  //   return new BaseResultDto({ user }, 'Register successful', true);
  // }

  @Post('login')
  async login(
    @Body() body: LoginRequestDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<BaseResultDto<LoginResponseDto>> {
    const user = await this.authService.validateUser(body);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = await this.authService.login(user);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return new BaseResultDto(
      { accessToken, refreshToken },
      'Login successful',
      true
    );
  }

  @Post('refresh')
  @ApiBody({
    type: RefreshTokenRequestDto,
    description: 'Refresh token',
    required: false,
  })
  async refreshToken(
    @Body() body: RefreshTokenRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<BaseResultDto<RefreshTokenResponseDto>> {
    const refreshToken = body.refreshToken || req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    const tokens = await this.authService.refreshTokens({ refreshToken });
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });
    return new BaseResultDto(tokens, 'Tokens refreshed successfully', true);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<BaseResultDto<LogoutResponseDto>> {
    const userId = req.user['id'];
    if (userId) {
      await this.authService.revokeRefreshToken(userId);
    }

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
    return new BaseResultDto(
      { message: 'Logged out' },
      'Logout successful',
      true
    );
  }

  @Get('check-token')
  @UseGuards(JwtAuthGuard)
  async checkToken(
    @Req() req: Request
  ): Promise<
    BaseResultDto<{ valid: boolean; needsRefresh: boolean; expiresIn: number }>
  > {
    const authHeader = req.headers.authorization;
    let accessToken = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7);
    } else if (req.cookies?.accessToken) {
      accessToken = req.cookies.accessToken;
    }

    if (!accessToken) {
      return new BaseResultDto(
        { valid: false, needsRefresh: true, expiresIn: 0 },
        'No token found',
        false
      );
    }

    try {
      const decoded = this.jwtService.decode(accessToken) as { exp: number };
      const currentTime = Math.floor(Date.now() / 1000);
      const expiresIn = decoded.exp - currentTime;
      const needsRefresh = expiresIn < 300;
      return new BaseResultDto(
        {
          valid: true,
          needsRefresh,
          expiresIn,
        },
        'Token status retrieved',
        true
      );
    } catch {
      return new BaseResultDto(
        { valid: false, needsRefresh: true, expiresIn: 0 },
        'Invalid token',
        false
      );
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('user-info')
  // async getUserInfo(@Req() req: Request): Promise<BaseResultDto<UserDto>> {
  //   return new BaseResultDto(req.user as UserDto, 'User info fetched', true);
  // }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getUserInfo(@Req() req: Request): Promise<BaseResultDto<UserDto>> {
    const user = await this.userService.findById(req.user['id']);
    const wallet = await this.walletService.exportMainWallet(
      user.id ?? user._id?.toString()
    );
    return new BaseResultDto(
      { ...user.toJSON(), address: wallet?.data?.address },
      'User info fetched successfully',
      true
    );
  }
  @Get('twitter')
  @UseGuards(AuthGuard('twitter'))
  async twitterLogin() {
    // Passport auto redirects to Twitter for authentication
    // No need to implement anything here, just trigger the guard
  }

  @Get('twitter/callback')
  @UseGuards(AuthGuard('twitter'))
  async twitterCallback(@Req() req, @Res() res) {
    const { accessToken, refreshToken, isCreatedWallet } =
      await this.authService.loginOrCreateTwitterUser(req.user);

    const redirectUrl = `${this.configService.get(
      'guard.frontendUrl'
    )}/auth/twitter/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&isCreatedWallet=${isCreatedWallet}`;
    return res.redirect(redirectUrl);
  }

  @Post('twitter/mobile')
  async mobileTwitterLogin(
    @Body() body: MobileTwitterLoginDto
  ): Promise<BaseResultDto<LoginResponseDto>> {
    try {
      // Verify Twitter access token and get user data
      const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics,verified', {
        headers: {
          'Authorization': `Bearer ${body.twitterAccessToken}`,
        },
      });

      if (!userResponse.ok) {
        throw new UnauthorizedException('Invalid Twitter access token');
      }

      const twitterUserData = await userResponse.json();
      const user = twitterUserData.data;

      // Create TwitterLoginDto from Twitter API response
      const twitterLoginDto: TwitterLoginDto = {
        twitterId: user.id,
        username: user.username,
        name: user.name,
        email: user.email || `${user.id}@twitter.whampay.com`,
        provider: 'twitter',
      };

      // Login or create user
      const loginResult = await this.authService.loginOrCreateTwitterUser(twitterLoginDto);

      return new BaseResultDto(
        loginResult,
        loginResult.isCreatedWallet ? 'Account created and logged in successfully' : 'Login successful',
        true
      );
    } catch (error) {
      console.error('Mobile Twitter login error:', error);
      throw new UnauthorizedException('Twitter authentication failed');
    }
  }
}
