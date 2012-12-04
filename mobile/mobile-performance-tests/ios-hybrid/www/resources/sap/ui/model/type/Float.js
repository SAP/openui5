/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides the base implementation for all model implementations
jQuery.sap.declare("sap.ui.model.type.Float");
jQuery.sap.require("sap.ui.model.SimpleType");
jQuery.sap.require("sap.ui.core.format.NumberFormat");

/**
 * Constructor for a Float type.
 *
 * @class
 * This class represents float simple types.
 *
 * @extends sap.ui.model.SimpleType
 *
 * @author SAP AG
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor
 * @public
 * @name sap.ui.model.type.Float 
 */
sap.ui.model.SimpleType.extend("sap.ui.model.type.Float", /** @lends sap.ui.model.type.Float  */ {
	
	constructor : function () {
		sap.ui.model.SimpleType.apply(this, arguments);
		this.sName = "Float";
	}

});

/**
 * Creates a new subclass of class sap.ui.model.type.Float with name <code>sClassName</code> 
 * and enriches it with the information contained in <code>oClassInfo</code>.
 * 
 * For a detailed description of <code>oClassInfo</code> or <code>FNMetaImpl</code> 
 * see {@link sap.ui.base.Object.extend Object.extend}.
 *   
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class  
 * @param {function} [FNMetaImpl] alternative constructor for a metadata object
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.ui.model.type.Float.extend
 * @function
 */

/**
 * @see sap.ui.model.SimpleType.prototype.formatValue
 */
sap.ui.model.type.Float.prototype.formatValue = function(fValue, sInternalType) {
	if (fValue == undefined || fValue == null) {
		return null;
	}
	switch(sInternalType) {
		case "string":
			return this.oFormat.format(fValue);
		case "int":
			return Math.floor(fValue);
		case "float":
			return fValue;
		default:
			throw new sap.ui.model.FormatException("Don't know how to format Float to " + sInternalType);
	}
};

/**
 * @see sap.ui.model.SimpleType.prototype.parseValue
 */
sap.ui.model.type.Float.prototype.parseValue = function(oValue, sInternalType) {
	var iResult;
	switch(sInternalType) {
		case "string":
			iResult = this.oFormat.parse(oValue);
			if (isNaN(iResult)) {
				throw new sap.ui.model.ParseException(oValue + " is not a valid Float value");
			}
			return iResult;
		case "int":
		case "float":
			return oValue;
		default:
			throw new sap.ui.model.ParseException("Don't know how to parse Float from " + sInternalType);
	}
};

/**
 * @see sap.ui.model.SimpleType.prototype.validateValue
 */
sap.ui.model.type.Float.prototype.validateValue = function(iValue) {
	if (this.oConstraints) {
		var aViolatedConstraints = [];
		jQuery.each(this.oConstraints, function(sName, oContent) {
			switch (sName) {
				case "minimum":
					if (iValue < oContent) {
						aViolatedConstraints.push("minimum");
					}
					break;
				case "maximum":
					if (iValue > oContent) {
						aViolatedConstraints.push("maximum");
					}
			}
		});
		if (aViolatedConstraints.length > 0) {
			throw new sap.ui.model.ValidateException("Validation of type constraints failed", aViolatedConstraints);
		}
	}
};

/**
 * @see sap.ui.model.SimpleType.prototype.setFormatOptions
 */
sap.ui.model.type.Float.prototype.setFormatOptions = function(oFormatOptions) {
	this.oFormatOptions = oFormatOptions;
	this.oFormat = sap.ui.core.format.NumberFormat.getFloatInstance(this.oFormatOptions);
};

