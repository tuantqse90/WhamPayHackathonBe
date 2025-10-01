import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@pay-wallet/common';
import {
  BasePaginationResultDto,
  NFTDto,
} from '@pay-wallet/domain';
import { CreateNFTDto, ListNFTDto } from './models';
import { NFTService } from './nft.service';

@ApiTags('NFT')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('nft')
export class NFTController {
  constructor(private readonly nftService: NFTService) {}

  @Get()
  @ApiOperation({ summary: 'Get NFT list with filters' })
  async getNFTList(
    @Query() query: ListNFTDto
  ): Promise<BasePaginationResultDto<NFTDto[]>> {
    return this.nftService.getNFTList(query);
  }


  @Get(':id')
  @ApiOperation({ summary: 'Get NFT detail by ID' })
  async getNFTDetail(@Param('id') id: string): Promise<NFTDto> {
    return this.nftService.getNFTDetail(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new NFT record' })
  async createNFT(@Body() createNFTDto: CreateNFTDto): Promise<NFTDto> {
    return this.nftService.createNFT(createNFTDto);
  }
}