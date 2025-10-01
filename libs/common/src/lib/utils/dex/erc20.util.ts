import { ethers, TransactionResponse } from 'ethers';
import { ETH_ADDRESSES, USDT_ADDRESSES } from '../../consant';
import { ERC20_ABI } from './contract.constants';

const rpc = process.env.MAINNET_RPC_URL;
export const defaultProvider = new ethers.JsonRpcProvider(rpc);
const provider = defaultProvider;

export const decimals = async (tokenAddress: string): Promise<number> => {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const decimals = await token.decimals();
  return Number(decimals);
};

export const isEth = (tokenAddress: string, chainId: number) => {
  return (
    ETH_ADDRESSES.get(`${chainId}`)?.toLowerCase() ===
    tokenAddress.toLowerCase()
  );
};

export const approveToken = async (
  tokenAddress: string,
  spender: string,
  amount: string,
  signer: ethers.Wallet
): Promise<TransactionResponse> => {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const tx = await token.approve(spender, amount);
  return tx;
};

export const transfer = async (
  tokenAddress: string,
  to: string,
  amount: string,
  signer: ethers.Wallet
) => {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const tx = await token.transfer(to, amount);
  return tx;
};

export const balanceOf = async (tokenAddress: string, address: string) => {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  return token.balanceOf(address);
};

export const allowance = async (
  tokenAddress: string,
  address: string,
  spender: string
) => {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  return token.allowance(address, spender);
};

export const approve = async (
  tokenAddress: string,
  spender: string,
  amount: string,
  signer: ethers.Wallet,
  options?: { nonce?: number }
) => {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  return token.approve(spender, amount, options);
};

export const batchApprove = async (
  tokenAddress: string,
  spender: string,
  amount: string,
  signers: ethers.Wallet[],
  concurrency = 2,
  delayInSeconds = 0
) => {
  // slip array of signers into chunks, then submit each chunk to the network
  // to prevent the network from being overloaded
  const batches = [];
  for (let i = 0; i < signers.length; i += concurrency) {
    batches.push(signers.slice(i, i + concurrency));
  }
  const txs = [];
  for (const batch of batches) {
    const promises = batch.map(async (signer) => {
      const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      return token.approve(spender, amount);
    });
    // wait for all promises to be resolved
    txs.push(...(await Promise.all(promises)));

    if (delayInSeconds > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, delayInSeconds * 1000)
      );
    }
  }
  return txs;
};

/**
 * Get decimals for multiple token addresses in parallel
 * Handles ETH addresses by returning 18 decimals
 * @param addresses - Array of token addresses
 * @param chainId - Chain ID for ETH check
 * @returns Map of address to decimals
 */
export const getTokenDecimals = async (
  addresses: string[],
  chainId: number
): Promise<Map<string, number>> => {
  const decimalsMap = new Map<string, number>();

  // ensure all addresses are unique and lowercase
  const uniqueAddresses = [
    ...new Set(addresses.map((address) => address.toLowerCase())),
  ];
  try {
    const promises = uniqueAddresses.map(async (address) => {
      if (isEth(address, chainId)) {
        return [address, 18] as [string, number];
      }
      const tokenDecimals = await decimals(address);
      return [address, Number(tokenDecimals.toString())] as [string, number];
    });

    const results = await Promise.all(promises);
    results.forEach(([address, decimal]) => {
      decimalsMap.set(address, decimal);
    });

    return decimalsMap;
  } catch (error) {
    throw new Error(`Failed to fetch token decimals: ${error.message}`);
  }
};

export const isUSDT = (tokenAddress: string, chainId: number) => {
  return (
    USDT_ADDRESSES.get(`${chainId}`)?.toLowerCase() ===
    tokenAddress.toLowerCase()
  );
};

export const transferNativeToken = async (
    provider: ethers.Provider,
    signer: ethers.Wallet,
    address: string,
    amount: string
  ) => {
    try {
      const balance = await provider.getBalance(signer.address);
      const requiredAmount = ethers.parseEther(amount);
      const estimatedGasCost = 21000n * 20000000000n;
      const totalAmount = requiredAmount + estimatedGasCost;
      if (balance < totalAmount) {
        throw new Error(`Insufficient balance. Balance: ${ethers.formatEther(balance)} - Require: ${ethers.formatEther(totalAmount)}`);
      }

      const tx = await signer.sendTransaction({
        to: address,
        value: requiredAmount,
        // gasLimit: 21000
      });
      // await tx.wait();
      return {
        recipient: address,
        amount: amount,
        txHash: tx.hash,
        success: true
      };
    } catch (error: any) {
      return {
        recipient: address,
        amount: amount,
        txHash: '',
        success: false,
        error: error.message
      };
    }
  }

export const transferToken = async(
  signer: ethers.Wallet,
  tokenAddress: string,
  address: string,
  amount: string
) => {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const decimals = await tokenContract.decimals().catch(() => 18);
    const balance = await tokenContract.balanceOf(signer.address);
    const requiredAmount = ethers.parseUnits(amount, decimals);
    if (balance < requiredAmount) {
      throw new Error(`Insufficient balance. Balance: ${ethers.formatUnits(balance, decimals)} - Require: ${amount}`);
    }
    const tx = await tokenContract.transfer(address, requiredAmount, {
      // gasLimit: 100000
    });
    // await tx.wait();
    return {
      recipient: address,
      amount: amount,
      txHash: tx.hash,
      success: true
    };
  } catch (error: any) {
    return {
      recipient: address,
      amount: amount,
      txHash: '',
      success: false,
      error: error.message
    };
  }
}