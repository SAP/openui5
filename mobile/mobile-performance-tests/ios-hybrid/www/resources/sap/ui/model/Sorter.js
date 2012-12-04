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
 * @name sap.ui.model.Sorter
 */
sap.ui.base.Object.extend("sap.ui.model.Sorter", /** @lends sap.ui.model.Sorter */ {
	
	constructor : function(sPath, bDescending){
		this.sPath = sPath;
		this.bDescending = bDescending;
	}

});

/**
 * Creates a new subclass of class sap.ui.model.Sorter with name <code>sClassName</code> 
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
 * @name sap.ui.model.Sorter.extend
 * @function
 */
