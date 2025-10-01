import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommonConfig,
  defaultProvider,
  ERC20_ABI,
  InjectCommonConfig
} from '@pay-wallet/common';
import {
  Token,
  TokenDocument,
  Wallet,
  WalletDocument
} from '@pay-wallet/domain';
import { ethers } from 'ethers';
import { Model } from 'mongoose';
import {
  ListTokensDto
} from './models';
import { defaultTokens } from './tokens';
@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    @InjectCommonConfig()
    private commonConfig: CommonConfig,
    @InjectModel(Token.name) private readonly tokenModel: Model<TokenDocument>,
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const count = await this.tokenModel.countDocuments({});
      if (count === 0) {
        await this.tokenModel.insertMany(defaultTokens);
        this.logger.log('Default tokens initialized successfully');
      }
    } catch (error) {
      this.logger.error('Error initializing default system options', error);
    }
  }

  public async listTokens(params: ListTokensDto): Promise<TokenDocument[]> {
    const { address, name, symbol } = params;
    const query = { $expr: { $and: [] } }; // Use $expr to allow case-insensitive comparison

    if (address) {
      query.$expr.$and.push({
        $eq: [{ $toLower: '$address' }, address.toLowerCase()],
      });
    }
    if (name) {
      query.$expr.$and.push({
        $eq: [{ $toLower: '$name' }, name.toLowerCase()],
      });
    }
    if (symbol) {
      query.$expr.$and.push({
        $eq: [{ $toLower: '$symbol' }, symbol.toLowerCase()],
      });
    }

    const tokens = await this.tokenModel.find(query).exec();
    return tokens;
  }

  public async getToken(address: string): Promise<TokenDocument> {
    let token = await this.tokenModel.findOne({
      address: address.toLowerCase(),
    });
    if (!token) {
      // Get from onchain
      const tokenContract = new ethers.Contract(
        address,
        ERC20_ABI,
        defaultProvider
      );
      const decimals = await tokenContract.decimals();
      const name = await tokenContract.name();
      const symbol = await tokenContract.symbol();
      const totalSupply = await tokenContract.totalSupply();
      token = await this.tokenModel.create({
        address: address.toLowerCase(),
        name: name,
        symbol: symbol,
        decimals: Number(decimals.toString()),
        totalSupply: Number(ethers.formatUnits(totalSupply, decimals)),
      });
    }
    return token;
  }
}
