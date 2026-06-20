import { Injectable } from '@nestjs/common';
import { ConversationState } from '../../common/enums/conversation-state.enum';
import {
  StateHandler,
  StateHandlerContext,
  StateHandlerResult,
} from '../../common/interfaces/state-handler.interface';
import { WELCOME_MESSAGE } from '../conversation.constants';

@Injectable()
export class CompletedHandler implements StateHandler {
  readonly state = ConversationState.COMPLETED;

  async handle(context: StateHandlerContext): Promise<StateHandlerResult> {
    void context;

    return {
      nextState: ConversationState.ASK_PRODUCT,
      conversationData: {},
      replyMessage:
        'Your previous order is complete. Would you like to place a new order?\n\n' +
        WELCOME_MESSAGE,
    };
  }
}
