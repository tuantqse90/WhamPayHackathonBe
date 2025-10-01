import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadDto, User, UserDocument } from '@pay-wallet/domain';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('guard.jwtSecret') || 'jwtsecret',
    });
  }

  /**
   * Validates the JWT payload by ensuring that the user still exists in the database.
   * If the user cannot be found an UnauthorizedException will be thrown.
   *
   * @param payload - The JWT payload containing the user data
   * @throws UnauthorizedException when the user is not found
   * @returns The user document that will be attached to the request object
   */
  async validate(payload: JwtPayloadDto) {
    // The payload can either be the full object { user: JwtPayloadDto } or directly the payload
    const extractedUser: JwtPayloadDto = (payload as any).user ?? payload;

    const userId: string = extractedUser.id;
    if (!userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const userInDb = await this.userModel.findById(userId);
    if (!userInDb) {
      throw new UnauthorizedException('User not found');
    }
    if (!userInDb.refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    return extractedUser;
  }
}
