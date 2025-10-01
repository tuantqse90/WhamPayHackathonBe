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
import { CreateTransactionDto, TransactionQueryDto } from './models';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>
  ) {}

  /**
   * Create a new transaction
   * @param transaction - The transaction to create
   * @returns The created transaction
   * @example
   * const transaction = await this.transactionService.create({
   *   from: '0x1234567890abcdef',
   *   to: '0xabcdef1234567890',
   *   amount: 100,
   *   status: 'pending',
   * });
   */
  async create(transaction: CreateTransactionDto): Promise<TransactionDto> {
    const createdTransaction = await this.transactionModel.create(transaction);
    return mapObject<TransactionDocument, TransactionDto>(
      'TransactionDocument',
      'TransactionDto',
      createdTransaction
    );
  }

  /**
   * Update a transaction
   * @param id - The ID of the transaction to update
   * @param transaction - The transaction to update
   * @returns The updated transaction
   * @example
   * const updatedTransaction = await this.transactionService.partialUpdate('0x1234567890abcdef', { status: 'completed' });
   */
  async partialUpdate(
    id: string,
    transaction: Partial<TransactionDto>
  ): Promise<TransactionDto> {
    // check if the transaction exists
    const existingTransaction = await this.findById(id);
    if (!existingTransaction) {
      throw new NotFoundException('Transaction not found');
    }

    const updatedTransaction = await this.transactionModel.findByIdAndUpdate(
      id,
      transaction,
      {
        new: true,
      }
    );

    return mapObject<TransactionDocument, TransactionDto>(
      'TransactionDocument',
      'TransactionDto',
      updatedTransaction
    );
  }

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
   * const transactions = await this.transactionService.getTransactions({
   *   userId: '0x1234567890abcdef',
   *   chainId: 1,
   *   type: 'swap',
   *   status: 'completed',
   * });
   */
  async getTransactions(
    query: TransactionQueryDto
  ): Promise<BasePaginationResultDto<TransactionDto[]>> {
    const page = query.page || 1;
    const limit = query.size || 100;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<TransactionDocument> = {};

    if (query.userId) filter.userId = query.userId;
    if (query.chainId) filter.chainId = Number(query.chainId);
    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;
    if (query.from) filter.from = query.from;
    if (query.search) {
      filter.$or = [
        { transactionHash: { $regex: query.search, $options: 'i' } },
        { from: { $regex: query.search, $options: 'i' } },
        { to: { $regex: query.search, $options: 'i' } },
      ];
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
