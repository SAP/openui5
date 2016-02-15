/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataContextBinding
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ContextBinding",
	"./lib/_Cache",
	"./_Context",
	"./_ODataHelper"
], function (jQuery, ChangeReason, ContextBinding, Cache, _Context, Helper) {
	"use strict";

	/**
	 * DO NOT CALL this private constructor for a new <code>ODataContextBinding</code>,
	 * but rather use {@link sap.ui.model.odata.v4.ODataModel#bindContext bindContext} instead!
	 *
	 * @param {sap.ui.model.odata.v4.ODataModel} oModel
	 *   The OData v4 model
	 * @param {string} sPath
	 *   The binding path in the model; must not end with a slash
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @param {object} [mParameters]
	 *   Map of OData query options as specified in "OData Version 4.0 Part 2: URL Conventions".
	 *   The following query options are allowed:
	 *   <ul>
	 *   <li> All "5.2 Custom Query Options" except for those with a name starting with "sap-"
	 *   <li> The $expand and $select "5.1 System Query Options"
	 *   </ul>
	 *   All other query options lead to an error.
	 *   Query options specified for the binding overwrite model query options.
	 *   Note: Query options may only be provided for absolute binding paths as only those
	 *   lead to a data service request.
	 * @throws {Error} When disallowed OData query options are provided
	 * @class Context binding for an OData v4 model.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.model.odata.v4.ODataContextBinding
	 * @extends sap.ui.model.ContextBinding
	 * @public
	 */
	var ODataContextBinding = ContextBinding.extend("sap.ui.model.odata.v4.ODataContextBinding", {
			constructor : function (oModel, sPath, oContext, mParameters) {
				ContextBinding.call(this, oModel, sPath, oContext);

				if (sPath.slice(-1) === "/") {
					throw new Error("Invalid path: " + sPath);
				}
				this.oCache = undefined;
				if (!this.isRelative()) {
					this.oCache = Cache.createSingle(oModel.oRequestor, sPath.slice(1),
						Helper.buildQueryOptions(oModel.mUriParameters, mParameters,
							["$expand", "$select"]));
				} else if (mParameters) {
					throw new Error("Bindings with a relative path do not support parameters");
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
	 *   If <code>true</code> the change event is fired even if the value has not changed
	 * @returns {Promise}
	 *   A Promise to be resolved when the check is finished
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
			//TODO always fire asynchronously - why? "data changes can not change the context"?!
			//TODO find out if "change" relates to location or content; implement consistently in
			// context and list binding
			that.oElementContext = _Context.create(that.getModel(), that, sResolvedPath);
			that._fireChange({reason : ChangeReason.Change});
		});
	};

	/**
	 * Refreshes the binding. Prompts the model to retrieve data from the server and notifies the
	 * control that new data is available. <code>bForceUpdate</code> has to be <code>true</code>.
	 * If <code>bForceUpdate</code> is not given or <code>false</code>, an error is thrown.
	 * Refresh is supported for absolute bindings.
	 *
	 * @param {boolean} bForceUpdate
	 *   The parameter <code>bForceUpdate</code> has to be <code>true</code>.
	 * @throws {Error} When <code>bForceUpdate</code> is not given or <code>false</code>, refresh
	 *   on this binding is not supported
	 *
	 * @public
	 * @see sap.ui.model.Binding#refresh
	 */
	ODataContextBinding.prototype.refresh = function (bForceUpdate) {
		if (!bForceUpdate) {
			throw new Error("Falsy values for bForceUpdate are not supported");
		}
		if (!this.oCache) {
			throw new Error("Refresh on this binding is not supported");
		}
		this.oCache.refresh();
		this._fireChange();
	};

	/**
	 * Requests the value for the given path; the value is requested from this binding's
	 * cache or from its context in case it has no cache.
	 *
	 * @param {string} [sPath]
	 *   Some relative path
	 * @returns {Promise}
	 *   A promise on the outcome of the cache's <code>read</code> call
	 */
	ODataContextBinding.prototype.requestValue = function (sPath) {
		return this.oCache
			? this.oCache.read(sPath)
			: this.getContext().requestValue(this.getPath() + (sPath ? "/" + sPath : ""));
	};

	/**
	 * Sets the (base) context which is used when the binding path is relative.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @protected
	 */
	ODataContextBinding.prototype.setContext = function (oContext) {
		if (this.oContext !== oContext) {
			this.oContext = oContext;
			if (this.isRelative()) {
				throw new Error("Nested context bindings are not supported");
			}
		}
	};

	return ODataContextBinding;

}, /* bExport= */ true);
