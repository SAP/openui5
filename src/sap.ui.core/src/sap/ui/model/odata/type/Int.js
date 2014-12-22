/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/format/NumberFormat', 'sap/ui/model/FormatException',
		'sap/ui/model/ParseException', 'sap/ui/model/SimpleType',
		'sap/ui/model/ValidateException'],
	function(NumberFormat, FormatException, ParseException, SimpleType, ValidateException) {
	"use strict";

	/**
	 * Returns the error message for the type.
	 *
	 * @param {sap.ui.model.odata.type.Int} oType
	 *   the type
	 * @param {boolean} bShowRange
	 *   if true, the range values are shown
	 * @returns {string}
	 *   the message
	 */
	function getErrorMessage(oType, bShowRange) {
		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle(),
			oRange = oType.getRange();

		if (bShowRange) {
			return oResourceBundle.getText("EnterIntRange", [
				oType._getFormatter().format(oRange.minimum),
				oType._getFormatter().format(oRange.maximum)
			]);
		}
		return oResourceBundle.getText("EnterInt");
	}

	/**
	 * Constructor for a new <code>Int</code>.
	 *
	 * @class This is an abstract base class for integer-based
	 * <a href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * OData primitive types</a> like <code>Edm.Int16</code> or <code>Edm.Int32</code>.
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.ui.model.odata.type.Int
	 * @param {object} [oFormatOptions]
	 *   format options; this type does not support any format options
	 * @param {object} oConstraints
	 *   the constraints
	 * @param {boolean|string} [oConstraints.nullable=true]
	 *   if <code>true</code>, the value <code>null</code> will be accepted
	 * @public
	 * @since 1.27.0
	 */
	var Int = SimpleType.extend("sap.ui.model.odata.type.Int",
			/** @lends sap.ui.model.odata.type.Int.prototype */
			{
				constructor : function (oFormatOptions, oConstraints) {
					this.setConstraints(oConstraints);
				},
				metadata : {
					"abstract" : true
				}
			}
		);

	/**
	 * Returns the formatter. Creates it lazily.
	 * @returns {sap.ui.core.format.NumberFormat}
	 *   the formatter
	 * @private
	 */
	Int.prototype._getFormatter = function () {
		if (!this.oFormat) {
			this.oFormat = NumberFormat.getIntegerInstance({groupingEnabled: true});
		}
		return this.oFormat;
	};

	/**
	 * Called by the framework when any localization setting changed.
	 * @private
	 */
	Int.prototype._handleLocalizationChange = function () {
		this.oFormat = null;
	};

	/**
	 * Format the given value to the given target type.
	 * When formatting to <code>string</code> the format options are used.
	 *
	 * @param {number} iValue
	 *   the value in model representation to be formatted
	 * @param {string} sTargetType
	 *   the target type
	 * @returns {number|string}
	 *   the formatted output value in the target type; <code>undefined</code> or <code>null</code>
	 *   will be formatted to <code>null</code>
	 * @throws sap.ui.model.FormatException
	 *   if <code>sTargetType</code> is unsupported
	 * @public
	 */
	Int.prototype.formatValue = function(iValue, sTargetType) {
		if (iValue === undefined || iValue === null) {
			return null;
		}
		switch (sTargetType) {
			case "string":
				return this._getFormatter().format(iValue);
			case "int":
				return Math.floor(iValue);
			case "float":
			case "any":
				return iValue;
			default:
				throw new FormatException("Don't know how to format "
					+ this.getName() + " to " + sTargetType);
		}
	};

	/**
	 * Parse the given value, which is expected to be of the given source type, to an Int in
	 * number representation.
	 * @param {number|string} vValue
	 *   the value to be parsed. The empty string and <code>null</code> are parsed to
	 *   <code>null</code>.
	 * @param {string} sSourceType
	 *   the internal type of vValue
	 * @throws sap.ui.model.ParseException
	 *   if <code>sSourceType</code> is unsupported or if the given string cannot be parsed to an
	 *   integer type
	 * @returns {number}
	 *   the parsed value
	 * @public
	 */
	Int.prototype.parseValue = function(vValue, sSourceType) {
		var iResult;

		if (vValue === null || vValue === "") {
			return null;
		}
		switch (sSourceType) {
			case "string":
				iResult = this._getFormatter().parse(vValue);
				if (isNaN(iResult)) {
					throw new ParseException(getErrorMessage(this, false));
				}
				return iResult;
			case "float":
				return Math.floor(vValue);
			case "int":
				return vValue;
			default:
				throw new ParseException("Don't know how to parse " + this.getName()
					+ " from " + sSourceType);
		}
	};

	/**
	 * Set constraints for Int. This is meta information used when validating the value.
	 *
	 * @param {object} [oConstraints]
	 *   constraints, see {@link #constructor}
	 * @private
	 */
	Int.prototype.setConstraints = function(oConstraints) {
		var vNullable = oConstraints && oConstraints.nullable;

		this.oConstraints = undefined;
		switch (vNullable) {
		case false:
		case "false":
			this.oConstraints = {nullable: false};
			break;
		case true:
		case "true":
			break;
		default:
			jQuery.sap.log.warning("Illegal nullable: " + vNullable, null,
				"sap.ui.model.odata.type.Int");
		}
		this._handleLocalizationChange();
	};

	/**
	 * Validate whether the given value in model representation is valid and meets the
	 * defined constraints.
	 * @param {number} iValue
	 *   the value to be validated
	 * @throws ValidateException, if the value is not in the allowed range of Int or if it is
	 *   of invalid type.
	 * @public
	 */
	Int.prototype.validateValue = function(iValue) {
		var oRange = this.getRange();

		if (iValue === null) {
			if (this.oConstraints && this.oConstraints.nullable === false) {
				throw new ValidateException(getErrorMessage(this, false));
			}
			return;
		}
		if (typeof iValue !== "number") {
			// These are "technical" errors by calling validate w/o parse
			throw new ValidateException(iValue + " (of type " + typeof iValue + ") is not a valid "
				+ this.getName() + " value");
		}
		if (Math.floor(iValue) !== iValue) {
			throw new ValidateException(getErrorMessage(this, false));
		}
		if (iValue < oRange.minimum || iValue > oRange.maximum) {
			throw new ValidateException(getErrorMessage(this, true));
		}
	};

	/**
	 * Returns the type's name.
	 *
	 * @name sap.ui.model.odata.type.Int#getName
	 * @function
	 * @protected
	 * @abstract
	 */

	/**
	 * Returns the type's supported range as object with properties <code>minimum</code> and
	 * <code>maximum</code>.
	 *
	 * @name sap.ui.model.odata.type.Int#getRange
	 * @function
	 * @protected
	 * @abstract
	 */

	return Int;
});
