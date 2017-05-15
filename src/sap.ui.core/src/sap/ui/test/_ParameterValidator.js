/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global'], function ($) {
	"use strict";
	var _ParameterValidator = function (options) {
		this._errorPrefix = options.errorPrefix;
	};

	var validationInfo = {
		validationInfo: {
			type: "object",
			mandatory: true
		},
		inputToValidate: {
			type: "object",
			mandatory: true
		},
		allowUnknownProperties: "bool"
	};

	function createValidationInfo (vValidationInfo) {
		if (typeof vValidationInfo === "string") {
			return {
				type: vValidationInfo,
				mandatory: false
			};
		}

		return vValidationInfo;
	}

	_ParameterValidator.prototype = {
		validate: function (options) {
			// validate its own parameters
			this._validate({
				inputToValidate: options,
				validationInfo: validationInfo
			});
			// validate the actual parameters
			this._validate(options);
		},

		_validate: function (oOptions) {
			var aErrors = this._getErrors(oOptions);

			if (aErrors.length === 1) {
				throw new Error(this._errorPrefix + " - " + aErrors[0]);
			}

			if (aErrors.length) {
				aErrors.unshift("Multiple errors where thrown " + this._errorPrefix);
				throw new Error(aErrors.join("\n"));
			}
		},

		/**
		 * Fills the aErrors parameter recursively
		 * @param oOptions
		 * @param aErrors
		 * @param {string} sPropertyPath
		 * @returns {*}
		 * @private
		 */
		_getErrors: function (oOptions, aErrors, sPropertyPath) {
			var mValidationInfo = oOptions.validationInfo,
				oInputToValidate = oOptions.inputToValidate,
				bAllowUnknownProperties = oOptions.allowUnknownProperties;

			if (!aErrors) {
				aErrors = [];
			}
			if (!sPropertyPath) {
				sPropertyPath = "";
			}

			Object.keys(oInputToValidate).forEach(function (sKey) {
				var oValidationInfo = createValidationInfo(mValidationInfo[sKey]);

				if (!bAllowUnknownProperties && !oValidationInfo) {
					aErrors.push("the property '" + sPropertyPath + sKey + "' is not defined in the API");
				}
			});


			Object.keys(mValidationInfo).forEach(function (sKey) {
				var vValue = oInputToValidate[sKey],
					oValidationInfo = createValidationInfo(mValidationInfo[sKey]);

				if ((!oValidationInfo.hasOwnProperty("type") || !oValidationInfo.hasOwnProperty("mandatory")) && vValue) {
					sPropertyPath += sKey + ".";

					aErrors.concat(this._getErrors({
						validationInfo: oValidationInfo,
						inputToValidate: vValue,
						allowUnknownProperties: bAllowUnknownProperties
					}, aErrors, sPropertyPath));
					return;
				}

				var sCompletePropertyPath = sPropertyPath + sKey;

				if (oValidationInfo.mandatory && (vValue === undefined || vValue === null)) {
					aErrors.push("No '" + sCompletePropertyPath + "' given but it is a mandatory parameter");
				}
				if (vValue === undefined || vValue === null) {
					// parameter undefined if it was mandatory the error is pushed already
					return;
				}

				var fnValidator = _ParameterValidator.types[oValidationInfo.type];
				var sError = fnValidator(vValue, sCompletePropertyPath);
				if (sError) {
					aErrors.push(sError);
				}
			}.bind(this));

			return aErrors;
		}
	};

	_ParameterValidator.types = {
		func : function (fnValue, sPropertyName) {
			if ($.isFunction(fnValue)) {
				return "";
			}
			return "the '" + sPropertyName + "' parameter needs to be a function but '"
				+ fnValue + "' was passed";
		},
		array: function (aValue, sPropertyName) {
			if ($.isArray(aValue)) {
				return "";
			}
			return "the '" + sPropertyName + "' parameter needs to be an array but '"
				+ aValue + "' was passed";
		},
		object: function (oValue, sPropertyName) {
			if ($.isPlainObject(oValue)) {
				return "";
			}
			return "the '" + sPropertyName + "' parameter needs to be an object but '"
				+ oValue + "' was passed";
		},
		string: function (sValue, sPropertyName) {
			if ($.type(sValue) === "string") {
				return "";
			}
			return "the '" + sPropertyName + "' parameter needs to be a string but '"
				+ sValue + "' was passed";
		},
		bool: function (bValue, sPropertyName) {
			if ($.type(bValue) === "boolean") {
				return "";
			}
			return "the '" + sPropertyName + "' parameter needs to be a boolean value but '"
				+ bValue + "' was passed";
		},
		numeric: function (iValue, sPropertyName) {
			if ($.isNumeric(iValue)) {
				return "";
			}
			return "the '" + sPropertyName + "' parameter needs to be numeric but '"
				+ iValue + "' was passed";
		},
		// no validation just for declaring optional and mandatory params
		any: $.noop
	};

	return _ParameterValidator;
},  /* export= */ true);