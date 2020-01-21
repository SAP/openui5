/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/SimpleType",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/thirdparty/jquery"
],
	function(Log, SimpleType, FormatException, ParseException, ValidateException, jQuery) {
	"use strict";

	/**
	 * Constructor for a <code>String</code> type.
	 *
	 * @class
	 * This class represents the string simple type.
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @alias sap.ui.model.type.String
	 * @param {object} [oFormatOptions]
	 *   Format options; this type ignores them, since it does not support any format options
	 * @param {object} [oConstraints]
	 *   Constraints; {@link #validateValue} throws an error if any constraint is
	 *   violated
	 * @param {int} [oConstraints.maxLength]
	 *   The maximal allowed length of the string; unlimited if not defined
	 * @param {int} [oConstraints.minLength]
	 *   The minimal allowed length of the string
	 * @param {string} [oConstraints.startsWith]
	 *   A prefix that any valid value must start with
	 * @param {string} [oConstraints.startsWithIgnoreCase]
	 *   A prefix that any valid value must start with, ignoring case
	 * @param {string} [oConstraints.endsWith]
	 *   A suffix that any valid value must end with
	 * @param {string} [oConstraints.endsWithIgnoreCase]
	 *   A suffix that any valid value must end with, ignoring case
	 * @param {string} [oConstraints.contains]
	 *   An infix that must be contained in any valid value
	 * @param {string} [oConstraints.equals]
	 *   The only value that is allowed
	 * @param {RegExp|string} [oConstraints.search]
	 *   A regular expression, or a string defining a regular expression, that the value must match
	 *
	 * @public
	 */
	var StringType = SimpleType.extend("sap.ui.model.type.String", /** @lends sap.ui.model.type.String.prototype */ {

		constructor : function () {
			SimpleType.apply(this, arguments);
			this.sName = "String";
			if (this.oConstraints.search && typeof this.oConstraints.search == "string") {
				this.oConstraints.search = new RegExp(this.oConstraints.search);
			}
		}
	});

	/**
	 * Formats the given value to the given target type.
	 *
	 * @param {string} sValue
	 *   The value to be formatted
	 * @param {string} sTargetType
	 *   The target type; may be "any", "boolean", "float", "int" or "string", or a type with "any",
	 *   "boolean", "float", "int" or "string" as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}
	 * @returns {string|number|boolean}
	 *   The formatted output value in the target type; <code>undefined</code> and <code>null</code>
	 *   are always formatted to <code>null</code>
	 * @throws {sap.ui.model.FormatException}
	 *   If <code>sTargetType</code> is unsupported or the string cannot be formatted to the target
	 *   type
	 *
	 * @public
	 */
	StringType.prototype.formatValue = function (sValue, sTargetType) {
		if (sValue == undefined || sValue == null) {
			return null;
		}
		switch (this.getPrimitiveType(sTargetType)) {
			case "string":
			case "any":
				return sValue;
			case "int":
				var iResult = parseInt(sValue);
				if (isNaN(iResult)) {
					throw new FormatException(sValue + " is not a valid int value");
				}
				return iResult;
			case "float":
				var fResult = parseFloat(sValue);
				if (isNaN(fResult)) {
					throw new FormatException(sValue + " is not a valid float value");
				}
				return fResult;
			case "boolean":
				if (sValue.toLowerCase() == "true" || sValue == "X") {
					return true;
				}
				if (sValue.toLowerCase() == "false" || sValue == "") {
					return false;
				}
				throw new FormatException(sValue + " is not a valid boolean value");
			default:
				throw new FormatException("Don't know how to format String to " + sTargetType);
		}
	};

	/**
	 * Parses the given value, which is expected to be of the given type, to a string.
	 *
	 * @param {string|number|boolean} vValue
	 *   The value to be parsed
	 * @param {string} sSourceType
	 *   The source type (the expected type of <code>vValue</code>); may be "boolean", "float",
	 *   "int" or "string", or a type with "boolean", "float", "int" or "string" as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}
	 * @returns {string}
	 *   The parsed value
	 * @throws {sap.ui.model.ParseException}
	 *   If <code>sSourceType</code> is unsupported
	 *
	 * @public
	 */
	StringType.prototype.parseValue = function (vValue, sSourceType) {
		switch (this.getPrimitiveType(sSourceType)) {
			case "string":
				return vValue;
			case "boolean":
			case "int":
			case "float":
				return vValue.toString();
			default:
				throw new ParseException("Don't know how to parse String from " + sSourceType);
		}
	};

	/**
	 * Validates whether the given value in model representation is valid and meets the defined
	 * constraints, see {@link #constructor}.
	 *
	 * @param {string} sValue
	 *   The value to be validated; <code>null</code> is treated like an empty string
	 * @throws {sap.ui.model.ValidateException}
	 *   If the value is not valid
	 *
	 * @public
	 */
	StringType.prototype.validateValue = function (sValue) {
		if (this.oConstraints) {
			var oBundle = sap.ui.getCore().getLibraryResourceBundle(),
				aViolatedConstraints = [],
				aMessages = [];

			if (sValue === null) {
				sValue = "";
			}
			jQuery.each(this.oConstraints, function (sName, vConstraint) {
				switch (sName) {
					case "maxLength":
						if (sValue.length > vConstraint) {
							aViolatedConstraints.push("maxLength");
							aMessages.push(oBundle.getText("String.MaxLength", [vConstraint]));
						}
						break;
					case "minLength":
						if (sValue.length < vConstraint) {
							aViolatedConstraints.push("minLength");
							aMessages.push(oBundle.getText("String.MinLength", [vConstraint]));
						}
						break;
					case "startsWith":  // expects string
						if (!(typeof vConstraint == "string" && vConstraint.length > 0 && sValue.startsWith(vConstraint))) {
							aViolatedConstraints.push("startsWith");
							aMessages.push(oBundle.getText("String.StartsWith", [vConstraint]));
						}
						break;
					case "startsWithIgnoreCase":  // expects string
						if (!(typeof vConstraint == "string" && vConstraint != "" ? sValue.toLowerCase().startsWith(vConstraint.toLowerCase()) : false)) {
							aViolatedConstraints.push("startsWithIgnoreCase");
							aMessages.push(oBundle.getText("String.StartsWith", [vConstraint]));
						}
						break;
					case "endsWith":  // expects string
						if (!(typeof vConstraint == "string" && vConstraint.length > 0 && sValue.endsWith(vConstraint))) {
							aViolatedConstraints.push("endsWith");
							aMessages.push(oBundle.getText("String.EndsWith", [vConstraint]));
						}
						break;
					case "endsWithIgnoreCase": // expects string
						if (!((typeof vConstraint == "string" && vConstraint != "" ? sValue.toLowerCase().endsWith(vConstraint.toLowerCase()) : false))) {
							aViolatedConstraints.push("endsWithIgnoreCase");
							aMessages.push(oBundle.getText("String.EndsWith", [vConstraint]));
						}
						break;
					case "contains": // expects string
						if (sValue.indexOf(vConstraint) == -1) {
							aViolatedConstraints.push("contains");
							aMessages.push(oBundle.getText("String.Contains", [vConstraint]));
						}
						break;
					case "equals": // expects string
						if (sValue != vConstraint) {
							aViolatedConstraints.push("equals");
							aMessages.push(oBundle.getText("String.Equals", [vConstraint]));
						}
						break;
					case "search": // expects regex
						if (sValue.search(vConstraint) == -1) {
							aViolatedConstraints.push("search");
							aMessages.push(oBundle.getText("String.Search", [vConstraint]));
						}
						break;
					default:
						Log.warning("Ignoring unknown constraint: '" + sName + "'", null,
							"sap.ui.model.type.String");
				}
			});
			if (aViolatedConstraints.length > 0) {
				throw new ValidateException(this.combineMessages(aMessages), aViolatedConstraints);
			}
		}
	};

	return StringType;
});