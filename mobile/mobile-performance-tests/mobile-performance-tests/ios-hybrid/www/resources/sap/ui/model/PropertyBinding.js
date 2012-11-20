/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides an abstract property binding.
jQuery.sap.declare("sap.ui.model.PropertyBinding");
jQuery.sap.require("sap.ui.model.Binding");

/**
 * Constructor for PropertyBinding
 *
 * @class
 * The PropertyBinding is used to access single data values in the data model.
 *
 * @param {sap.ui.model.Model} oModel
 * @param {String} sPath
 * @param {Object} oContext
 * @abstract
 * @public
 */
sap.ui.model.PropertyBinding = function(oModel, sPath, oContext, mParameters){
	sap.ui.model.Binding.apply(this, arguments);
};
sap.ui.model.PropertyBinding.prototype = jQuery.sap.newObject(sap.ui.model.Binding.prototype);

/*
 * Describe the sap.ui.model.PropertyBinding.
 * Resulting metadata can be obtained via sap.ui.model.PropertyBinding.getMetadata();
 */
sap.ui.base.Object.defineClass("sap.ui.model.PropertyBinding", {

  // ---- object ----
  baseType : "sap.ui.model.Binding",
  publicMethods : [
	// methods
	"getValue", "setValue"
  ]

});

// the 'abstract methods' to be implemented by child classes
/**
 * Returns the current value of the bound target
 *
 * @function
 * @name sap.ui.model.PropertyBinding.prototype.getValue
 * @return {object} the current value of the bound target
 *
 * @public
 */

/**
 * Sets the value for this binding. A model implementation should check if the current default binding mode permits
 * setting the binding value and if so set the new value also in the model.
 *
 * @function
 * @name sap.ui.model.PropertyBinding.prototype.setValue
 * @param {object} oValue the value to set for this binding
 *
 * @public
 */