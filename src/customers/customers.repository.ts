import { Injectable, Logger } from '@nestjs/common';
import {
  Customer,
  UpsertCustomerInput,
} from '../common/interfaces/customer.interface';
import { CompanyConfigService } from '../company/company-config.service';
import { SupabaseService } from '../database/supabase.service';

@Injectable()
export class CustomersRepository {
  private readonly logger = new Logger(CustomersRepository.name);
  private readonly tableName = 'customers';

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly companyConfigService: CompanyConfigService,
  ) {}

  async findOrCreate(input: UpsertCustomerInput): Promise<Customer> {
    const { companyId, createdBy } = this.companyConfigService.getContext();
    const existing = await this.findByPhone(input.phone, companyId);

    if (existing) {
      if (existing.address !== input.address) {
        return this.updateAddress(existing.id, input.address);
      }

      return existing;
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from(this.tableName)
      .insert({
        company_id: companyId,
        created_by: createdBy,
        first_name: input.first_name ?? 'WhatsApp',
        last_name: input.last_name ?? 'Cliente',
        phone: input.phone,
        address: input.address,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to create customer: ${error.message}`, error);
      throw new Error(`Database error: ${error.message}`);
    }

    return data as Customer;
  }

  private async findByPhone(
    phone: string,
    companyId: string,
  ): Promise<Customer | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from(this.tableName)
      .select('*')
      .eq('company_id', companyId)
      .eq('phone', phone)
      .maybeSingle();

    if (error) {
      this.logger.error(`Failed to find customer: ${error.message}`, error);
      throw new Error(`Database error: ${error.message}`);
    }

    return data as Customer | null;
  }

  private async updateAddress(
    customerId: string,
    address: string,
  ): Promise<Customer> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from(this.tableName)
      .update({ address, updated_at: new Date().toISOString() })
      .eq('id', customerId)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Failed to update customer address: ${error.message}`,
        error,
      );
      throw new Error(`Database error: ${error.message}`);
    }

    return data as Customer;
  }
}
