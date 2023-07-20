import { SlackMessengerService } from './SlackMessenger';

export class SlackNotification extends SlackMessengerService {
  private readonly channel: string;
  private readonly environment?: string = 'production';
  constructor(slackToken: string, slackChannel: string, devEnviron?: string) {
    super(slackToken);
    this.channel = slackChannel;
    this.environment = devEnviron;
  }

  public LogError(err: any, req: any, res: any, next: any, code = null) {
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    this.sendMessage(`:x: Error => ${fullUrl} => on: ${new Date()}`, err.message, this.channel);
    return res.status(400).json({
      message: err?.details ? `Validation error: ${err.details.map((x: any) => x.message).join(', ')} ` : err.message,
      data: null,
      code: code ? code : 400,
    });
  }

  public LogSuccess(message: string, code: number, data?: any) {
    return this.sendMessage(
      `:white_check_mark: Success => ${
        this.environment
      } => status: ${code} => message: ${message} => on: ${new Date()}`,
      data ? JSON.stringify(data) : '',
      this.channel,
    );
  }
  public LogDebug(message: string, data: any, code?: number) {
    return this.sendMessage(
      `:eyes: Debug => ${this.environment} ${
        code ? ` => status: ${code}` : ''
      } => message: ${message} => on: ${new Date()}`,
      data ? JSON.stringify(data) : '',
      this.channel,
    );
  }
}
