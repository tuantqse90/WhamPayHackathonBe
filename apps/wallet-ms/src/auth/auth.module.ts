import { Module, forwardRef } from '@nestjs/common';
import { authConfig, AuthConfig, GuardsModule } from '@pay-wallet/common';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { WalletModule } from '../wallet/wallet.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

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
    forwardRef(() => UserModule),
    WalletModule,
    GuardsModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
