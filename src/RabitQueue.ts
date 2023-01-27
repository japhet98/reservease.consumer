import amqplib = require('amqplib');
import { InternalApiResponse } from './InternalApiResponse';
export interface IConsumerService {
  SubscribeEvents: (message: string) => any;
}

export class RabitQueue {
  private readonly _connectionUrl: string;
  constructor(messageQueueUrl: string) {
    this._connectionUrl = messageQueueUrl;
  }

  public async CreateQueueChannel(queue: string): Promise<InternalApiResponse<any>> {
    try {
      const connection = await amqplib.connect(this._connectionUrl);
      const channel = await connection.createChannel();
      await channel.assertQueue(queue, { durable: false });
      return new InternalApiResponse<any>(true, channel, 'Successfully created channel');
    } catch (err: any) {
      return new InternalApiResponse<any>(false, undefined, 'Failed to create channel');
    }
  }

  public async CreateExchangeChannel(exchangeName: string): Promise<InternalApiResponse<any>> {
    try {
      const connection = await amqplib.connect(this._connectionUrl);
      const channel = await connection.createChannel();
      await channel.assertExchange(exchangeName, 'direct', { durable: true });

      return new InternalApiResponse<any>(true, channel, 'Successfully created channel');
    } catch (err: any) {
      return new InternalApiResponse<any>(false, undefined, 'Failed to create channel');
    }
  }

  public async SentToQueue(channel: any, queue: string, message: string): Promise<InternalApiResponse<string>> {
    try {
      await channel.assertQueue(queue, { durable: false });

      await channel.sendToQueue(queue, Buffer.from(message), {
        persistent: true,
      });

      return new InternalApiResponse<string>(true, message, `[x] Sent ${message}`);
    } catch (err: any) {
      return new InternalApiResponse<string>(
        false,
        message,
        ` [x] Failed to send '%s' ${message} to queue ${queue}`,
        err?.message,
      );
    }
  }

  public async ConsumeFromQueue(channel: any, queue: string, service: IConsumerService) {
    try {
      const q = await channel.assertQueue(queue, {
        durable: false,
      });

      channel.consume(
        q.queue,
        (msg: any) => {
          if (msg.content) {
            service.SubscribeEvents(msg.content.toString());
          }

        },
        {
          noAck: true,
        },
      );
    } catch (err: any) {
      throw err;
    }
  }

  public async SubscribeMessage(channel: any, exchangeName: string, bindingKey: string, service: IConsumerService) {
    try {
      await channel.assertExchange(exchangeName, 'direct', { durable: true });
      const q = await channel.assertQueue('', { exclusive: true });

      channel.bindQueue(q.queue, exchangeName, bindingKey);

      channel.consume(
        q.queue,
        (msg: any) => {
          if (msg.content) {
            service.SubscribeEvents(msg.content.toString());
          }
        },
        {
          noAck: true,
        },
      );
    } catch (error) {
      throw error;
    }
  }
  public async PublishMessage(
    channel: any,
    exchangeName: string,
    bindingKey: string,
    message: string,
  ): Promise<InternalApiResponse<string>> {
    try {
      channel.publish(exchangeName, bindingKey, Buffer.from(message));
      return new InternalApiResponse<any>(
        true,
        message,
        `Published message to exchange name: ${exchangeName} successfully`,
      );
    } catch (error) {
      return new InternalApiResponse<any>(
        false,
        undefined,
        `Failed to publish message to exchange name: ${exchangeName}`,
      );
    }
  }
}
