import { ApiProperty } from '@nestjs/swagger';
export class SwapData {
  @ApiProperty({
    description: 'The sell token',
    example: '0x1234567890123456789012345678901234567890',
  })
  sellToken: string;
  @ApiProperty({
    description: 'The buy token',
    example: '0x1234567890123456789012345678901234567890',
  })
  buyToken: string;
  @ApiProperty({
    description: 'The sell amount',
    example: '100',
  })
  sellAmount: string;
  @ApiProperty({
    description: 'The buy amount',
    example: '100',
  })
  buyAmount: string;
  @ApiProperty({
    description: 'The slippage',
    example: '100',
  })
  slippage: string;
}

export class MMSwapData {
  @ApiProperty({
    description: 'The sell token',
    example: '0x1234567890123456789012345678901234567890',
  })
  sellToken: string;
  @ApiProperty({
    description: 'The buy token',
    example: '0x1234567890123456789012345678901234567890',
  })
  buyToken: string;
  @ApiProperty({
    description: 'The sell amount',
    example: '100',
  })
  sellAmount: string;
  @ApiProperty({
    description: 'The buy amount',
    example: '100',
  })
  buyAmount: string;
  @ApiProperty({
    description: 'The slippage',
    example: '100',
  })
  slippage: string;
}

export class AddLiquidityData {
  @ApiProperty({
    description: 'The token 0',
    example: '0x1234567890123456789012345678901234567890',
  })
  token0: string;

  @ApiProperty({
    description: 'The token 1',
    example: '0x1234567890123456789012345678901234567890',
  })
  token1: string;

  @ApiProperty({
    description: 'The amount 0',
    example: '100',
  })
  amount0: string;

  @ApiProperty({
    description: 'The amount 1',
    example: '100',
  })
  amount1: string;
}

export class RemoveLiquidityData {
  @ApiProperty({
    description: 'The token 0',
    example: '0x1234567890123456789012345678901234567890',
  })
  token0: string;

  @ApiProperty({
    description: 'The token 1',
    example: '0x1234567890123456789012345678901234567890',
  })
  token1: string;

  @ApiProperty({
    description: 'The amount 0',
    example: '100',
  })
  amount0: string;

  @ApiProperty({
    description: 'The amount 0',
    example: '100',
  })
  amount1: string;
}

export class DeployContractData {
  @ApiProperty({
    description: 'The contract address',
    example: '0x1234567890123456789012345678901234567890',
  })
  contractAddress: string;
  @ApiProperty({
    description: 'The contract abi',
    example: '0x1234567890123456789012345678901234567890',
  })
  contractAbi: string;
  @ApiProperty({
    description: 'The contract bytecode',
    example: '0x1234567890123456789012345678901234567890',
  })
  contractBytecode: string;
}

export class MoveFundsData {
  tokenAddress: string;
  recipient: string;
  amount: string;
  jobId: string;
}
