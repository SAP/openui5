/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/format/NumberFormat', 'sap/ui/model/FormatException',
		'sap/ui/model/odata/type/ODataType', 'sap/ui/model/ParseException',
		'sap/ui/model/ValidateException'],
	function(NumberFormat, FormatException, ODataType, ParseException, ValidateException) {
	"use strict";

	/**
	 * Returns the formatter. Creates it lazily.
	 * @param {sap.ui.model.odata.type.Int} oType
	 *   the type instance
	 * @returns {sap.ui.core.format.NumberFormat}
	 *   the formatter
	 */
	function getFormatter(oType) {
		if (!oType.oFormat) {
			oType.oFormat = NumberFormat.getIntegerInstance({groupingEnabled: true});
		}
		return oType.oFormat;
	}

	/**
	 * Fetches a text from the message bundle and formats it using the parameters.
	 *
	 * @param {string} sKey
	 *   the message key
	 * @param {any[]} aParams
	 *   the message parameters
	 * @returns {string}
	 *   the message
	 */
	function getText(sKey, aParams) {
		return sap.ui.getCore().getLibraryResourceBundle().getText(sKey, aParams);
	}

	/**
	 * Set constraints for Int. This is meta information used when validating the value.
	 *
	 * @param {sap.ui.model.odata.type.Int} oType
	 *   the type instance
	 * @param {object} [oConstraints]
	 *   constraints, see {@link #constructor}
	 */
	function setConstraints(oType, oConstraints) {
		var vNullable = oConstraints && oConstraints.nullable;

		oType.oConstraints = undefined;
		switch (vNullable) {
		case false:
		case "false":
			oType.oConstraints = {nullable: false};
			break;
		case true:
		case "true":
			break;
		default:
			jQuery.sap.log.warning("Illegal nullable: " + vNullable, null, oType.getName());
		}
		oType._handleLocalizationChange();
	}

	/**
	 * Constructor for a new <code>Int</code>.
	 *
	 * @class This is an abstract base class for integer-based
	 * <a href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * OData primitive types</a> like <code>Edm.Int16</code> or <code>Edm.Int32</code>.
	 *
	 * @extends sap.ui.model.odata.type.ODataType
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
	var Int = ODataType.extend("sap.ui.model.odata.type.Int",
			/** @lends sap.ui.model.odata.type.Int.prototype */
			{
				constructor : function (oFormatOptions, oConstraints) {
					ODataType.apply(this, arguments);
					setConstraints(this, oConstraints);
				},
				metadata : {
					"abstract" : true
				}
			}
		);

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
				return getFormatter(this).format(iValue);
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
				iResult = getFormatter(this).parse(vValue);
				if (isNaN(iResult)) {
					throw new ParseException(getText("EnterInt"));
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
				throw new ValidateException(getText("EnterInt"));
			}
			return;
		}
		if (typeof iValue !== "number") {
			// These are "technical" errors by calling validate w/o parse
			throw new ValidateException(iValue + " (of type " + typeof iValue + ") is not a valid "
				+ this.getName() + " value");
		}
		if (Math.floor(iValue) !== iValue) {
			throw new ValidateException(getText("EnterInt"));
		}
		if (iValue < oRange.minimum) {
			throw new ValidateException(
				getText("EnterIntMin", [this.formatValue(oRange.minimum, "string")]));
		}
		if (iValue > oRange.maximum) {
			throw new ValidateException(
				getText("EnterIntMax", [this.formatValue(oRange.maximum, "string")]));
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
