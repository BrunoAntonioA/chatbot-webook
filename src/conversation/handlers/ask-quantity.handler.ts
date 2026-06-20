import { Injectable } from '@nestjs/common';
import { ConversationState } from '../../common/enums/conversation-state.enum';
import {
  StateHandler,
  StateHandlerContext,
  StateHandlerResult,
} from '../../common/interfaces/state-handler.interface';
import { parseQuantity } from '../conversation.constants';

@Injectable()
export class AskQuantityHandler implements StateHandler {
  readonly state = ConversationState.ASK_QUANTITY;

  async handle(context: StateHandlerContext): Promise<StateHandlerResult> {
    const quantity = parseQuantity(context.messageText);

    if (quantity === null) {
      return {
        nextState: ConversationState.ASK_QUANTITY,
        conversationData: context.conversationData,
        replyMessage:
          'Please enter a valid quantity (a positive number).',
      };
    }

    return {
      nextState: ConversationState.ASK_ADDRESS,
      conversationData: {
        ...context.conversationData,
        quantity,
      },
      replyMessage: 'Please send your delivery address.',
    };
  }
}
