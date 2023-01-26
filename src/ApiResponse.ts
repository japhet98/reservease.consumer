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