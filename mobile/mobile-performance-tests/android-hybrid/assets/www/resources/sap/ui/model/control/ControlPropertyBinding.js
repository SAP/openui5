/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides the JSON model implementation of a property binding
jQuery.sap.declare("sap.ui.model.control.ControlPropertyBinding");
jQuery.sap.require("sap.ui.model.PropertyBinding");

/**
 *
 * @class
 * Property binding implementation for JSON format
 *
 * @param sPath
 * @param [oModel]
 */
sap.ui.model.control.ControlPropertyBinding = function(oModel, sPath, oContext){
	sap.ui.model.PropertyBinding.apply(this, arguments);
	this.oValue = this._getValue();
};
sap.ui.model.control.ControlPropertyBinding.prototype = jQuery.sap.newObject(sap.ui.model.PropertyBinding.prototype);

sap.ui.base.Object.defineClass("sap.ui.model.control.ControlPropertyBinding", {

  // ---- object ----
  baseType : "sap.ui.model.PropertyBinding",
  publicMethods : [
	// methods
  ]

});

/**
 * Returns the current value of the bound target
 * @return {object} the current value of the bound target
 */
sap.ui.model.control.ControlPropertyBinding.prototype.getValue = function(){
	return this.oValue;
};

/**
 * Returns the current value of the bound target (incl. re-evaluation)
 * @return {object} the current value of the bound target
 */
sap.ui.model.control.ControlPropertyBinding.prototype._getValue = function () {
	return this.oContext.getProperty(this.sPath);
};

/**
 * Setter for context
 */
sap.ui.model.control.ControlPropertyBinding.prototype.setContext = function(oContext) {
	this.oContext = oContext;
	this.checkUpdate();
};

/**
 * Check whether this Binding would provide new values and in case it changed,
 * inform interested parties about this.
 * @protected
 */
sap.ui.model.control.ControlPropertyBinding.prototype.checkUpdate = function() {
	var oValue = this._getValue();
	if(oValue !== this.oValue) {// optimize for not firing the events when unneeded
		this.oValue = oValue;
		this._fireChange();
	}
};