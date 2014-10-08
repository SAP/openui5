/*!
 * ${copyright}
 */

/**
 * client-based DataBinding
 *
 * @namespace
 * @name sap.ui.model.json
 * @public
 */

// Provides the JSON object based model implementation
sap.ui.define(['jquery.sap.global', './ClientContextBinding', './ClientListBinding', './ClientPropertyBinding', './ClientTreeBinding', './Model'],
	function(jQuery, ClientContextBinding, ClientListBinding, ClientPropertyBinding, ClientTreeBinding, Model) {
	"use strict";


	/**
	 * Constructor for a new ClientModel.
	 *
	 * @class Model implementation for Client models
	 * @abstract
	 * @extends sap.ui.model.Model
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @param {object} oData URL where to load the data from
	 * @constructor
	 * @public
	 * @name sap.ui.model.ClientModel
	 */
	var ClientModel = Model.extend("sap.ui.model.ClientModel", /** @lends sap.ui.model.ClientModel.prototype */ {
		
		constructor : function(oData) {
			Model.apply(this, arguments);
			
			this.bCache = true;
			this.aPendingRequestHandles = [];
			
			if (typeof oData == "string") {
				this.loadData(oData);
			}
		},
	
		metadata : {
			publicMethods : ["loadData", "setData", "getData", "setProperty", "forceNoCache"]
		}
	
	});
	
	/**
	 * Creates a new subclass of class sap.ui.model.ClientModel with name <code>sClassName</code> 
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
	 * @name sap.ui.model.ClientModel.extend
	 * @function
	 */
	
	/**
	 * Returns the current data of the model.
	 * Be aware that the returned object is a reference to the model data so all changes to that data will also change the model data.
	 *
	 * @return the data object
	 * @public
	 * @name sap.ui.model.ClientModel#getData
	 * @function
	 */
	ClientModel.prototype.getData = function(){
		return this.oData;
	};
	
	/**
	 * Private method iterating the registered bindings of this model instance and initiating their check for update
	 *
	 * @param {boolean} bForceupdate
	 *
	 * @private
	 * @name sap.ui.model.ClientModel#checkUpdate
	 * @function
	 */
	ClientModel.prototype.checkUpdate = function(bForceupdate) {
		var aBindings = this.aBindings.slice(0);
		jQuery.each(aBindings, function(iIndex, oBinding) {
			oBinding.checkUpdate(bForceupdate);
		});
	};
	
	/**
	 * @see sap.ui.model.Model.prototype.bindElement
	 *
	 */
	/**
	 * @see sap.ui.model.Model.prototype.createBindingContext
	 *
	 * @name sap.ui.model.ClientModel#createBindingContext
	 * @function
	 */
	ClientModel.prototype.createBindingContext = function(sPath, oContext, mParameters, fnCallBack) {
		// optional parameter handling
		if (typeof oContext == "function") {
			fnCallBack = oContext;
			oContext = null;
		}
		if (typeof mParameters == "function") {
			fnCallBack = mParameters;
			mParameters = null;
		}
		// resolve path and create context
		var sContextPath = this.resolve(sPath, oContext),
			oNewContext = (sContextPath == undefined) ? undefined : this.getContext(sContextPath ? sContextPath : "/");
		  if (!oNewContext) {
			  oNewContext = null;
		  }
		fnCallBack(oNewContext);
	};
	
	
	ClientModel.prototype._ajax = function(oParameters){
		var that = this;
	
		if (this.bDestroyed) {
			return;
		}
	
		function wrapHandler(fn) {
			return function() {
				// request finished, remove request handle from pending request array
				var iIndex = jQuery.inArray(oRequestHandle, that.aPendingRequestHandles);
				if (iIndex > -1) {
					that.aPendingRequestHandles.splice(iIndex, 1);
				}
	
				// call original handler method
				if (!(oRequestHandle && oRequestHandle.bSuppressErrorHandlerCall)) {
					fn.apply(this, arguments);
				}
			};
		}
	
		oParameters.success = wrapHandler(oParameters.success);
		oParameters.error = wrapHandler(oParameters.error);
	
		var oRequestHandle = jQuery.ajax(oParameters);
	
		// add request handle to array and return it (only for async requests)
		if (oParameters.async) {
			this.aPendingRequestHandles.push(oRequestHandle);
		}
	
	};
	
	/**
	 * @see sap.ui.model.Model.prototype.destroy
	 * @public
	 * @name sap.ui.model.ClientModel#destroy
	 * @function
	 */
	ClientModel.prototype.destroy = function() {
	
		// Abort pending requests
		if (this.aPendingRequestHandles) {
			for (var i = this.aPendingRequestHandles.length - 1; i >= 0; i--) {
				var oRequestHandle = this.aPendingRequestHandles[i];
				if (oRequestHandle && oRequestHandle.abort) {
					oRequestHandle.bSuppressErrorHandlerCall = true;
					oRequestHandle.abort();
				}
			}
			delete this.aPendingRequestHandles;
		}
	
		Model.prototype.destroy.apply(this, arguments);
	};
	
	/**
	 * @see sap.ui.model.Model.prototype.destroyBindingContext
	 *
	 * @name sap.ui.model.ClientModel#destroyBindingContext
	 * @function
	 */
	ClientModel.prototype.destroyBindingContext = function(oContext) {
		// TODO: what todo here?
	};
	
	/**
	 * @see sap.ui.model.Model.prototype.bindContext
	 * @name sap.ui.model.ClientModel#bindContext
	 * @function
	 */
	ClientModel.prototype.bindContext = function(sPath, oContext, mParameters) {
		var oBinding = new ClientContextBinding(this, sPath, oContext, mParameters);
		return oBinding;
	};
	
	/**
	 * update all bindings
	 * @param {boolean} bForceUpdate true/false: Default = false. If set to false an update 
	 * 					will only be done when the value of a binding changed.   
	 * @public
	 * @name sap.ui.model.ClientModel#updateBindings
	 * @function
	 */
	ClientModel.prototype.updateBindings = function(bForceUpdate) {
		this.checkUpdate(bForceUpdate);
	};
	
	/**
	 * Force no caching.
	 * @param {boolean} [bForceNoCache=false] whether to force not to cache
	 * @public
	 * @name sap.ui.model.ClientModel#forceNoCache
	 * @function
	 */
	ClientModel.prototype.forceNoCache = function(bForceNoCache) {
		this.bCache = !bForceNoCache;
	};
	

	return ClientModel;

}, /* bExport= */ true);
