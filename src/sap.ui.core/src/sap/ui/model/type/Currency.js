/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides the base implementation for all model implementations
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/each",
	"sap/base/util/extend",
	"sap/base/util/isEmptyObject",
	"sap/ui/core/Lib",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/CompositeType",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException"
], function(Log, each, extend, isEmptyObject, Library, NumberFormat, CompositeType, FormatException, ParseException,
		ValidateException) {
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
	 *   {@link sap.ui.core.format.NumberFormat.getCurrencyInstance}. If the format options
	 *   <code>showMeasure</code> or since 1.89.0 <code>showNumber</code> are set to
	 *   <code>false</code>, model messages for the respective parts are not propagated to the
	 *   control, provided the corresponding binding supports the feature of ignoring model
	 *   messages, see {@link sap.ui.model.Binding#supportsIgnoreMessages}, and the corresponding
	 *   binding parameter is not set manually.
	 * @param {boolean} [oFormatOptions.preserveDecimals=true]
	 *   By default decimals are preserved, unless <code>oFormatOptions.style</code> is given as
	 *   "short" or "long"; since 1.89.0
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

		constructor : function (oFormatOptions) {
			CompositeType.apply(this, arguments);
			this.sName = "Currency";
			this.bShowMeasure = !oFormatOptions || !("showMeasure" in oFormatOptions)
				|| oFormatOptions.showMeasure;
			this.bShowNumber = !oFormatOptions || !("showNumber" in oFormatOptions)
				|| oFormatOptions.showNumber;
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
	 * @returns {string|null}
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
		if ((aValues[0] == undefined || aValues[0] == null) && this.bShowNumber) {
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
	 * @param {array} [aCurrentValues]
	 *   Not used
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
		var vResult;

		switch (this.getPrimitiveType(sSourceType)) {
			case "string":
				vResult = this.oOutputFormat.parse(sValue);
				if (!Array.isArray(vResult) || this.bShowNumber && isNaN(vResult[0])) {
					throw this.getParseException();
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
			var oBundle = Library.getResourceBundleFor("sap.ui.core"),
				aViolatedConstraints = [],
				aMessages = [],
				aValues = vValue,
				iValue;
			if (this.oInputFormat) {
				aValues = this.oInputFormat.parse(vValue);
			}
			iValue = aValues[0];
			each(this.oConstraints, function(sName, oContent) {
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
		this.oFormatOptions = Object.assign(
			oFormatOptions.style !== "short" && oFormatOptions.style !== "long"
				? {preserveDecimals : true}
				: {},
			oFormatOptions);
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
	 *
	 * @private
	 */
	Currency.prototype._createFormats = function () {
		var oSourceOptions = this.oFormatOptions.source;
		this.oOutputFormat = NumberFormat.getCurrencyInstance(this.iScale >= 0
			// ensures that amount scale wins over the decimals for the unit
			? extend({}, {maxFractionDigits : this.iScale}, this.oFormatOptions)
			: this.oFormatOptions);
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

	/**
	 * Returns the parse exception based on "showNumber" and "showMeasure" format options.
	 *
	 * @returns {sap.ui.model.ParseException} The parse exception
	 *
	 * @private
	 */
	Currency.prototype.getParseException = function () {
		var oBundle = Library.getResourceBundleFor("sap.ui.core"),
			sText;

		if (!this.bShowNumber) {
			sText = oBundle.getText("Currency.InvalidMeasure");
		} else if (!this.bShowMeasure) {
			sText = oBundle.getText("EnterNumber");
		} else {
			sText = oBundle.getText("Currency.Invalid");
		}

		return new ParseException(sText);
	};

	/**
	 * Gets an array of indices that determine which parts of this type shall not propagate their
	 * model messages to the attached control. Prerequisite is that the corresponding binding
	 * supports this feature, see {@link sap.ui.model.Binding#supportsIgnoreMessages}. If the format
	 * option <code>showMeasure</code> is set to <code>false</code> and the currency value is not
	 * shown in the control, the part for the currency code shall not propagate model messages to
	 * the control. Analogously, since 1.89.0, if the format option <code>showNumber</code> is set
	 * to <code>false</code>, the amount is not shown in the control and the part for the amount
	 * shall not propagate model messages to the control.
	 *
	 * @return {number[]}
	 *   An array of indices that determine which parts of this type shall not propagate their model
	 *   messages to the attached control
	 *
	 * @public
	 * @see sap.ui.model.Binding#supportsIgnoreMessages
	 * @since 1.82.0
	 */
	// @override sap.ui.model.Binding#supportsIgnoreMessages
	Currency.prototype.getPartsIgnoringMessages = function () {
		if (!this.bShowMeasure) {
			return [1];
		} else if (!this.bShowNumber) {
			return [0];
		}
		return [];
	};

	/**
	 * Gets the indices of the binding parts of this composite type in order to determine those parts
	 * whose types are required for formatting.
	 * If for example the type of the amount part is a {@link sap.ui.model.odata.type.Decimal} with a
	 * <code>scale</code> constraint less than the currency part's decimal places, then the amount's
	 * scale is used.
	 *
	 * @returns {int[]}
	 *   The indices of the parts with a relevant type for this composite type, or an empty array if
	 *   the format option <code>showNumber</code> is <code>false</code>
	 *
	 * @override sap.ui.model.CompositeType#getPartsListeningToTypeChanges
	 * @see #processPartTypes
	 */
	Currency.prototype.getPartsListeningToTypeChanges = function () {
		// Only the first part is of interest because it may have a type with another scale than the
		// decimal places for the currency part
		return this.bShowNumber ? [0] : [];
	};

	/**
	 * Processes the types of this composite type's parts. Remembers the <code>scale</code>
	 * constraint of the amount part's type to consider it while formatting.
	 *
	 * @param {sap.ui.model.SimpleType[]} aPartTypes The types of the composite binding parts
	 *
	 * @override sap.ui.model.CompositeType#processPartTypes
	 * @protected
	 * @since 1.120.0
	 */
	Currency.prototype.processPartTypes = function (aPartTypes) {
		const iOldScale = this.iScale;
		const oAmountType = aPartTypes[0];
		if (oAmountType?.isA("sap.ui.model.odata.type.Decimal")) {
			this.iScale = oAmountType.oConstraints?.scale || 0;
		}
		if (iOldScale !== this.iScale) {
			this._createFormats();
		}
	};

	return Currency;

});
