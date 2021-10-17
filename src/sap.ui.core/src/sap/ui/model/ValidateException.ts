import Exception from "sap/ui/base/Exception";
var ValidateException = function (message, violatedConstraints) {
    this.name = "ValidateException";
    this.message = message;
    this.violatedConstraints = violatedConstraints;
};
ValidateException.prototype = Object.create(Exception.prototype);