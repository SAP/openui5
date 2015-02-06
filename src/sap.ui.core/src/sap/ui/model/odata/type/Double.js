/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/format/NumberFormat', 'sap/ui/model/FormatException',
		'sap/ui/model/odata/type/ODataType', 'sap/ui/model/ParseException',
		'sap/ui/model/ValidateException'],
	function(NumberFormat, FormatException, ODataType, ParseException, ValidateException) {
	"use strict";

	var rDouble = /^[-+]?\d(\.\d+)?E[-+]?\d+$/i;

	/**
	 * Returns the matching error message for the type based on the constraints.
	 *
	 * @returns {string}
	 *   the message
	 */
	function getErrorMessage() {
		return sap.ui.getCore().getLibraryResourceBundle().getText("EnterNumber");
	}

	/**
	 * Returns the formatter. Creates it lazily.
	 * @param {sap.ui.model.odata.type.Double} oType
	 *   the type instance
	 * @returns {sap.ui.core.format.NumberFormat}
	 *   the formatter
	 */
	function getFormatter(oType) {
		if (!oType.oFormat) {
			oType.oFormat = NumberFormat.getFloatInstance({groupingEnabled: true});
		}
		return oType.oFormat;
	}

	/**
	 * Returns the type's nullable constraint.
	 *
	 * @param {sap.ui.model.odata.type.Double} oType
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
	 * @param {sap.ui.model.odata.type.Double} oType
	 *   the type instance
	 * @param {object} [oConstraints]
	 *   constraints, see {@link #constructor}
	 */
	function setConstraints(oType, oConstraints) {
		var vNullable = oConstraints && oConstraints.nullable;

		oType.oConstraints = undefined;
		if (vNullable === false || vNullable === "false") {
			oType.oConstraints = {nullable: false};
		} else if (vNullable !== undefined && vNullable !== true && vNullable !== "true") {
			jQuery.sap.log.warning("Illegal nullable: " + vNullable, null, oType.getName());
		}

		oType._handleLocalizationChange();
	}

	/**
	 * Constructor for a primitive type <code>Edm.Double</code>.
	 *
	 * @class This class represents the OData primitive type <a
	 * href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * <code>Edm.Double</code></a>.
	 *
	 * In {@link sap.ui.model.odata.v2.ODataModel ODataModel} this type is represented as a
	 * <code>string</code>.
	 *
	 * @extends sap.ui.model.odata.type.ODataType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.model.odata.type.Double
	 * @param {object} [oFormatOptions]
	 *   format options as defined in the interface of {@link sap.ui.model.SimpleType}; this
	 *   type ignores them since it does not support any format options
	 * @param {object} [oConstraints]
	 *   constraints; {@link #validateValue validateValue} throws an error if any constraint is
	 *   violated
	 * @param {boolean|string} [oConstraints.nullable=true]
	 *   if <code>true</code>, the value <code>null</code> will be accepted
	 * @public
	 * @since 1.27.0
	 */
	var Double = ODataType.extend("sap.ui.model.odata.type.Double",
			/** @lends sap.ui.model.odata.type.Double.prototype */
			{
				constructor : function (oFormatOptions, oConstraints) {
					ODataType.apply(this, arguments);
					setConstraints(this, oConstraints);
				}
			}
		);

	/**
	 * Formats the given value to the given target type. When formatting to "string", very large
	 * or very small values are formatted to the exponential format (e.g. "-3.14 E+15").
	 *
	 * @param {string} sValue
	 *   the value to be formatted, which is represented as a string in the model
	 * @param {string} sTargetType
	 *   the target type; may be "any", "float", "int", "string".
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {number|string}
	 *   the formatted output value in the target type; <code>undefined</code> or <code>null</code>
	 *   are formatted to <code>null</code>
	 * @throws {sap.ui.model.FormatException}
	 *   if <code>sTargetType</code> is unsupported
	 * @public
	 */
	Double.prototype.formatValue = function(sValue, sTargetType) {
		var oFormatOptions,
			fValue;

		if (sValue === null || sValue === undefined) {
			return null;
		}
		switch (sTargetType) {
		case "any":
			return sValue;
		case "float":
			return parseFloat(sValue);
		case "int":
			return Math.floor(parseFloat(sValue));
		case "string":
			fValue = parseFloat(sValue);
			if (fValue && (Math.abs(fValue) >= 1e15 || Math.abs(fValue) < 1e-4)) {
				oFormatOptions = getFormatter(this).oFormatOptions;
				return fValue.toExponential()
					.replace("e", "\u00a0E") // non-breaking space
					.replace(".", oFormatOptions.decimalSeparator)
					.replace("+", oFormatOptions.plusSign)
					.replace("-", oFormatOptions.minusSign);
			}
			return getFormatter(this).format(sValue);
		default:
			throw new FormatException("Don't know how to format " + this.getName() + " to "
				+ sTargetType);
		}
	};

	/**
	 * Parses the given value, which is expected to be of the given type, to an Edm.Double in
	 * <code>string</code> representation.
	 *
	 * @param {string|number} vValue
	 *   the value to be parsed; the empty string and <code>null</code> will be parsed to
	 *   <code>null</code>
	 * @param {string}
	 *   sSourceType the source type (the expected type of <code>vValue</code>); may be "float",
	 *   "int" or "string".
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {string}
	 *   the parsed value
	 * @throws {sap.ui.model.ParseException}
	 *   if <code>sSourceType</code> is unsupported or if the given string cannot be parsed to a
	 *   Double
	 * @public
	 */
	Double.prototype.parseValue = function(vValue, sSourceType) {
		var fResult;

		if (vValue === null || vValue === "") {
			return null;
		}
		switch (sSourceType) {
		case "string":
			fResult = getFormatter(this).parse(vValue);
			if (isNaN(fResult)) {
				throw new ParseException(getErrorMessage());
			}
			break;
		case "int":
		case "float":
			fResult = vValue;
			break;
		default:
			throw new ParseException("Don't know how to parse " + this.getName() + " from "
				+ sSourceType);
		}
		return fResult.toExponential();
	};

	/**
	 * Called by the framework when any localization setting changed.
	 * @private
	 */
	Double.prototype._handleLocalizationChange = function () {
		this.oFormat = null;
	};

	/**
	 * Validates whether the given value in model representation is valid and meets the
	 * defined constraints.
	 *
	 * @param {string} sValue
	 *   the value to be validated
	 * @returns {void}
	 * @throws {sap.ui.model.ValidateException} if the value is not valid
	 * @public
	 */
	Double.prototype.validateValue = function (sValue) {
		if (sValue === null && isNullable(this)) {
			return;
		}
		if (typeof sValue === "string" && rDouble.exec(sValue)) {
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
	Double.prototype.getName = function () {
		return "sap.ui.model.odata.type.Double";
	};

	return Double;
});
