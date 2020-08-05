/*!
 * ${copyright}
 */

// Provides an OData Unit type which extends sap.ui.model.type.Unit by unit of measure
// customizing
sap.ui.define([
	"./UnitMixin",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/type/Unit"
], function (applyUnitMixin, NumberFormat, BaseUnit) {
	"use strict";

	/**
	 * Constructor for a <code>Unit</code> composite type.
	 *
	 * @param {object} [oFormatOptions]
	 *   See parameter <code>oFormatOptions</code> of {@link sap.ui.model.type.Unit#constructor}.
	 *   Format options are immutable, that is, they can only be set once on construction. Format
	 *   options that are not supported or have a different default are listed below.
	 * @param {object} [oFormatOptions.customUnits]
	 *   Not supported; the type derives this from its unit customizing part.
	 * @param {boolean} [oFormatOptions.parseAsString=true]
	 *   Whether the measure is parsed to a string; set to <code>false</code> if the measure's
	 *   underlying type is represented as a <code>number</code>, for example
	 *   {@link sap.ui.model.odata.type.Int32}
	 * @param {boolean} [oFormatOptions.unitOptional=true]
	 *   Whether the quantity is parsed if no unit is entered.
	 * @param {any} [oFormatOptions.emptyString=0]
	 *   Defines how an empty string is parsed into the measure. With the default value
	 *   <code>0</code> the measure becomes <code>0</code> when an empty string is parsed.
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
	 *
	 * @borrows sap.ui.model.odata.type.UnitMixin#getInterface as #getInterface
	 * @borrows sap.ui.model.odata.type.UnitMixin#validateValue as #validateValue
	 */
	var Unit = BaseUnit.extend("sap.ui.model.odata.type.Unit", {
		constructor : function (oFormatOptions, oConstraints, aDynamicFormatOptionNames) {
			this._applyUnitMixin.apply(this, arguments);
		}
	});

	applyUnitMixin(Unit.prototype, BaseUnit, "customUnits");

	/**
	 * Formats the given values of the parts of the <code>Unit</code> composite type to the given
	 * target type.
	 *
	 * @param {any[]} aValues
	 *   Array of part values to be formatted; contains in the following order: measure, unit,
	 *   unit customizing. The first call to this method where all parts are set determines the unit
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
	 * @function
	 * @name sap.ui.model.odata.type.Unit#formatValue
	 * @public
	 * @since 1.63.0
	 */

	/**
	 * @override
	 * @see sap.ui.model.odata.type.UnitMixin#getCustomUnitForKey
	 */
	Unit.prototype.getCustomUnitForKey = function (mCustomizing, sKey) {
		return {
			decimals : mCustomizing[sKey].UnitSpecificScale,
			displayName : mCustomizing[sKey].Text,
			"unitPattern-count-other" : NumberFormat.getDefaultUnitPattern(sKey)
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
	 * @function
	 * @name sap.ui.model.odata.type.Unit#parseValue
	 * @public
	 * @see sap.ui.model.type.Unit#parseValue
	 * @since 1.63.0
	 */

	return Unit;
});