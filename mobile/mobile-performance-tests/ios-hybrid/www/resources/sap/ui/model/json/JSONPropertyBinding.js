/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides the JSON model implementation of a property binding
jQuery.sap.declare("sap.ui.model.json.JSONPropertyBinding");
jQuery.sap.require("sap.ui.model.PropertyBinding");

/**
 *
 * @class
 * Property binding implementation for JSON format
 *
 * @param sPath
 * @param [oModel]
 * @name sap.ui.model.json.JSONPropertyBinding
 * @extends sap.ui.model.PropertyBinding
 */
sap.ui.model.PropertyBinding.extend("sap.ui.model.json.JSONPropertyBinding", /** @lends sap.ui.model.json.JSONPropertyBinding */ {
	
	constructor : function(oModel, sPath, oContext){
		sap.ui.model.PropertyBinding.apply(this, arguments);
	
		this.oValue = this._getValue();
	}
	
});

/**
 * Creates a new subclass of class sap.ui.model.json.JSONPropertyBinding with name <code>sClassName</code> 
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
 * @name sap.ui.model.json.JSONPropertyBinding.extend
 * @function
 */

/**
 * @see sap.ui.model.PropertyBinding.prototype.getValue
 */
sap.ui.model.json.JSONPropertyBinding.prototype.getValue = function(){
	return this.oValue;
};


/**
 * Returns the current value of the bound target (incl. re-evaluation)
 * @return {object} the current value of the bound target
 */
sap.ui.model.json.JSONPropertyBinding.prototype._getValue = function(){
	var sProperty = this.sPath.substr(this.sPath.lastIndexOf("/")+1);
	if (sProperty == "__name__") {
		var aPath = this.oContext.split("/");
		return aPath[aPath.length - 1];
	}
	return this.oModel._getObject(this.sPath, this.oContext); // ensure to survive also not set model object
};

/**
 * @see sap.ui.model.PropertyBinding.prototype.setValue
 */
sap.ui.model.json.JSONPropertyBinding.prototype.setValue = function(oValue){
	if (!jQuery.sap.equal(this.oValue, oValue)){
		// the binding value will be updated by the model. The model calls checkupdate on all bindings after updating its value.
		this.oModel.setProperty(this.sPath, oValue, this.oContext);
	}
};

/**
 * Setter for context
 */
sap.ui.model.json.JSONPropertyBinding.prototype.setContext = function(oContext) {
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
sap.ui.model.json.JSONPropertyBinding.prototype.checkUpdate = function(bForceupdate){
	var oValue = this._getValue();
	if(!jQuery.sap.equal(oValue, this.oValue) || bForceupdate) {// optimize for not firing the events when unneeded
		this.oValue = oValue;
		this._fireChange();
	}
};