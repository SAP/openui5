import Exception from "sap/ui/base/Exception";
var ParseException = function (message) {
    this.name = "ParseException";
    this.message = message;
};
ParseException.prototype = Object.create(Exception.prototype);