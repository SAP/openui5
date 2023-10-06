/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/ODataType"
], function (Log, NumberFormat, FormatException, ParseException, ValidateException, ODataType) {
	"use strict";

	/**
	 * Returns the locale-dependent error message for the type.
	 *
	 * @returns {string}
	 *   the locale-dependent error message
	 */
	function getErrorMessage() {
		return sap.ui.getCore().getLibraryResourceBundle().getText("EnterNumber");
	}

	/**
	 * Returns the type's nullable constraint.
	 *
	 * @param {sap.ui.model.odata.type.Single} oType
	 *   the type
	 * @returns {boolean}
	 *   the nullable constraint or <code>true</code> if not defined
	 */
	function isNullable(oType) {
		return !oType.oConstraints || oType.oConstraints.nullable !== false;
	}

	/**
	 * Sets the constraints.
	 *
	 * @param {sap.ui.model.odata.type.Single} oType
	 *   the type instance
	 * @param {object} [oConstraints]
	 *   constraints, see {@link #constructor}
	 */
	function setConstraints(oType, oConstraints) {
		var vNullable;

		oType.oConstraints = undefined;
		if (oConstraints) {
			vNullable = oConstraints.nullable;
			if (vNullable === false || vNullable === "false") {
				oType.oConstraints = {nullable : false};
			} else if (vNullable !== undefined && vNullable !== true && vNullable !== "true") {
				Log.warning("Illegal nullable: " + vNullable, null, oType.getName());
			}
		}

		oType._handleLocalizationChange();
	}

	/**
	 * Constructor for a primitive type <code>Edm.Single</code>.
	 *
	 * @class This class represents the OData primitive type <a
	 * href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * <code>Edm.Single</code></a>.
	 *
	 * In both {@link sap.ui.model.odata.v2.ODataModel} and {@link sap.ui.model.odata.v4.ODataModel}
	 * this type is represented as a <code>number</code>.
	 *
	 * @extends sap.ui.model.odata.type.ODataType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.model.odata.type.Single
	 * @param {object} [oFormatOptions]
	 *   Format options as defined in {@link sap.ui.core.format.NumberFormat.getFloatInstance}.
	 *   In contrast to NumberFormat <code>groupingEnabled</code> defaults to <code>true</code>.
	 * @param {boolean} [oFormatOptions.parseEmptyValueToZero=false]
	 *   Whether the empty string and <code>null</code> are parsed to <code>0</code> if the <code>nullable</code>
	 *   constraint is set to <code>false</code>; see {@link #parseValue parseValue}; since 1.115.0
	 * @param {boolean} [oFormatOptions.preserveDecimals=true]
	 *   by default decimals are preserved, unless <code>oFormatOptions.style</code> is given as
	 *   "short" or "long"; since 1.89.0
	 * @param {object} [oConstraints]
	 *   constraints; {@link #validateValue validateValue} throws an error if any constraint is
	 *   violated
	 * @param {boolean|string} [oConstraints.nullable=true]
	 *   if <code>true</code>, the value <code>null</code> is accepted
	 * @public
	 * @since 1.27.1
	 */
	var Single = ODataType.extend("sap.ui.model.odata.type.Single", {
				constructor : function (oFormatOptions, oConstraints) {
					ODataType.apply(this, arguments);
					this.oFormatOptions = oFormatOptions;
					setConstraints(this, oConstraints);
					this.checkParseEmptyValueToZero();
				}
			}
		);

	/**
	 * Formats the given value to the given target type.
	 *
	 * @param {string|number} vValue
	 *   the value to be formatted, which is represented as a number in the model
	 * @param {string} sTargetType
	 *   the target type; may be "any", "float", "int", "string", or a type with one of these types
	 *   as its {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {number|string}
	 *   the formatted output value in the target type; <code>undefined</code> or <code>null</code>
	 *   are formatted to <code>null</code>
	 * @throws {sap.ui.model.FormatException}
	 *   If <code>sTargetType</code> is not supported or <code>vValue</code> is not a model value
	 *   for this type.
	 * @public
	 */
	Single.prototype.formatValue = function (vValue, sTargetType) {
		var fValue;

		if (vValue === null || vValue === undefined) {
			return null;
		}
		if (typeof vValue === "number") {
			fValue = vValue;
		} else if (typeof vValue === "string") {
			fValue = parseFloat(vValue);
		} else if (sTargetType !== "any") {
			throw new FormatException("Illegal " + this.getName() + " value: " + vValue);
		}
		switch (this.getPrimitiveType(sTargetType)) {
			case "any":
				return vValue;
			case "float":
				return fValue;
			case "int":
				return Math.floor(fValue);
			case "string":
				// toPrecision to avoid rounding errors and parseFloat to avoid trailing zeroes
				return this.getFormat().format(parseFloat(fValue.toPrecision(7)));
			default:
				throw new FormatException("Don't know how to format " + this.getName() + " to "
					+ sTargetType);
		}
	};

	/**
	 * @override
	 */
	Single.prototype.getFormat = function () {
		if (!this.oFormat) {
			var oFormatOptions = {groupingEnabled : true},
				oTypeFormatOptions = this.oFormatOptions || {};
			if (oTypeFormatOptions.style !== "short" && oTypeFormatOptions.style !== "long") {
				oFormatOptions.preserveDecimals = true;
			}
			Object.assign(oFormatOptions, this.oFormatOptions);
			delete oFormatOptions.parseEmptyValueToZero;
			this.oFormat = NumberFormat.getFloatInstance(oFormatOptions);
		}

		return this.oFormat;
	};

	/**
	 * Parses the given value, which is expected to be of the given type, to an Edm.Single in
	 * <code>number</code> representation.
	 *
	 * @param {number|string|null} vValue
	 *   The value to be parsed; note that there is no way to enter <code>Infinity</code> or
	 *   <code>NaN</code> values
	 * @param {string} sSourceType
	 *   The source type (the expected type of <code>vValue</code>); may be "float", "int",
	 *   "string", or a type with one of these types as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {number|null}
	 *   The parsed value. The empty string and <code>null</code> are parsed to:
	 *   <ul>
	 *     <li><code>0</code> if the <code>parseEmptyValueToZero</code> format option
	 *       is set to <code>true</code> and the <code>nullable</code> constraint is set to <code>false</code>,</li>
	 *     <li><code>null</code> otherwise.</li>
	 *   </ul>
	 * @throws {sap.ui.model.ParseException}
	 *   If <code>sSourceType</code> is unsupported or if the given string cannot be parsed to a
	 *   Single
	 * @public
	 * @since 1.29.0
	 */
	Single.prototype.parseValue = function (vValue, sSourceType) {
		var vEmptyValue = this.getEmptyValue(vValue, true);
		if (vEmptyValue !== undefined) {
			return vEmptyValue;
		}

		switch (this.getPrimitiveType(sSourceType)) {
			case "string":
				var fResult = this.getFormat().parse(vValue);
				if (isNaN(fResult)) {
					throw new ParseException(getErrorMessage());
				}
				return Math.fround(fResult);
			case "int":
			case "float":
				return Math.fround(vValue);
			default:
				throw new ParseException("Don't know how to parse " + this.getName() + " from "
					+ sSourceType);
		}
	};

	/**
	 * Called by the framework when any localization setting changed.
	 * @private
	 */
	Single.prototype._handleLocalizationChange = function () {
		this.oFormat = null;
	};

	/**
	 * Validates whether the given value in model representation is valid and meets the
	 * defined constraints.
	 *
	 * @param {number} fValue
	 *   the value to be validated
	 * @throws {sap.ui.model.ValidateException} if the value is not valid
	 * @public
	 * @since 1.29.0
	 */
	Single.prototype.validateValue = function (fValue) {
		if (fValue === null && isNullable(this)) {
			return;
		}
		if (typeof fValue === "number") {
			return;
		}
		throw new ValidateException(getErrorMessage());
	};

	/**
	 * Returns the type's name.
	 *
	 * @returns {string}
	 *   the type's name
	 * @public
	 */
	Single.prototype.getName = function () {
		return "sap.ui.model.odata.type.Single";
	};

	return Single;
});