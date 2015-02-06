/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/format/NumberFormat', 'sap/ui/model/FormatException',
		'sap/ui/model/odata/type/ODataType', 'sap/ui/model/ParseException',
		'sap/ui/model/ValidateException'],
	function(NumberFormat, FormatException, ODataType, ParseException, ValidateException) {
	"use strict";

	var rDecimal = /^[-+]?(\d+)(?:\.(\d+))?$/;

	/**
	 * Returns the matching error key for the type based on the constraints.
	 *
	 * @param {sap.ui.model.odata.type.Decimal} oType
	 *   the type
	 * @returns {string}
	 *   the key
	 */
	function getErrorKey(oType) {
		if (getScale(oType) === Infinity) {
			return getPrecision(oType) === Infinity ? "EnterNumber" : "EnterNumberPrecision";
		}
		return getPrecision(oType) === Infinity ?
			"EnterNumberScale" : "EnterNumberPrecisionScale";
	}

	/**
	 * Returns the matching error message for the type based on the constraints.
	 *
	 * @param {sap.ui.model.odata.type.Decimal} oType
	 *   the type
	 * @returns {string}
	 *   the message
	 */
	function getErrorMessage(oType) {
		return sap.ui.getCore().getLibraryResourceBundle().getText(getErrorKey(oType),
			[getPrecision(oType), getScale(oType)]);
	}

	/**
	 * Returns the formatter. Creates it lazily.
	 * @param {sap.ui.model.odata.type.Decimal} oType
	 *   the type instance
	 * @returns {sap.ui.core.format.NumberFormat}
	 *   the formatter
	 */
	function getFormatter(oType) {
		var oFormatOptions, iScale;

		if (!oType.oFormat) {
			oFormatOptions = {
				groupingEnabled: true,
				maxIntegerDigits: Infinity
			};
			iScale = getScale(oType);
			if (iScale !== Infinity) {
				oFormatOptions.decimals = iScale;
			}
			oType.oFormat = NumberFormat.getFloatInstance(oFormatOptions);
		}
		return oType.oFormat;
	}

	/**
	 * Returns the type's precision constraint.
	 *
	 * @param {sap.ui.model.odata.type.Decimal} oType
	 *   the type
	 * @returns {number}
	 *   the precision constraint or <code>Infinity</code> if not defined
	 */
	function getPrecision(oType) {
		return (oType.oConstraints && oType.oConstraints.precision) || Infinity;
	}

	/**
	 * Returns the type's scale constraint.
	 *
	 * @param {sap.ui.model.odata.type.Decimal} oType
	 *   the type
	 * @returns {number}
	 *   the scale constraint or <code>0</code> if not defined
	 */
	function getScale(oType) {
		return (oType.oConstraints && oType.oConstraints.scale) || 0;
	}

	/**
	 * Returns the type's nullable constraint.
	 *
	 * @param {sap.ui.model.odata.type.Decimal} oType
	 *   the type
	 * @returns {boolean}
	 *   the nullable constraint or <code>true</code> if not defined
	 */
	function isNullable(oType) {
		return !oType.oConstraints || oType.oConstraints.nullable !== false;
	}

	/**
	 * Normalizes the given number to the fixed format.
	 *
	 * @param {object} oFormatOptions
	 *   the format options
	 * @param {string} sText
	 *   the number entered by a user with sign, decimal and grouping separator according to given
	 *   format options
	 * @returns {string}
	 *   the normalized number consisting of an optional "-", at least one digit and an optional
	 *   "." followed by more digits (<code>/-?\d+(\.\d+)?/</code>) or <code>undefined</code> if
	 *   the given text is in the wrong format
	 */
	function normalizeNumber(oFormatOptions, sText) {
		var aMatches,
			sNewText,
			sSign = "";

		// remove all whitespace
		sText = sText.replace(/\s/g, "");

		// determine the sign
		switch (sText.charAt(0)) {
		case oFormatOptions.minusSign:
			sSign = "-";
			// falls through
		case oFormatOptions.plusSign:
			sText = sText.slice(1);
			break;
		// no default
		}

		// remove all grouping separators
		while ((sNewText = sText.replace(oFormatOptions.groupingSeparator, "")) !== sText) {
			sText = sNewText;
		}

		// replace one decimal separator by the dot
		sText = sText.replace(oFormatOptions.decimalSeparator, ".");

		// check validity and normalize
		aMatches = /^(\d*)(?:\.(\d*))?$/.exec(sText);
		if (aMatches) {
			return sSign
				+ (aMatches[1] || "0")
				+ (aMatches[2] ? "." + aMatches[2] : "");
		}
	}

	/**
	 * Sets the constraints.
	 *
	 * @param {sap.ui.model.odata.type.Decimal} oType
	 *   the type instance
	 * @param {object} [oConstraints]
	 *   constraints, see {@link #constructor}
	 */
	function setConstraints(oType, oConstraints) {
		var vNullable = oConstraints && oConstraints.nullable,
			vPrecision = oConstraints && oConstraints.precision,
			vScale = oConstraints && oConstraints.scale,
			iPrecision, iScale;

		function validate(vValue, iDefault, iMinimum, sName) {
			var iValue = typeof vValue === "string" ? parseInt(vValue, 10) : vValue;

			if (iValue === undefined) {
				return iDefault;
			}
			if (typeof iValue !== "number" || isNaN(iValue) || iValue < iMinimum) {
				jQuery.sap.log.warning("Illegal " + sName + ": " + vValue, null, oType.getName());
				return iDefault;
			}
			return iValue;
		}

		function setConstraint(sName, vValue, vDefault) {
			if (vValue != vDefault) {
				oType.oConstraints = oType.oConstraints || {};
				oType.oConstraints[sName] = vValue;
			}
		}

		iScale = vScale === "variable" ? Infinity : validate(vScale, 0, 0, "scale");
		iPrecision = validate(vPrecision, Infinity, 1, "precision");
		if (iScale !== Infinity && iPrecision <= iScale) {
			jQuery.sap.log.warning("Illegal scale: must be less than precision (precision="
				+ vPrecision + ", scale=" + vScale + ")", null, oType.getName());
			iScale = Infinity; // "variable"
		}
		oType.oConstraints = undefined;
		setConstraint("precision", iPrecision, Infinity);
		setConstraint("scale", iScale, 0);
		if (vNullable === false || vNullable === "false") {
			setConstraint("nullable", false, true);
		} else if (vNullable !== undefined && vNullable !== true && vNullable !== "true") {
			jQuery.sap.log.warning("Illegal nullable: " + vNullable, null, oType.getName());
		}

		oType._handleLocalizationChange();
	}

	/**
	 * Constructor for a primitive type <code>Edm.Decimal</code>.
	 *
	 * @class This class represents the OData primitive type <a
	 * href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * <code>Edm.Decimal</code></a>.
	 *
	 * In {@link sap.ui.model.odata.v2.ODataModel ODataModel} this type is represented as a
	 * <code>string</code>. It never uses exponential format ("1e-5").
	 *
	 * @extends sap.ui.model.odata.type.ODataType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.model.odata.type.Decimal
	 * @param {object} [oFormatOptions]
	 *   format options as defined in the interface of {@link sap.ui.model.SimpleType}; this
	 *   type ignores them since it does not support any format options
	 * @param {object} [oConstraints]
	 *   constraints; {@link #validateValue validateValue} throws an error if any constraint is
	 *   violated
	 * @param {boolean|string} [oConstraints.nullable=true]
	 *   if <code>true</code>, the value <code>null</code> will be accepted
	 * @param {int|string} [oConstraints.precision=Infinity]
	 *   the maximum number of digits allowed in the property’s value
	 * @param {int|string} [oConstraints.scale=0]
	 *   the maximum number of digits allowed to the right of the decimal point; the number must be
	 *   less than <code>precision</code> (if given). As a special case, "variable" is supported.
	 *
	 *   The number of digits to the right of the decimal point may vary from zero to
	 *   <code>scale</code>, and the number of digits to the left of the decimal point may vary
	 *   from one to <code>precision</code> minus <code>scale</code>.
	 *
	 *   The number is always displayed with exactly <code>scale</code> digits to the right of the
	 *   decimal point (unless <code>scale</code> is "variable").
	 * @public
	 * @since 1.27.0
	 */
	var Decimal = ODataType.extend("sap.ui.model.odata.type.Decimal",
			/** @lends sap.ui.model.odata.type.Decimal.prototype */
			{
				constructor : function (oFormatOptions, oConstraints) {
					ODataType.apply(this, arguments);
					setConstraints(this, oConstraints);
				}
			}
		);

	/**
	 * Formats the given value to the given target type. When formatting to "string" the type's
	 * constraint <code>scale</code> is taken into account.
	 *
	 * @param {string} sValue
	 *   the value to be formatted, which is represented as a string in the model
	 * @param {string} sTargetType
	 *   the target type; may be "any", "float", "int" or "string".
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {number|string}
	 *   the formatted output value in the target type; <code>undefined</code> or <code>null</code>
	 *   are formatted to <code>null</code>
	 * @throws {sap.ui.model.FormatException}
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
			return getFormatter(this).format(sValue);
		default:
			throw new FormatException("Don't know how to format " + this.getName() + " to "
				+ sTargetType);
		}
	};

	/**
	 * Parses the given value, which is expected to be of the given type, to a decimal in
	 * <code>string</code> representation.
	 *
	 * @param {string|number} vValue
	 *   the value to be parsed; the empty string and <code>null</code> will be parsed to
	 *   <code>null</code>
	 * @param {string} sSourceType
	 *   the source type (the expected type of <code>vValue</code>); may be "float", "int" or
	 *   "string".
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {string}
	 *   the parsed value
	 * @throws {sap.ui.model.ParseException}
	 *   if <code>sSourceType</code> is unsupported or if the given string cannot be parsed to a
	 *   Decimal
	 * @public
	 */
	Decimal.prototype.parseValue = function(vValue, sSourceType) {
		var sResult;

		if (vValue === null || vValue === "") {
			return null;
		}
		switch (sSourceType) {
		case "string":
			sResult = normalizeNumber(getFormatter(this).oFormatOptions, vValue);
			if (!sResult) {
				throw new ParseException(getErrorMessage(this));
			}
			break;
		case "int":
		case "float":
			sResult = NumberFormat.getFloatInstance({
				maxIntegerDigits: Infinity,
				decimalSeparator: ".",
				groupingEnabled: false
			}).format(vValue);
			break;
		default:
			throw new ParseException("Don't know how to parse " + this.getName() + " from "
				+ sSourceType);
		}
		return sResult;
	};

	/**
	 * Called by the framework when any localization setting changed.
	 * @private
	 */
	Decimal.prototype._handleLocalizationChange = function () {
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
	Decimal.prototype.validateValue = function (sValue) {
		var iFractionDigits, iIntegerDigits, aMatches;

		if (sValue === null && isNullable(this)) {
			return;
		}
		if (typeof sValue === "string") {
			aMatches = rDecimal.exec(sValue);
			if (aMatches) {
				iIntegerDigits = aMatches[1].length;
				iFractionDigits = (aMatches[2] || "").length;
				if (iFractionDigits <= getScale(this)
					&& iIntegerDigits + iFractionDigits <= getPrecision(this)) {
					return;
				}
			}
		}
		throw new ValidateException(getErrorMessage(this));
	};

	/**
	 * Returns the type's name.
	 *
	 * @returns {string}
	 *   the type's name
	 * @public
	 */
	Decimal.prototype.getName = function () {
		return "sap.ui.model.odata.type.Decimal";
	};

	return Decimal;
});
