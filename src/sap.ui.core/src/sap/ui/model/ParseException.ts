import Exception from "sap/ui/base/Exception";
export class ParseException {
    static prototype = Object.create(Exception.prototype);
    constructor(message: any) {
        this.name = "ParseException";
        this.message = message;
    }
}