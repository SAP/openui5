/*!
 * ${copyright}
 */

// Provides an abstraction for model bindings
sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider'],
	function(jQuery, EventProvider) {
	"use strict";


	/**
	 * Constructor for Context class.
	 *
	 * @class
	 * The Context is a pointer to an object in the model data, which is used to 
	 * allow definition of relative bindings, which are resolved relative to the
	 * defined object.
	 * Context elements are created either by the ListBinding for each list entry
	 * or by using createBindingContext.
	 *
	 * @param {sap.ui.model.Model} oModel the model
	 * @param {String} sPath the path
	 * @param {Object} oContext the context object
	 * @abstract
	 * @public
	 * @name sap.ui.model.Context
	 */
	var Context = sap.ui.base.Object.extend("sap.ui.model.Context", /** @lends sap.ui.model.Context.prototype */ {
		
		constructor : function(oModel, sPath){
	
			sap.ui.base.Object.apply(this);
		
			this.oModel = oModel;
			this.sPath = sPath;
		
		},
		
		metadata : {
			"abstract" : true,
		  publicMethods : [
				"getModel", "getPath", "getProperty", "getObject"
			]
		}
	
	});
	
	/**
	 * Creates a new subclass of class sap.ui.model.Context with name <code>sClassName</code> 
	 * and enriches it with the information contained in <code>oClassInfo</code>.
	 * 
	 * For a detailed description of <code>oClassInfo</code> or <code>FNMetaImpl</code> 
	 * see {@link sap.ui.base.C.extend Object.extend}.
	 *   
	 * @param {string} sClassName name of the class to be created
	 * @param {object} [oClassInfo] object literal with informations about the class  
	 * @param {function} [FNMetaImpl] alternative constructor for a metadata object
	 * @return {function} the created class / constructor function
	 * @public
	 * @static
	 * @name sap.ui.model.Context.extend
	 * @function
	 */
	
	// Getter
	/**
	 * Getter for model
	 * @public
	 * @return {sap.ui.core.Model} the model
	 * @name sap.ui.model.Context#getModel
	 * @function
	 */
	Context.prototype.getModel = function() {
		return this.oModel;
	};
	
	/**
	 * Getter for path of the context itself or a subpath
	 * @public
	 * @param {String} sPath the binding path
	 * @return {String} the binding path
	 * @name sap.ui.model.Context#getPath
	 * @function
	 */
	Context.prototype.getPath = function(sPath) {
		return this.sPath + (sPath ? "/" + sPath : "");
	};
	
	/**
	 * Gets the property with the given relative binding path
	 * @public
	 * @param {String} sPath the binding path
	 * @return {any} the property value
	 * @name sap.ui.model.Context#getProperty
	 * @function
	 */
	Context.prototype.getProperty = function(sPath) {
		return this.oModel.getProperty(sPath, this);
	};
	
	/**
	 * Gets the (model dependent) object the context points to or the object with the given relative binding path
	 * @public
	 * @param {String} sPath the binding path
	 * @return {object} the context object
	 * @name sap.ui.model.Context#getObject
	 * @function
	 */
	Context.prototype.getObject = function(sPath) {
		return this.oModel.getObject(sPath, this);
	};
	
	/** 
	 * toString method returns path for compatbility
	 * @name sap.ui.model.Context#toString
	 * @function
	 */
	Context.prototype.toString = function() {
		return this.sPath;
	};
	

	return Context;

}, /* bExport= */ true);
