/*!
 * ${copyright}
 */

// Provides mixin sap.ui.model.odata.type.UnitMixin supporting unit customizing for types like
// sap.ui.model.odata.type.Currency or sap.ui.model.odata.type.Unit
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException"
], function(Library, ParseException, ValidateException) {
	"use strict";

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
		return Library.getResourceBundleFor("sap.ui.core").getText(sKey, aParams);
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

	/* Enhances the given prototype.
	 *
	 * @param {object} oPrototype
	 *   The prototype of the concrete type
	 * @param {object} fnBaseType
	 *   The concrete type's base class
	 * @param {string} sFormatOptionName
	 *   The name of the format option that accepts the custom units,
	 *   see {@link sap.ui.core.format.NumberFormat.getCurrencyInstance} or
	 *   {@link sap.ui.core.format.NumberFormat.getUnitInstance}
	 * @param {string} sMessageKeyPrefix
	 *   The key prefix used to get error message texts from the resource bundle
	 */
	return function (oPrototype, fnBaseType, sFormatOptionName, sMessageKeyPrefix) {
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

		// @override
		// @see sap.ui.model.SimpleType#getFormatOptions
		function getFormatOptions() {
			var oBaseFormatOptions = fnBaseType.prototype.getFormatOptions.call(this);

			delete oBaseFormatOptions[sFormatOptionName];

			return oBaseFormatOptions;
		}

		/**
		 * Gets an array of indices that determine which parts of this type shall not propagate
		 * their model messages to the attached control. Prerequisite is that the corresponding
		 * binding supports this feature, see {@link sap.ui.model.Binding#supportsIgnoreMessages}.
		 * If the format option <code>showMeasure</code> is set to <code>false</code> and the unit
		 * or currency is not shown in the control, the part for the unit or currency shall not
		 * propagate model messages to the control. Analogously, since 1.89.0, if the format option
		 * <code>showNumber</code> is set to <code>false</code>, the amount or measure is not shown
		 * in the control and the part for the amount or measure shall not propagate model messages
		 * to the control.
		 *
		 * @return {number[]}
		 *   An array of indices that determine which parts of this type shall not propagate their
		 *   model messages to the attached control
		 *
		 * @public
		 * @see sap.ui.model.Binding#supportsIgnoreMessages
		 * @since 1.82.0
		 */
		// @override sap.ui.model.CompositeType#getPartsIgnoringMessages
		function getPartsIgnoringMessages() {
			if (!this.bShowMeasure) {
				return [1, 2];
			} else if (!this.bShowNumber) {
				return [0, 2];
			}
			return [2];
		}

		/**
		 * Returns the validate exception based on "showNumber" and "showMeasure" format options and
		 * given decimals.
		 *
		 * @param {int} iDecimals
		 *   The allowed number of decimals of the current currency
		 * @returns {sap.ui.model.ValidateException}
		 *   The validate exception
		 *
		 * @private
		 */
		function getValidateException(iDecimals) {
			var sText;

			if (!this.bShowNumber) {
				sText = iDecimals
					? getText(sMessageKeyPrefix + ".WithDecimals", [iDecimals])
					: getText(sMessageKeyPrefix + ".WithoutDecimals");
			} else {
				sText = iDecimals
					? getText("EnterNumberFraction", [iDecimals])
					: getText("EnterInt");
			}

			return new ValidateException(sText);
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
		 * @param {any[]} [aCurrentValues]
		 *   Not used
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
		function parseValue(vValue, sSourceType) {
			var aValues;

			if (this.mCustomUnits === undefined) {
				throw new ParseException("Cannot parse value without customizing");
			}

			aValues = fnBaseType.prototype.parseValue.apply(this, arguments);
			// remove trailing decimal zeroes and separator
			if (aValues[0] && typeof aValues[0] === "string" && aValues[0].includes(".")) {
				aValues[0] = aValues[0].replace(rTrailingZeros, "").replace(rSeparator, "");
			}

			return aValues;
		}

		/**
		 * Validates whether the given value in model representation as returned by
		 * {@link #parseValue} is valid and meets the conditions of this type's unit/currency
		 * customizing.
		 *
		 * @param {any[]} aValues
		 *   An array containing measure or amount, and unit or currency in this order, see return
		 *   value of {@link #parseValue}
		 * @throws {sap.ui.model.ValidateException}
		 *   If {@link #formatValue} has not yet been called with a customizing part or if the
		 *   entered measure/amount has too many decimals
		 *
		 * @function
		 * @name sap.ui.model.odata.type.UnitMixin#validateValue
		 * @public
		 * @since 1.63.0
		 */
		function validateValue(aValues) {
			var iDecimals, iFractionDigits, aMatches,
				vNumber = aValues[0],
				sUnit = aValues[1];

			if (this.mCustomUnits === undefined) {
				throw new ValidateException("Cannot validate value without customizing");
			}

			if (!vNumber || !sUnit || !this.mCustomUnits
					|| this.oConstraints.skipDecimalsValidation) {
				return;
			}

			aMatches = rDecimals.exec(vNumber);
			iFractionDigits = aMatches ? aMatches[1].replace(rTrailingZeros, "").length : 0;
			iDecimals = this.mCustomUnits[sUnit].decimals;
			if (iFractionDigits > iDecimals) {
				throw this.getValidateException(iDecimals);
			}
		}

		/*
		 * A mixin for sap.ui.model.odata.type.Currency and sap.ui.model.odata.type.Unit.
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
		 * @param {boolean} [oFormatOptions.preserveDecimals=true]
		 *   By default decimals are preserved, unless <code>oFormatOptions.style</code> is given as
		 *   "short" or "long"; since 1.89.0
		 * @param {boolean} [oFormatOptions.unitOptional]
		 *   Whether the amount or measure is parsed if no currency or unit is entered; defaults to
		 *   <code>true</code> if neither <code>showMeasure</code> nor <code>showNumber</code> is
		 *   set to a falsy value, otherwise defaults to <code>false</code>
		 * @param {any} [oFormatOptions.emptyString=0|""]
		 *   Defines which value to use if an empty string is parsed.
		 *   <ul>
		 *     <li> If the formatted value contains the amount/measure, <code>0</code> is used as
		 *       the default amount/measure when an empty string is parsed.</li>
		 *     <li> If the formatted value contains only the currency/unit because the
		 *       <code>showNumber</code> format option is set to <code>false</code>, <code>""</code>
		 *       (empty string) is used as the default currency/unit when an empty string is parsed.
		 *     </li>
		 *   </ul>
		 * @param {object} [oConstraints]
		 *   Only the 'skipDecimalsValidation' constraint is supported. Constraints are immutable,
		 *   that is, they can only be set once on construction.
		 * @param {boolean} [oConstraints.skipDecimalsValidation=false]
		 *   Whether to skip validation of the number of decimals based on the code list
		 *   customizing; since 1.93.0
		 * @throws {Error} If called with more parameters than <code>oFormatOptions</code> or if the
		 *   format option <code>sFormatOptionName</code> is set
		 *
		 * @alias sap.ui.model.odata.type.UnitMixin
		 * @mixin
		 */
		function UnitMixin(oFormatOptions, oConstraints) {
			var aConstraintKeys = oConstraints ? Object.keys(oConstraints) : [];

			function checkConstraint(sConstraint) {
				if (sConstraint !== "skipDecimalsValidation") {
					throw new Error("Only 'skipDecimalsValidation' constraint is supported");
				}
			}

			if (oFormatOptions && oFormatOptions[sFormatOptionName]) {
				throw new Error("Format option " + sFormatOptionName + " is not supported");
			}
			aConstraintKeys.forEach(checkConstraint);
			if (arguments.length > 2) {
				throw new Error("Only parameters oFormatOptions and oConstraints are supported");
			}

			const bShowNumber = !oFormatOptions || !("showNumber" in oFormatOptions) || oFormatOptions["showNumber"];
			const bShowMeasure = !oFormatOptions || !("showMeasure" in oFormatOptions) || oFormatOptions["showMeasure"];
			// format option preserveDecimals is set in the base type
			oFormatOptions = Object.assign({
					emptyString: bShowNumber ? 0 : "",
					parseAsString : true,
					unitOptional : bShowNumber && bShowMeasure
				}, oFormatOptions);

			oConstraints = Object.assign({}, oConstraints);
			fnBaseType.call(this, oFormatOptions, oConstraints);
			// initialize mixin members after super c'tor as it overrides several members!

			// map custom units as expected by {@link sap.ui.core.format.NumberFormat}
			this.mCustomUnits = undefined;
			// must not overwrite setConstraints and setFormatOptions on prototype as they are
			// called in SimpleType constructor
			this.setConstraints = function () {
				throw new Error("Constraints are immutable");
			};
			this.setFormatOptions = function () {
				throw new Error("Format options are immutable");
			};
		}

		// remember the constructor which has access to this local scope
		oPrototype._applyUnitMixin = UnitMixin;
		oPrototype.formatValue = formatValue;
		oPrototype.getFormatOptions = getFormatOptions;
		oPrototype.getPartsIgnoringMessages = getPartsIgnoringMessages;
		oPrototype.getValidateException = getValidateException;
		oPrototype.parseValue = parseValue;
		oPrototype.validateValue = validateValue;
	};
});