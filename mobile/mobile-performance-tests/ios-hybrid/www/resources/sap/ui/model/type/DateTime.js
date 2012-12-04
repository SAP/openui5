/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides the base implementation for all model implementations
jQuery.sap.declare("sap.ui.model.type.DateTime");
jQuery.sap.require("sap.ui.model.type.Date");

/**
 * Constructor for a DateTime type.
 *
 * @class
 * This class represents datetime simple types.
 *
 * @extends sap.ui.model.type.Date
 *
 * @author SAP AG
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor
 * @public
 * @name sap.ui.model.type.DateTime
 */
sap.ui.model.type.Date.extend("sap.ui.model.type.DateTime", /** @lends sap.ui.model.type.DateTime */ {
	
	constructor : function () {
		sap.ui.model.type.Date.apply(this, arguments);
		this.sName = "DateTime";
	}

});

/**
 * Creates a new subclass of class sap.ui.model.type.DateTime with name <code>sClassName</code> 
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
 * @name sap.ui.model.type.DateTime.extend
 * @function
 */

/**
 * @see sap.ui.model.SimpleType.prototype.setFormatOptions
 */
sap.ui.model.type.DateTime.prototype.setFormatOptions = function(oFormatOptions) {
	this.oFormatOptions = oFormatOptions;
	this.oOutputFormat = sap.ui.core.format.DateFormat.getDateTimeInstance(this.oFormatOptions);
	if (this.oFormatOptions.source) {
		this.oInputFormat = sap.ui.core.format.DateFormat.getDateTimeInstance(this.oFormatOptions.source);
	}
};