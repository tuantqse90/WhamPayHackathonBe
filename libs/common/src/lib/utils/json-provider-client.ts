/* eslint-disable @typescript-eslint/no-explicit-any */
// Create a JSON provider client with failover capabilities
import {
  JsonRpcProvider,
  Network,
  FetchResponse,
  TransactionReceipt,
  TransactionResponse,
} from 'ethers';

/**
 * A JsonRpcProvider that handles multiple RPC nodes with failover capabilities
 * and round-robin retries when encountering 419 (rate limit) errors or other
 * temporary failures. This provider automatically switches to the next available
 * RPC URL in a round-robin fashion when the current one fails.
 */
export class JsonRpcProviderWithFailover extends JsonRpcProvider {
  private rpcUrls: string[];
  private currentUrlIndex: number;
  private maxRetries: number;
  private network?: Network;
  private currentProvider: JsonRpcProvider;

  /**
   * Create a new JsonRpcProviderWithFailover
   * @param rpcUrls - Array of RPC URLs to use in round-robin fashion
   * @param network - The network to connect to
   * @param maxRetries - Maximum number of retries before giving up (defaults to rpcUrls.length)
   */
  constructor(rpcUrls: string[], network?: Network, maxRetries?: number) {
    if (!rpcUrls || rpcUrls.length === 0) {
      throw new Error('At least one RPC URL must be provided');
    }

    // Start with the first URL
    super(rpcUrls[0], network);

    this.rpcUrls = rpcUrls;
    this.currentUrlIndex = 0;
    this.maxRetries = maxRetries || rpcUrls.length;
    this.network = network;
    this.currentProvider = new JsonRpcProvider(rpcUrls[0], network);
  }

  /**
   * Override the _send method to handle failover logic
   */
  override async _send(payload: any): Promise<any> {
    let lastError: Error | null = null;
    let retryCount = 0;

    while (retryCount < this.maxRetries) {
      try {
        // Update the URL if this is a retry
        if (retryCount > 0) {
          console.log(
            `Attempting retry ${retryCount}/${
              this.maxRetries
            } with RPC URL: ${this.getCurrentRpcUrl()}`
          );
          this.switchToNextRpcUrl();
        }

        // Use the current provider to send the request
        const result = await this.currentProvider._send(payload);

        // If we succeeded after retries, log the success
        if (retryCount > 0) {
          console.log(
            `Request succeeded after ${retryCount} retries with RPC URL: ${this.getCurrentRpcUrl()}`
          );
        }

        return result;
      } catch (error: any) {
        lastError = error;

        console.error(`RPC request failed on URL ${this.getCurrentRpcUrl()}:`, {
          error: error.message,
          status: error.status,
          code: error.code,
          retryCount: retryCount + 1,
          maxRetries: this.maxRetries,
        });

        // Check if the error is a 419 (rate limit) error or other potentially recoverable error
        if (this.isRetryableError(error)) {
          retryCount++;
          console.warn(
            `Retryable error detected, switching to next RPC URL (${retryCount}/${this.maxRetries} retries)`
          );
          continue;
        }

        // If it's not a retryable error, throw immediately
        console.error(
          `Non-retryable error detected, throwing immediately:`,
          error
        );
        throw error;
      }
    }

    // If we've exhausted all retries, throw the last error
    console.error(
      `All ${this.maxRetries} retries exhausted. Last error:`,
      lastError
    );
    throw lastError || new Error('Failed to send request after all retries');
  }

  /**
   * Switch to the next RPC URL in the round-robin sequence
   */
  private switchToNextRpcUrl(): void {
    // Update the current URL index (round-robin)
    this.currentUrlIndex = (this.currentUrlIndex + 1) % this.rpcUrls.length;

    // Get the new URL
    const newUrl = this.rpcUrls[this.currentUrlIndex];

    // Create a new provider instance with the new URL
    this.currentProvider = new JsonRpcProvider(newUrl, this.network);

    console.log(`Switched to RPC URL: ${newUrl}`);
  }

  /**
   * Override getNetwork to use current provider
   */
  override async getNetwork(): Promise<Network> {
    return this.currentProvider.getNetwork();
  }

  /**
   * Override getBlockNumber to use current provider
   */
  override async getBlockNumber(): Promise<number> {
    return this.currentProvider.getBlockNumber();
  }

