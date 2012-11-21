/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides a filter for list bindings
jQuery.sap.declare("sap.ui.model.Filter");
jQuery.sap.require("sap.ui.model.FilterOperator");

/**
 * Constructor for Filter
 *
 * @class
 * Filter for the list binding
 *
 *
 * @param {String} sPath the binding path for this filter
 * @param {sap.ui.model.FilterOperator} sOperator Operator used for the filter
 * @param {Object} oValue1 First value to use for filter
 * @param {Object} [oValue2=null] Second value to use for filter (optional)
 * @public
 */
sap.ui.model.Filter = function(sPath, sOperator, oValue1, oValue2){
	this.sPath = sPath;
	this.sOperator = sOperator;
	this.oValue1 = oValue1;
	this.oValue2 = oValue2;
};
sap.ui.model.Filter.prototype = jQuery.sap.newObject(sap.ui.base.Object.prototype);