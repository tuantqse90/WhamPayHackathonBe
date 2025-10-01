import { Token } from "@pay-wallet/domain";

export const defaultTokens: Token[] = [
  {
    address: '0x0000000000000000000000000000000000000000',
    name: 'Paseo',
    symbol: 'PAS',
    decimals: 18,
    totalSupply: 1000000,
    createdHash: '',
    defaultHolder: '',
  },
  {
    address: '0x1519cc45e857f47b69fc07cb5476bf64c3af1579',
    name: 'USDT',
    symbol: 'USDT',
    decimals: 18,
    totalSupply: 1000000,
    createdHash: '',
    defaultHolder: '',
  },
];