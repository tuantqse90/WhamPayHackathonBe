import { Global, Module } from '@nestjs/common';
import { SharedService } from './shared.service';

@Module({
  imports: [],
  providers: [SharedService],
  exports: [SharedService],
})
@Global()
export class SharedModule {}
