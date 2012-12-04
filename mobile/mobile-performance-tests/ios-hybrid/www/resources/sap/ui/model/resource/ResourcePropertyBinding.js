/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides the Resource model implementation of a property binding
jQuery.sap.declare("sap.ui.model.resource.ResourcePropertyBinding");
jQuery.sap.require("sap.ui.model.PropertyBinding");

/**
 * @class
 * Property binding implementation for resource bundles
 *
 * @param sPath
 * @param [oModel]
 * @name sap.ui.model.resource.ResourcePropertyBinding
 */
sap.ui.model.PropertyBinding.extend("sap.ui.model.resource.ResourcePropertyBinding", /** @lends sap.ui.model.resource.ResourcePropertyBinding */ {
	
	constructor : function(oModel, sPath){
		sap.ui.model.PropertyBinding.apply(this, arguments);
	
		this.oValue = this.oModel.getProperty(sPath);
	},
	
});

/**
 * Creates a new subclass of class sap.ui.model.resource.ResourcePropertyBinding with name <code>sClassName</code> 
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
 * @name sap.ui.model.resource.ResourcePropertyBinding.extend
 * @function
 */

/**
 * @see sap.ui.model.PropertyBinding.prototype.getValue
 */
sap.ui.model.resource.ResourcePropertyBinding.prototype.getValue = function(){
	return this.oValue;
};