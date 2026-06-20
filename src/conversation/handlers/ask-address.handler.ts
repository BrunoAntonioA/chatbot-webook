import { Injectable } from '@nestjs/common';
import { ConversationState } from '../../common/enums/conversation-state.enum';
import {
  StateHandler,
  StateHandlerContext,
  StateHandlerResult,
} from '../../common/interfaces/state-handler.interface';

@Injectable()
export class AskAddressHandler implements StateHandler {
  readonly state = ConversationState.ASK_ADDRESS;

  async handle(context: StateHandlerContext): Promise<StateHandlerResult> {
    const address = context.messageText.trim();

    if (address.length < 5) {
      return {
        nextState: ConversationState.ASK_ADDRESS,
        conversationData: context.conversationData,
        replyMessage:
          'Please provide a complete delivery address (at least 5 characters).',
      };
    }

    return {
      nextState: ConversationState.ASK_DELIVERY_TIME,
      conversationData: {
        ...context.conversationData,
        address,
      },
      replyMessage: 'What delivery time do you prefer?',
    };
  }
}
