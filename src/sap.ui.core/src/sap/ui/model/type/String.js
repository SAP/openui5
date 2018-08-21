/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define([
	'sap/ui/model/SimpleType',
	'sap/ui/model/FormatException',
	'sap/ui/model/ParseException',
	'sap/ui/model/ValidateException',
	"sap/ui/thirdparty/jquery"
],
	function(SimpleType, FormatException, ParseException, ValidateException, jQuery) {
	"use strict";


	/**
	 * Constructor for a String type.
	 *
	 * @class
	 * This class represents string simple types.
	 *
	 * @extends sap.ui.model.SimpleType
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @param {object} [oFormatOptions] formatting options. String doesn't support any formatting options
	 * @param {object} [oConstraints] value constraints. All given constraints must be fulfilled by a value to be valid
	 * @param {int} [oConstraints.maxLength] maximum length (in characters) that a string of this value may have
	 * @param {int} [oConstraints.minLength] minimum length (in characters) that a string of this value may have
	 * @param {string} [oConstraints.startsWith] a prefix that any valid value must start with
	 * @param {string} [oConstraints.startsWithIgnoreCase] a prefix that any valid value must start with, ignoring case
	 * @param {string} [oConstraints.endsWith] a suffix that any valid value must end with
	 * @param {string} [oConstraints.endsWithIgnoreCase] a suffix that any valid value must end with, ignoring case
	 * @param {string} [oConstraints.contains] an infix that must be contained in any valid value
	 * @param {string} [oConstraints.equals] only value that is allowed
	 * @param {RegExp} [oConstraints.search] a regular expression that the value must match
	 * @alias sap.ui.model.type.String
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

	StringType.prototype.formatValue = function(sValue, sInternalType) {
		if (sValue == undefined || sValue == null) {
			return null;
		}
		switch (this.getPrimitiveType(sInternalType)) {
			case "string":
			case "any":
				return sValue;
			case "int":
				var iResult = parseInt(sValue, 10);
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
				throw new FormatException("Don't know how to format String to " + sInternalType);
		}
	};

	StringType.prototype.parseValue = function(oValue, sInternalType) {
		switch (this.getPrimitiveType(sInternalType)) {
			case "string":
				return oValue;
			case "boolean":
			case "int":
			case "float":
				return oValue.toString();
			default:
				throw new ParseException("Don't know how to parse String from " + sInternalType);
		}
	};

	StringType.prototype.validateValue = function(sValue) {
		if (this.oConstraints) {
			var oBundle = sap.ui.getCore().getLibraryResourceBundle(),
				aViolatedConstraints = [],
				aMessages = [];
			jQuery.each(this.oConstraints, function(sName, oContent) {
				switch (sName) {
					case "maxLength":  // expects int
						if (sValue.length > oContent) {
							aViolatedConstraints.push("maxLength");
							aMessages.push(oBundle.getText("String.MaxLength", [oContent]));
						}
						break;
					case "minLength":  // expects int
						if (sValue.length < oContent) {
							aViolatedConstraints.push("minLength");
							aMessages.push(oBundle.getText("String.MinLength", [oContent]));
						}
						break;
					case "startsWith":  // expects string
						if (!(typeof oContent == "string" && oContent.length > 0 && sValue.startsWith(oContent))) {
							aViolatedConstraints.push("startsWith");
							aMessages.push(oBundle.getText("String.StartsWith", [oContent]));
						}
						break;
					case "startsWithIgnoreCase":  // expects string
						if (!((typeof oContent == "string" && oContent != "" ? sValue.toLowerCase().startsWith(oContent.toLowerCase()) : false))) {
							aViolatedConstraints.push("startsWithIgnoreCase");
							aMessages.push(oBundle.getText("String.StartsWith", [oContent]));
						}
						break;
					case "endsWith":  // expects string
						if (!(typeof oContent == "string" && oContent.length > 0 && sValue.endsWith(oContent))) {
							aViolatedConstraints.push("endsWith");
							aMessages.push(oBundle.getText("String.EndsWith", [oContent]));
						}
						break;
					case "endsWithIgnoreCase": // expects string
						if (!((typeof oContent == "string" && oContent != "" ? sValue.toLowerCase().endsWith(oContent.toLowerCase()) : false))) {
							aViolatedConstraints.push("endsWithIgnoreCase");
							aMessages.push(oBundle.getText("String.EndsWith", [oContent]));
						}
						break;
					case "contains": // expects string
						if (sValue.indexOf(oContent) == -1) {
							aViolatedConstraints.push("contains");
							aMessages.push(oBundle.getText("String.Contains", [oContent]));
						}
						break;
					case "equals": // expects string
						if (sValue != oContent) {
							aViolatedConstraints.push("equals");
							aMessages.push(oBundle.getText("String.Equals", [oContent]));
						}
						break;
					case "search": // expects regex
						if (sValue.search(oContent) == -1) {
							aViolatedConstraints.push("search");
							aMessages.push(oBundle.getText("String.Search", [oContent]));
						}
						break;
				}
			});
			if (aViolatedConstraints.length > 0) {
				throw new ValidateException(this.combineMessages(aMessages), aViolatedConstraints);
			}
		}
	};



	return StringType;

});