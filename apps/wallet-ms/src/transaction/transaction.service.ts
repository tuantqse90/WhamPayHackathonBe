import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { mapArray, mapObject } from '@pay-wallet/common';
import {
    BasePaginationResultDto,
    Transaction,
    TransactionDocument,
    TransactionDto,
} from '@pay-wallet/domain';
import { FilterQuery, Model } from 'mongoose';
import { CreateTransactionDto, ListTransactionsDto } from './models';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>
  ) {}

  /**
   * Find a transaction by its ID
   * @param id - The ID of the transaction to find
   * @returns The found transaction
   * @example
   * const transaction = await this.transactionService.findById('0x1234567890abcdef');
   */
  async findById(id: string): Promise<TransactionDto> {
    const transaction = await this.transactionModel.findById(id);
    return mapObject<TransactionDocument, TransactionDto>(
      'TransactionDocument',
      'TransactionDto',
      transaction
    );
  }

  /**
   * Find a transaction by its hash
   * @param hash - The hash of the transaction to find
   * @returns The found transaction
   * @example
   * const transaction = await this.transactionService.findByHash('0x1234567890abcdef');
   */
  async findByHash(hash: string): Promise<TransactionDto> {
    const transaction = await this.transactionModel.findOne({
      transactionHash: hash,
    });
    return mapObject<TransactionDocument, TransactionDto>(
      'TransactionDocument',
      'TransactionDto',
      transaction
    );
  }

  /**
   * Find a transaction by its wallet address
   * @param address - The address of the wallet to find
   * @returns The found transaction
   * @example
   * const transactions = await this.transactionService.findByWalletAddress('0x1234567890abcdef');
   */
  async findByWalletAddress(address: string): Promise<TransactionDto[]> {
    const transactions = await this.transactionModel.find({ from: address });
    return mapArray<TransactionDocument, TransactionDto>(
      'TransactionDocument',
      'TransactionDto',
      transactions
    );
  }

  /**
   * Get transactions with optional filtering
   * @param query - Query parameters for filtering transactions
   * @returns Array of transactions matching the query
   * @example
   * const transactions = await this.transactionService.listTransactions({
   *   userId: '0x1234567890abcdef',
   *   chainId: 1,
   *   type: 'swap',
   *   status: 'completed',
   * });
   */
  async listTransactions(
    query: ListTransactionsDto
  ): Promise<BasePaginationResultDto<TransactionDto[]>> {
    const page = query.page || 1;
    const limit = query.size || 100;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<TransactionDocument> = {};

    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;
    if (query.fromUsername) filter.fromUser = query.fromUsername;
    if (query.toUsername) filter.toUser = query.toUsername;
    if (query.fromAddress) filter.fromAddress = query.fromAddress;
    if (query.toAddress) filter.toAddress = query.toAddress;

    const orConditions = [];    
    if (query.username) {
      orConditions.push(
        { fromUser: query.username },
        { toUser: query.username }
      );
    }
    if (query.search) {
      orConditions.push(
        { transactionHash: { $regex: query.search, $options: 'i' } },
        { from: { $regex: query.search, $options: 'i' } },
        { to: { $regex: query.search, $options: 'i' } }
      );
    }
    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }

    // Build sort options
    const sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (query.orderBy) {
      sortOptions[query.orderBy] = query.desc ? -1 : 1;
    }
    const total = await this.transactionModel.countDocuments(filter);
    const transactions = await this.transactionModel
      .find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
    console.log('transactions:', transactions);
    return new BasePaginationResultDto(
      mapArray<TransactionDocument, TransactionDto>(
        'TransactionDocument',
        'TransactionDto',
        transactions
      ),
      total,
      page,
      limit
    );
  }
}
