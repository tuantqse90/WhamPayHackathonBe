import { Injectable, Logger } from '@nestjs/common';
import {
  WalletDto,
} from '@pay-wallet/domain';
import { ethers, TransactionResponse } from 'ethers';
import {
  batchAllowances,
  batchApprove,
  decrypt,
  defaultProvider,
} from '../utils';
import { UNISWAP_V3_ROUTER_ADDRESS } from '../consant';

@Injectable()
export class SharedService {
  private readonly logger = new Logger(SharedService.name);

  async batchApprove(
    tokenAddress: string,
    address: string,
    wallets: WalletDto[]
  ): Promise<TransactionResponse[]> {
    if (!wallets || wallets.length === 0) {
      this.logger.error(`No wallets found`);
      return [];
    }
    if (!wallets) return [];
    const maxAllowance = ethers.MaxUint256;
    const tnxs: TransactionResponse[] = [];

    const calls = wallets.map((wallet) => ({
      owner: wallet.address,
      spender: UNISWAP_V3_ROUTER_ADDRESS,
      token: tokenAddress,
    }));
    const allowanceResults = await batchAllowances(calls, defaultProvider);
    const needToApprove = allowanceResults.filter(
      (result) => result.allowance < maxAllowance
    );
    if (needToApprove.length === 0) {
      this.logger.log(
        `All wallets have allowanced for trading ${tokenAddress}`
      );
      return [];
    }
    if (needToApprove.length > 0) {
      const sellTokenApproveTnxs = await batchApprove(
        tokenAddress,
        UNISWAP_V3_ROUTER_ADDRESS,
        maxAllowance.toString(),
        wallets.map(
          (wallet) =>
            new ethers.Wallet(
              decrypt(wallet.encryptedPrivateKey, wallet.privateKeySalt),
              defaultProvider
            )
        ),
        2,
        0.5
      );
      tnxs.push(...sellTokenApproveTnxs);
    }

    this.logger.log(
      `Approved ${tnxs.length} transactions for tokens ${tokenAddress}`
    );
    return tnxs;
  }
}
