/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define([
	'sap/ui/core/format/NumberFormat',
	'sap/ui/model/CompositeType',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException',
	'sap/ui/model/ValidateException',
	"sap/ui/thirdparty/jquery",
	"sap/base/util/isEmptyObject"
],
	function(
		NumberFormat,
		CompositeType,
		FormatException,
		ParseException,
		ValidateException,
		jQuery,
		isEmptyObject
	) {
	"use strict";


	/**
	 * Constructor for a Currency type.
	 *
	 * @class
	 * This class represents the currency composite type.
	 *
	 * @extends sap.ui.model.CompositeType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @param {object} [oFormatOptions] Formatting options. For a list of all available options, see {@link sap.ui.core.format.NumberFormat#constructor NumberFormat}.
	 * @param {object} [oFormatOptions.source] Additional set of format options to be used if the property in the model is not of type <code>string</code> and needs formatting as well.
	 * 										   If an empty object is given, the grouping is disabled and a dot is used as decimal separator.
	 * @param {object} [oConstraints] Value constraints
	 * @param {float} [oConstraints.minimum] Smallest value allowed for this type
	 * @param {float} [oConstraints.maximum] Largest value allowed for this type
	 * @alias sap.ui.model.type.Currency
	 */
	var Currency = CompositeType.extend("sap.ui.model.type.Currency", /** @lends sap.ui.model.type.Currency.prototype  */ {

		constructor : function () {
			CompositeType.apply(this, arguments);
			this.sName = "Currency";
			this.bUseRawValues = true;
		}

	});

	/**
	 * Format the given array containing amount and currency code to an output value of type string.
	 * Other internal types than 'string' are not supported by the Currency type.
	 * If a source format has been defined for this type, the formatValue does also accept
	 * a string value as input, which will be parsed into an array using the source format.
	 * If aValues is not defined or null, null will be returned.
	 *
	 * @function
	 * @name sap.ui.model.type.Currency.prototype.formatValue
	 * @param {array|string} vValue the array of values or string value to be formatted
	 * @param {string} sInternalType the target type
	 * @return {any} the formatted output value
	 *
	 * @public
	 */
	Currency.prototype.formatValue = function(vValue, sInternalType) {
		var aValues = vValue;
		if (vValue == undefined || vValue == null) {
			return null;
		}
		if (this.oInputFormat) {
			aValues = this.oInputFormat.parse(vValue);
		}
		if (!Array.isArray(aValues)) {
			throw new FormatException("Cannot format currency: " + vValue + " has the wrong format");
		}
		if (aValues[0] == undefined || aValues[0] == null) {
			return null;
		}
		switch (this.getPrimitiveType(sInternalType)) {
			case "string":
				return this.oOutputFormat.format(aValues);
			case "int":
			case "float":
			case "any":
			default:
				throw new FormatException("Don't know how to format currency to " + sInternalType);
		}
	};

	/**
	 * Parse a string value to an array containing amount and currency. Parsing of other
	 * internal types than 'string' is not supported by the Currency type.
	 * In case a source format has been defined, after parsing the currency is formatted
	 * using the source format and a string value is returned instead.
	 *
	 * @function
	 * @name sap.ui.model.type.Currency.prototype.parseValue
	 * @param {any} vValue the value to be parsed
	 * @param {string} sInternalType the source type
	 * @param {array} aCurrentValues the current values of all binding parts
	 * @return {array|string} the parse result array
	 *
	 * @public
	 */
	Currency.prototype.parseValue = function(vValue, sInternalType) {
		var vResult, oBundle;
		switch (this.getPrimitiveType(sInternalType)) {
			case "string":
				vResult = this.oOutputFormat.parse(vValue);
				// current default error
				// more specific errors describing the actual issue during parse()
				// will be introduced with later work on the NumberFormat
				if (!Array.isArray(vResult) || isNaN(vResult[0])) {
					oBundle = sap.ui.getCore().getLibraryResourceBundle();
					throw new ParseException(oBundle.getText("Currency.Invalid", [vValue]));
				}
				break;
			case "int":
			case "float":
			default:
				throw new ParseException("Don't know how to parse Currency from " + sInternalType);
		}
		if (this.oInputFormat) {
			vResult = this.oInputFormat.format(vResult);
		}
		return vResult;
	};

	Currency.prototype.validateValue = function(vValue) {
		if (this.oConstraints) {
			var oBundle = sap.ui.getCore().getLibraryResourceBundle(),
				aViolatedConstraints = [],
				aMessages = [],
				aValues = vValue,
				iValue;
			if (this.oInputFormat) {
				aValues = this.oInputFormat.parse(vValue);
			}
			iValue = aValues[0];
			jQuery.each(this.oConstraints, function(sName, oContent) {
				switch (sName) {
					case "minimum":
						if (iValue < oContent) {
							aViolatedConstraints.push("minimum");
							aMessages.push(oBundle.getText("Currency.Minimum", [oContent]));
						}
						break;
					case "maximum":
						if (iValue > oContent) {
							aViolatedConstraints.push("maximum");
							aMessages.push(oBundle.getText("Currency.Maximum", [oContent]));
						}
				}
			});
			if (aViolatedConstraints.length > 0) {
				throw new ValidateException(this.combineMessages(aMessages), aViolatedConstraints);
			}
		}
	};

	Currency.prototype.setFormatOptions = function(oFormatOptions) {
		this.oFormatOptions = oFormatOptions;
		this._createFormats();
	};

	/**
	 * Called by the framework when any localization setting changed
	 * @private
	 */
	Currency.prototype._handleLocalizationChange = function() {
		this._createFormats();
	};

	/**
	 * Create formatters used by this type
	 * @private
	 */
	Currency.prototype._createFormats = function() {
		var oSourceOptions = this.oFormatOptions.source;
		this.oOutputFormat = NumberFormat.getCurrencyInstance(this.oFormatOptions);
		if (oSourceOptions) {
			if (isEmptyObject(oSourceOptions)) {
				oSourceOptions = {
					groupingEnabled: false,
					groupingSeparator: ",",
					decimalSeparator: "."
				};
			}
			this.oInputFormat = NumberFormat.getCurrencyInstance(oSourceOptions);
		}
	};

	return Currency;

});
