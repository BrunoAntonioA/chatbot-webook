import { IsNotEmpty, IsString } from 'class-validator';

export class WebhookQueryDto {
  @IsString()
  @IsNotEmpty()
  'hub.mode': string;

  @IsString()
  @IsNotEmpty()
  'hub.challenge': string;

  @IsString()
  @IsNotEmpty()
  'hub.verify_token': string;
}
