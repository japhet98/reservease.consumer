import {WebClient} from "@slack/web-api";
import { Md, Message, Section} from "slack-block-builder";
export class SlackMessengerService {
    private readonly _client:WebClient;

    constructor(slackToken:string){
     this._client = new WebClient(slackToken);

    }
    protected async errorMessage(topic:string, error:any, channel: string) {
       try{
        return await this._client.chat.postMessage(
            Message({
                channel: (channel) , text: `Error- [${topic}]`
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
                channel: (channel) , text: `${title}`
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