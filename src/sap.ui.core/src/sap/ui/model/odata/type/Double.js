/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/format/NumberFormat', 'sap/ui/model/FormatException',
		'sap/ui/model/ParseException', 'sap/ui/model/SimpleType',
		'sap/ui/model/ValidateException'],
	function(NumberFormat, FormatException, ParseException, SimpleType, ValidateException) {
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
	 * Constructor for a primitive type <code>Edm.Double</code>.
	 *
	 * @class This class represents the OData primitive type <a
	 * href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * <code>Edm.Double</code></a>.
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.model.odata.type.Double
	 * @param {object} [oFormatOptions]
	 *   format options; this type does not support any format options
	 * @param {object} [oConstraints]
	 *   constraints
	 * @param {boolean|string} [oConstraints.nullable=true]
	 *   if <code>true</code>, the value <code>null</code> will be accepted
	 * @param {int|string} [oConstraints.precision=Infinity]
	 *   the maximum number of digits allowed in the property’s value
	 * @param {int|string} [oConstraints.scale=0]
	 *   the maximum number of digits allowed to the right of the decimal point; the number must be
	 *   less than <code>precision</code> (if given). As a special case, "variable" is supported.
	 *   <p>
	 *   The number of digits to the right of the decimal point may vary from zero to
	 *   <code>scale</code>, and the number of digits to the left of the decimal point may vary
	 *   from one to <code>precision</code> minus <code>scale</code>.
	 * @public
	 * @since 1.27.0
	 */
	var Double = SimpleType.extend("sap.ui.model.odata.type.Double",
			/** @lends sap.ui.model.odata.type.Double.prototype */
			{
				constructor : function (oFormatOptions, oConstraints) {
					this.setConstraints(oConstraints);
				}
			}
		);

	/**
	 * Format the given value to the given target type. When formatting to <code>string</code>
	 * the type's constraint <code>scale</code> and formatting options will be taken into account.
	 *
	 * @param {string} sValue
	 *   the value to be formatted, which is represented as a string in the model
	 * @param {string} sTargetType
	 *   the target type
	 * @returns {number|string}
	 *   the formatted output value in the target type; <code>undefined</code> or <code>null</code>
	 *   will be formatted to <code>null</code>
	 * @throws sap.ui.model.FormatException
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
				oFormatOptions = this._getFormatter().oFormatOptions;
				return fValue.toExponential()
					.replace("e", " E")
					.replace(".", oFormatOptions.decimalSeparator)
					.replace("+", oFormatOptions.plusSign)
					.replace("-", oFormatOptions.minusSign);
			}
			return this._getFormatter().format(sValue);
		default:
			throw new FormatException("Don't know how to format " + this.getName() + " to "
				+ sTargetType);
		}
	};

	/**
	 * Parse the given value which is expected to be of the given type to a double in string
	 * representation.
	 *
	 * @param {string|number} vValue
	 *   the value to be parsed; the empty string and <code>null</code> will be parsed to
	 *   <code>null</code>
	 * @param {string}
	 *   sSourceType the source type (the expected type of <code>oValue</code>)
	 * @returns {string}
	 *   the parsed value
	 * @throws sap.ui.model.ParseException
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
			fResult = this._getFormatter().parse(vValue);
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
	 * Returns the formatter. Creates it lazily.
	 * @returns {sap.ui.core.format.NumberFormat}
	 *   the formatter
	 * @private
	 */
	Double.prototype._getFormatter = function () {
		if (!this.oFormat) {
			this.oFormat = NumberFormat.getFloatInstance({groupingEnabled: true});
		}
		return this.oFormat;
	};

	/**
	 * Validate whether the given value in model representation is valid and meets the
	 * defined constraints (if any).
	 *
	 * @param {string} sValue
	 *   the value to be validated
	 * @throws sap.ui.model.ValidateException if the value is not valid
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
	 * Set the constraints.
	 *
	 * @param {object} [oConstraints]
	 *   constraints, see {@link #constructor}
	 * @private
	 */
	Double.prototype.setConstraints = function(oConstraints) {
		var vNullable = oConstraints && oConstraints.nullable;

		this.oConstraints = undefined;
		if (vNullable === false || vNullable === "false") {
			this.oConstraints = {nullable: false};
		} else if (vNullable !== undefined && vNullable !== true && vNullable !== "true") {
			jQuery.sap.log.warning("Illegal nullable: " + vNullable, null, this.getName());
		}

		this._handleLocalizationChange();
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
