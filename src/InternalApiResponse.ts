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