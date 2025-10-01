/**
 * Multicall3.sol
 * https://github.com/mds1/multicall/blob/main/src/Multicall3.sol
 */

import { ethers, parseUnits, ZeroAddress } from 'ethers';
import { ERC20_ABI, MULTICALL_ABI_ETHERS } from './contract.constants';
import { MULTICALL_ADDRESS, UNISWAP_V3_QUOTER_ABI, UNISWAP_V3_QUOTER_ADDRESS } from '../../consant';

// Extended ERC20 ABI including token metadata functions
export const ERC20_METADATA_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

/**
 * Interface for allowance batch call result
 */
export interface AllowanceBatchResult {
  owner: string;
  spender: string;
  token: string;
  allowance: bigint;
  success: boolean;
}

/**
 * Interface for balance batch call result
 */
export interface BalanceBatchResult {
  address: string;
  token: string;
  balance: bigint;
  success: boolean;
}

/**
 * Interface for token info result
 */
export interface TokenInfoResult {
  token: string;
  name: string;
  symbol: string;
  decimals: number;
  success: boolean;
}

/**
 * Batch check allowances for multiple owner/spender/token combinations using multicall3
 * @param calls Array of { owner, spender, token } objects
 * @param provider Ethers provider
 * @returns Promise<AllowanceBatchResult[]>
 * @example
 * const allowances = await batchAllowances(
 *   [{ owner: '0x123', spender: '0x456', token: '0x789' }],
 *   provider
 * );
 */
export const batchAllowances = async (
  calls: Array<{ owner: string; spender: string; token: string }>,
  provider: ethers.Provider
): Promise<AllowanceBatchResult[]> => {
  if (calls.length === 0) {
    return [];
  }

  // Create multicall contract instance
  const multicall = new ethers.Contract(
    MULTICALL_ADDRESS,
    MULTICALL_ABI_ETHERS,
    provider
  );

  // Create ERC20 interface for encoding function calls
  const erc20Interface = new ethers.Interface(ERC20_ABI);

  // Prepare multicall data
  const multicallData = calls.map((call) => ({
    target: call.token,
    allowFailure: true,
    callData: erc20Interface.encodeFunctionData('allowance', [
      call.owner,
      call.spender,
    ]),
  }));

  try {
    // Execute multicall
    const results = await multicall.aggregate3.staticCall(multicallData);

    // Process results
    return calls.map((call, index) => {
      const result = results[index];
      let allowance = BigInt(0);
      let success = false;

      if (result.success && result.returnData !== '0x') {
        try {
          const decoded = erc20Interface.decodeFunctionResult(
            'allowance',
            result.returnData
          );
          allowance = BigInt(decoded[0]);
          success = true;
        } catch (error) {
          console.warn(`Failed to decode allowance for ${call.token}:`, error);
        }
      }

      return {
        owner: call.owner,
        spender: call.spender,
        token: call.token,
        allowance,
        success,
      };
    });
  } catch (error) {
    console.error('Batch allowances failed:', error);
    // Return failed results for all calls
    return calls.map((call) => ({
      owner: call.owner,
      spender: call.spender,
      token: call.token,
      allowance: BigInt(0),
      success: false,
    }));
  }
};

/**
 * Batch check balances for multiple address/token combinations using multicall3
 * @param calls Array of { address, token } objects
 * @param provider Ethers provider
 * @returns Promise<BalanceBatchResult[]>
 * @example
 * const balances = await batchBalancesOf(
 *   [{ address: '0x123', token: '0x789' }],
 *   provider
 * );
 */
