/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/thirdparty/jquery"
], function (jQueryDOM) {
	"use strict";

	/**
	 * A class used for validating an object's properties
	 * @class
	 * @private
	 * @param {object} oOptions validator options
	 * @param {string} oOptions.errorPrefix prefix for validation error messages - usually contains the class and method that called the validation
	 */
	var _ParameterValidator = function (oOptions) {
		this._errorPrefix = oOptions.errorPrefix;
	};

	/**
	 * Validates parameters. Throws error if some parameters are not valid.
	 * @param {object} oOptions validation options
	 * @param {object} oOptions.validationInfo definition of accepted parameters including name, type, 'mandatory' flag.
	 * short syntax: {paramName: "paramType"}  - same as
	 * full syntax: {paramName: {type: "paramType", mandatory: false}}
	 * If the value is an object without 'type' property, it is considered to be a nested validationInfo:
	 * {param1: {param2: "param2Type", param3: {type: "param3Type"}}}
	 * @param {object} oOptions.inputToValidate object to validate against validationInfo
	 * @param {boolean} oOptions.allowUnknownProperties false by default. when false, throw error if a parameter is not defined in the validationInfo
	 */
	_ParameterValidator.prototype.validate = function (oOptions) {
		// validate _ParameterValidator#validate's own parameters - oOptions
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
		// validate the actual parameters - inputToValidate
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

	/**
	 * Inspects the oOptions.inputToValidate object in depth to find all errors
	 * @param {object} oOptions validator options
	 * @param {array} aErrors an array containing the result
	 * @param {string} sPropertyPath full property path
	 * @returns {array} an array of all the errors
	 * @private
	 */
	_ParameterValidator.prototype._getErrors = function (oOptions, aErrors, sPropertyPath) {
		aErrors = aErrors || [];
		sPropertyPath = sPropertyPath ? sPropertyPath + "." : "";

		if (!oOptions.allowUnknownProperties) {
			Object.keys(oOptions.inputToValidate).forEach(function (sKey) {
				if (!oOptions.validationInfo[sKey]) {
					aErrors.push("the property '" + sPropertyPath +  sKey + "' is not defined in the API");
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
			} else if (oParameterValidationInfo.hasOwnProperty("type")) {
				// value is not empty and should be validated
				var oType = _ParameterValidator.types[oParameterValidationInfo.type];
				if (!oType.isValid(vValue)) {
					aErrors.push("the '" + sFullPropertyPath + "' parameter needs to be " + oType.description + " but '"
						+ vValue + "' was passed");
				}
			} else {
				// value is a nested input to validate - resursion
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
		// no validation just for declaring optional and mandatory params
		any: {
			isValid: function () {
				return true;
			},
			description: "any value"
		}
	};

	function _isNumeric (iValue) {
		// see sap/ui/thirdparty/jquery-compat for implementation details
		return (typeof iValue === "number" || typeof iValue === "string" ) && !isNaN(iValue - parseFloat(iValue));
	}

	return _ParameterValidator;
},  /* export= */ true);
