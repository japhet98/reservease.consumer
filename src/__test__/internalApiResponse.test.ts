import { InternalApiResponse } from "../InternalApiResponse";


const apiRes:any={
    ok:true,
    message:"tested",
    data:[]
    };
    
      test("Api Response",() =>{
        expect(new InternalApiResponse<any>(true,[],"tested")).toEqual(apiRes);
      })
    
      const apiRes2:any={
        ok:true,
        message:"tested",
        data:null
        };
        
          test("Api Response",() =>{
            expect(new InternalApiResponse<any>(true,null,"tested")).toEqual(apiRes2);
          })