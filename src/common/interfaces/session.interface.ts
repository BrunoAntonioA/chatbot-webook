import { ConversationState } from '../enums/conversation-state.enum';
import { ConversationData } from './conversation-data.interface';

export interface Session {
  id: string;
  company_id: string;
  phone_number: string;
  current_state: ConversationState;
  conversation_data: ConversationData;
  created_at: string;
  updated_at: string;
}
