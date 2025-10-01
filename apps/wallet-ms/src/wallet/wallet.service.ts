import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import {
  batchBalancesOf,
  decrypt,
  defaultProvider,
  encrypt,
  ERC20_ABI,
  generateKey,
  mapArray,
  mapObject,
  MULTISEND_ABI,
  MULTISEND_ADDRESS,
  transferNativeToken,
  transferToken
} from '@pay-wallet/common';
import {
  BaseResultDto,
  Transaction,
  TransactionDocument,
  TransactionStatus,
  TransactionType,
  User,
  UserDocument,
  WalletDocument,
  WalletDto,
  WalletType,
} from '@pay-wallet/domain';
import { ethers, isAddress, Wallet, ZeroAddress } from 'ethers';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  SendTokenResponseDto,
  SendTokensDto,
  TransferTokenDto,
  WalletInfoDto,
  WalletMultiSendDto,
  WithdrawQueueItem,
  WithdrawRequestDto,
} from './models';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  private readonly provider: ethers.Provider;

  constructor(
    private configService: ConfigService,
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {
    const rpcUrl = this.configService.get<string>('RPC_URL') || 'https://scroll-sepolia.drpc.org';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  /**
   * Create a main wallet
   */
  async createMainWallet(
    userId: string
  ): Promise<BaseResultDto<WalletInfoDto>> {
    const existed = await this.walletModel.findOne({
      userId,
      type: WalletType.MAIN,
    });
    if (existed) {
      throw new BadRequestException(
        'Main wallet already exists for this userId'
      );
    }

    const wallet = ethers.Wallet.createRandom();
    const privateKeySalt = generateKey(32, 'hex');
    const mnemonicSalt = generateKey(32, 'base64url');
    const walletEntity = new this.walletModel({
      address: wallet.address.toLowerCase(),
      encryptedMnemonic: encrypt(wallet.mnemonic.phrase, mnemonicSalt),
      encryptedPrivateKey: encrypt(wallet.privateKey, privateKeySalt),
      mnemonicSalt,
      privateKeySalt,
      userId,
      type: WalletType.MAIN,
    });
    await walletEntity.save();
    return new BaseResultDto(
      {
        address: wallet.address.toLowerCase(),
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase,
      },
      'General wallet created successfully',
      true
    );
  }


  /**
   * Create a new wallet
   * @returns The created wallet with its address, private key, and mnemonic
   * @example
   * const wallets = await this.walletService.create(1);
   */
  async createWallet(
    userId: string,
    numberOfWallets: number,
    type: WalletType
  ): Promise<WalletInfoDto[]> {
    if (!userId) {
      throw new BadRequestException('userId must be provided');
    }

    if (type === WalletType.MAIN && numberOfWallets) {
      throw new BadRequestException('Cannot create multiple main wallets');
    }

    const wallets = [];
    const walletEntities = [];
    for (let i = 0; i < numberOfWallets; i++) {
      const wallet = ethers.Wallet.createRandom();
      const privateKeySalt = generateKey(32, 'hex');
      const mnemonicSalt = generateKey(32, 'base64url');
      const walletEntity = new this.walletModel({
        userId,
        address: wallet.address.toLocaleLowerCase(),
        encryptedMnemonic: encrypt(wallet.mnemonic.phrase, mnemonicSalt),
        encryptedPrivateKey: encrypt(wallet.privateKey, privateKeySalt),
        mnemonicSalt,
        privateKeySalt,
        type,
      });
      walletEntities.push(walletEntity);
      wallets.push({
        address: wallet.address.toLocaleLowerCase(),
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase,
      });
    }

    if (walletEntities.length > 0) {
      await this.walletModel.insertMany(walletEntities);
    }

    return wallets;
  }

  /**
   * Get a wallet by address
   * @param address - The address of the wallet to get
   * @returns The wallet
   * @example
   * const wallet = await this.walletService.getWallet('0x1234567890abcdef');
   */
  async getWallet(address: string): Promise<WalletDto> {
    const wallet = await this.walletModel.findOne({
      address: address.toLocaleLowerCase(),
    });
    return mapObject<WalletDocument, WalletDto>(
      'WalletDocument',
      'WalletDto',
      wallet
    );
  }

  /**
   * Get wallets by addresses
   * @param addresses - The addresses of the wallets to get
   * @returns The wallets
   * @example
   * const wallets = await this.walletService.getWallets(['0x1234567890abcdef', '0xabcdef1234567890']);
   */
  async getWallets(addresses: string[]): Promise<WalletDto[]> {
    const walletDocs = await this.walletModel.find({
      address: { $in: addresses },
    });
    const wallets = walletDocs.map((wallet) => wallet.toJSON());
    return mapArray<WalletDocument, WalletDto>(
      'WalletDocument',
      'WalletDto',
      wallets
    );
  }

  /**
   * Get all wallets
   * @returns The wallets
   * @example
   * const wallets = await this.walletService.allWallets();
   */
  async allWallets(): Promise<WalletDto[]> {
    const walletDocs = await this.walletModel.find({});
    const wallets = walletDocs.map((wallet) => wallet.toJSON());
    return mapArray<WalletDocument, WalletDto>(
      'WalletDocument',
      'WalletDto',
      wallets
    );
  }

  /**
   * Get all system wallets
   * @returns The system wallets
   * @example
   * const wallets = await this.walletService.allSystemWallets();
   */
  async allSystemWallets(): Promise<WalletDto[]> {
    const walletDocs = await this.walletModel.find({
      userId: 'SYSTEM',
    });
    const wallets = walletDocs.map((wallet) => wallet.toJSON());
    return mapArray<WalletDocument, WalletDto>(
      'WalletDocument',
      'WalletDto',
      wallets
    );
  }

  /**
   * Export the unique main wallet for an userId (decrypt privateKey and mnemonic)
   */
  async exportMainWallet(
    userId: string
  ): Promise<BaseResultDto<WalletInfoDto>> {
    const wallet = await this.walletModel.findOne({
      userId,
      type: WalletType.MAIN,
    });
    if (!wallet)
      throw new BadRequestException(
        'General wallet not found for this userId'
      );
    const privateKey = decrypt(
      wallet.encryptedPrivateKey,
      wallet.privateKeySalt
    );
    const mnemonic = decrypt(wallet.encryptedMnemonic, wallet.mnemonicSalt);
    return new BaseResultDto(
      {
        address: wallet.address,
        privateKey,
        mnemonic,
      },
      'General wallet exported successfully',
      true
    );
  }

  async sendToken(payload: SendTokensDto): Promise<SendTokenResponseDto> {
    const { chainId, privateKey, tokenAddress, isNative, amount, wallets } =
      payload;
    const signer = new ethers.Wallet(privateKey, defaultProvider);
    const multiSendAddress = MULTISEND_ADDRESS[chainId];
    if (!multiSendAddress) {
      throw new Error('Multisend address not found');
    }
    const multisendContract = new ethers.Contract(
      multiSendAddress,
      MULTISEND_ABI,
      signer
    );
    let decimals = 18;
    let tokenContract: ethers.Contract;
    let balance = await defaultProvider.getBalance(signer.address);
    if (!isNative) {
      tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      decimals = await tokenContract.decimals();
      balance = await tokenContract.balanceOf(signer.address);
    }
    // Check token balance
    const tokenAmount = ethers.parseUnits(`${amount}`, decimals);
    const tokenAmounts = Array(wallets.length).fill(tokenAmount);
    const totalAmount = tokenAmount * BigInt(wallets.length);
    if (balance < totalAmount) {
      throw new BadRequestException(
        `Insufficient token balance. Required: ${ethers.formatEther(
          totalAmount
        )}, Available: ${ethers.formatEther(balance)}`
      );
    }

    // Approve multisend contract
    if (!isNative) {
      console.log(`Approving multisend contract for token: ${tokenAddress}`);
      const approveTx = await tokenContract.approve(
        multiSendAddress,
        totalAmount
      );
      console.log(`Approval transaction hash: ${approveTx.hash}`);
      await approveTx.wait();
    }
    // Execute multi send
    let tx;
    if (isNative) {
      tx = await multisendContract.multiSend(wallets, tokenAmounts, {
        value: totalAmount,
      });
    } else {
      tx = await multisendContract.multiSendERC20(
        wallets,
        tokenAmounts,
        tokenAddress
      );
    }

    const receipt = await tx.wait();
    return {
      transactionHash: tx.hash,
      tokenAddress,
      amount: amount,
      recipients: wallets,
      status: receipt.status === 1 ? 'success' : 'failed',
    } as SendTokenResponseDto;
  }

  async multiSend(
    payload: WalletMultiSendDto
  ): Promise<BaseResultDto<SendTokenResponseDto>> {
    const { userId, wallets, isNative, tokenAddress, amount, chainId } = payload;
    if (!isNative && !isAddress(tokenAddress)) {
      throw new BadRequestException('Address is not valid');
    }
    if (isNative && isAddress(tokenAddress)) {
      throw new BadRequestException(
        'Should not provide address when withdraw native'
      );
    }

    const wallet = await this.walletModel.findOne({
      userId,
      type: WalletType.MAIN,
    });
    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    const privateKey = decrypt(wallet.encryptedPrivateKey, wallet.privateKeySalt);
    const signer = new ethers.Wallet(privateKey, defaultProvider);
    let decimals = 18;
    let balance: bigint;

    if (isNative) {
      balance = await defaultProvider.getBalance(signer.address);
    } else {
      if (!tokenAddress) {
        throw new BadRequestException('Token address is required');
      }
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        defaultProvider
      );
      [decimals, balance] = await Promise.all([
        tokenContract.decimals(),
        tokenContract.balanceOf(signer.address),
      ]);
    }

    const tokenAmount = ethers.parseUnits(`${amount}`, decimals);
    const totalAmount = tokenAmount * BigInt(wallets.length);

    if (balance < totalAmount) {
      throw new BadRequestException('Insufficient balance');
    }

    const result = await this.sendToken({
      chainId: chainId ?? 8453,
      tokenAddress,
      isNative,
      amount,
      privateKey,
      wallets,
    });

    return new BaseResultDto<SendTokenResponseDto>(
      result,
      'Tokens sent successfully',
      true
    );
  }

  /**
   * Enqueue a withdrawal job in Redis for a specific account
   */
  // async enqueueWithdrawJob(
  //   userId: string,
  //   job: WithdrawQueueItem
  // ): Promise<void> {
  //   const queueKey = `withdrawal-queue-${userId}`;
  //   await this.redisService.getClient().rpush(queueKey, JSON.stringify(job));
  // }

  // /**
  //  * Dequeue a withdrawal job from Redis for a specific account
  //  */
  // async dequeueWithdrawJob(
  //   userId: string
  // ): Promise<WithdrawQueueItem | null> {
  //   const queueKey = `withdrawal-queue-${userId}`;
  //   const jobStr = await this.redisService.getClient().lpop(queueKey);
  //   if (!jobStr) return null;
  //   return JSON.parse(jobStr);
  // }

  // /**
  //  * Get withdrawal queue length for a specific account
  //  */
  // async getWithdrawQueueLength(userId: string): Promise<number> {
  //   const queueKey = `withdrawal-queue-${userId}`;
  //   return await this.redisService.getClient().llen(queueKey);
  // }

  /**
   * Withdraw tokens from multiple wallets to a recipient.
   * Enqueues jobs for processing.
   */
  async withdraw(dto: WithdrawRequestDto): Promise<BaseResultDto<string[]>> {
    const {
      wallets,
      amount,
      tokenAddress,
      chainId = 8543,
      userId,
      isNative,
    } = dto;
    if (!isNative && !isAddress(tokenAddress)) {
      throw new BadRequestException('Address is not valid');
    }
    if (isNative && isAddress(tokenAddress)) {
      throw new BadRequestException(
        'Should not provide address when withdraw native'
      );
    }
    //find main wallet
    const mainWallet = await this.walletModel.findOne({
      userId,
      type: WalletType.MAIN,
    });
    if (!mainWallet) {
      throw new BadRequestException('General wallet not found');
    }

    const recipient = mainWallet.address.toLowerCase();
    const jobIds: string[] = [];
    for (let i = 0; i < wallets.length; i++) {
      const jobId = uuidv4();
      const job: WithdrawQueueItem = {
        jobId,
        chainId,
        userId,
        recipient,
        isNative,
        tokenAddress,
        walletAddress: wallets[i],
        amount: amount.toString(),
        createdAt: new Date().toISOString(),
      };
      // await this.enqueueWithdrawJob(userId, job);
      jobIds.push(jobId);
      await this.transactionModel.create({
        chainId,
        userId,
        from: wallets[i],
        to: recipient,
        type: TransactionType.WITHDRAW,
        status: TransactionStatus.PROCESSING,
        transactionHash:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        data: {
          jobId,
          tokenAddress,
          recipient,
          amount,
        },
      });
    }
    return new BaseResultDto(jobIds, 'Withdrawal jobs enqueued', true);
  }

  async transfer(payload: TransferTokenDto) {
    const { userId, recipient, tokenAddress, isNative, amount } = payload;
    const user = await this.userModel.findOne({
      _id: userId,
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const wallet = await this.walletModel.findOne({
      userId: userId,
    });
    const privateKey = decrypt(
      wallet.encryptedPrivateKey,
      wallet.privateKeySalt
    );
    let recipientAddress: string;
    let recipientUser = await this.userModel.findOne({
      username: recipient,
    });
    if (!recipientUser) {
      recipientUser = await this.userModel.insertOne(
        {
          username: recipient,
          email: `${recipient}@gmail.com`
        }
      );
      const newWallet = await this.createMainWallet(recipientUser.id);
      recipientAddress = newWallet.data.address;
    } else {
      const recipientWallet = await this.walletModel.findOne({
        userId: recipientUser.id,
        type: WalletType.MAIN,
      });
      if (!recipientWallet) {
        const newWallet = await this.createMainWallet(recipientUser.id);
        recipientAddress = newWallet.data.address;
      } else {
        recipientAddress = recipientWallet.address;
      }
    }
    let result: any;
    const signer = new ethers.Wallet(privateKey, this.provider);
    if (isNative) {
      result = await transferNativeToken(this.provider, signer, recipientAddress, amount.toString());
    } else {
      if (!isAddress(tokenAddress)) {
        throw new BadRequestException('Token address is not valid');
      }
      result = await transferToken(signer, tokenAddress, recipientAddress, amount.toString());
    }
    return new BaseResultDto<SendTokenResponseDto>(
      result,
      result.success ? 'Token transfer successful' : 'Token transfer failed',
      result.success
    );
  }

  async getWalletPrivateKey(
    address: string,
    userId: string
  ): Promise<string> {
    const wallet = await this.walletModel.findOne({
      address: address.toLowerCase(),
      userId,
    });
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    return decrypt(wallet.encryptedPrivateKey, wallet.privateKeySalt);
  }

  async getBalances(
    addresses: string[],
    tokenAddress: string,
    isNative: false
  ) {
    const token = isNative ? ZeroAddress : tokenAddress;
    const batchSize = 20;
    const walletBatches = [];
    let allBalances = [];
    const mapWallets = addresses.map((wallet) => {
      return {
        address: wallet,
        token: token,
      };
    });
    for (let i = 0; i < mapWallets.length; i += batchSize) {
      walletBatches.push(mapWallets.slice(i, i + batchSize));
    }
    for (const batch of walletBatches) {
      const batchBalances = await batchBalancesOf(
        batch,
        defaultProvider,
        isNative
      );
      allBalances = [...allBalances, ...batchBalances];
    }
    return allBalances.map((balance) => ({
      address: balance.address,
      balance: balance.balance.toString(),
    }));
  }
}