export const batchBalancesOf = async (
  calls: Array<{ address: string; token: string }>,
  provider: ethers.Provider,
  isNative = false
): Promise<BalanceBatchResult[]> => {
  if (calls.length === 0) {
    return [];
  }

  // Create multicall contract instance
  const multicall = new ethers.Contract(
    MULTICALL_ADDRESS,
    MULTICALL_ABI_ETHERS,
    provider
  );

  // Create ERC20 interface for encoding function calls
  const erc20Interface = new ethers.Interface(
    isNative ? MULTICALL_ABI_ETHERS : ERC20_ABI
  );

  // Prepare multicall data
  const multicallData = calls.map((call) => ({
    target: isNative ? MULTICALL_ADDRESS : call.token,
    allowFailure: true,
    callData: erc20Interface.encodeFunctionData(
      isNative ? 'getEthBalance' : 'balanceOf',
      [call.address]
    ),
  }));

  try {
    // Execute multicall
    const results = await multicall.aggregate3.staticCall(multicallData);

    // Process results
    return calls.map((call, index) => {
      const result = results[index];
      let balance = BigInt(0);
      let success = false;

      if (result.success && result.returnData !== '0x') {
        try {
          const decoded = erc20Interface.decodeFunctionResult(
            isNative ? 'getEthBalance' : 'balanceOf',
            result.returnData
          );
          balance = BigInt(decoded[0]);
          success = true;
        } catch (error) {
          console.warn(`Failed to decode balance for ${call.token}:`, error);
        }
      }

      return {
        address: call.address,
        token: isNative ? ZeroAddress : call.token,
        balance,
        success,
      };
    });
  } catch (error) {
    console.error('Batch balances failed:', error);
    // Return failed results for all calls
    return calls.map((call) => ({
      address: call.address,
      token: call.token,
      balance: BigInt(0),
      success: false,
    }));
  }
};

/**
 * Batch get token information (name, symbol, decimals) for multiple tokens using multicall3
 * @param tokens Array of token addresses
 * @param provider Ethers provider
 * @returns Promise<TokenInfoResult[]>
 * @example
 * const tokenInfo = await batchTokenInfo(
 *   ['0x123', '0x456'],
 *   provider
 * );
 */
export const batchTokenInfo = async (
  tokens: string[],
  provider: ethers.Provider
): Promise<TokenInfoResult[]> => {
  if (tokens.length === 0) {
    return [];
  }

  // Create multicall contract instance
  const multicall = new ethers.Contract(
    MULTICALL_ADDRESS,
    MULTICALL_ABI_ETHERS,
    provider
  );

  // Create ERC20 interface for encoding function calls
  const erc20Interface = new ethers.Interface(ERC20_METADATA_ABI);

  // Prepare multicall data for name, symbol, and decimals for each token
  const multicallData: Array<{
    target: string;
    allowFailure: boolean;
    callData: string;
  }> = [];

  tokens.forEach((token) => {
    // Add name call
    multicallData.push({
      target: token,
      allowFailure: true,
      callData: erc20Interface.encodeFunctionData('name', []),
    });
    // Add symbol call
    multicallData.push({
      target: token,
      allowFailure: true,
      callData: erc20Interface.encodeFunctionData('symbol', []),
    });
    // Add decimals call
    multicallData.push({
      target: token,
      allowFailure: true,
      callData: erc20Interface.encodeFunctionData('decimals', []),
    });
  });

  try {
    // Execute multicall
    const results = await multicall.aggregate3.staticCall(multicallData);

    // Process results - every 3 results correspond to one token (name, symbol, decimals)
    return tokens.map((token, tokenIndex) => {
      const nameIndex = tokenIndex * 3;
      const symbolIndex = tokenIndex * 3 + 1;
      const decimalsIndex = tokenIndex * 3 + 2;

      const nameResult = results[nameIndex];
      const symbolResult = results[symbolIndex];
      const decimalsResult = results[decimalsIndex];

      let name = '';
      let symbol = '';
      let decimals = 0;
      let success = false;

      try {
        // Decode name
        if (nameResult.success && nameResult.returnData !== '0x') {
          const decodedName = erc20Interface.decodeFunctionResult(
            'name',
            nameResult.returnData
          );
          name = decodedName[0];
        }

        // Decode symbol
        if (symbolResult.success && symbolResult.returnData !== '0x') {
          const decodedSymbol = erc20Interface.decodeFunctionResult(
            'symbol',
            symbolResult.returnData
          );
          symbol = decodedSymbol[0];
        }

        // Decode decimals
        if (decimalsResult.success && decimalsResult.returnData !== '0x') {
          const decodedDecimals = erc20Interface.decodeFunctionResult(
            'decimals',
            decimalsResult.returnData
          );
          decimals = Number(decodedDecimals[0]);
        }

        // Consider successful if at least symbol and decimals were retrieved
        success = symbolResult.success && decimalsResult.success;
      } catch (error) {
        console.warn(`Failed to decode token info for ${token}:`, error);
      }

      return {
        token,
        name,
        symbol,
        decimals,
        success,
      };
    });
  } catch (error) {
    console.error('Batch token info failed:', error);
    // Return failed results for all tokens
    return tokens.map((token) => ({
      token,
      name: '',
      symbol: '',
      decimals: 0,
      success: false,
    }));
  }
};

