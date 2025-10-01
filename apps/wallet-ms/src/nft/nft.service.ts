import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  BasePaginationResultDto,
  NFT,
  NFTDocument,
  NFTDto,
  NFTStatus,
} from '@pay-wallet/domain';
import { Model } from 'mongoose';
import { CreateNFTDto, ListNFTDto } from './models';
import { mapArray, mapObject } from '@pay-wallet/common';

@Injectable()
export class NFTService {
  constructor(@InjectModel(NFT.name) private nftModel: Model<NFTDocument>) {}

  async createNFT(createNFTDto: CreateNFTDto): Promise<NFTDto> {
    const existingNFT = await this.nftModel.findOne({
      contractAddress: createNFTDto.contractAddress,
      tokenId: createNFTDto.tokenId,
    });

    if (existingNFT) {
      throw new Error('NFT already exists');
    }
    const nft = new this.nftModel(createNFTDto);
    const savedNFT = await nft.save();
    return mapObject<NFTDocument, NFTDto>('NFTDocument', 'NFTDto', savedNFT);
  }

  async getNFTList(
    query: ListNFTDto
  ): Promise<BasePaginationResultDto<NFTDto[]>> {
    const { page = 1, size = 20, search, ...filters } = query;
    const skip = (page - 1) * size;

    const conditions: Record<string, unknown> = {};
    if (filters.contractAddress) {
      conditions.contractAddress = filters.contractAddress.toLowerCase();
    }
    if (filters.type) {
      conditions.type = filters.type;
    }

    if (search) {
      conditions.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { collectionName: { $regex: search, $options: 'i' } },
      ];
    }

    const [nfts, total] = await Promise.all([
      this.nftModel
        .find(conditions)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(size)
        .exec(),
      this.nftModel.countDocuments(conditions).exec(),
    ]);

    const data = mapArray<NFTDocument, NFTDto>('NFTDocument', 'NFTDto', nfts);

    return {
      success: true,
      message: 'NFTs retrieved successfully',
      data,
      total,
      page,
      pageSize: size,
    };
  }

  async getNFTDetail(id: string): Promise<NFTDto> {
    const nft = await this.nftModel.findById(id);
    if (!nft) {
      throw new NotFoundException('NFT not found');
    }
    return mapObject<NFTDocument, NFTDto>('NFTDocument', 'NFTDto', nft);
  }

  async getNFTByTokenId(
    contractAddress: string,
    tokenId: string
  ): Promise<NFTDto> {
    const nft = await this.nftModel.findOne({
      contractAddress: contractAddress.toLowerCase(),
      tokenId,
    });
    if (!nft) {
      throw new NotFoundException('NFT not found');
    }
    return mapObject<NFTDocument, NFTDto>('NFTDocument', 'NFTDto', nft);
  }

  async transferNFT(
    contractAddress: string,
    tokenId: string,
    newOwner: string
  ): Promise<NFTDto> {
    const nft = await this.nftModel.findOneAndUpdate(
      {
        contractAddress: contractAddress.toLowerCase(),
        tokenId,
        status: NFTStatus.ACTIVE,
      },
      {
        owner: newOwner.toLowerCase(),
        status: NFTStatus.ACTIVE,
      },
      { new: true }
    );

    if (!nft) {
      throw new NotFoundException('NFT not found or already transferred');
    }
    return mapObject<NFTDocument, NFTDto>('NFTDocument', 'NFTDto', nft);
  }
}
