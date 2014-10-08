/*!
 * ${copyright}
 */

// Provides an abstraction for list bindings
sap.ui.define(['jquery.sap.global', './Binding'],
	function(jQuery, Binding) {
	"use strict";


	/**
	 * Constructor for ContextBinding
	 *
	 * @class
	 * The ContextBinding is a specific binding for a setting context for the model
	 *
	 * @param {sap.ui.model.Model} oModel
	 * @param {String} sPath
	 * @param {Object} oContext
	 * @param {Object} [mParameters]
	 * @param {Object} [oEvents] object defining event handlers
	 * @abstract
	 * @public
	 * @name sap.ui.model.ContextBinding
	 */
	var ContextBinding = Binding.extend("sap.ui.model.ContextBinding", /** @lends sap.ui.model.ContextBinding.prototype */ {
		
		constructor : function(oModel, sPath, oContext, mParameters, oEvents){
			Binding.call(this, oModel, sPath, oContext, mParameters, oEvents);
			this.oElementContext = null;
			this.bInitial = true;
		},
	
		metadata : {
			 publicMethods : [
			 // methods
				"getElementContext"
			 ]
		}
	});
	
	/**
	 * Creates a new subclass of class sap.ui.model.ContextBinding with name <code>sClassName</code> 
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
	 * @name sap.ui.model.ContextBinding.extend
	 * @function
	 */
	
	/**
	 * Check whether this Binding would provide new values and in case it changed,
	 * inform interested parties about this.
	 *
	 * @param {boolean} bForceupdate
	 * @name sap.ui.model.ContextBinding#checkUpdate
	 * @function
	 */
	ContextBinding.prototype.checkUpdate = function(bForceupdate) {
		// nothing to do here, data changes can not change the context
	};
	
	/**
	 * Refreshes the binding, check whether the model data has been changed and fire change event
	 * if this is the case. For server side models this should refetch the data from the server.
	 * 
	 * @param {boolean} bForceUpdate Does not have any effect on this binding
	 * 
	 * @public
	 */
	
	/**
	 * Return the bound context
	 * @name sap.ui.model.ContextBinding#getBoundContext
	 * @function
	 */
	ContextBinding.prototype.getBoundContext = function(oContext) {
		return this.oElementContext;
	};
	

	return ContextBinding;

}, /* bExport= */ true);
