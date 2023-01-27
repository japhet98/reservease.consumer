import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import * as hbs from 'nodemailer-express-handlebars';
import { InternalApiResponse } from './InternalApiResponse';
import {
    allowInsecurePrototypeAccess,
  } from"@handlebars/allow-prototype-access";

interface IGmailAuth{
    user:string;
    pass:string;
}

interface IEmail {
    receipient: string|string[];
    subject?: string;
    from?: string;
    templateName?: string;
    text?: string;
    senderEmail?:string;
    senderName?: string;
}

interface IEmailRes{
    mail:any;
    messageInfo:any;
}
export class EmailService{
    private readonly _appEmailAddress:string;
    private readonly _appPassword:string;
    private readonly _defaultSenderEmail:string;
    private readonly _defaultSenderName:string;
    private readonly _viewDir:any;
    private readonly _partialDir:any;
    private readonly _layoutDir:any;
    private readonly _defaultLayout:string = "main.hbs";
    private gmailAuth:IGmailAuth;

    constructor(appEmailAddress:string, appPassword:string ,defaultLayout:string, viewDir:any, layoutDir:any, partialDir:any, defaultSenderEmail:string, defaultSenderName:string){
        this._appEmailAddress  = appEmailAddress;
        this._appPassword = appPassword;
        this._defaultSenderEmail = defaultSenderEmail;
        this._defaultSenderName = defaultSenderName;
        this._defaultLayout = defaultLayout;
        this._viewDir =  viewDir;
        this._layoutDir = layoutDir;
        this._partialDir = partialDir;
        this.gmailAuth={
            user: this._appEmailAddress,
            pass: this._appPassword
        };
    }

    private CreateGmailTransporter(){
     try{
        const  emailTransporter =  nodemailer.createTransport({
            service: "gmail",
            auth: this.gmailAuth
          });

          return emailTransporter;
     }
     catch(err){
        throw err;
     }

    }

    private GetSenderInfo(email:string|undefined, name:string|undefined){
        let _email = this._defaultSenderEmail;
        let _name = this._defaultSenderName;
        if(email !== "" && email !== null && email !== undefined){
            _email = email;
        }
        if(name !== "" && name !== null && name !== undefined){
            _name = name;
        }

        return `${_name}<${_email}>`;
    }

    public  async sendEmail(params: IEmail, context: any = null):Promise<InternalApiResponse<IEmailRes>> {
        try {
            const {
                
                subject,
                templateName
            } = params;

            const senderInfo = this.GetSenderInfo(params.senderEmail,params.senderName);
            let receipient:string[]
            if(typeof params.receipient === 'string') {
           
               receipient = Array(params.receipient);
            }
            else{
                receipient = params.receipient
            }
     
            const options = {
                viewEngine: {
                    extname: '.hbs',
                    layoutsDir:  `${this._layoutDir}`,
                      defaultLayout:this._defaultLayout,
                    paritalsDir: `${this._partialDir}/`,
                    handlebars: allowInsecurePrototypeAccess(Handlebars),
                },
                viewPath: `${this._viewDir}/`,
                extName: '.hbs',
            };
            const emailTransporter =  this.CreateGmailTransporter();
            emailTransporter.use('compile', hbs(options));
            
            const mail = {
                from: senderInfo,
                to: receipient,
                subject,
                template: templateName,
                context
            };
          
            const messageInfo = await emailTransporter.sendMail(mail);
           
            return new InternalApiResponse<IEmailRes>(true, {
                mail,
                messageInfo
            },"Successfuly sent email")
           
        } catch (error: any) {
            return new InternalApiResponse<IEmailRes>(false, undefined,"Faled to send email")
        }


    }

    public  async sendTextEmail(params: IEmail):Promise<InternalApiResponse<IEmailRes>> {
        try {
            const {
                receipient,
                subject,
                text
            } = params;
            const senderInfo = this.GetSenderInfo(params.senderEmail,params.senderName);
            const mail = {
                from: senderInfo,
                to: receipient,
                subject,
                text
            };
            const emailTransporter =  this.CreateGmailTransporter();
            const messageInfo = await emailTransporter.sendMail(mail);

            return new InternalApiResponse<IEmailRes>(true, {
                mail,
                messageInfo
            },"Successfuly sent email")
           
        } catch (error: any) {
            return new InternalApiResponse<IEmailRes>(false, undefined,"Faled to send email")
        }


    }

}