  /**
   * Override getBalance to use current provider
   */
  override async getBalance(address: string): Promise<bigint> {
    return this.currentProvider.getBalance(address);
  }

  /**
   * Override getTransaction to use current provider
   */
  override async getTransaction(
    hash: string
  ): Promise<null | TransactionResponse> {
    return this.currentProvider.getTransaction(hash);
  }

  /**
   * Override getTransactionReceipt to use current provider
   */
  override async getTransactionReceipt(
    hash: string
  ): Promise<null | TransactionReceipt> {
    return this.currentProvider.getTransactionReceipt(hash);
  }

  /**
   * Override getLogs to use current provider
   */
  override async getLogs(filter: any): Promise<any[]> {
    return this.currentProvider.getLogs(filter);
  }

  /**
   * Override call to use current provider
   */
  override async call(tx: any): Promise<string> {
    return this.currentProvider.call(tx);
  }

  /**
   * Override estimateGas to use current provider
   */
  override async estimateGas(tx: any): Promise<bigint> {
    return this.currentProvider.estimateGas(tx);
  }

  /**
   * Override getFeeData to use current provider
   */
  override async getFeeData(): Promise<any> {
    return this.currentProvider.getFeeData();
  }

  /**
   * Get the current provider's connection info
   */
  public getCurrentProvider(): JsonRpcProvider {
    return this.currentProvider;
  }

  /**
   * Get the current provider's connection URL
   */
  public getConnectionUrl(): string {
    return (
      (this.currentProvider as any).connection?.url || this.getCurrentRpcUrl()
    );
  }

  /**
   * Test method to verify provider switching works correctly
   * This can be used for debugging and testing purposes
   */
  public async testProviderConnection(): Promise<{
    success: boolean;
    url: string;
    error?: string;
    blockNumber?: number;
  }> {
    try {
      const blockNumber = await this.currentProvider.getBlockNumber();
      return {
        success: true,
        url: this.getCurrentRpcUrl(),
        blockNumber: blockNumber,
      };
    } catch (error: any) {
      return {
        success: false,
        url: this.getCurrentRpcUrl(),
        error: error.message,
      };
    }
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: any): boolean {
    // Check for HTTP 419 (rate limit) errors - this is the main issue the user reported
    if (error.status === 419 || error.status === '419') {
      console.log('419 rate limit error detected - retrying with next RPC');
      return true;
    }

    // Check for HTTP 429 (Too Many Requests) errors - standard rate limiting
    if (error.status === 429 || error.status === '429') {
      console.log('429 rate limit error detected - retrying with next RPC');
      return true;
    }

    // Check for common retryable error codes
    if (
      error.code === 'SERVER_ERROR' ||
      error.code === 'TIMEOUT' ||
      error.code === 'NETWORK_ERROR' ||
      error.code === 'UNKNOWN_ERROR' ||
      error.code === 'ENOTFOUND' || // DNS resolution failure
      error.code === 'ECONNREFUSED' || // Connection refused
      error.code === 'ECONNRESET' || // Connection reset
      error.code === 'ETIMEDOUT' || // Connection timeout
      error.code === 'EHOSTUNREACH' || // Host unreachable
      error.code === 'ENETUNREACH' // Network unreachable
    ) {
      console.log(`Retryable error code detected: ${error.code}`);
      return true;
    }

    // Check for fetch responses with status codes that indicate temporary issues
    if (error.response instanceof FetchResponse) {
      const status = error.response.status;
      // 408: Request Timeout, 5xx: Server errors, 419: Rate limit, 429: Too Many Requests
      if (
        status === 408 ||
        status === 419 ||
        status === 429 ||
        (status >= 500 && status < 600)
      ) {
        console.log(`Retryable HTTP status detected: ${status}`);
        return true;
      }
    }

    // Check for connection errors in the error message
    if (error.message && typeof error.message === 'string') {
      const message = error.message.toLowerCase();
      if (
        message.includes('connection') ||
        message.includes('timeout') ||
        message.includes('rate limit') ||
        message.includes('too many requests') ||
        message.includes('419') ||
        message.includes('429') ||
        message.includes('network error') ||
        message.includes('fetch failed') ||
        message.includes('enotfound') ||
        message.includes('dns') ||
        message.includes('getaddrinfo') ||
        message.includes('host not found') ||
        message.includes('connection refused') ||
        message.includes('connection reset') ||
        message.includes('host unreachable') ||
        message.includes('network unreachable') ||
        message.includes('socket hang up') ||
        message.includes('socket timeout')
      ) {
        console.log(`Retryable error message detected: ${error.message}`);
        return true;
      }
    }

    // Check for ethers.js specific error formats
    if (error.error && error.error.code) {
      const errorCode = error.error.code;
      if (errorCode === -32005 || errorCode === -32000) {
        // Common rate limit codes
        console.log(`Retryable JSON-RPC error code detected: ${errorCode}`);
        return true;
      }
    }

    console.log(`Non-retryable error detected:`, {
      status: error.status,
      code: error.code,
      message: error.message,
    });
    return false;
  }

