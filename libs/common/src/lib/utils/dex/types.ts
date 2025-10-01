export interface QuoteResponse {
  blockNumber: string;
  buyAmount: string;
  buyToken: string;
  fees: {
    integratorFee: null | string;
    zeroExFee: null | string;
    gasFee: null | string;
  };
  issues: {
    allowance: {
      actual: string;
      spender: string;
    };
    balance: {
      token: string;
      actual: string;
      expected: string;
    };
    simulationIncomplete: boolean;
    invalidSourcesPassed: string[];
  };
  liquidityAvailable: boolean;
  minBuyAmount: string;
  permit2: {
    type: string;
    hash: string;
    eip712: {
      types: {
        PermitTransferFrom: Array<{
          name: string;
          type: string;
        }>;
        TokenPermissions: Array<{
          name: string;
          type: string;
        }>;
        EIP712Domain: Array<{
          name: string;
          type: string;
        }>;
      };
      domain: {
        name: string;
        chainId: number;
        verifyingContract: string;
      };
      message: {
        permitted: {
          token: string;
          amount: string;
        };
        spender: string;
        nonce: string;
        deadline: string;
      };
      primaryType: string;
    };
  };
  route: {
    fills: Array<{
      from: string;
      to: string;
      source: string;
      proportionBps: string;
    }>;
    tokens: Array<{
      address: string;
      symbol: string;
    }>;
  };
  sellAmount: string;
  sellToken: string;
  tokenMetadata: {
    buyToken: {
      buyTaxBps: string;
      sellTaxBps: string;
    };
    sellToken: {
      buyTaxBps: string;
      sellTaxBps: string;
    };
  };
  totalNetworkFee: string;
  transaction: {
    to: string;
    data: string;
    gas: string;
    gasPrice: string;
    value: string;
  };
  zid: string;
}

export interface PriceResponse {
  blockNumber: string;
  buyAmount: string;
  buyToken: string;
  fees: {
    integratorFee: string | null;
    zeroExFee: string | null;
    gasFee: string | null;
  };
  gas: string;
  gasPrice: string;
  issues: {
    allowance: {
      actual: string;
      spender: string;
    };
    balance: {
      token: string;
      actual: string;
      expected: string;
    };
    simulationIncomplete: boolean;
    invalidSourcesPassed: string[];
  };
  liquidityAvailable: boolean;
  minBuyAmount: string;
  route: {
    fills: Array<{
      from: string;
      to: string;
      source: string;
      proportionBps: string;
    }>;
    tokens: Array<{
      address: string;
      symbol: string;
    }>;
  };
  sellAmount: string;
  sellToken: string;
  tokenMetadata: {
    buyToken: {
      buyTaxBps: string;
      sellTaxBps: string;
    };
    sellToken: {
      buyTaxBps: string;
      sellTaxBps: string;
    };
  };
  totalNetworkFee: string;
  zid: string;
}

export interface GaslessQuoteResponse {
  quoteId: string;
}

export interface DeployedContractResponse {
  address: string;
  transactionHash: string;
}

export interface TransactionResponse {
  transactionHash: string;
}

export interface Wallet {
  address: string;
  privateKey: string;
  mnemonic: string;
}

// export interface EIP712TypedData {
//   types: Record<string, TypedDataField[]>;
//   domain: TypedDataDomain;
//   message: {
//     [key: string]: unknown;
//   };
//   primaryType: string;
// }

/**
 * Params
 */
export class ExecuteSwapParams {
  chainId: number;
  buyToken: string;
  sellToken: string | 'ETH';
  sellAmount: string;
  taker: string;
  slippageBps?: number;
}

export class GetQuoteParams {
  chainId: number;
  buyToken: string;
  sellToken: string | 'ETH';
  sellAmount: string;
  slippageBps?: number;
  taker: string;
}

export interface AddLiquidityParams {
  chainId: number;
  tokenA: string;
  tokenB: string;
  amountA: string;
  amountB: string;
  taker: string;
}

export interface AddLiquidityWithETHParams {
  chainId: number;
  token: string;
  amountToken: string;
  amountETH: string;
  taker: string;
}

export class LiquidityUniswapV2Response {
  hash: string;
  pairAddress: string;
  dex: string;
}

export class SwapETHForTokensParams {
  chainId: number;
  amount: string;
  taker: string;
}

export class SwapTokensForETHParams {
  chainId: number;
  token: string;
  amount: string;
  taker: string;
}

export class SwapTokensForTokensParams {
  chainId: number;
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  taker: string;
}

export interface NativeToWrappedParams {
  chainId: number;
  amount: string;
}

export interface WrapResponse {
  hash: string;
  amount: string;
}
