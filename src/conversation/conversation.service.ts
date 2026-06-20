import { Injectable, Logger } from '@nestjs/common';
import { ConversationState } from '../common/enums/conversation-state.enum';
import { ConversationData } from '../common/interfaces/conversation-data.interface';
import { IncomingMessage } from '../common/interfaces/incoming-message.interface';
import { OrdersService } from '../orders/orders.service';
import { SessionsRepository } from './sessions.repository';
import {
  StateMachineService,
  UnknownStateError,
} from './state-machine.service';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    private readonly sessionsRepository: SessionsRepository,
    private readonly stateMachineService: StateMachineService,
    private readonly ordersService: OrdersService,
  ) {}

  async handleIncomingMessage(message: IncomingMessage): Promise<string> {
    const { phoneNumber, messageText } = message;

    try {
      let session =
        await this.sessionsRepository.findByPhoneNumber(phoneNumber);

      if (!session) {
        session = await this.sessionsRepository.create(phoneNumber);
      }

      if (session.current_state === ConversationState.COMPLETED) {
        session = await this.sessionsRepository.reset(session.id);
      }

      let result;

      try {
        result = await this.stateMachineService.process(
          session.current_state,
          {
            phoneNumber,
            messageText,
            conversationData: session.conversation_data ?? {},
          },
        );
      } catch (error) {
        if (error instanceof UnknownStateError) {
          this.logger.warn(
            `Recovering from unknown state for ${phoneNumber}: ${error.state}`,
          );
          session = await this.sessionsRepository.reset(session.id);
          result = await this.stateMachineService.process(
            ConversationState.START,
            {
              phoneNumber,
              messageText,
              conversationData: {},
            },
          );
        } else {
          throw error;
        }
      }

      if (result.shouldCreateOrder) {
        await this.createOrderFromConversation(phoneNumber, result.conversationData);
      }

      await this.sessionsRepository.update(
        session.id,
        result.nextState,
        result.conversationData,
      );

      return result.replyMessage;
    } catch (error) {
      this.logger.error(
        `Failed to process message from ${phoneNumber}`,
        error instanceof Error ? error.stack : String(error),
      );

      return 'Sorry, something went wrong. Please try again in a moment.';
    }
  }

  private async createOrderFromConversation(
    phoneNumber: string,
    data: ConversationData,
  ): Promise<void> {
    if (
      !data.product ||
      data.quantity === undefined ||
      !data.address ||
      !data.deliveryTime
    ) {
      this.logger.error(
        `Incomplete order data for ${phoneNumber}: ${JSON.stringify(data)}`,
      );
      throw new Error('Incomplete order data');
    }

    await this.ordersService.createOrder({
      phone_number: phoneNumber,
      product: data.product,
      product_key: data.productKey,
      quantity: data.quantity,
      address: data.address,
      delivery_time: data.deliveryTime,
    });
  }
}
