import { Injectable } from '@nestjs/common';
import { ConversationState } from '../../common/enums/conversation-state.enum';
import {
  StateHandler,
  StateHandlerContext,
  StateHandlerResult,
} from '../../common/interfaces/state-handler.interface';
import { WELCOME_MESSAGE } from '../conversation.constants';

@Injectable()
export class StartHandler implements StateHandler {
  readonly state = ConversationState.START;

  async handle(context: StateHandlerContext): Promise<StateHandlerResult> {
    void context;

    return {
      nextState: ConversationState.ASK_PRODUCT,
      conversationData: {},
      replyMessage: WELCOME_MESSAGE,
    };
  }
}
