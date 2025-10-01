import { ethers } from 'ethers';
import { ERC1155_ABI, ERC721_ABI } from './contract.constants';

export const transferNFT721 = async (
  signer: ethers.Wallet,
  nftAddress: string,
  recipientAddress: string,
  tokenId: number
) => {
  try {
    const nftContract = new ethers.Contract(nftAddress, ERC721_ABI, signer);
    // const owner = await nftContract.ownerOf(tokenId);
    // if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    //   throw new Error(`Not the owner of token ID ${tokenId}`);
    // }
    const tx = await nftContract.safeTransferFrom(
      signer.address,
      recipientAddress,
      tokenId
    );

    return {
      recipient: recipientAddress,
      nftAddress,
      tokenId,
      txHash: tx.hash,
      success: true,
    };
  } catch (error: unknown) {
    return {
      recipient: recipientAddress,
      nftAddress,
      tokenId,
      txHash: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const transferNFT1155 = async (
  signer: ethers.Wallet,
  nftAddress: string,
  recipientAddress: string,
  tokenId: number,
  amount: number,
  data = '0x'
) => {
  try {
    const nftContract = new ethers.Contract(nftAddress, ERC1155_ABI, signer);
    const tx = await nftContract.safeTransferFrom(
      signer.address,
      recipientAddress,
      tokenId,
      amount,
      data
    );

    return {
      recipient: recipientAddress,
      nftAddress,
      tokenId,
      amount,
      txHash: tx.hash,
      success: true,
    };
  } catch (error: unknown) {
    return {
      recipient: recipientAddress,
      nftAddress,
      tokenId,
      amount,
      txHash: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const checkNFT721Ownership = async (
  provider: ethers.Provider,
  nftAddress: string,
  ownerAddress: string,
  tokenId: number
): Promise<boolean> => {
  try {
    const nftContract = new ethers.Contract(nftAddress, ERC721_ABI, provider);
    const owner = await nftContract.ownerOf(tokenId);
    return owner.toLowerCase() === ownerAddress.toLowerCase();
  } catch {
    return false;
  }
};

export const getNFT1155Balance = async (
  provider: ethers.Provider,
  nftAddress: string,
  ownerAddress: string,
  tokenId: number
): Promise<number> => {
  try {
    const nftContract = new ethers.Contract(nftAddress, ERC1155_ABI, provider);
    const balance = await nftContract.balanceOf(ownerAddress, tokenId);
    return Number(balance.toString());
  } catch {
    return 0;
  }
};
