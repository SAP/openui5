/*!
 * ${copyright}
 */

// Provides an abstraction for list bindings
sap.ui.define(['jquery.sap.global', './ContextBinding'],
	function(jQuery, ContextBinding) {
	"use strict";


	/**
	 * Constructor for ClientContextBinding
	 *
	 * @class
	 * The ContextBinding is a specific binding for a setting context for the model
	 *
	 * @param {sap.ui.model.Model} oModel
	 * @param {String} sPath
	 * @param {Object} oContext
	 * @param {Object} [mParameters]
	 * @abstract
	 * @public
	 * @name sap.ui.model.ClientContextBinding
	 */
	var ClientContextBinding = ContextBinding.extend("sap.ui.model.ClientContextBinding", /** @lends sap.ui.model.ClientContextBinding.prototype */ {
	
		constructor : function(oModel, sPath, oContext, mParameters, oEvents){
			ContextBinding.call(this, oModel, sPath, oContext, mParameters, oEvents);
			var that = this;
			oModel.createBindingContext(sPath, oContext, mParameters, function(oContext) {
				that.bInitial = false;
				that.oElementContext = oContext;
			});
		}
	
	});
	
	/**
	 * Creates a new subclass of class sap.ui.model.ClientContextBinding with name <code>sClassName</code> 
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
	 * @name sap.ui.model.ClientContextBinding.extend
	 * @function
	 */
	
	/**
	 * @see sap.ui.model.ContextBinding.prototype.refresh
	 * @name sap.ui.model.ClientContextBinding#refresh
	 * @function
	 */
	ClientContextBinding.prototype.refresh = function(bForceUpdate) {
		var that = this;
		//recreate Context: force update
		this.oModel.createBindingContext(this.sPath, this.oContext, this.mParameters, function(oContext) {
			if (that.oElementContext === oContext && !bForceUpdate) {
				that.oModel.checkUpdate(true,oContext);
			} else {
				that.oElementContext = oContext;
				that._fireChange();
			}
		}, true);
	};
	
	/**
	 * @see sap.ui.model.ContextBinding.prototype.refresh
	 * @name sap.ui.model.ClientContextBinding#initialize
	 * @function
	 */
	ClientContextBinding.prototype.initialize = function() {
		var that = this;
		//recreate Context: force update
		this.oModel.createBindingContext(this.sPath, this.oContext, this.mParameters, function(oContext) {
			that.oElementContext = oContext;
			that._fireChange();
		}, true);
	};
	
	/**
	 * @see sap.ui.model.ContextBinding.prototype.setContext
	 * @name sap.ui.model.ClientContextBinding#setContext
	 * @function
	 */
	ClientContextBinding.prototype.setContext = function(oContext) {
		var that = this;
		if (this.oContext != oContext) {
			this.oContext = oContext;
			this.oModel.createBindingContext(this.sPath, this.oContext, this.mParameters, function(oContext) {
				that.oElementContext = oContext;
				that._fireChange();
			});
		}
	};

	return ClientContextBinding;

}, /* bExport= */ true);
