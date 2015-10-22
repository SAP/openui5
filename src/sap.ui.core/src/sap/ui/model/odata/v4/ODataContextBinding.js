/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataContextBinding
sap.ui.define([
	"jquery.sap.global", "sap/ui/model/ChangeReason", "sap/ui/model/ContextBinding"
], function (jQuery, ChangeReason, ContextBinding) {
	"use strict";

	/**
	 * Constructor for a new ODataContextBinding.
	 *
	 * @param {sap.ui.model.odata.v4.ODataModel} oModel
	 *   the OData v4 model
	 * @param {String} sPath
	 *   the binding path in the model
	 * @param {sap.ui.model.Context} [oContext]
	 *   the context which is required as base for a relative path
	 *
	 * @class Context binding for an OData v4 model.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.model.odata.v4.ODataContextBinding
	 * @extends sap.ui.model.ContextBinding
	 * @public
	 * @since 1.31.0
	 */
	var ODataContextBinding = ContextBinding.extend("sap.ui.model.odata.v4.ODataContextBinding",
			/** @lends sap.ui.model.odata.v4.ODataContextBinding.prototype */
			{
				constructor : function () {
					ContextBinding.apply(this, arguments);
				},
				metadata : {
					publicMethods : []
				}
			});

	/**
	 * Checks for an update of this binding's context. If the binding can be resolved and the bound
	 * context does not match the resolved path, a change event is fired; this event will always be
	 * asynchronous.
	 *
	 * @param {boolean} [bForceUpdate=false]
	 *   if <code>true</code> the change event is fired even if the value has not changed.
	 * @returns {Promise}
	 *   a Promise to be resolved when the check is finished
	 *
	 * @protected
	 */
	ODataContextBinding.prototype.checkUpdate = function (bForceUpdate) {
		var oPromise = Promise.resolve(),
			sResolvedPath = this.getModel().resolve(this.getPath(), this.getContext()),
			that = this;

		// works with oElementContext from ContextBinding which describes the resolved binding
		// (whereas oContext from Binding is the base if sPath is relative)
		if (!sResolvedPath
				|| (!bForceUpdate && this.oElementContext
					&& this.oElementContext.getPath() === sResolvedPath)) {
			return oPromise;
		}
		return oPromise.then(function () {
			// always fire asynchronously
			that.oElementContext = that.getModel().getContext(sResolvedPath);
			that._fireChange({reason: ChangeReason.Change});
		});
	};

	/**
	 * Sets the (base) context which is used when the binding path is relative. This triggers a
	 * {@link #checkUpdate} resulting in an asynchronous change event if the bound context changes.
	 * Dependent bindings then will react and also check for updates.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   the context which is required as base for a relative path
	 * @protected
	 */
	ODataContextBinding.prototype.setContext = function (oContext) {
		// only trigger an update if this context can change something
		if (this.oContext !== oContext) {
			this.oContext = oContext;
			if (this.isRelative()) {
				this.checkUpdate(false);
			}
		}
	};

	return ODataContextBinding;

}, /* bExport= */ true);
