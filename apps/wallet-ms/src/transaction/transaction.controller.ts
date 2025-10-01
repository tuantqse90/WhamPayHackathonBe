import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@pay-wallet/common';
import { BasePaginationResultDto, TransactionDto } from '@pay-wallet/domain';
import { Request } from 'express';
import { ListTransactionsDto } from './models';
import { TransactionService } from './transaction.service';
@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-Auth')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  /**
   * Get transactions with optional filtering
   * @param query - Query parameters for filtering transactions
   * @returns Array of transactions matching the query
   */
  @Get()
  @ApiOperation({ summary: 'List transactions' })
  @ApiQuery({ type: ListTransactionsDto })
  async listTransactions(
    @Req() req: Request,
    @Query() query: ListTransactionsDto
  ): Promise<BasePaginationResultDto<TransactionDto[]>> {
    return this.transactionService.listTransactions({
      ...query,
      username: req.user['username'],
      userAddress: req.user['address'],
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by its ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ type: TransactionDto })
  async getTransactionById(@Param('id') id: string) {
    return this.transactionService.findById(id);
  }
}
