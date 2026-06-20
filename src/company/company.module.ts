import { Global, Module } from '@nestjs/common';
import { CompanyConfigService } from './company-config.service';

@Global()
@Module({
  providers: [CompanyConfigService],
  exports: [CompanyConfigService],
})
export class CompanyModule {}
