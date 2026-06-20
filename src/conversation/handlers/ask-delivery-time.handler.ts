import { Injectable } from '@nestjs/common';
import { ConversationState } from '../../common/enums/conversation-state.enum';
import {
  StateHandler,
  StateHandlerContext,
  StateHandlerResult,
} from '../../common/interfaces/state-handler.interface';
import { buildOrderConfirmation } from '../conversation.constants';

@Injectable()
export class AskDeliveryTimeHandler implements StateHandler {
  readonly state = ConversationState.ASK_DELIVERY_TIME;

  async handle(context: StateHandlerContext): Promise<StateHandlerResult> {
    const deliveryTime = context.messageText.trim();

    if (deliveryTime.length < 2) {
      return {
        nextState: ConversationState.ASK_DELIVERY_TIME,
        conversationData: context.conversationData,
        replyMessage: 'Please provide a valid delivery time.',
      };
    }

    const conversationData = {
      ...context.conversationData,
      deliveryTime,
    };

    return {
      nextState: ConversationState.CONFIRM_ORDER,
      conversationData,
      replyMessage: buildOrderConfirmation(conversationData),
    };
  }
}
