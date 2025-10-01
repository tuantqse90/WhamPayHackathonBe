export const WRAPPED_NATIVE_TOKEN = {
  8453: '0x4200000000000000000000000000000000000006',
  10143: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
};

export const MULTISEND_ADDRESS = {
  8453: '0x2288392445A6323A59bbA29f6672715413a172df',
  10143: '0x2cE4A6bC94C6844C1056B3b80eD3F243a7eaF14e',
};

export const MULTISEND_ABI = [
  'function multiSend(address[] calldata recipients, uint256[] calldata amounts) external',
  'function multiSendERC20(address[] calldata recipients, uint256[] calldata amounts, address token) external',
];

export const ETH_ADDRESSES = new Map<string, string>([
  ['8453', '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'],
  ['10143', '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'],
]);

export const WETH_ADDRESSES = new Map<string, string>([
  ['8453', '0x4200000000000000000000000000000000000006'],
  ['10143', '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701'],
]);

export const USDT_ADDRESSES = new Map<string, string>([
  ['1', '0xdac17f958d2ee523a2206206994597c13d831ec7'],
  ['8453', '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'],
]);

export const MULTICALL_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';