import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListTokensDto } from './models';
import { TokenService } from './token.service';

@ApiTags('tokens')
@Controller('tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of tokens' })
  @ApiResponse({
    status: 200,
    description: 'The list of tokens has been successfully retrieved.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async listTokens(@Query() getTokensDto: ListTokensDto) {
    return this.tokenService.listTokens(getTokensDto);
  }

  @Get(':address')
  @ApiOperation({ summary: 'Get token info' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async getToken(@Param('address') address: string) {
    return this.tokenService.getToken(address.toLocaleLowerCase());
  }
}
