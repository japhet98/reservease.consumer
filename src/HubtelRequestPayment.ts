import { uuid } from "uuidv4";
import axios from "axios";
import { InternalApiResponse } from "./InternalApiResponse";

interface IAuthCredentail{
    password:string;
    username:string;
}
interface IRequestOption{
    url:string;
    method:string;
    headers:object;
    auth:object;
    data:any;
}

interface IResponsePayload{
    responseData:any,
    requestData:any
}

interface IRequestPayload{
    amount:number;
    title :string;
    description:string;
    callbackUrl: string;
    cancellationUrl:string;
    returnUrl:string;
    logo:string;
}

export class HubtelPayment{


    private readonly _authCredendtial: IAuthCredentail;
    private readonly _requestPaymentUrl:string;
    private readonly _requestPhoneNumber:string;
    private Options: IRequestOption = {
        url: "",
        method: "",
        headers: {
          "Content-Type": "application/json",
        },
        auth: {},
        data: {},
      };
    constructor(clientId:string, clientSecret:string, requestPaymentUrl:string, requestPhoneNumber:string){
        this._authCredendtial={
            password:clientSecret,
            username: clientId
        }

        this._requestPaymentUrl = requestPaymentUrl;
        this._requestPhoneNumber = requestPhoneNumber
    }
    


    public async GetPaymentPayload(params:IRequestPayload){
        try{
            const clientReference = uuid(); 
            const Payload ={
                clientReference,
                amount: params?.amount,
                title: params?.title,
                description: params?.description,
                callbackUrl: params?.callbackUrl,
                cancellationUrl: params?.cancellationUrl,
                returnUrl: params?.returnUrl,
                logo: params?.logo,
            }
    
            this.Options.url =  `${this._requestPaymentUrl}/${this._requestPhoneNumber}`;
            this.Options.method = "POST";
            this.Options.auth = this._authCredendtial;
            this.Options.data = JSON.stringify(Payload);
            
            const MyOPtions:any = this.Options;
            const response = await axios(MyOPtions);

            const resp:IResponsePayload ={
                requestData:Payload,
                responseData:response.data
            }
            
            return new InternalApiResponse<any>(true,resp,"Payment Request Successfull")
          
            
        }
        catch(err){
            
            return new InternalApiResponse<any>(false,null,"Payment Request Failed")
        }
      

    }


}