/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define([
	"sap/base/Log",
	'sap/ui/core/format/NumberFormat',
	'sap/ui/model/CompositeType',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException',
	'sap/ui/model/ValidateException',
	"sap/ui/thirdparty/jquery",
	"sap/base/util/isEmptyObject"
],
	function(
		Log,
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
	 * Constructor for a <code>Currency</code> type.
	 *
	 * @class
	 * This class represents the composite type <code>Currency</code>, which consists of the parts
	 * "amount" (of type <code>number</code> or <code>string</code>) and "currency" (of type
	 * <code>string</code>). In case the amount is a <code>string</code>, it must be the JavaScript
	 * representation of the corresponding number.
	 * If the <code>source</code> format option is given, the composite type has only one part of
	 * type <code>string</code>, holding both amount and currency in the source format.
	 *
	 * @extends sap.ui.model.CompositeType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @param {object} [oFormatOptions]
	 *   Format options; for a list of all available options, see
	 *   {@link sap.ui.core.format.NumberFormat.getCurrencyInstance}.
	 * @param {object} [oFormatOptions.source]
	 *   A set of format options as defined for
	 *   {@link sap.ui.core.format.NumberFormat.getCurrencyInstance} which describes the format of
	 *   amount and currency in the model in case the model holds this in one property of type
	 *   <code>string</code>, e.g. as &quot;EUR 22&quot;. If an empty object is given,
	 *   grouping is disabled, the decimal separator is a dot and the grouping separator is a comma.
	 * @param {object} [oConstraints]
	 *   Constraints for the value part
	 * @param {number} [oConstraints.minimum]
	 *   Smallest amount allowed excluding the minimum value itself
	 * @param {number} [oConstraints.maximum]
	 *   Largest amount allowed excluding the maximum value itself
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
	 * Formats the given value to the given target type.
	 *
	 * @param {any[]|string} vValue
	 *   The array containing amount and currency code in case the <code>source</code> format option
	 *   is not given; otherwise, a string representation of the value which is parsed using the
	 *   source format
	 * @param {string} sTargetType
	 *   The target type; must be "string", or a type with "string" as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}
	 * @returns {string}
	 *   The formatted output value; the values <code>undefined</code> or <code>null</code> or
	 *   an amount <code>undefined</code> or <code>null</code> are formatted to <code>null</code>
	 * @throws {sap.ui.model.FormatException}
	 *   If <code>sTargetType</code> is unsupported
	 *
	 * @public
	 */
	Currency.prototype.formatValue = function(vValue, sTargetType) {
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
		switch (this.getPrimitiveType(sTargetType)) {
			case "string":
				return this.oOutputFormat.format(aValues);
			default:
				throw new FormatException("Don't know how to format currency to " + sTargetType);
		}
	};

	/**
	 * Parses a string value.
	 *
	 * @param {string} sValue
	 *   The value to be parsed
	 * @param {string} sSourceType
	 *   The source type (the expected type of <code>sValue</code>); must be "string", or a type
	 *   with "string" as its {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 * @param {array} aCurrentValues
	 *   The current values of all binding parts
	 * @returns {any[]|string}
	 *   If the <code>source</code> format option is not set, the method returns an array
	 *   containing amount and currency: the amount is a <code>string</code> if the format
	 *   option <code>parseAsString</code> is set and a <code>number</code> otherwise, the currency
	 *   is always a <code>string</code>.
	 *   If the <code>source</code> format option is set, the method returns a string representation
	 *   of amount and currency in the given source format.
	 * @throws {sap.ui.model.ParseException}
	 *   If <code>sSourceType</code> is unsupported or if the given string cannot be parsed
	 * @public
	 */
	Currency.prototype.parseValue = function(sValue, sSourceType) {
		var vResult, oBundle;
		switch (this.getPrimitiveType(sSourceType)) {
			case "string":
				vResult = this.oOutputFormat.parse(sValue);
				if (!Array.isArray(vResult) || isNaN(vResult[0])) {
					oBundle = sap.ui.getCore().getLibraryResourceBundle();
					throw new ParseException(oBundle.getText("Currency.Invalid", [sValue]));
				}
				break;
			default:
				throw new ParseException("Don't know how to parse Currency from " + sSourceType);
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
						break;
					default:
						Log.warning("Unknown constraint '" + sName + "': Value is not validated.",
							null, "sap.ui.model.type.Currency");
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
