import { Injectable, Logger } from '@nestjs/common';
import { ConversationState } from '../common/enums/conversation-state.enum';
import {
  StateHandler,
  StateHandlerContext,
  StateHandlerResult,
} from '../common/interfaces/state-handler.interface';
import {
  AskAddressHandler,
  AskDeliveryTimeHandler,
  AskProductHandler,
  AskQuantityHandler,
  CompletedHandler,
  ConfirmOrderHandler,
  StartHandler,
} from './handlers';

@Injectable()
export class StateMachineService {
  private readonly logger = new Logger(StateMachineService.name);
  private readonly handlers = new Map<ConversationState, StateHandler>();

  constructor(
    startHandler: StartHandler,
    askProductHandler: AskProductHandler,
    askQuantityHandler: AskQuantityHandler,
    askAddressHandler: AskAddressHandler,
    askDeliveryTimeHandler: AskDeliveryTimeHandler,
    confirmOrderHandler: ConfirmOrderHandler,
    completedHandler: CompletedHandler,
  ) {
    this.registerHandler(startHandler);
    this.registerHandler(askProductHandler);
    this.registerHandler(askQuantityHandler);
    this.registerHandler(askAddressHandler);
    this.registerHandler(askDeliveryTimeHandler);
    this.registerHandler(confirmOrderHandler);
    this.registerHandler(completedHandler);
  }

  private registerHandler(handler: StateHandler): void {
    this.handlers.set(handler.state, handler);
  }

  async process(
    currentState: ConversationState,
    context: StateHandlerContext,
  ): Promise<StateHandlerResult> {
    const handler = this.handlers.get(currentState);

    if (!handler) {
      this.logger.error(`Unknown conversation state: ${currentState}`);
      throw new UnknownStateError(currentState);
    }

    return handler.handle(context);
  }
}

export class UnknownStateError extends Error {
  constructor(public readonly state: ConversationState) {
    super(`Unknown conversation state: ${state}`);
    this.name = 'UnknownStateError';
  }
}
