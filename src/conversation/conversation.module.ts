import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { ConversationService } from './conversation.service';
import { SessionsRepository } from './sessions.repository';
import { StateMachineService } from './state-machine.service';
import {
  AskAddressHandler,
  AskDeliveryTimeHandler,
  AskProductHandler,
  AskQuantityHandler,
  CompletedHandler,
  ConfirmOrderHandler,
  StartHandler,
} from './handlers';

@Module({
  imports: [OrdersModule],
  providers: [
    SessionsRepository,
    StartHandler,
    AskProductHandler,
    AskQuantityHandler,
    AskAddressHandler,
    AskDeliveryTimeHandler,
    ConfirmOrderHandler,
    CompletedHandler,
    StateMachineService,
    ConversationService,
  ],
  exports: [ConversationService],
})
export class ConversationModule {}
