/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/model/odata/type/ODataType',
		'sap/ui/model/ValidateException', 'sap/ui/model/type/String'],
	function(jQuery, ODataType, ValidateException, StringType) {
	"use strict";

	var rDigitsOnly = /^\d+$/,
		rLeadingZeros = /^0*(?=\d)/;

	/**
	 * Checks whether isDigitSequence constraint is set to true and the given value is a digit
	 * sequence.
	 *
	 * @param {string} [sValue]
	 *   the value to be checked
	 * @param {object} [oConstraints]
	 *   the currently used constraints
	 * @returns {boolean}
	 *   true if isDigitSequence is set to true and the given value is a digit sequence
	 */
	function isDigitSequence(sValue, oConstraints) {
		return oConstraints && oConstraints.isDigitSequence && sValue && sValue.match(rDigitsOnly);
	}

	/**
	 * Sets the constraints.
	 *
	 * @param {sap.ui.model.odata.type.String} oType
	 *   the type instance
	 * @param {object} [oConstraints]
	 *   constraints, see {@link #constructor}
	 */
	function setConstraints(oType, oConstraints) {
		var vIsDigitSequence, vMaxLength, vNullable;

		oType.oConstraints = undefined;
		if (oConstraints) {
			vMaxLength = oConstraints.maxLength;
			if (typeof vMaxLength === "string") {
				vMaxLength = parseInt(vMaxLength, 10);
			}
			if (typeof vMaxLength === "number" && !isNaN(vMaxLength) && vMaxLength > 0) {
				oType.oConstraints = {maxLength : vMaxLength };
			} else if (vMaxLength !== undefined) {
				jQuery.sap.log.warning("Illegal maxLength: " + oConstraints.maxLength,
					null, oType.getName());
			}
			vIsDigitSequence = oConstraints.isDigitSequence;
			if (vIsDigitSequence === true || vIsDigitSequence === "true") {
				oType.oConstraints = oType.oConstraints || {};
				oType.oConstraints.isDigitSequence = true;
			} else if (vIsDigitSequence !== undefined && vIsDigitSequence !== false
					&& vIsDigitSequence !== "false") {
				jQuery.sap.log.warning("Illegal isDigitSequence: " + vIsDigitSequence, null,
					oType.getName());
			}

			vNullable = oConstraints.nullable;
			if (vNullable === false || vNullable === "false") {
				oType.oConstraints = oType.oConstraints || {};
				oType.oConstraints.nullable = false;
			} else if (vNullable !== undefined && vNullable !== true && vNullable !== "true") {
				jQuery.sap.log.warning("Illegal nullable: " + vNullable, null, oType.getName());
			}
		}
	}

	/**
	 * Constructor for an OData primitive type <code>Edm.String</code>.
	 *
	 * @class This class represents the OData primitive type <a
	 * href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * <code>Edm.String</code></a>.
	 *
	 * In both {@link sap.ui.model.odata.v2.ODataModel} and {@link sap.ui.model.odata.v4.ODataModel}
	 * this type is represented as a <code>string</code>.
	 *
	 * @extends sap.ui.model.odata.type.ODataType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.model.odata.type.String
	 * @param {object} [oFormatOptions]
	 *   format options as defined in the interface of {@link sap.ui.model.SimpleType}; this
	 *   type ignores them since it does not support any format options
	 * @param {object} [oConstraints]
	 *   constraints; {@link #validateValue validateValue} throws an error if any constraint is
	 *   violated
	 * @param {boolean|string} [oConstraints.isDigitSequence=false]
	 *   if <code>true</code>, the value is handled as a sequence of digits; while formatting
	 *   leading zeros are removed from the value and while parsing the value is enhanced with
	 *   leading zeros (if a maxLength constraint is given) or leading zeros are removed from the
	 *   value (if no maxLength constraint is given); this constraint is supported since 1.35.0.
	 *   To make this type behave as ABAP type NUMC, use
	 *   <code>oConstraints.isDigitSequence=true</code> together with
	 *   <code>oConstraints.maxLength</code>.
	 * @param {int|string} [oConstraints.maxLength]
	 *   the maximal allowed length of the string; unlimited if not defined
	 * @param {boolean|string} [oConstraints.nullable=true]
	 *   if <code>true</code>, the value <code>null</code> is accepted. The constraint
	 *   <code>nullable=false</code> is interpreted as "input is mandatory"; empty user input is
	 *   rejected then.
	 * @public
	 * @since 1.27.0
	 */
	var EdmString = ODataType.extend("sap.ui.model.odata.type.String", {
				constructor : function (oFormatOptions, oConstraints) {
					ODataType.apply(this, arguments);
					setConstraints(this, oConstraints);
				}
			}
		);

	/**
	 * Formats the given value to the given target type.
	 * If <code>isDigitSequence</code> constraint of this type is set to <code>true</code> and the
	 * target type is any or string and the given value contains only digits, the leading zeros are
	 * truncated.
	 *
	 * @param {string} sValue
	 *   the value to be formatted
	 * @param {string} sTargetType
	 *   the target type; may be "any", "boolean", "float", "int" or "string".
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {string|number|boolean}
	 *   the formatted output value in the target type; <code>undefined</code> is always formatted
	 *   to <code>null</code>; <code>null</code> is formatted to "" if the target type is "string".
	 * @throws {sap.ui.model.FormatException}
	 *   if <code>sTargetType</code> is unsupported or the string cannot be formatted to the target
	 *   type
	 * @function
	 * @public
	 */
	EdmString.prototype.formatValue = function (sValue, sTargetType) {
		if (sValue === null && this.getPrimitiveType(sTargetType) === "string") {
			return "";
		}
		if (isDigitSequence(sValue, this.oConstraints)) {
			sValue = sValue.replace(rLeadingZeros, "");
		}
		return StringType.prototype.formatValue.call(this, sValue, sTargetType);
	};

	/**
	 * Parses the given value which is expected to be of the given type to a string.
	 * If <code>isDigitSequence</code> constraint of this type is set to <code>true</code> and
	 * the parsed string is a sequence of digits, then the parsed string is either enhanced with
	 * leading zeros, if <code>maxLength</code> constraint is given, or leading zeros are removed
	 * from parsed string.
	 *
	 * Note: An empty input string (<code>""</code>) is parsed to <code>null</code>. This value will
	 * be rejected with a {@link sap.ui.model.ValidateException ValidateException} by
	 * {@link #validateValue} if the constraint <code>nullable</code> is <code>false</code>.
	 *
	 * @param {string|number|boolean} vValue
	 *   the value to be parsed
	 * @param {string} sSourceType
	 *   the source type (the expected type of <code>vValue</code>).
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {string}
	 *   the parsed value or <code>null</code> if <code>vValue</code> is <code>""</code>
	 * @throws {sap.ui.model.ParseException}
	 *   if <code>sSourceType</code> is unsupported
	 * @public
	 */
	EdmString.prototype.parseValue = function (vValue, sSourceType) {
		var sResult;

		sResult = vValue === "" ? null : StringType.prototype.parseValue.apply(this, arguments);

		if (isDigitSequence(sResult, this.oConstraints)) {
			sResult = sResult.replace(rLeadingZeros, "");
			if (this.oConstraints.maxLength) {
				sResult = sResult.padStart(this.oConstraints.maxLength, "0");
			}
		}
		return sResult;
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
	EdmString.prototype.validateValue = function (sValue) {
		var oConstraints = this.oConstraints || {},
			iMaxLength = oConstraints.maxLength;

		if (sValue === null) {
			if (oConstraints.nullable !== false) {
				return;
			}
		} else if (typeof sValue !== "string") {
			throw new ValidateException("Illegal " + this.getName() + " value: " + sValue);
		} else if (oConstraints.isDigitSequence) {
			if (!sValue.match(rDigitsOnly)) {
				throw new ValidateException(sap.ui.getCore().getLibraryResourceBundle()
					.getText("EnterDigitsOnly"));
			}
			if (iMaxLength && sValue.length > iMaxLength) {
				throw new ValidateException(sap.ui.getCore().getLibraryResourceBundle()
					.getText("EnterMaximumOfDigits", [iMaxLength]));
			}
			return;
		} else if (!iMaxLength || sValue.length <= iMaxLength) {
			return;
		}
		throw new ValidateException(sap.ui.getCore().getLibraryResourceBundle().getText(
			iMaxLength ? "EnterTextMaxLength" : "EnterText", [iMaxLength]));
	};

	/**
	 * Returns the type's name.
	 *
	 * @returns {string}
	 *   the type's name
	 * @public
	 */
	EdmString.prototype.getName = function () {
		return "sap.ui.model.odata.type.String";
	};

	return EdmString;
});
