import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@pay-wallet/domain';
import { AuthConfig, authConfig } from './auth.config';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { JwtStrategy } from './jwt/jwt.strategy';
import { RolesGuard } from './roles.guard';
import { TwitterAuthGuard } from './twitter/twitter.guard';
import { TwitterStrategy } from './twitter/twitter.strategy';
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(authConfig)],
      inject: [authConfig.KEY],
      useFactory: (config: AuthConfig) => ({
        secret: config.jwtSecret ?? 'secret',
        signOptions: { expiresIn: '1d' },
      }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
  ],
  providers: [
    JwtStrategy,
    TwitterStrategy,
    JwtAuthGuard,
    TwitterAuthGuard,
    RolesGuard,
  ],
  exports: [
    JwtStrategy,
    TwitterStrategy,
    JwtAuthGuard,
    TwitterAuthGuard,
    RolesGuard,
  ],
})
export class GuardsModule {}
