/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides class sap.ui.model.odata.ODataPropertyBinding
jQuery.sap.declare("sap.ui.model.odata.ODataPropertyBinding");
jQuery.sap.require("sap.ui.model.PropertyBinding");

/**
 *
 * @class
 * Property binding implementation for oData format
 *
 * @param sPath
 * @param [oModel]
 */
sap.ui.model.odata.ODataPropertyBinding = function(oModel, sPath, oContext){
	sap.ui.model.PropertyBinding.apply(this, arguments);

	this.oValue = this._getValue();
};
sap.ui.model.odata.ODataPropertyBinding.prototype = jQuery.sap.newObject(sap.ui.model.PropertyBinding.prototype);

sap.ui.base.Object.defineClass("sap.ui.model.odata.ODataPropertyBinding", {

	  // ---- object ----
	  baseType : "sap.ui.model.PropertyBinding",
	  publicMethods : [
		// methods
	  ]

});


/**
 * Returns the current value of the bound target
 * @return {object} the current value of the bound target
 * @protected
 */
sap.ui.model.odata.ODataPropertyBinding.prototype.getValue = function(){
	return this.oValue;
};

/**
 * Returns the current value of the bound target (incl. re-evaluation)
 * @return {object} the current value of the bound target
 */
sap.ui.model.odata.ODataPropertyBinding.prototype._getValue = function(){
	return this.oModel._getObject(this.sPath, this.oContext);
};

/**
 * @see sap.ui.model.PropertyBinding.prototype.setValue
 */
sap.ui.model.odata.ODataPropertyBinding.prototype.setValue = function(oValue){
	if (this.oValue != oValue){
		//the binding value will be updated by the model. The model calls checkupdate on all bindings after updating its value.
		if (!this.oModel.setProperty(this.sPath, oValue, this.oContext)) {
			this._fireChange();
		}
	}
};

/**
 * Setter for context
 */
sap.ui.model.odata.ODataPropertyBinding.prototype.setContext = function(oContext) {
	this.oContext = oContext;
	this.checkUpdate();
};

/**
 * Check whether this Binding would provide new values and in case it changed,
 * inform interested parties about this.
 * 
 * @param {boolean} force no cache true/false: Default = false  
 * 
 */
sap.ui.model.odata.ODataPropertyBinding.prototype.checkUpdate = function(bForceUpdate){
	var oValue = this._getValue();
	if(oValue !== this.oValue || bForceUpdate) {// optimize for not firing the events when unneeded
		this.oValue = oValue;
		this._fireChange();
	}
};

sap.ui.model.odata.ODataPropertyBinding.prototype._refresh = function() {
	this.checkUpdate();
};