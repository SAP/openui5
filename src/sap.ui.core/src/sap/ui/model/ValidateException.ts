import Exception from "sap/ui/base/Exception";
export class ValidateException {
    static prototype = Object.create(Exception.prototype);
    constructor(message: any, violatedConstraints: any) {
        this.name = "ValidateException";
        this.message = message;
        this.violatedConstraints = violatedConstraints;
    }
}