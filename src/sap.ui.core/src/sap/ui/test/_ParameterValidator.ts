import jQueryDOM from "sap/ui/thirdparty/jquery";
var _ParameterValidator = function (oOptions) {
    this._errorPrefix = oOptions.errorPrefix;
};
_ParameterValidator.prototype.validate = function (oOptions) {
    this._validate({
        inputToValidate: oOptions,
        validationInfo: {
            validationInfo: {
                type: "object",
                mandatory: true
            },
            inputToValidate: {
                type: "object",
                mandatory: true
            },
            allowUnknownProperties: "bool"
        }
    });
    this._validate(oOptions);
};
_ParameterValidator.prototype._validate = function (oOptions) {
    var aErrors = this._getErrors(oOptions);
    if (aErrors.length === 1) {
        throw new Error(this._errorPrefix + " - " + aErrors[0]);
    }
    if (aErrors.length) {
        throw new Error("Multiple errors where thrown " + this._errorPrefix + "\n" + aErrors.join("\n"));
    }
};
_ParameterValidator.prototype._getErrors = function (oOptions, aErrors, sPropertyPath) {
    aErrors = aErrors || [];
    sPropertyPath = sPropertyPath ? sPropertyPath + "." : "";
    if (!oOptions.allowUnknownProperties) {
        Object.keys(oOptions.inputToValidate).forEach(function (sKey) {
            if (!oOptions.validationInfo[sKey]) {
                aErrors.push("the property '" + sPropertyPath + sKey + "' is not defined in the API");
            }
        });
    }
    Object.keys(oOptions.validationInfo).forEach(function (sKey) {
        var sFullPropertyPath = sPropertyPath + sKey;
        var vValue = oOptions.inputToValidate[sKey];
        var oParameterValidationInfo = this._getParameterValidationInfo(oOptions.validationInfo[sKey]);
        if (vValue === undefined || vValue === null) {
            if (oParameterValidationInfo.mandatory) {
                aErrors.push("No '" + sFullPropertyPath + "' given but it is a mandatory parameter");
            }
        }
        else if (oParameterValidationInfo.hasOwnProperty("type")) {
            var oType = _ParameterValidator.types[oParameterValidationInfo.type];
            if (!oType.isValid(vValue)) {
                aErrors.push("the '" + sFullPropertyPath + "' parameter needs to be " + oType.description + " but '" + vValue + "' was passed");
            }
        }
        else {
            aErrors.concat(this._getErrors({
                validationInfo: oParameterValidationInfo,
                inputToValidate: vValue,
                allowUnknownProperties: oOptions.allowUnknownProperties
            }, aErrors, sFullPropertyPath));
        }
    }.bind(this));
    return aErrors;
};
_ParameterValidator.prototype._getParameterValidationInfo = function (vValidationInfo) {
    if (typeof vValidationInfo === "string") {
        return {
            type: vValidationInfo,
            mandatory: false
        };
    }
    return vValidationInfo;
};
_ParameterValidator.types = {
    func: {
        isValid: function (fnValue) {
            return typeof fnValue === "function";
        },
        description: "a function"
    },
    array: {
        isValid: function (aValue) {
            return Array.isArray(aValue);
        },
        description: "an array"
    },
    object: {
        isValid: function (oValue) {
            return jQueryDOM.isPlainObject(oValue);
        },
        description: "an object"
    },
    string: {
        isValid: function (sValue) {
            return typeof sValue === "string" || sValue instanceof String;
        },
        description: "a string"
    },
    bool: {
        isValid: function (bValue) {
            return typeof bValue === "boolean";
        },
        description: "a boolean value"
    },
    numeric: {
        isValid: function (iValue) {
            return _isNumeric(iValue);
        },
        description: "numeric"
    },
    positivenumeric: {
        isValid: function (iValue) {
            return _isNumeric(iValue) && iValue > 0;
        },
        description: "a positive numeric"
    },
    any: {
        isValid: function () {
            return true;
        },
        description: "any value"
    }
};
function _isNumeric(iValue) {
    return (typeof iValue === "number" || typeof iValue === "string") && !isNaN(iValue - parseFloat(iValue));
}