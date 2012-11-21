/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides the Resource model implementation of a property binding
jQuery.sap.declare("sap.ui.model.resource.ResourcePropertyBinding");
jQuery.sap.require("sap.ui.model.PropertyBinding");

/**
 *
 * @class
 * Property binding implementation for resource bundles
 *
 * @param sPath
 * @param [oModel]
 */
sap.ui.model.resource.ResourcePropertyBinding = function(oModel, sPath){
	sap.ui.model.PropertyBinding.apply(this, arguments);

	this.oValue = this.oModel.getProperty(sPath);
};
sap.ui.model.resource.ResourcePropertyBinding.prototype = jQuery.sap.newObject(sap.ui.model.PropertyBinding.prototype);

//chain the prototypes
sap.ui.base.Object.defineClass("sap.ui.model.resource.ResourcePropertyBinding", {

  // ---- object ----
  baseType : "sap.ui.model.PropertyBinding",
  publicMethods : [
	// methods
  ]

});

/**
 * @see sap.ui.model.PropertyBinding.prototype.getValue
 */
sap.ui.model.resource.ResourcePropertyBinding.prototype.getValue = function(){
	return this.oValue;
};