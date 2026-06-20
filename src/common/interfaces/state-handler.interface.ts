import { ConversationState } from '../enums/conversation-state.enum';
import { ConversationData } from './conversation-data.interface';

export interface StateHandlerContext {
  phoneNumber: string;
  messageText: string;
  conversationData: ConversationData;
}

export interface StateHandlerResult {
  nextState: ConversationState;
  conversationData: ConversationData;
  replyMessage: string;
  shouldCreateOrder?: boolean;
}

export interface StateHandler {
  readonly state: ConversationState;
  handle(context: StateHandlerContext): Promise<StateHandlerResult>;
}
