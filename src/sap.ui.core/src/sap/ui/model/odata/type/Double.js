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
	 * @param {sap.ui.model.odata.type.Double} oType
	 *   the type instance
	 * @returns {sap.ui.core.format.NumberFormat}
	 *   the formatter
	 */
	function getFormatter(oType) {
		var oFormatOptions;

		if (!oType.oFormat) {
			oFormatOptions = jQuery.extend({groupingEnabled: true}, oType.oFormatOptions);
			oType.oFormat = NumberFormat.getFloatInstance(oFormatOptions);
		}
		return oType.oFormat;
	}

	/**
	 * Constructor for a primitive type <code>Edm.Double</code>.
	 *
	 * @class This class represents the OData primitive type <a
	 * href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * <code>Edm.Double</code></a>. <b>This data type is read-only</b>. The functions
	 * {@link #parseValue parseValue} and {@link #validateValue validateValue} throw exceptions.
	 *
	 * @extends sap.ui.model.odata.type.ODataType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.model.odata.type.Double
	 * @param {object} [oFormatOptions]
	 *   format options as defined in {@link sap.ui.core.format.NumberFormat}. In contrast to
	 *   NumberFormat <code>groupingEnabled</code> defaults to <code>true</code>.
	 * @public
	 * @since 1.27.0
	 */
	var Double = ODataType.extend("sap.ui.model.odata.type.Double",
			/** @lends sap.ui.model.odata.type.Double.prototype */
			{
				constructor : function (oFormatOptions) {
					ODataType.apply(this, arguments);
					this.oFormatOptions = oFormatOptions;
					this._handleLocalizationChange();
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
	 * Throws a <code>ParseException</code> because this type is read only.
	 *
	 * @throws {sap.ui.model.ParseException}
	 * @public
	 */
	Double.prototype.parseValue = function() {
		throw new ParseException("Unsupported operation: data type " + this.getName()
			+ " is read-only.");
	};

	/**
	 * Called by the framework when any localization setting changed.
	 * @private
	 */
	Double.prototype._handleLocalizationChange = function () {
		this.oFormat = null;
	};

	/**
	 * Throws a <code>ValidateException</code> because this type is read only.
	 *
	 * @throws {sap.ui.model.ValidateException}
	 * @public
	 */
	Double.prototype.validateValue = function () {
		throw new ValidateException("Unsupported operation: data type " + this.getName()
			+ " is read-only.");
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
