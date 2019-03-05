/*!
 * ${copyright}
 */

// Provides an OData Unit type which extends sap.ui.model.type.Unit by unit of measure
// customizing
sap.ui.define([
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/type/Unit"
], function (NumberFormat, ParseException, ValidateException, BaseUnit) {
	"use strict";
	/*global Map */

	var mCustomizing2CustomUnits = new Map(),
		rDecimal = /\.(\d+)$/;

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
	 * Constructor for a <code>Unit</code> composite type.
	 *
	 * @param {object} [oFormatOptions]
	 *   See parameter <code>oFormatOptions</code> of {@link sap.ui.model.type.Unit#constructor}.
	 *   Format options are immutable, that is, they can only be set once on construction.
	 * @param {object} [oFormatOptions.customUnits]
	 *   Not supported; the type derives this from its unit customizing part.
	 * @param {boolean} [oFormatOptions.parseAsString=true]
	 *   Whether the measure is parsed to a string; set to <code>false</code> if the measure's
	 *   underlying type is represented as a <code>number</code>, for example
	 *   {@link sap.ui.model.odata.type.Int32}
	 * @param {object} [oConstraints] Not supported
	 * @param {string[]} [aDynamicFormatOptionNames] Not supported
	 * @throws {Error} If called with more parameters than <code>oFormatOptions</code> or if the
	 *   format option <code>customUnits</code> is set
	 *
	 * @alias sap.ui.model.odata.type.Unit
	 * @author SAP SE
	 * @class This class represents the <code>Unit</code> composite type with the parts measure,
	 * unit, and unit customizing. The measure part is formatted according to the customizing for
	 * the unit. Use the result of the promise returned by
	 * {@link sap.ui.model.odata.v4.ODataMetaModel#requestUnitsOfMeasure} as unit customizing part.
	 * If no unit customizing is available, UI5's default formatting applies. The type may only be
	 * used for measure and unit parts from a {@link sap.ui.model.odata.v4.ODataModel}.
	 * @extends sap.ui.model.type.Unit
	 * @public
	 * @since 1.63.0
	 * @version ${version}
	 */
	var Unit = BaseUnit.extend("sap.ui.model.odata.type.Unit", {
		constructor : function (oFormatOptions, oConstraints, aDynamicFormatOptionNames) {
			if (oFormatOptions && oFormatOptions["customUnits"]) {
				throw new Error("Format option customUnits is not supported");
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
			oFormatOptions = Object.assign({unitOptional : true}, oFormatOptions,
				{parseAsString : true});

			BaseUnit.call(this, oFormatOptions, oConstraints);

			this.bParseWithValues = true;

			// must not overwrite setConstraints and setFormatOptions on prototype as they are
			// called in SimpleType constructor
			this.setConstraints = function () {
				throw new Error("Constraints not supported");
			};
			this.setFormatOptions = function () {
				throw new Error("Format options are immutable");
			};
			this.mCustomUnits = undefined;
		}
	});

	/**
	 * Formats the given values of the parts of the <code>Unit</code> composite type to the given
	 * target type.
	 *
	 * @param {any[]} aValues
	 *   Array of part values to be formatted; contains measure, unit, unit customizing in this
	 *   order. The first call to this method where all parts are set determines the unit
	 *   customizing; subsequent calls use this customizing, so that the corresponding part may be
	 *   omitted. Changes to the unit customizing part after this first method call are not
	 *   considered: The unit customizing for this <code>Unit</code> instance remains unchanged.
	 * @param {string} sTargetType
	 *   The target type; must be "string" or a type with "string" as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {string}
	 *   The formatted output value; <code>null</code>, if <code>aValues</code> is
	 *   <code>undefined</code> or <code>null</code> or if the measure, the unit or the
	 *   unit customizing contained therein is <code>undefined</code>.
	 * @throws {sap.ui.model.FormatException}
	 *   If <code>sTargetType</code> is unsupported
	 *
	 * @public
	 * @since 1.63.0
	 */
	Unit.prototype.formatValue = function (aValues, sTargetType) {
		var that = this;

		if (this.mCustomUnits === undefined && aValues && aValues[2] !== undefined) {
			if (aValues[2] === null) { // no unit customizing available
				this.mCustomUnits = null;
			} else {
				this.mCustomUnits = mCustomizing2CustomUnits.get(aValues[2]);
				if (!this.mCustomUnits) {
					this.mCustomUnits = {};
					Object.keys(aValues[2]).forEach(function (sKey) {
						that.mCustomUnits[sKey] = {
							decimals : aValues[2][sKey].UnitSpecificScale,
							displayName : aValues[2][sKey].Text,
							"unitPattern-count-other" : NumberFormat.getDefaultUnitPattern(sKey)
						};
					});
					mCustomizing2CustomUnits.set(aValues[2], this.mCustomUnits);
				}
				BaseUnit.prototype.setFormatOptions.call(this,
					Object.assign({customUnits : this.mCustomUnits}, this.oFormatOptions));
			}
		}

		// composite binding calls formatValue several times, where some parts are not yet available
		if (!aValues || aValues[0] === undefined || aValues[1] === undefined
			|| this.mCustomUnits === undefined && aValues[2] === undefined) {
			return null;
		}

		return BaseUnit.prototype.formatValue.call(this, aValues.slice(0, 2), sTargetType);
	};

	/**
	 * @see sap.ui.base.Object#getInterface
	 *
	 * @returns {object} this
	 *
	 * @public
	 * @since 1.63.0
	 */
	Unit.prototype.getInterface = function () {
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
	Unit.prototype.getName = function () {
		return "sap.ui.model.odata.type.Unit";
	};

	/**
	 * Parses the given string value to an array containing measure and unit.
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
	 *   An array containing measure and unit in this order. Both, measure and unit, are string
	 *   values unless the format option <code>parseAsString</code> is <code>false</code>; in this
	 *   case, the measure is a number.
	 * @throws {sap.ui.model.ParseException}
	 *   If {@link #formatValue} has not yet been called with a unit customizing part or
	 *   if <code>sSourceType</code> is unsupported or if the given string cannot be parsed
	 *
	 * @public
	 * @see sap.ui.model.type.Unit#parseValue
	 * @since 1.63.0
	 */
	Unit.prototype.parseValue = function (vValue, sSourceType, aCurrentValues) {
		var iDecimals, iFractionDigits, aMatches, sUnit, aValues;

		if (this.mCustomUnits === undefined) {
			throw new ParseException("Cannot parse value without unit customizing");
		}

		aValues = BaseUnit.prototype.parseValue.apply(this, arguments);
		sUnit = aValues[1] || aCurrentValues[1];
		// remove trailing decimal zeroes and separator
		if (aValues[0].includes(".")) {
			aValues[0] = aValues[0].replace(/0+$/, "").replace(/\.$/, "");
		}
		if (sUnit && this.mCustomUnits) {
			aMatches = rDecimal.exec(aValues[0]);
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
	};

	/**
	 * Does nothing as the <code>Unit</code> type does not support constraints.
	 *
	 * @param {string} vValue
	 *   The value to be validated
	 * @returns {void}
	 * @throws {sap.ui.model.ValidateException}
	 *   If {@link #formatValue} has not yet been called with a unit customizing part
	 *
	 * @public
	 * @since 1.63.0
	 */
	Unit.prototype.validateValue = function (vValue) {
		if (this.mCustomUnits === undefined) {
			throw new ValidateException("Cannot validate value without unit customizing");
		}
	};

	return Unit;
});