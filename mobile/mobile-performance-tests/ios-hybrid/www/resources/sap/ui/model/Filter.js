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
 * @name sap.ui.model.Filter
 */
sap.ui.base.Object.extend("sap.ui.model.Filter", /** @lends sap.ui.model.Filter */ {
	
	constructor : function(sPath, sOperator, oValue1, oValue2){
		this.sPath = sPath;
		this.sOperator = sOperator;
		this.oValue1 = oValue1;
		this.oValue2 = oValue2;
  }

});

/**
 * Creates a new subclass of class sap.ui.model.Filter with name <code>sClassName</code> 
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
 * @name sap.ui.model.Filter.extend
 * @function
 */

