/*!
 * ${copyright}
 */

// Provides an OData Unit type which extends sap.ui.model.type.Unit by unit of measure
// customizing
sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/type/Unit"
], function (merge, NumberFormat, BaseUnit) {
	"use strict";
	/*global Map */

	var mCustomizing2CustomUnits = new Map();

	/**
	 * Constructor for a Unit composite type.
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
	 * @class This class represents the Unit composite type with the parts measure, unit, and
	 * unit customizing. The measure part is formatted according to the customizing for the unit.
	 * Use the result of the promise returned by
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

			oFormatOptions = merge({parseAsString : true, unitOptionalOnParse : true},
				oFormatOptions);

			BaseUnit.call(this, oFormatOptions, oConstraints, ["customUnits"]);

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
	 * Formats the given values of the parts of the Unit composite type to the given target type.
	 *
	 * @param {any[]} aValues
	 *   Array of part values to be formatted; contains measure, unit, unit customizing in this
	 *   order. The first call to this method where all parts are set determines the unit
	 *   customizing; subsequent calls use this customizing, so that the corresponding part may be
	 *   omitted. Changes to the unit customizing part after this first method call are not
	 *   considered: The unit customizing for this Unit instance remains unchanged.
	 * @param {string} sTargetType
	 *   The target type; must be "string" or a type with "string" as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {string}
	 *   The formatted output value; <code>null</code>, if <code>aValues</code> or the measure or
	 *   unit value contained therein is <code>undefined</code> or <code>null</code> or if the
	 *   unit customizing is not set
	 * @throws {sap.ui.model.FormatException}
	 *   If <code>sTargetType</code> is unsupported
	 *
	 * @public
	 * @since 1.63.0
	 */
	Unit.prototype.formatValue = function (aValues, sTargetType) {
		var that = this;

		function isUnset(vValue) {
			return vValue === undefined || vValue === null;
		}

		// composite binding calls formatValue several times, where some parts are not yet available
		if (!aValues || isUnset(aValues[0]) || isUnset(aValues[1])
			|| aValues[2] === undefined && this.mCustomUnits === undefined) {
			return null;
		}

		if (this.mCustomUnits === undefined) {
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
			}
		}
		aValues = aValues.slice(0, 2);
		if (this.mCustomUnits) {
			aValues[2] = this.mCustomUnits;
		}
		return BaseUnit.prototype.formatValue.call(this, aValues, sTargetType);
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
	 * @returns {any[]}
	 *   An array containing measure and unit in this order. Both, measure and unit, are string
	 *   values unless the format option <code>parseAsString</code> is <code>false</code>; in this
	 *   case, the measure is a number.
	 * @throws {sap.ui.model.ParseException}
	 *   If <code>sSourceType</code> is unsupported or if the given string cannot be parsed
	 * @throws {Error}
	 *   If {@link #formatValue} has not yet been called with a unit customizing part
	 *
	 * @public
	 * @see sap.ui.model.type.Unit#parseValue
	 * @since 1.63.0
	 */
	Unit.prototype.parseValue = function (vValue, sSourceType) {
		if (!this.mCustomUnits) {
			throw new Error("Cannot parse value without unit customizing");
		}

		return BaseUnit.prototype.parseValue.apply(this, arguments);
	};

	/**
	 * Does nothing as the Unit type does not support constraints.
	 *
	 * @param {string} vValue
	 *   The value to be validated
	 * @returns {void}
	 * @throws {Error}
	 *   If {@link #formatValue} has not yet been called with a unit customizing part
	 *
	 * @public
	 * @since 1.63.0
	 */
	Unit.prototype.validateValue = function (vValue) {
		if (this.mCustomUnits === undefined) {
			throw new Error("Cannot validate value without unit customizing");
		}
	};

	return Unit;
});