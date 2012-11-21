/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides the concept of a sorter for list bindings
jQuery.sap.declare("sap.ui.model.Sorter");

/**
 *
 * Constructor for Sorter
 *
 * @class
 * Sorter for the list binding
 * This object defines the sort order for the list binding.
 *
 *
 * @param {String} sPath the binding path used for sorting
 * @param {boolean} [bDescending=false] whether the sort order should be descending
 * @public
 */
sap.ui.model.Sorter = function(sPath, bDescending){
	this.sPath = sPath;
	this.bDescending = bDescending;
};
sap.ui.model.Sorter.prototype = jQuery.sap.newObject(sap.ui.base.Object.prototype);