  /**
   * Get the currently active RPC URL
   */
  public getCurrentRpcUrl(): string {
    return this.rpcUrls[this.currentUrlIndex];
  }

  /**
   * Get all configured RPC URLs
   */
  public getRpcUrls(): string[] {
    return [...this.rpcUrls];
  }

  /**
   * Add a new RPC URL to the list
   */
  public addRpcUrl(url: string): void {
    if (!this.rpcUrls.includes(url)) {
      this.rpcUrls.push(url);
    }
  }

  /**
   * Remove an RPC URL from the list
   */
  public removeRpcUrl(url: string): boolean {
    if (this.rpcUrls.length <= 1) {
      return false; // Cannot remove the last URL
    }

    const index = this.rpcUrls.indexOf(url);
    if (index !== -1) {
      this.rpcUrls.splice(index, 1);

      // If we removed the current URL, switch to the next one
      if (index === this.currentUrlIndex) {
        this.switchToNextRpcUrl();
      } else if (index < this.currentUrlIndex) {
        // Adjust the current index if we removed a URL before it
        this.currentUrlIndex--;
      }

      // Update the current provider if needed
      if (index === this.currentUrlIndex) {
        this.currentProvider = new JsonRpcProvider(
          this.getCurrentRpcUrl(),
          this.network
        );
      }

      return true;
    }

    return false;
  }
}

/**
 * Create a new JsonRpcProviderWithFailover with the given RPC URLs
 * @param rpcUrls - Array of RPC URLs to use in round-robin fashion
 * @param network - The network to connect to
 * @param maxRetries - Maximum number of retries before giving up
 * @returns A provider with failover capabilities
 *
 * @example
 * // For Ethereum mainnet with multiple providers
 * const provider = createJsonRpcProviderWithFailover([
 *   'https://eth-mainnet.alchemyapi.io/v2/your-api-key',
 *   'https://mainnet.infura.io/v3/your-api-key',
 *   'https://rpc.ankr.com/eth',
 *   'https://ethereum.publicnode.com'
 * ]);
 *
 * // For Polygon with a specific network object
 * const provider = createJsonRpcProviderWithFailover(
 *   [
 *     'https://polygon-mainnet.g.alchemy.com/v2/your-api-key',
 *     'https://polygon-rpc.com',
 *     'https://rpc-mainnet.matic.network'
 *   ],
 *   { name: "matic", chainId: 137 }
 * );
 */
export function createJsonRpcProviderWithFailover(
  rpcUrls: string[],
  network?: Network,
  maxRetries?: number
): JsonRpcProviderWithFailover {
  return new JsonRpcProviderWithFailover(rpcUrls, network, maxRetries);
}

// Additional usage examples:

// 1. Creating a provider for Ethereum mainnet
// const mainnetProvider = createJsonRpcProviderWithFailover([
//   process.env.ETHEREUM_RPC_URL_1 || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
//   process.env.ETHEREUM_RPC_URL_2 || 'https://mainnet.infura.io/v3/your-api-key',
//   'https://rpc.ankr.com/eth',
//   'https://ethereum.publicnode.com',
// ]);

// 2. Using with a specific chain (e.g. Monad)
// const monadProvider = createJsonRpcProviderWithFailover([
//   process.env.MONAD_RPC_URL_1 || 'https://rpc.monad.xyz',
//   process.env.MONAD_RPC_URL_2 || 'https://monad-rpc.publicnode.com',
// ], { name: "monad", chainId: 10143 });

// 3. With wallet integration
// const wallet = new ethers.Wallet(privateKey, provider);
// const tx = await wallet.sendTransaction({
//   to: recipient,
//   value: ethers.parseEther("1.0")
// });
