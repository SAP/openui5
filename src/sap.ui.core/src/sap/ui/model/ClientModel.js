/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides client-based DataBinding implementation
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'./Model',
	'./ClientContextBinding',
	'./ClientListBinding', // convenience dependency for legacy code using global names
	'./ClientPropertyBinding', // convenience dependency for legacy code using global names
	'./ClientTreeBinding' // convenience dependency for legacy code using global names
],
	function(
		jQuery,
		Model,
		ClientContextBinding
	) {
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
	 * @param {string} [oData] URL where to load the data from
	 * @public
	 * @alias sap.ui.model.ClientModel
	 */
	var ClientModel = Model.extend("sap.ui.model.ClientModel", /** @lends sap.ui.model.ClientModel.prototype */ {

		constructor : function(oData) {
			Model.apply(this, arguments);

			this.bCache = true;
			this.aPendingRequestHandles = [];
			this.mUnsupportedFilterOperators = {"Any": true, "All": true};

			if (typeof oData == "string") {
				this.loadData(oData);
			}
		},

		metadata : {}

	});

	/**
	 * Returns the current data of the model.
	 *
	 * Be aware that the returned object is a reference to the model data so all changes to that data will also change the model data.
	 *
	 * @returns {any} the data object
	 * @public
	 */
	ClientModel.prototype.getData = function(){
		return this.oData;
	};

	/*
	 * @see sap.ui.model.Model.prototype.createBindingContext
	 *
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
		if (fnCallBack) {
			fnCallBack(oNewContext);
		}
		return oNewContext;
	};


	ClientModel.prototype._ajax = function(oParameters){
		var oRequestHandle,
			that = this;

		if (this.bDestroyed) {
			return;
		}

		function wrapHandler(fn) {
			return function() {
				// request finished, remove request handle from pending request array
				if (that.aPendingRequestHandles){
					var iIndex = that.aPendingRequestHandles.indexOf(oRequestHandle);
					if (iIndex > -1) {
						that.aPendingRequestHandles.splice(iIndex, 1);
					}
				}

				// call original handler method
				if (!(oRequestHandle && oRequestHandle.bSuppressErrorHandlerCall)) {
					fn.apply(this, arguments);
				}
			};
		}

		oParameters.success = wrapHandler(oParameters.success);
		oParameters.error = wrapHandler(oParameters.error);

		oRequestHandle = jQuery.ajax(oParameters);

		// add request handle to array and return it (only for async requests)
		if (oParameters.async) {
			this.aPendingRequestHandles.push(oRequestHandle);
		}
	};

	/**
	 * @see sap.ui.model.Model.prototype.destroy
	 * @public
	 */
	ClientModel.prototype.destroy = function() {
		Model.prototype.destroy.apply(this, arguments);
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
	};

	/**
	 * Does nothing.
	 *
	 * @param {sap.ui.model.Context} oContext The context to destroy
	 */
	ClientModel.prototype.destroyBindingContext = function(oContext) {
	};

	/*
	 * @see sap.ui.model.Model.prototype.bindContext
	 */
	ClientModel.prototype.bindContext = function(sPath, oContext, mParameters) {
		var oBinding = new ClientContextBinding(this, sPath, oContext, mParameters);
		return oBinding;
	};

	/**
	 * Creates a new property binding for this model.
	 *
	 * @param {string} sPath
	 *   The path pointing to the property that should be bound; either an absolute path or a path
	 *   relative to a given <code>oContext</code>
	 * @param {object} [oContext]
	 *   A context object for the new binding
	 * @param {Object<string,any>} [mParameters]
	 *   Map of optional parameters for the binding
	 * @param {boolean} [mParameters.ignoreMessages]
	 *   Whether this binding does not propagate model messages to the control; supported since
	 *   1.119.0. Some composite types like {@link sap.ui.model.type.Currency} automatically ignore
	 *   model messages for some of their parts depending on their format options; setting this
	 *   parameter to <code>true</code> or <code>false</code> overrules the automatism of the type.
	 *
	 *   For example, a binding for a currency code is used in a composite binding for rendering the
	 *   proper number of decimals, but the currency code is not displayed in the attached control.
	 *   In that case, messages for the currency code shall not be displayed at that control, only
	 *   messages for the amount.
	 * @returns {sap.ui.model.PropertyBinding}
	 *   The new property binding
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.ClientModel#bindProperty
	 * @public
	 * @see sap.ui.model.Model#bindProperty
	 * @see #getProperty
	 */
	// @override sap.ui.model.Model#bindProperty

	/**
	 * update all bindings
	 * @param {boolean} bForceUpdate true/false: Default = false. If set to false an update
	 * 					will only be done when the value of a binding changed.
	 * @public
	 */
	ClientModel.prototype.updateBindings = function(bForceUpdate) {
		this.checkUpdate(bForceUpdate);
	};

	/**
	 * Force no caching.
	 * @param {boolean} [bForceNoCache=false] whether to force not to cache
	 * @public
	 */
	ClientModel.prototype.forceNoCache = function(bForceNoCache) {
		this.bCache = !bForceNoCache;
	};

	return ClientModel;
});