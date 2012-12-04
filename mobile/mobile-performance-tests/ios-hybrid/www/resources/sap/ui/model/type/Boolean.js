/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides the base implementation for all model implementations
jQuery.sap.declare("sap.ui.model.type.Boolean");
jQuery.sap.require("sap.ui.model.SimpleType");
jQuery.sap.require("sap.ui.core.format.NumberFormat");

/**
 * Constructor for a Boolean type.
 *
 * @class
 * This class represents boolean simple types.
 *
 * @extends sap.ui.model.SimpleType
 *
 * @author SAP AG
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor
 * @public
 * @name sap.ui.model.type.Boolean
 */
sap.ui.model.SimpleType.extend("sap.ui.model.type.Boolean", /** @lends sap.ui.model.type.Boolean */ {
	
	constructor : function () {
		sap.ui.model.SimpleType.apply(this, arguments);
		this.sName = "Boolean";
	}

});

/**
 * Creates a new subclass of class sap.ui.model.type.Boolean with name <code>sClassName</code> 
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
 * @name sap.ui.model.type.Boolean.extend
 * @function
 */

/**
 * @see sap.ui.model.SimpleType.prototype.formatValue
 */
sap.ui.model.type.Boolean.prototype.formatValue = function(bValue, sInternalType) {
	if (bValue == undefined || bValue == null) {
		return null;
	}
	switch(sInternalType) {
		case "boolean":
			return bValue;
		case "string":
			return bValue.toString();
		case "int": // TODO return 1 for true?!
		case "float":
		default:
			throw new sap.ui.model.FormatException("Don't know how to format Boolean to " + sInternalType);
	}
};

/**
 * @see sap.ui.model.SimpleType.prototype.parseValue
 */
sap.ui.model.type.Boolean.prototype.parseValue = function(oValue, sInternalType) {
	var sResult;
	switch(sInternalType) {
		case "boolean":
			return oValue;
		case "string":
			if (oValue.toLowerCase() == "true" || oValue == "X"){
				return true;
			}
			if (oValue.toLowerCase() == "false" || oValue == ""){
				return false;
			}
			throw new sap.ui.model.ParseException("Don't know how to parse Boolean from " + sInternalType);
		case "int": // TODO return 1 for true?!
		case "float":
		default:
			throw new sap.ui.model.ParseException("Don't know how to parse Boolean from " + sInternalType);
	}
};

/**
 * @see sap.ui.model.SimpleType.prototype.validateValue
 */
sap.ui.model.type.Boolean.prototype.validateValue = function(sValue) {

};

