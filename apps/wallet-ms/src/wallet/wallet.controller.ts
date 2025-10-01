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
  NFTTransferResponseDto,
  SendTokenResponseDto,
  TransferNFT1155Dto,
  TransferNFT721Dto,
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
  createMainWallet(@Req() req: Request): Promise<BaseResultDto<WalletInfoDto>> {
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
  exportMainWallet(@Req() req: Request): Promise<BaseResultDto<WalletInfoDto>> {
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
    summary: 'Transfer token to a username',
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

  @Post('transfer-nft-721')
  @ApiOperation({
    summary: 'Transfer ERC721 NFT to a username or address',
  })
  @ApiResponse({
    status: 200,
    description: 'NFT721 transfer executed',
    type: NFTTransferResponseDto,
  })
  transferNFT721(
    @Req() req: Request,
    @Body() payload: TransferNFT721Dto
  ): Promise<BaseResultDto<NFTTransferResponseDto>> {
    return this.walletService.transferNFT721({
      ...payload,
      userId: req.user['id'],
    });
  }

  @Post('transfer-nft-1155')
  @ApiOperation({
    summary: 'Transfer ERC1155 NFT to a username or address',
  })
  @ApiResponse({
    status: 200,
    description: 'NFT1155 transfer executed',
    type: NFTTransferResponseDto,
  })
  transferNFT1155(
    @Req() req: Request,
    @Body() payload: TransferNFT1155Dto
  ): Promise<BaseResultDto<NFTTransferResponseDto>> {
    return this.walletService.transferNFT1155({
      ...payload,
      userId: req.user['id'],
    });
  }
}
