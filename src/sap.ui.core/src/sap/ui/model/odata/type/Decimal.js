/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/format/NumberFormat', 'sap/ui/model/FormatException',
		'sap/ui/model/ParseException', 'sap/ui/model/SimpleType',
		'sap/ui/model/ValidateException'],
	function(NumberFormat, FormatException, ParseException, SimpleType, ValidateException) {
	"use strict";

	var rDecimal = /^[-+]?(\d+)(?:\.(\d+))?$/;

	/**
	 * Constructor for a primitive type <code>Edm.Decimal</code>.
	 *
	 * @class This class represents the OData primitive type <a
	 * href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * <code>Edm.Decimal</code></a>.
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.model.odata.type.Decimal
	 * @param {object} [oFormatOptions]
	 * 	 format options, see {@link #setFormatOptions}
	 * @param {object} [oConstraints]
	 * 	 constraints, see {@link #setConstraints}
	 * @public
	 * @since 1.27.0
	 */
	var Decimal = SimpleType.extend("sap.ui.model.odata.type.Decimal",
			/** @lends sap.ui.model.odata.type.Decimal.prototype */
			{
				constructor : function () {
					SimpleType.apply(this, arguments);
					this.sName = "sap.ui.model.odata.type.Decimal";
			}
		});

	/**
	 * Format the given value to the given target type. When formatting to <code>string</code>
	 * the type's constraint <code>scale</code> and formatting options will be taken into account.
	 *
	 * @param {string} sValue
	 *   the value to be formatted, which is represented as a string in the model
	 * @param {string} sTargetType
	 *   the target type
	 * @return {number|string}
	 *   the formatted output value in the target type; <code>undefined</code> or <code>null</code>
	 *   will be formatted to <code>null</code>
	 * @throws sap.ui.model.FormatException
	 *   if <code>sTargetType</code> is unsupported
	 * @public
	 */
	Decimal.prototype.formatValue = function(sValue, sTargetType) {
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
			return this.oFormat.format(sValue);
		default:
			throw new FormatException("Don't know how to format " + this.sName + " to "
				+ sTargetType);
		}
	};

	/**
	 * Parse the given value which is expected to be of the given type to a decimal in string
	 * representation.
	 *
	 * @param {string|number} vValue
	 *   the value to be parsed
	 * @param {string}
	 *   sSourceType the source type (the expected type of <code>oValue</code>)
	 * @return {string}
	 *   the parsed value
	 * @throws sap.ui.model.ParseException
	 *   if <code>sSourceType</code> is unsupported or if the given string cannot be parsed to a
	 *   Decimal
	 * @public
	 */
	Decimal.prototype.parseValue = function(vValue, sSourceType) {
		var fResult;

		switch (sSourceType) {
		case "string":
			fResult = this.oFormat.parse(vValue);
			if (isNaN(fResult)) {
				// TODO localization? This is a user error!
				throw new ParseException(vValue + " is not a valid " + this.sName + " value");
			}
			break;
		case "int":
		case "float":
			fResult = vValue;
			break;
		default:
			throw new ParseException("Don't know how to parse " + this.sName + " from "
				+ sSourceType);
		}
		return String(fResult);
	};

	/**
	 * Called by the framework when any localization setting changed
	 * @private
	 */
	Decimal.prototype._handleLocalizationChange = function () {
		var oFormatOptions = {groupingEnabled: true},
			iScale = this.oConstraints.scale;

		if (iScale !== Infinity) {
			oFormatOptions.maxFractionDigits = oFormatOptions.minFractionDigits = iScale;
		}
		this.oFormat = NumberFormat.getFloatInstance(oFormatOptions);
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
	Decimal.prototype.validateValue = function (sValue) {
		var iFractionDigits, iIntegerDigits, aMatches;

		if (typeof sValue === "string") {
			aMatches = rDecimal.exec(sValue);
			if (aMatches) {
				iIntegerDigits = aMatches[1].length;
				iFractionDigits = (aMatches[2] || "").length;
				if (iFractionDigits <= this.oConstraints.scale
					&& iIntegerDigits + iFractionDigits <= this.oConstraints.precision) {
					return;
				}
			}
		}
		// TODO localization, improve error message for end user
		throw new ValidateException("Illegal " + this.sName + " value: " + sValue);
	};

	/**
	 * Set format options.
	 *
	 * @param {object} oFormatOptions
	 *   the format options (none so far)
	 * @public
	 */
	Decimal.prototype.setFormatOptions = function(oFormatOptions) {
		// no format options supported yet
	};

	/**
	 * Set the constraints.
	 *
	 * @param {object} [oConstraints]
	 * 	 constraints
	 * @param {int} [oConstraints.precision=Infinity]
	 *   the maximum number of digits allowed in the property’s value
	 * @param {int|string} [oConstraints.scale=0]
	 *   the maximum number of digits allowed to the right of the decimal point; the number must be
	 *   less than <code>precision</code> (if given). As a special case, "variable" is supported.
	 *   <p>
	 *   The number of digits to the right of the decimal point may vary from zero to
	 *   <code>scale</code>, and the number of digits to the left of the decimal point may vary
	 *   from one to <code>precision</code> minus <code>scale</code>.
	 * @public
	 */
	Decimal.prototype.setConstraints = function(oConstraints) {
		var iPrecision = oConstraints && oConstraints.precision,
			iScale = oConstraints && oConstraints.scale;

		function validate(iValue, iDefault, iMinimum, sName) {
			if (iValue === undefined) {
				return iDefault;
			}
			if (typeof iValue !== "number" || iValue < iMinimum) {
				jQuery.sap.log.warning("Illegal " + sName + ": " + iValue,
					null, "sap.ui.model.odata.type.Decimal");
				return iDefault;
			}
			return iValue;
		}

		iScale = iScale === "variable" ? Infinity : validate(iScale, 0, 0, "scale");
		iPrecision = validate(iPrecision, Infinity, 1, "precision");
		if (iScale !== Infinity && iPrecision <= iScale) {
			jQuery.sap.log.warning("Illegal scale: must be less than precision (precision="
				+ iPrecision + ", scale=" + iScale + ")", null, "sap.ui.model.odata.type.Decimal");
			iScale = Infinity; // "variable"
		}
		this.oConstraints = {
				precision: iPrecision,
				scale: iScale
		};

		this._handleLocalizationChange();
	};

	return Decimal;
});
