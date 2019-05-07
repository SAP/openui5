/*!
 * ${copyright}
 */

// Provides an OData Currency type which extends sap.ui.model.type.Currency by currency customizing
sap.ui.define([
	"./UnitMixin",
	"sap/ui/model/type/Currency"
], function (applyUnitMixin, BaseCurrency) {
	"use strict";

	/**
	 * Constructor for a <code>Currency</code> composite type.
	 *
	 * @param {object} [oFormatOptions]
	 *   See parameter <code>oFormatOptions</code> of
	 *   {@link sap.ui.model.type.Currency#constructor}. Format options are immutable, that is,
	 *   they can only be set once on construction. Format options that are not supported or have a
	 *   different default are listed below.
	 * @param {object} [oFormatOptions.customCurrencies]
	 *   Not supported; the type derives this from its currency customizing part.
	 * @param {boolean} [oFormatOptions.parseAsString=true]
	 *   Whether the amount is parsed to a string; set to <code>false</code> if the amount's
	 *   underlying type is represented as a <code>number</code>, for example
	 *   {@link sap.ui.model.odata.type.Int32}
	 * @param {boolean} [oFormatOptions.unitOptional=true]
	 *   Whether the amount is parsed if no currency is entered.
	 * @param {any} [oFormatOptions.emptyString=0]
	 *   Defines how an empty string is parsed into the amount. With the default value
	 *   <code>0</code> the amount becomes <code>0</code> when an empty string is parsed.
	 * @param {object} [oConstraints] Not supported
	 * @throws {Error} If called with more parameters than <code>oFormatOptions</code> or if the
	 *   format option <code>customCurrencies</code> is set
	 *
	 * @alias sap.ui.model.odata.type.Currency
	 * @author SAP SE
	 * @class This class represents the <code>Currency</code> composite type with the parts amount,
	 * currency, and currency customizing. The amount part is formatted according to the customizing
	 * for the currency. Use the result of the promise returned by
	 * {@link sap.ui.model.odata.v4.ODataMetaModel#requestCurrencyCodes} as currency customizing
	 * part. If no currency customizing is available, UI5's default formatting applies. The type may
	 * only be used for amount and currency parts from a {@link sap.ui.model.odata.v4.ODataModel}.
	 * @extends sap.ui.model.type.Currency
	 * @public
	 * @since 1.63.0
	 * @version ${version}
	 *
	 * @borrows sap.ui.model.odata.type.UnitMixin#getInterface as #getInterface
	 * @borrows sap.ui.model.odata.type.UnitMixin#validateValue as #validateValue
	 */
	var Currency = BaseCurrency.extend("sap.ui.model.odata.type.Currency", {
		constructor : function (oFormatOptions, oConstraints) {
			this._applyUnitMixin.apply(this, arguments);
		}
	});

	applyUnitMixin(Currency.prototype, BaseCurrency, "customCurrencies");

	/**
	 * Formats the given values of the parts of the <code>Currency</code> composite type to the
	 * given target type.
	 *
	 * @param {any[]} aValues
	 *   Array of part values to be formatted; contains in the following order: amount, currency,
	 *   currency customizing. The first call to this method where all parts are set determines the
	 *   currency customizing; subsequent calls use this customizing, so that the corresponding
	 *   part may be omitted. Changes to the currency customizing part after this first method call
	 *   are not considered: The currency customizing for this <code>Currency</code> instance
	 *   remains unchanged.
	 * @param {string} sTargetType
	 *   The target type; must be "string" or a type with "string" as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {string}
	 *   The formatted output value; <code>null</code>, if <code>aValues</code> is
	 *   <code>undefined</code> or <code>null</code> or if the amount, the currency or
	 *   the currency customizing contained therein is <code>undefined</code>.
	 * @throws {sap.ui.model.FormatException}
	 *   If <code>sTargetType</code> is unsupported
	 *
	 * @function
	 * @name sap.ui.model.odata.type.Currency#formatValue
	 * @public
	 * @since 1.63.0
	 */

	/**
	 * @override
	 * @see sap.ui.model.odata.type.UnitMixin#getCustomUnitForKey
	 */
	Currency.prototype.getCustomUnitForKey = function (mCustomizing, sKey) {
		return {
			decimals : mCustomizing[sKey].UnitSpecificScale,
			isoCode : mCustomizing[sKey].StandardCode
		};
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
	 * @param {any[]} aCurrentValues
	 *   The current values of all binding parts
	 * @returns {any[]}
	 *   An array containing amount and currency in this order. Both, amount and currency, are
	 *   string values unless the format option <code>parseAsString</code> is <code>false</code>; in
	 *   this case, the amount is a number.
	 * @throws {sap.ui.model.ParseException}
	 *   If {@link #formatValue} has not yet been called with a currency customizing part or
	 *   if <code>sSourceType</code> is unsupported or if the given string cannot be parsed
	 *
	 * @function
	 * @name sap.ui.model.odata.type.Currency#parseValue
	 * @public
	 * @see sap.ui.model.type.Currency#parseValue
	 * @since 1.63.0
	 */

	return Currency;
});