import Exception from "sap/ui/base/Exception";
export class FormatException {
    static prototype = Object.create(Exception.prototype);
    constructor(message: any) {
        this.name = "FormatException";
        this.message = message;
    }
}