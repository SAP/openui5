/*!
 * ${copyright}
 */

// Provides mixin sap.ui.model.odata.type.UnitMixin supporting unit customizing for types like
// sap.ui.model.odata.type.Currency or sap.ui.model.odata.type.Unit
sap.ui.define([
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException"
], function (ParseException, ValidateException) {
	"use strict";
	/*global Map */

	var mCodeList2CustomUnits = new Map(),
		rDecimals = /\.(\d+)$/,
		rSeparator = /\.$/,
		rTrailingZeros = /0+$/;

	/**
	 * Fetches a text from the message bundle and formats it using the parameters.
	 *
	 * @param {string} sKey
	 *   The message key
	 * @param {any[]} aParams
	 *   The message parameters
	 * @returns {string}
	 *   The message
	 */
	function getText(sKey, aParams) {
		return sap.ui.getCore().getLibraryResourceBundle().getText(sKey, aParams);
	}

	/**
	 * Converts the given unit customizing for the given key to a custom unit.
	 *
	 * @param {object} mCustomizing
	 *   The unit customizing as retrieved from a backend
	 * @param {string} sKey
	 *   The key
	 * @returns {object}
	 *   The custom unit as expected by {@link sap.ui.core.format.NumberFormat}
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.type.UnitMixin#getCustomUnitForKey
	 * @private
	 */

	/**
	 * @see sap.ui.base.Object#getInterface
	 *
	 * @returns {object} this
	 *
	 * @function
	 * @name sap.ui.model.odata.type.UnitMixin#getInterface
	 * @public
	 * @since 1.63.0
	 */
	function getInterface() {
		return this;
	}

	/**
	 * Does nothing as the type does not support constraints.
	 *
	 * @param {string} vValue
	 *   The value to be validated
	 * @throws {sap.ui.model.ValidateException}
	 *   If {@link #formatValue} has not yet been called with a customizing part
	 *
	 * @function
	 * @name sap.ui.model.odata.type.UnitMixin#validateValue
	 * @public
	 * @since 1.63.0
	 */
	 function validateValue(vValue) {
		if (this.mCustomUnits === undefined) {
			throw new ValidateException("Cannot validate value without customizing");
		}
	}

	/* Enhances the given prototype.
	 *
	 * @param {object} oPrototype
	 *   The prototype of the concrete type
	 * @param {object} fnBaseType
	 *   The concrete type's base class
	 * @param {string} sFormatOptionName
	 *   The name of the format option that accepts the custom units,
	 *   see {@link sap.ui.core.format.NumberFormat#getCurrencyInstance} or
	 *   {@link sap.ui.core.format.NumberFormat#getUnitInstance}
	 */
	return function (oPrototype, fnBaseType, sFormatOptionName) {
		/**
		 * Formats the given values of the parts of the composite type to the given target type.
		 *
		 * @param {any[]} aValues
		 *   Array of part values to be formatted; contains in the following order: Measure or
		 *   amount, unit or currency, and the corresponding customizing. The first call to this
		 *   method where all parts are set determines the customizing; subsequent calls use this
		 *   customizing, so that the corresponding part may be omitted. Changes to the customizing
		 *   part after this first method call are not considered: The customizing for this instance
		 *   remains unchanged.
		 * @param {string} sTargetType
		 *   The target type; must be "string" or a type with "string" as its
		 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
		 *   See {@link sap.ui.model.odata.type} for more information.
		 * @returns {string}
		 *   The formatted output value; <code>null</code>, if <code>aValues</code> is
		 *   <code>undefined</code> or <code>null</code> or if the measure or amount, the unit or
		 *   currency or the corresponding customizing contained therein is <code>undefined</code>.
		 * @throws {sap.ui.model.FormatException}
		 *   If <code>sTargetType</code> is unsupported
		 *
		 * @function
		 * @name sap.ui.model.odata.type.UnitMixin#formatValue
		 * @public
		 * @since 1.63.0
		 */
		function formatValue(aValues, sTargetType) {
			var oFormatOptions,
				that = this;

			if (this.mCustomUnits === undefined && aValues && aValues[2] !== undefined) {
				if (aValues[2] === null) { // no unit customizing available
					this.mCustomUnits = null;
				} else {
					this.mCustomUnits = mCodeList2CustomUnits.get(aValues[2]);
					if (!this.mCustomUnits) {
						this.mCustomUnits = {};
						Object.keys(aValues[2]).forEach(function (sKey) {
							that.mCustomUnits[sKey] = that.getCustomUnitForKey(aValues[2], sKey);
						});
						mCodeList2CustomUnits.set(aValues[2], this.mCustomUnits);
					}
					oFormatOptions = {};
					oFormatOptions[sFormatOptionName] = this.mCustomUnits;
					fnBaseType.prototype.setFormatOptions.call(this,
						Object.assign(oFormatOptions, this.oFormatOptions));
				}
			}

			// composite binding calls formatValue several times,
			// where some parts are not yet available
			if (!aValues || aValues[0] === undefined || aValues[1] === undefined
				|| this.mCustomUnits === undefined && aValues[2] === undefined) {
				return null;
			}

			return fnBaseType.prototype.formatValue.call(this, aValues.slice(0, 2), sTargetType);
		}

		/**
		 * Parses the given string value to an array containing measure or amount, and unit or
		 * currency.
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
		 *   An array containing measure or amount, and unit or currency in this order. Measure or
		 *   amount, and unit or currency, are string values unless the format option
		 *   <code>parseAsString</code> is <code>false</code>; in this case, the measure or amount
		 *   is a number.
		 * @throws {sap.ui.model.ParseException}
		 *   If {@link #formatValue} has not yet been called with a customizing part or
		 *   if <code>sSourceType</code> is unsupported or if the given string cannot be parsed
		 *
		 * @function
		 * @name sap.ui.model.odata.type.UnitMixin#parseValue
		 * @public
		 * @see sap.ui.model.type.Unit#parseValue
		 * @since 1.63.0
		 */
		function parseValue(vValue, sSourceType, aCurrentValues) {
			var iDecimals, iFractionDigits, aMatches, sUnit, aValues;

			if (this.mCustomUnits === undefined) {
				throw new ParseException("Cannot parse value without customizing");
			}

			aValues = fnBaseType.prototype.parseValue.apply(this, arguments);
			sUnit = aValues[1] || aCurrentValues[1];
			// remove trailing decimal zeroes and separator
			if (aValues[0].includes(".")) {
				aValues[0] = aValues[0].replace(rTrailingZeros, "").replace(rSeparator, "");
			}
			if (sUnit && this.mCustomUnits) {
				aMatches = rDecimals.exec(aValues[0]);
				iFractionDigits = aMatches ? aMatches[1].length : 0;
				// If the unit is not in mCustomUnits, the base class throws a ParseException.
				iDecimals = this.mCustomUnits[sUnit].decimals;
				if (iFractionDigits > iDecimals) {
					throw new ParseException(iDecimals
						? getText("EnterNumberFraction", [iDecimals])
						: getText("EnterInt"));
				}
			}
			if (!this.bParseAsString) {
				aValues[0] = Number(aValues[0]);
			}

			return aValues;
		}

		/*
		 * A mixin for sap.ui.model.odata.type.Currency and sap.ui.model.odata.type.Unit.
		 *
		 * Note: the format option <code>unitOptional</code> defaults to true.
		 *
		 * @param {object} [oFormatOptions]
		 *   See parameter <code>oFormatOptions</code> of <code>fnBaseType</code>. Format options
		 *   are immutable, that is, they can only be set once on construction. Format options
		 *   that are not supported or have a different default are listed below.
		 * @param {object} [oFormatOptions.<sFormatOptionName>]
		 *   Not supported; the type derives this from its customizing part.
		 * @param {boolean} [oFormatOptions.parseAsString=true]
		 *   Whether the amount or measure is parsed to a string; set to <code>false</code> if the
		 *   underlying type is represented as a <code>number</code>, for example
		 *   {@link sap.ui.model.odata.type.Int32}
		 * @param {boolean} [oFormatOptions.unitOptional=true]
		 *   Whether the amount or measure is parsed if no currency or unit is entered.
		 * @param {any} [oFormatOptions.emptyString=0]
		 *   Defines how an empty string is parsed into the amount/measure. With the default value
		 *   <code>0</code> the amount/measure becomes <code>0</code> when an empty string is
		 *   parsed.
		 * @param {object} [oConstraints] Not supported
		 * @throws {Error} If called with more parameters than <code>oFormatOptions</code> or if the
		 *   format option <code>sFormatOptionName</code> is set
		 *
		 * @alias sap.ui.model.odata.type.UnitMixin
		 * @mixin
		 */
		function UnitMixin(oFormatOptions, oConstraints) {
			if (oFormatOptions && oFormatOptions[sFormatOptionName]) {
				throw new Error("Format option " + sFormatOptionName + " is not supported");
			}
			if (oConstraints) {
				throw new Error("Constraints not supported");
			}
			if (arguments.length > 2) {
				throw new Error("Only the parameter oFormatOptions is supported");
			}

			// Note: The format option 'parseAsString' is always set to true, so that the base type
			// always parses to a string and we can check the result.
			this.bParseAsString = !oFormatOptions || !("parseAsString" in oFormatOptions)
				|| oFormatOptions.parseAsString;
			oFormatOptions = Object.assign({unitOptional : true, emptyString: 0}, oFormatOptions,
				{parseAsString : true});

			fnBaseType.call(this, oFormatOptions, oConstraints);
			// initialize mixin members after super c'tor as it overrides several members!

			// map custom units as expected by {@link sap.ui.core.format.NumberFormat}
			this.mCustomUnits = undefined;
			// whether the parse method call includes the current binding values as a 3rd parameter
			this.bParseWithValues = true;
			// must not overwrite setConstraints and setFormatOptions on prototype as they are
			// called in SimpleType constructor
			this.setConstraints = function () {
				throw new Error("Constraints not supported");
			};
			this.setFormatOptions = function () {
				throw new Error("Format options are immutable");
			};
		}

		// remember the constructor which has access to this local scope
		oPrototype._applyUnitMixin = UnitMixin;
		oPrototype.formatValue = formatValue;
		oPrototype.getInterface = getInterface;
		oPrototype.parseValue = parseValue;
		oPrototype.validateValue = validateValue;
	};
}, /* bExport= */ false);