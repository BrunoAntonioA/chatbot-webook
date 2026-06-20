import { Injectable } from '@nestjs/common';
import { ConversationState } from '../../common/enums/conversation-state.enum';
import {
  StateHandler,
  StateHandlerContext,
  StateHandlerResult,
} from '../../common/interfaces/state-handler.interface';
import {
  WELCOME_MESSAGE,
  getQuantityPrompt,
  parseProductChoice,
} from '../conversation.constants';

@Injectable()
export class AskProductHandler implements StateHandler {
  readonly state = ConversationState.ASK_PRODUCT;

  async handle(context: StateHandlerContext): Promise<StateHandlerResult> {
    const product = parseProductChoice(context.messageText);

    if (!product) {
      return {
        nextState: ConversationState.ASK_PRODUCT,
        conversationData: context.conversationData,
        replyMessage:
          'Invalid selection. Please reply with 1, 2, or 3.\n\n' +
          WELCOME_MESSAGE,
      };
    }

    return {
      nextState: ConversationState.ASK_QUANTITY,
      conversationData: {
        ...context.conversationData,
        product: product.label,
        productKey: product.key,
      },
      replyMessage: getQuantityPrompt(product.key),
    };
  }
}
