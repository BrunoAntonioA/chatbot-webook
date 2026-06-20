import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../database/supabase.service';

export interface CompanyContext {
  companyId: string;
  createdBy: string;
}

@Injectable()
export class CompanyConfigService implements OnModuleInit {
  private readonly logger = new Logger(CompanyConfigService.name);
  private context: CompanyContext;

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async onModuleInit(): Promise<void> {
    const companyId = this.configService.get<string>('DEFAULT_COMPANY_ID');

    if (!companyId) {
      throw new Error('DEFAULT_COMPANY_ID must be configured');
    }

    let createdBy = this.configService.get<string>('DEFAULT_CREATED_BY');

    if (!createdBy) {
      createdBy = await this.resolveCompanyOwner(companyId);
    }

    this.context = { companyId, createdBy };
    this.logger.log(
      `Company context loaded: company=${companyId}, createdBy=${createdBy}`,
    );
  }

  getContext(): CompanyContext {
    if (!this.context) {
      throw new Error('Company context is not initialized');
    }

    return this.context;
  }

  private async resolveCompanyOwner(companyId: string): Promise<string> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('company_members')
      .select('user_id')
      .eq('company_id', companyId)
      .eq('role', 'owner')
      .limit(1)
      .maybeSingle();

    if (error) {
      this.logger.error(
        `Failed to resolve company owner for ${companyId}: ${error.message}`,
      );
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data?.user_id) {
      throw new Error(
        `No owner found for company ${companyId}. Set DEFAULT_CREATED_BY in .env`,
      );
    }

    return data.user_id as string;
  }
}
