import {WebClient} from "@slack/web-api";
import { Md, Message, Section} from "slack-block-builder";
import { IChannel, IConsumerService } from "./interface";
import amqplib = require('amqplib');



export  class InternalApiResponse <T>{

    public readonly ok:boolean;
    public readonly data?:T;
    public readonly message?:any;
    public readonly other?:any;

    constructor(ok:boolean, data?:T, message?:any, other?:any) {
        this.ok = ok;
        this.data = data;
        this.message = message;
        this.other = other;
        
    }
}
export  class ApiResponse <T>{

    private readonly code:number;
    private readonly message:string;
    private readonly data?:T

    constructor(code:number, message:string, data?:T){
        this.code = code;
        this.message = message;
        this.data = data;
    }
   
}

export class JoiValidation<T>{

    private readonly Schema:any;

    constructor(schema:any){
        this.Schema = schema;

       
    }

    public async Validate(data:any){
        try {
            const value = await this.Schema.validateAsync(data);
            return  new InternalApiResponse<T>(true,value);
    
        }
        catch (err) {
            let errorData:any = null;
            return new InternalApiResponse<T>(false,errorData,this.FormatJoiError(err));
        }
    }
   private FormatJoiError(error: any){
        return `Validation error: ${error.details.map((x: any) => x.message).join(', ')}`
    }


}

class SlackMessengerService {
    private readonly _client:WebClient;

    constructor(slackToken:string){
     this._client = new WebClient(slackToken);

    }
    protected async errorMessage(topic:string, error:any, channel: string) {
       try{
        return await this._client.chat.postMessage(
            Message({
                channel: channel , text: `Error- [${topic}]`
            })
                .blocks(
                    Section().text(Md.codeBlock(` ${JSON.stringify(require("@stdlib/error-to-json")(error), null, 4)}`)),
                ).buildToObject()
        )
       }
       catch(err){
        throw err;
       }
    }
 

    protected sendMessage(title: string, s: string, channel : string) {
       try{
        return this._client.chat.postMessage(
            Message({
                channel: channel , text: `${title}`
            })
                .blocks(
                    Section()
                        .text(`${Md.bold(title)} `),
                    Section()
                        .text(`${Md.codeBlock(s?.length >3000?"data shortend":s)} `)
                ).buildToObject()
        )
       }
       catch(err){
        throw err;
       }
    }

}

export class SlackNotification extends SlackMessengerService{

    private readonly channel:string;
    private readonly environment?:string = "production";
    constructor(slackToken:string,slackChannel:string,devEnviron?:string){
        super(slackToken);
        this.channel = slackChannel;
        this.environment = devEnviron;
    }

    public LogError(err:any, req:any, res:any, next:any,code=null){
       
        var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        this.sendMessage(`:x: Error => ${fullUrl} => on: ${new Date()}`, err.message,this.channel)
     return    res.status(400).json({message:err?.details?`Validation error: ${err.details.map((x: any) => x.message).join(', ')} `: err.message, data:null, code:code?code:400});
    }

   public LogSuccess(message:string, code:number, data?:any){
        
        return  this.sendMessage(`:white_check_mark: Success => ${this.environment} => status: ${code} => message: ${message} => on: ${new Date()}`, data? JSON.stringify(data):"",this.channel);
 
     }
     public LogDebug(message:string, data:any, code?:number){
        
        return  this.sendMessage(`:eyes: Debug => ${this.environment} ${code? ` => status: ${code}`:""} => message: ${message} => on: ${new Date()}`, data? JSON.stringify(data):"",this.channel);
 
     }

     
}

export class RabitQueue {

    private readonly _messageQueue:string;
    private readonly _exchangeName:string;

    private readonly _bindingKey:string;
    constructor(messageQueueUrl:string,exchangeName:string,bindingKey:string) {
       this._messageQueue = messageQueueUrl;
       this._exchangeName = exchangeName;
        this._bindingKey  = bindingKey;
    }

    public async  CreateChannel(){
        try {
          const connection = await amqplib.connect(this._messageQueue);
          const channel = await connection.createChannel();
          await channel.assertQueue(this._exchangeName);
     
          return channel;
        } catch (err) {
          throw err;
        }
      };

      public async SubscribeMessage(channel:IChannel, service:IConsumerService){
        try {
            await channel.assertExchange(this._exchangeName, "direct", { durable: true });
  const q = await channel.assertQueue("", { exclusive: true });
//   console.log(` Waiting for messages in queue: ${q.queue}`);

  channel.bindQueue(q.queue, this._exchangeName,  this._bindingKey);

  channel.consume(
    q.queue,
    (msg:any) => {
      if (msg.content) {
        // console.log("the message is:", msg.content.toString());
        service.SubscribeEvents(msg.content.toString());
      }
    //   console.log("[X] received");
    },
    {
      noAck: true,
    }
  );
        } catch (error) {
            throw error;
        }
      }
      public async PublishMessage(channel:IChannel, bindingKey:string, payload:string) {
        channel.publish(this._exchangeName, bindingKey, Buffer.from(payload));
        // console.log("Sent: ", payload);
       
      };


}