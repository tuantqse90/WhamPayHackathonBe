// import { ethers, TypedDataField, TypedDataDomain } from 'ethers';
// import { JsonRpcProviderWithFailover } from './json-provider-client';

// const rpcUrls = (
//   process.env.MAINNET_RPC_URLS ||
//   process.env.MAINNET_RPC_URL ||
//   ''
// )
//   .split(',')
//   .filter((url) => url.trim() !== '');

// if (rpcUrls.length === 0) {
//   throw new Error(
//     'No RPC URL provided. Please set MAINNET_RPC_URLS or MAINNET_RPC_URL environment variable.'
//   );
// }

// export const defaultProvider = new JsonRpcProviderWithFailover(rpcUrls);

// /**
//  * Create a new wallet
//  * @returns The wallet
//  * @example
//  * const wallet = createWallet();
//  */
// export const createWallet = (): {
//   mnemonic: string;
//   privateKey: string;
//   address: string;
// } => {
//   const wallet = ethers.Wallet.createRandom();
//   return {
//     mnemonic: wallet.mnemonic?.phrase || '',
//     privateKey: wallet.privateKey,
//     address: wallet.address,
//   };
// };

// /**
//  * Convert a number to a hex string
//  * @param num - The number to convert
//  * @param options - The options for the conversion
//  * @returns The hex string
//  * @example
//  * const hex = numberToHex(100, { signed: true, size: 32 });
//  */
// export const numberToHex = (
//   num: number,
//   options: { signed: boolean; size: number }
// ): string => {
//   return ethers.toBeHex(num, options.size);
// };

// /**
//  * Sign a typed data
//  * @param wallet - The wallet to sign the data with
//  * @param typedData - The typed data to sign
//  * @returns The signed data
//  * @example
//  * const signedData = signTypedData(wallet, typedData);
//  */
// export const signTypedData = (
//   wallet: ethers.Wallet,
//   typedData: EIP712TypedData
// ): Promise<string> => {
//   return wallet.signTypedData(
//     typedData.domain,
//     typedData.types,
//     typedData.message
//   );
// };

// /**
//  * EIP712TypedData
//  * @param types - The types of the data
//  * @param domain - The domain of the data
//  * @param message - The message of the data
//  * @param primaryType - The primary type of the data
//  * @example
//  * const typedData = {
//  *   types: {
//  *     EIP712TypedData: [
//  *       { name: 'name', type: 'string' },
//  *       { name: 'version', type: 'string' },
//  *     ],
//  *   },
//  *   domain: {
//  *     name: 'EIP712TypedData',
//  *     version: '1',
//  *   },
//  *   message: {
//  *     name: 'John Doe',
//  *     version: '1',
//  *   },
//  *   primaryType: 'EIP712TypedData',
//  * };
//  */
// export interface EIP712TypedData {
//   types: Record<string, TypedDataField[]>;
//   domain: TypedDataDomain;
//   message: {
//     [key: string]: unknown;
//   };
//   primaryType: string;
// }

// export const gasPriceInWei = async (): Promise<number> => {
//   const { gasPrice } = await defaultProvider.getFeeData();
//   return gasPrice ? Number(gasPrice) : 0;
// };

// export const gasPriceInGwei = async (): Promise<number> => {
//   const gasPrice = await gasPriceInWei();
//   return gasPrice / 1e9;
// };

// /**
//  * Parse the final swap result from the events
//  * @param events - The events to parse
//  * @returns The final swap result
//  * @example
//  * const finalSwapResult = parseFilnalSwapResultFromEvents(events);
//  */
// export const parseFinalSwapResultFromTransaction = async (
//   hash: string
// ): Promise<null | {
//   sender: string;
//   recipient: string;
//   sentTokenAddress: string;
//   sentTokenAmount: string;
//   receivedTokenAddress: string;
//   receivedTokenAmount: string;
//   hash: string;
//   blockNumber: number;
// }> => {
//   const receipt = await defaultProvider.getTransactionReceipt(hash);
//   if (!receipt) {
//     throw new Error('Transaction receipt not found');
//   }

//   const sender = receipt.from.toLowerCase();
//   // keccak256("Transfer(address,address,uint256)")
//   const erc20TransferSig = '0xddf252ad';
//   const logs = receipt.logs.filter((log) =>
//     log.topics[0].startsWith(erc20TransferSig)
//   );

//   // Parse Transfer logs into structured data
//   const transfers = logs.map((log) => {
//     const token = log.address.toLowerCase();
//     const from = '0x' + log.topics[1].slice(26).toLowerCase();
//     const to = '0x' + log.topics[2].slice(26).toLowerCase();
//     const amount = BigInt(log.data).toString();
//     return { token, from, to, amount };
//   });

//   // Sent = sender -> other address
//   const sent = transfers.filter((t) => t.from === sender && t.to !== sender);
//   // Received = non-sender -> sender
//   const received = transfers
//     .reverse()
//     .filter((t) => t.to === sender && t.from !== sender);

//   // Check if we have both sent and received transfers
//   if (sent.length === 0 || received.length === 0) {
//     // No valid swap detected - missing either sent or received transfers
//     return null;
//   }

//   // sum all sent and received
//   const sentAmount = transfers
//     .filter((t) => t.from === sender)
//     .reduce((acc, t) => acc + BigInt(t.amount), BigInt(0));
//   const receivedAmount = transfers
//     .filter((t) => t.to === sender)
//     .reduce((acc, t) => acc + BigInt(t.amount), BigInt(0));

//   return {
//     sender,
//     recipient: sender, // both sender & receiver are the same
//     sentTokenAddress: sent[0].token,
//     sentTokenAmount: sentAmount.toString(),
//     receivedTokenAddress: received[0].token,
//     receivedTokenAmount: receivedAmount.toString(),
//     hash,
//     blockNumber: receipt.blockNumber,
//   };
// };
