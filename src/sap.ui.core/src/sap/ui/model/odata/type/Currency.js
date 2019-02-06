/*!
 * ${copyright}
 */

// Provides an OData Currency type which extends sap.ui.model.type.Currency by currency customizing
sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/model/type/Currency"
], function (merge, BaseCurrency) {
	"use strict";
	/*global Map */

	var mCustomizing2CustomCurrencies = new Map();

	/**
	 * Constructor for a Currency composite type.
	 *
	 * @param {object} [oFormatOptions]
	 *   See parameter <code>oFormatOptions</code> of
	 *   {@link sap.ui.model.type.Currency#constructor}. Format options are immutable, that is, they
	 *   can only be set once on construction.
	 * @param {object} [oFormatOptions.customCurrencies]
	 *   Not supported; the type derives this from its currency customizing part.
	 * @param {boolean} [oFormatOptions.parseAsString=true]
	 *   Whether the amount is parsed to a string; set to <code>false</code> if the amount's
	 *   underlying type is represented as a <code>number</code>, for example
	 *   {@link sap.ui.model.odata.type.Int32}
	 * @param {object} [oConstraints] Not supported
	 * @throws {Error} If called with more parameters than <code>oFormatOptions</code> or if the
	 *   format option <code>customCurrencies</code> is set
	 *
	 * @alias sap.ui.model.odata.type.Currency
	 * @author SAP SE
	 * @class This class represents the Currency composite type with the parts amount, currency, and
	 * currency customizing. The amount part is formatted according to the customizing for the
	 * currency. Use the result of the promise returned by
	 * {@link sap.ui.model.odata.v4.ODataMetaModel#requestCurrencyCodes} as currency customizing
	 * part. If no currency customizing is available, UI5's default formatting applies. The type may
	 * only be used for amount and currency parts from a {@link sap.ui.model.odata.v4.ODataModel}.
	 * @extends sap.ui.model.type.Currency
	 * @public
	 * @since 1.63.0
	 * @version ${version}
	 */
	var Currency = BaseCurrency.extend("sap.ui.model.odata.type.Currency", {
		constructor : function (oFormatOptions, oConstraints, aDynamicFormatOptionNames) {
			if (oFormatOptions && oFormatOptions["customCurrencies"]) {
				throw new Error("Format option customCurrencies is not supported");
			}

			if (oConstraints) {
				throw new Error("Constraints not supported");
			}

			if (arguments.length > 2) {
				throw new Error("Only the parameter oFormatOptions is supported");
			}

			oFormatOptions = merge({parseAsString : true}, oFormatOptions);

			BaseCurrency.call(this, oFormatOptions, oConstraints);

			// must not overwrite setConstraints and setFormatOptions on prototype as they are
			// called in SimpleType constructor
			this.setConstraints = function () {
				throw new Error("Constraints not supported");
			};
			this.setFormatOptions = function () {
				throw new Error("Format options are immutable");
			};
			this.mCustomCurrencies = undefined;
		}
	});

	/**
	 * Formats the given values of the parts of the Currency composite type to the given target
	 * type.
	 *
	 * @param {any[]} aValues
	 *   Array of part values to be formatted; contains amount, currency, currency customizing in
	 *   this order. The first call to this method where all parts are set determines the currency
	 *   customizing; subsequent calls use this customizing, so that the corresponding part may be
	 *   omitted. Changes to the currency customizing part after this first method call are not
	 *   considered: The currency customizing for this Currency instance remains unchanged.
	 * @param {string} sTargetType
	 *   The target type; must be "string" or a type with "string" as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {string}
	 *   The formatted output value; <code>null</code>, if <code>aValues</code> or the amount or
	 *   currency value contained therein is <code>undefined</code> or <code>null</code> or if
	 *   the unit customizing is not set.
	 * @throws {sap.ui.model.FormatException}
	 *   If <code>sTargetType</code> is unsupported
	 *
	 * @public
	 * @since 1.63.0
	 */
	Currency.prototype.formatValue = function (aValues, sTargetType) {
		var that = this;

		function isUnset(vValue) {
			return vValue === undefined || vValue === null;
		}

		// composite binding calls formatValue several times, where some parts are not yet available
		if (!aValues || isUnset(aValues[0]) || isUnset(aValues[1])
			|| aValues[2] === undefined && this.mCustomCurrencies === undefined) {
			return null;
		}

		if (this.mCustomCurrencies === undefined) {
			if (aValues[2] === null) { // no currency customizing available
				this.mCustomCurrencies = null;
			} else {
				this.mCustomCurrencies = mCustomizing2CustomCurrencies.get(aValues[2]);
				if (!this.mCustomCurrencies) {
					this.mCustomCurrencies = {};
					Object.keys(aValues[2]).forEach(function (sKey) {
						that.mCustomCurrencies[sKey] = {
							decimals : aValues[2][sKey].UnitSpecificScale,
							isoCode : aValues[2][sKey].StandardCode
						};
					});
					mCustomizing2CustomCurrencies.set(aValues[2], this.mCustomCurrencies);
				}
				BaseCurrency.prototype.setFormatOptions.call(this,
					merge({customCurrencies : this.mCustomCurrencies}, this.oFormatOptions));
			}
		}
		return BaseCurrency.prototype.formatValue.call(this, aValues.slice(0, 2), sTargetType);
	};

	/**
	 * @see sap.ui.base.Object#getInterface
	 *
	 * @returns {object} this
	 *
	 * @public
	 * @since 1.63.0
	 */
	Currency.prototype.getInterface = function () {
		return this;
	};

	/**
	 * Returns the type's name.
	 *
	 * @returns {string}
	 *   The type's name
	 *
	 * @public
	 * @since 1.63.0
	 */
	Currency.prototype.getName = function () {
		return "sap.ui.model.odata.type.Currency";
	};

	/**
	 * Parses the given string value to an array containing amount and currency.
	 *
	 * @param {string} vValue
	 *   The value to be parsed
	 * @param {string} sSourceType
	 *   The source type (the expected type of <code>vValue</code>); must be "string", or a type
	 *   with "string" as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {any[]}
	 *   An array containing amount and currency in this order. Both, amount and currency, are
	 *   string values unless the format option <code>parseAsString</code> is <code>false</code>; in
	 *   this case, the amount is a number.
	 * @throws {sap.ui.model.ParseException}
	 *   If <code>sSourceType</code> is unsupported or if the given string cannot be parsed
	 * @throws {Error}
	 *   If {@link #formatValue} has not yet been called with a currency customizing part
	 *
	 * @public
	 * @see sap.ui.model.type.Currency#parseValue
	 * @since 1.63.0
	 */
	Currency.prototype.parseValue = function (vValue, sSourceType) {
		if (!this.mCustomCurrencies) {
			throw new Error("Cannot parse value without currency customizing");
		}

		return BaseCurrency.prototype.parseValue.apply(this, arguments);
	};

	/**
	 * Does nothing as the Currency type does not support constraints.
	 *
	 * @param {string} vValue
	 *   The value to be validated
	 * @returns {void}
	 * @throws {Error}
	 *   If {@link #formatValue} has not yet been called with a currency customizing part
	 *
	 * @public
	 * @since 1.63.0
	 */
	Currency.prototype.validateValue = function (vValue) {
		if (this.mCustomCurrencies === undefined) {
			throw new Error("Cannot validate value without currency customizing");
		}
	};

	return Currency;
});