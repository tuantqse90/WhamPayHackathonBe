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
import { TransactionQueryDto } from './models';
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
  @ApiQuery({ type: TransactionQueryDto })
  async getTransactions(
    @Req() req: Request,
    @Query() query: TransactionQueryDto
  ): Promise<BasePaginationResultDto<TransactionDto[]>> {
    return this.transactionService.getTransactions({
      ...query,
      userId: req.user['id'],
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
