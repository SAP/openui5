/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides the XML model implementation of a property binding
jQuery.sap.declare("sap.ui.model.xml.XMLPropertyBinding");
jQuery.sap.require("sap.ui.model.PropertyBinding");

/**
 *
 * @class
 * Property binding implementation for XML format
 *
 * @param sPath
 * @param [oModel]
 */
sap.ui.model.xml.XMLPropertyBinding = function(oModel, sPath, oContext){
	sap.ui.model.PropertyBinding.apply(this, arguments);

	this.oValue = this._getValue();
};
sap.ui.model.xml.XMLPropertyBinding.prototype = jQuery.sap.newObject(sap.ui.model.PropertyBinding.prototype);

sap.ui.base.Object.defineClass("sap.ui.model.xml.XMLPropertyBinding", {

  // ---- object ----
  baseType : "sap.ui.model.PropertyBinding",
  publicMethods : [
	// methods
  ]

});

/**
 * @see sap.ui.model.PropertyBinding.prototype.getValue
 */
sap.ui.model.xml.XMLPropertyBinding.prototype.getValue = function(){
	return this.oValue;
};

/**
 * Returns the current value of the bound target (incl. re-evaluation)
 * @return {object} the current value of the bound target
 */
sap.ui.model.xml.XMLPropertyBinding.prototype._getValue = function(){
	var sProperty = this.sPath.substr(this.sPath.lastIndexOf("/")+1);
	if (sProperty == "__name__") {
		var aPath = this.oContext.split("/");
		return aPath[aPath.length - 1];
	}
	return this.oModel.getProperty(this.sPath, this.oContext);
};

/**
 * @see sap.ui.model.PropertyBinding.prototype.setValue
 */
sap.ui.model.xml.XMLPropertyBinding.prototype.setValue = function(oValue){
	if (this.oValue != oValue){
		// the binding value will be updated by the model. The model calls checkupdate on all bindings after updating its value.
		this.oModel.setProperty(this.sPath, oValue, this.oContext);
	}
};

/**
 * Setter for context
 */
sap.ui.model.xml.XMLPropertyBinding.prototype.setContext = function(oContext) {
	this.oContext = oContext;
	this.checkUpdate();
};

/**
 * Check whether this Binding would provide new values and in case it changed,
 * inform interested parties about this.
 * 
 * @param {boolean} bForceupdate
 * 
 */
sap.ui.model.xml.XMLPropertyBinding.prototype.checkUpdate = function(bForceupdate){
	var oValue = this._getValue();
	if(oValue !== this.oValue || bForceupdate) {// optimize for not firing the events when unneeded
		this.oValue = oValue;
		this._fireChange();
	}
};