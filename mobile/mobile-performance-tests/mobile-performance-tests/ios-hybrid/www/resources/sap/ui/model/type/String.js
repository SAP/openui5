/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides the base implementation for all model implementations
jQuery.sap.declare("sap.ui.model.type.String");
jQuery.sap.require("sap.ui.model.SimpleType");
jQuery.sap.require("sap.ui.core.format.NumberFormat");

/**
 * Constructor for a String type.
 *
 * @class
 * This class represents string simple types.
 *
 * @extends sap.ui.model.SimpleType
 *
 * @author SAP AG
 * @version 1.9.0-SNAPSHOT
 *
 * @constructor
 * @public
 */
sap.ui.model.type.String = function () {
	sap.ui.model.SimpleType.apply(this, arguments);
	this.sName = "String";
};

// chain the prototypes
sap.ui.model.type.String.prototype = jQuery.sap.newObject(sap.ui.model.SimpleType.prototype);

/*
 * Describe the sap.ui.model.type.String.
 * Resulting metadata can be obtained via sap.ui.model.type.String.getMetadata();
 */
sap.ui.base.Object.defineClass("sap.ui.model.type.String", {

  // ---- object ----
  baseType : "sap.ui.model.SimpleType",
  publicMethods : [
    // methods
  ]

});

/**
 * @see sap.ui.model.SimpleType.prototype.formatValue
 */
sap.ui.model.type.String.prototype.formatValue = function(sValue, sInternalType) {
	if (sValue == undefined || sValue == null) {
		return null;
	}
	switch(sInternalType) {
		case "string":
			return sValue;
		case "int":
			var iResult = parseInt(sValue, 10);
			if (isNaN(iResult)) {
				throw new sap.ui.model.FormatException(sValue + " is not a valid int value");
			}
			return iResult;
		case "float":
			var fResult = parseFloat(sValue);
			if (isNaN(fResult)) {
				throw new sap.ui.model.FormatException(sValue + " is not a valid float value");
			}
			return fResult;
		case "boolean":
			if (sValue.toLowerCase() == "true" || sValue == "X") {
				return true;
			}
			if (sValue.toLowerCase() == "false" || sValue == "") {
				return false;
			}
			throw new sap.ui.model.FormatException(sValue + " is not a valid boolean value");
		default:
			throw new sap.ui.model.FormatException("Don't know how to format String to " + sInternalType);
	}
};

/**
 * @see sap.ui.model.SimpleType.prototype.parseValue
 */
sap.ui.model.type.String.prototype.parseValue = function(oValue, sInternalType) {
	var sResult;
	switch(sInternalType) {
		case "string":
			return oValue;
		case "boolean":
		case "int":
		case "float":
			return oValue.toString();
		default:
			throw new sap.ui.model.ParseException("Don't know how to parse String from " + sInternalType);
	}
};

/**
 * @see sap.ui.model.SimpleType.prototype.validateValue
 */
sap.ui.model.type.String.prototype.validateValue = function(sValue) {
	if (this.oConstraints) {
		var aViolatedConstraints = [];
		jQuery.each(this.oConstraints, function(sName, oContent) {
			switch (sName) {
				case "maxLength":  // expects int
					if (sValue.length > oContent) {
						aViolatedConstraints.push("maxLength");
					}
					break;
				case "minLength":  // expects int
					if (sValue.length < oContent) {
						aViolatedConstraints.push("minLength");
					}
					break;
				case "startsWith":  // expects string
					if (!jQuery.sap.startsWith(sValue,oContent)) {
						aViolatedConstraints.push("startsWith");
					}
					break;
				case "startsWithIgnoreCase":  // expects string
					if (!jQuery.sap.startsWithIgnoreCase(sValue,oContent)) {
						aViolatedConstraints.push("startsWithIgnoreCase");
					}
					break;
				case "endsWith":  // expects string
					if (!jQuery.sap.endsWith(sValue,oContent)) {
						aViolatedConstraints.push("endsWith");
					}
					break;
				case "endsWithIgnoreCase": // expects string
					if (!jQuery.sap.endsWithIgnoreCase(sValue,oContent)) {
						aViolatedConstraints.push("endsWithIgnoreCase");
					}
					break;
				case "contains": // expects string
					if (sValue.indexOf(oContent) == -1) {
						aViolatedConstraints.push("contains");
					}
					break;
				case "equals": // expects string
					if (sValue != oContent) {
						aViolatedConstraints.push("equals");
					}
					break;
				case "search": // expects regex
					if (sValue.search(oContent) == -1) {
						aViolatedConstraints.push("search");
					}
					break;
			}
		});
		if (aViolatedConstraints.length > 0) {
			throw new sap.ui.model.ValidateException("Validation of type constraints failed", aViolatedConstraints);
		}
	}
};

