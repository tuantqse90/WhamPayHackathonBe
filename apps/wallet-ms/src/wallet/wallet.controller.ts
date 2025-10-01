import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@pay-wallet/common';
import { BaseResultDto } from '@pay-wallet/domain';
import { Request } from 'express';
import {
    SendTokenResponseDto,
    TransferTokenDto,
    WalletInfoDto,
    WalletMultiSendDto,
} from './models';
import { WalletService } from './wallet.service';
@Controller('wallets')
@ApiTags('Wallets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-Auth')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('main-wallet')
  @ApiOperation({ summary: 'Create a main wallet' })
  @ApiResponse({
    status: 200,
    description: 'Wallet created successfully',
  })
  createMainWallet(
    @Req() req: Request
  ): Promise<BaseResultDto<WalletInfoDto>> {
    return this.walletService.createMainWallet(req.user['id']);
  }

  @Get('export-main')
  @ApiOperation({
    summary: 'Export the unique main wallet for an userId',
  })
  @ApiResponse({
    status: 200,
    description: 'Exported wallet',
  })
  exportMainWallet(
    @Req() req: Request
  ): Promise<BaseResultDto<WalletInfoDto>> {
    return this.walletService.exportMainWallet(req.user['id']);
  }

  @Post('deposit')
  @ApiOperation({
    summary:
      "Send tokens/native from the user's main wallet to multiple recipients",
  })
  @ApiResponse({
    status: 200,
    description: 'Multisend executed',
    type: SendTokenResponseDto,
  })
  depositToMMWallet(
    @Req() req: Request,
    @Body() payload: WalletMultiSendDto
  ): Promise<BaseResultDto<SendTokenResponseDto>> {
    return this.walletService.multiSend({
      ...payload,
      userId: req.user['id'],
    });
  }

  @Post('transfer')
  @ApiOperation({
    summary:
      "Transfer token to a username",
  })
  @ApiResponse({
    status: 200,
    description: 'Transfer executed',
    type: SendTokenResponseDto,
  })
  transfer(
    @Req() req: Request,
    @Body() payload: TransferTokenDto
  ): Promise<BaseResultDto<SendTokenResponseDto>> {
    return this.walletService.transfer({
      ...payload,
      userId: req.user['id'],
    });
  }

  // @Post('withdraw')
  // @ApiOperation({
  //   summary: 'Withdraw tokens/native from multiple wallets to a recipient',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Withdrawal jobs queued successfully',
  //   type: [String],
  // })
  // async withdraw(
  //   @Req() req: Request,
  //   @Body() payload: WithdrawRequestDto
  // ): Promise<BaseResultDto<string[]>> {
  //   return this.walletService.withdraw({
  //     ...payload,
  //     userId: req.user['id'],
  //   });
  // }

  // @Post('balances')
  // @ApiOperation({
  //   summary: 'Get balance of wallet',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Exported wallet',
  // })
  // getUserWallet(@Body() payload: any) {
  //   return this.walletService.getBalances(
  //     payload.addresses,
  //     payload.tokenAddress,
  //     payload.isNative
  //   );
  // }
}
