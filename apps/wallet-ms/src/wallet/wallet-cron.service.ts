import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { defaultProvider, ERC20_ABI, isUSDT, RedisService } from '@pay-wallet/common';
import {
  Transaction,
  TransactionDocument,
  TransactionStatus,
  TransactionType,
} from '@pay-wallet/domain';
import { ethers } from 'ethers';
import { Model } from 'mongoose';
import { WithdrawQueueItem } from './models';
import { WalletService } from './wallet.service';

@Injectable()
export class WalletWithdrawCronService {
  private readonly logger = new Logger(WalletWithdrawCronService.name);

  constructor(
    private readonly walletService: WalletService,
    private readonly redisService: RedisService,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>
  ) {}

  /**
   * Cron job to process withdrawal jobs for all accounts
   */
  // @Cron('*/1 * * * *', {
  //   name: 'processWithdrawal',
  // })
  // async processWithdrawals() {
  //   // TODO: Replace with actual logic to get all userIds with queues
  //   const userIds = await this.getAllAccountIdsWithQueues();
  //   for (const userId of userIds) {
  //     let job: WithdrawQueueItem | null;
  //     // Process all jobs in the queue for this account
  //     while ((job = await this.walletService.dequeueWithdrawJob(userId))) {
  //       try {
  //         const txHash = await this.executeWithdrawJob(job);
  //         this.logger.log(
  //           `Processed withdrawal job ${job.jobId} for account ${userId}, txHash: ${txHash}`
  //         );
  //       } catch (err) {
  //         this.logger.error(
  //           `Failed to process withdrawal job ${job.jobId} for account ${userId}: ${err}`
  //         );
  //       }
  //     }
  //   }
  // }

  private async getAllAccountIdsWithQueues(): Promise<string[]> {
    // Example: scan Redis for keys matching 'withdrawal-queue-*'
    const client = this.redisService.getClient();
    const keys = await client.keys('withdrawal-queue-*');
    return keys.map((key: string) => key.replace('withdrawal-queue-', ''));
  }

  private async executeWithdrawJob(job: WithdrawQueueItem): Promise<string> {
    // 1. Get and decrypt the wallet's private key
    const privateKey =
      await this.walletService.getWalletPrivateKey(
        job.walletAddress,
        job.userId,
      );
    const signer = new ethers.Wallet(privateKey, defaultProvider);
    let txHash = '';
    try {
      // 2. Check balance
      let balance: bigint;
      let decimals = 18;
      if (job.isNative) {
        balance = await defaultProvider.getBalance(signer.address);
      } else {
        const tokenContract = new ethers.Contract(
          job.tokenAddress,
          ERC20_ABI,
          defaultProvider
        );
        [decimals, balance] = await Promise.all([
          tokenContract.decimals(),
          tokenContract.balanceOf(signer.address),
        ]);
      }
      const amount = ethers.parseUnits(job.amount, decimals);
      if (balance < amount) {
        throw new Error('Insufficient balance');
      }
      // 3. Approve (ERC20, handle USDT special case)
      if (!job.isNative) {
        // USDT special handling: reset allowance to 0 before setting new allowance
        const recipient = job.recipient;
        const tokenContract = new ethers.Contract(
          job.tokenAddress,
          ERC20_ABI,
          signer
        );
        const currentAllowance = await tokenContract.allowance(
          signer.address,
          recipient
        );
        if (isUSDT(job.tokenAddress, job.chainId)) {
          if (currentAllowance > 0n) {
            const tx0 = await tokenContract.approve(recipient, 0);
            await tx0.wait();
          }
        }
        if (currentAllowance < amount) {
          const tx1 = await tokenContract.approve(recipient, amount);
          await tx1.wait();
        }
        // 4. Transfer ERC20
        const tx = await tokenContract.transfer(recipient, amount);
        const receipt = await tx.wait();
        txHash = receipt.hash;
      } else {
        // 4. Transfer native
        const tx = await signer.sendTransaction({
          to: job.recipient,
          value: amount,
        });
        const receipt = await tx.wait();
        txHash = receipt.hash;
      }
      // 5. Update transaction with tx hash and status
      await this.transactionModel.updateOne(
        {
          type: TransactionType.WITHDRAW,
          'data.jobId': job.jobId,
          userId: job.userId,
        },
        {
          $set: {
            transactionHash: txHash,
            status: TransactionStatus.COMPLETED,
          },
        }
      );
      return txHash;
    } catch (err) {
      // Update transaction status to failed
      await this.transactionModel.updateOne(
        {
          type: TransactionType.WITHDRAW,
          'data.jobId': job.jobId,
          userId: job.userId,
        },
        {
          $set: {
            status: TransactionStatus.FAILED,
          },
        }
      );
      throw err;
    }
  }
}
