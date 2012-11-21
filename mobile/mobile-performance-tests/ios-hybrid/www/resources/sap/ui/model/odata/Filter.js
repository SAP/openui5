/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides a filter for list bindings
jQuery.sap.declare("sap.ui.model.odata.Filter");
jQuery.sap.require("sap.ui.model.FilterOperator");

/**
 * Constructor for Filter
 *
 * @class
 * Filter for the list binding
 *
 *
 * @param {String} sPath the binding path for this filter
 * @param {Array} aValues Array of FilterOperators and their values: [{operator:"GE",value1:"val1"},{operator:"LE",value1:"val1"},{operator:"BT",value1:"val1",value2:"val2"}]
 * @param {Boolean} [bAND=true] If true the values from aValues will be ANDed; otherwise ORed
 * @public
 */
sap.ui.model.odata.Filter = function(sPath, aValues, bAND){
	this.sPath = sPath;
	this.aValues = aValues;
	this.bAND = bAND == undefined ? true : bAND;
};
sap.ui.model.odata.Filter.prototype = jQuery.sap.newObject(sap.ui.base.Object.prototype);