export const batchPrice = async (
  pairs: {
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    decimalsIn: number;
    decimalsOut: number;
  }[],
  provider: ethers.Provider
) => {
  if (pairs.length === 0) {
    return [];
  }

  // Create multicall contract instance
  const multicall = new ethers.Contract(
    MULTICALL_ADDRESS,
    MULTICALL_ABI_ETHERS,
    provider
  );
  const quoterInterface = new ethers.Interface(UNISWAP_V3_QUOTER_ABI);

  const multicallData: Array<{
    target: string;
    allowFailure: boolean;
    callData: string;
  }> = [];
  const skipIdx: number[] = [];
  // Build multicall payload
  pairs.forEach((pair, idx) => {
    if (pair.tokenIn.toLowerCase() === pair.tokenOut.toLowerCase()) {
      skipIdx.push(idx); // will fill later
      return;
    }

    const call = {
      target: UNISWAP_V3_QUOTER_ADDRESS,
      allowFailure: true,
      callData: quoterInterface.encodeFunctionData('quoteExactInputSingle', [
        {
          tokenIn: pair.tokenIn,
          tokenOut: pair.tokenOut,
          fee: 3000,
          amountIn: parseUnits(pair.amountIn, pair.decimalsIn),
          sqrtPriceLimitX96: 0,
        },
      ]),
    };

    multicallData.push(call);
  });

  const prices: { price: string; success: boolean }[] = [];
  // Execute multicall
  const results = await multicall.aggregate3.staticCall(multicallData);
  let resultIdx = 0;
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];

    // Shortcut: tokenIn == tokenOut
    if (skipIdx.includes(i)) {
      prices.push({ price: '1', success: true });
      continue;
    }

    const res = results[resultIdx++];
    let price = '0';
    let success = false;

    try {
      if (res.success && res.returnData !== '0x') {
        const [amountOut] = quoterInterface.decodeFunctionResult(
          'quoteExactInputSingle',
          res.returnData
        );
        price = amountOut.toString(); // or formatUnits(amountOut, pair.decimalsOut);
        success = true;
      }
    } catch (e) {
      console.log(`Decode failed for ${pair.tokenIn}/${pair.tokenOut}`, e);
    }

    prices.push({ price, success });
  }
  return prices;
};

export const uniswapPoolData = async (
  address: string,
  provider: ethers.Provider
) => {
  const abi = [
    'function factory() view returns (address)',
    'function token0() view returns (address)',
    'function token1() view returns (address)',
  ];
  const multicall = new ethers.Contract(
    MULTICALL_ADDRESS,
    MULTICALL_ABI_ETHERS,
    provider
  );
  const poolInterface = new ethers.Interface(abi);
  const multicallData = [
    {
      target: address,
      allowFailure: true,
      callData: poolInterface.encodeFunctionData('factory', []),
    },
    {
      target: address,
      allowFailure: true,
      callData: poolInterface.encodeFunctionData('token0', []),
    },
    {
      target: address,
      allowFailure: true,
      callData: poolInterface.encodeFunctionData('token1', []),
    },
  ];
  try {
    const results = await multicall.aggregate3.staticCall(multicallData);

    return {
      factory: poolInterface
        .decodeFunctionResult('factory', results[0].returnData)[0]
        .toLowerCase(),
      token0: poolInterface
        .decodeFunctionResult('token0', results[1].returnData)[0]
        .toLowerCase(),
      token1: poolInterface
        .decodeFunctionResult('token1', results[2].returnData)[0]
        .toLowerCase(),
    };
  } catch (error) {
    console.error('Failed to get uniswap pool data:', error);
    throw error;
  }
};
