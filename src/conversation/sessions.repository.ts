import { Injectable, Logger } from '@nestjs/common';
import { ConversationState } from '../common/enums/conversation-state.enum';
import { ConversationData } from '../common/interfaces/conversation-data.interface';
import { Session } from '../common/interfaces/session.interface';
import { CompanyConfigService } from '../company/company-config.service';
import { SupabaseService } from '../database/supabase.service';

@Injectable()
export class SessionsRepository {
  private readonly logger = new Logger(SessionsRepository.name);
  private readonly tableName = 'sessions';

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly companyConfigService: CompanyConfigService,
  ) {}

  async findByPhoneNumber(phoneNumber: string): Promise<Session | null> {
    const { companyId } = this.companyConfigService.getContext();

    const { data, error } = await this.supabaseService
      .getClient()
      .from(this.tableName)
      .select('*')
      .eq('company_id', companyId)
      .eq('phone_number', phoneNumber)
      .maybeSingle();

    if (error) {
      this.logger.error(
        `Failed to find session for ${phoneNumber}: ${error.message}`,
        error,
      );
      throw new Error(`Database error: ${error.message}`);
    }

    return data as Session | null;
  }

  async create(phoneNumber: string): Promise<Session> {
    const { companyId } = this.companyConfigService.getContext();

    const { data, error } = await this.supabaseService
      .getClient()
      .from(this.tableName)
      .insert({
        company_id: companyId,
        phone_number: phoneNumber,
        current_state: ConversationState.START,
        conversation_data: {},
      })
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Failed to create session for ${phoneNumber}: ${error.message}`,
        error,
      );
      throw new Error(`Database error: ${error.message}`);
    }

    return data as Session;
  }

  async update(
    sessionId: string,
    currentState: ConversationState,
    conversationData: ConversationData,
  ): Promise<Session> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from(this.tableName)
      .update({
        current_state: currentState,
        conversation_data: conversationData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Failed to update session ${sessionId}: ${error.message}`,
        error,
      );
      throw new Error(`Database error: ${error.message}`);
    }

    return data as Session;
  }

  async reset(sessionId: string): Promise<Session> {
    return this.update(sessionId, ConversationState.START, {});
  }
}
