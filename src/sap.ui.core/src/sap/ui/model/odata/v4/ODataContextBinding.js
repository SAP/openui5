/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataContextBinding
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ContextBinding",
	"sap/ui/model/odata/v4/lib/_Cache"
], function (jQuery, ChangeReason, ContextBinding, Cache) {
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
	 * @param {number} iIndex
	 *   the index of this context binding in the array of root bindings kept by the model, see
	 *   {@link sap.ui.model.odata.v4.ODataModel#bindContext bindContext}
	 * @class Context binding for an OData v4 model
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
				constructor : function (oModel, sPath, oContext, iIndex, mParameters) {
					var bAbsolute = sPath.charAt(0) === "/",
						sBindingPath = bAbsolute ? sPath + ";root=" + iIndex : sPath;

					ContextBinding.call(this, oModel, sBindingPath, oContext, mParameters);
					if (bAbsolute) {
						this.oCache = Cache.createSingle(oModel.oRequestor,
							oModel.sServiceUrl + oModel.resolve(sPath, oContext).slice(1),
							oModel.mUriParameters);
					}
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
	 * Returns a promise to read the value for the given path in the context binding.
	 *
	 * @param {string} sPath
	 *   the relative path to the property
	 * @param {boolean} bAllowObjectAccess
	 *   whether access to whole objects is allowed
	 * @return {Promise}
	 *   the promise which is resolved with the value, e.g. <code>"foo"</code> for simple
	 *   properties, <code>[...]</code> for collections and <code>{"foo" : "bar", ...}</code> for
	 *   objects
	 * @private
	 */
	ODataContextBinding.prototype.readValue = function (sPath, bAllowObjectAccess) {
		var that = this;

		return new Promise(function (fnResolve, fnReject) {
			function message() {
				return "Failed to read value for "
					//TODO use oModel.mUriParameters
					+ that.getModel().sServiceUrl + that.getPath().slice(1).split(";root=")[0]
					+ " and path " + sPath;
			}

			function reject(oError) {
				jQuery.sap.log.error(message(), oError,
					"sap.ui.model.odata.v4.ODataContextBinding");
				fnReject(oError);
			}

			that.oCache.read().then(function (oData) {
				if (sPath) {
					sPath.split("/").every(function (sSegment) { //TODO refactor to Helper.foo?
						if (!oData) {
							jQuery.sap.log.warning(message() + ": Invalid segment " + sSegment,
								null, "sap.ui.model.odata.v4.ODataContextBinding");
							return false;
						}
						oData = oData[sSegment];
						return true;
					});
				}
				if (!bAllowObjectAccess && oData && typeof oData === "object") {
					reject(new Error("Accessed value is not primitive"));
					return;
				}
				fnResolve(oData);
			}, reject);
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
				// TODO not tested
				this.checkUpdate(false);
			}
		}
	};

	return ODataContextBinding;

}, /* bExport= */ true);
