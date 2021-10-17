import Exception from "sap/ui/base/Exception";
var FormatException = function (message) {
    this.name = "FormatException";
    this.message = message;
};
FormatException.prototype = Object.create(Exception.prototype);