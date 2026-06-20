import { Injectable } from '@nestjs/common';
import { ConversationState } from '../../common/enums/conversation-state.enum';
import {
  StateHandler,
  StateHandlerContext,
  StateHandlerResult,
} from '../../common/interfaces/state-handler.interface';
import {
  buildOrderConfirmation,
  isAffirmativeResponse,
} from '../conversation.constants';

@Injectable()
export class ConfirmOrderHandler implements StateHandler {
  readonly state = ConversationState.CONFIRM_ORDER;

  async handle(context: StateHandlerContext): Promise<StateHandlerResult> {
    if (!isAffirmativeResponse(context.messageText)) {
      return {
        nextState: ConversationState.CONFIRM_ORDER,
        conversationData: context.conversationData,
        replyMessage:
          'Please reply YES to confirm your order, or send a new message to start over.\n\n' +
          buildOrderConfirmation(context.conversationData),
      };
    }

    return {
      nextState: ConversationState.COMPLETED,
      conversationData: context.conversationData,
      replyMessage: 'Your order has been created successfully.',
      shouldCreateOrder: true,
    };
  }
}
