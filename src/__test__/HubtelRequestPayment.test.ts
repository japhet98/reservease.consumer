import { HubtelPayment } from "../HubtelRequestPayment";
import { InternalApiResponse } from "../InternalApiResponse";


const apiRes:any={
    ok:true,
    message:"Payment Request Successfull",
    data:[]
    };
    
      test("Hubtel Payment Request", async() =>{
      const   HUBTEL_CLIENT_ID="qhnsdyat"
       const HUBTEL_CLIENT_SECRET="rnpizlvx"
       const URL = "https://devp-reqsendmoney-230622-api.hubtel.com/request-money";
       const phoneNumber = '233558299409';
        const hubtelService = new HubtelPayment(HUBTEL_CLIENT_ID, HUBTEL_CLIENT_SECRET,URL,phoneNumber);

        const requestPayload = {
            amount:1,
            title :"Testing Payment Service",
            description:"Testing Payment Service",
            callbackUrl: "https://roomallocationserver-pdwatiowia-uc.a.run.app/api/v3/request-payment/callback",
            cancellationUrl:"https://www.reservease.com",
            returnUrl:"https://www.reservease.com",
            logo:"https://storage.googleapis.com/us.artifacts.reservease-370818.appspot.com/reservease/assets/reservease-logo.png"
        }
        const resp = await hubtelService.GetPaymentPayload(requestPayload);
        expect(resp.message).toEqual(apiRes.message);
      })
  