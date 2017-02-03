/*!
 * ${copyright}
 */

//Provides mixin sap.ui.model.odata.v4.ODataParentBinding for classes extending sap.ui.model.Binding
//with dependent bindings
sap.ui.define([
	"sap/ui/model/ChangeReason",
	"./ODataBinding",
	"./lib/_Helper",
	"./lib/_SyncPromise"
], function (ChangeReason, asODataBinding, _Helper, _SyncPromise) {
	"use strict";

	/**
	 * A mixin for all OData V4 bindings with dependent bindings.
	 *
	 * @alias sap.ui.model.odata.v4.ODataParentBinding
	 * @extends sap.ui.model.odata.v4.ODataBinding
	 * @mixin
	 */
	function ODataParentBinding() {}

	asODataBinding(ODataParentBinding.prototype);

	// regular expression converting path to metadata path
	var rNotMetaContext = /\([^/]*|\/\d+|^\d+\//g;

	/**
	 * Changes this binding's parameters and refreshes the binding. The parameters are changed
	 * according to the given map of parameters: Parameters with an <code>undefined</code> value are
	 * removed, the other parameters are set, and missing parameters remain unchanged.
	 *
	 * @param {object} mParameters
	 *   Map of binding parameters, see {@link sap.ui.model.odata.v4.ODataModel#bindList} and
	 *   {@link sap.ui.model.odata.v4.ODataModel#bindContext}
	 * @throws {Error}
	 *   If <code>mParameters</code> is missing, contains binding-specific or unsupported
	 *   parameters, or contains unsupported values.
	 *
	 * @public
	 * @since 1.45.0
	 */
	ODataParentBinding.prototype.changeParameters = function (mParameters) {
		var mBindingParameters = jQuery.extend(true, {}, this.mParameters),
			bChanged = false,
			sKey;

		if (!mParameters) {
			throw new Error("Missing map of binding parameters");
		}

		for (sKey in mParameters) {
			if (sKey.indexOf("$$") === 0) {
				throw new Error("Unsupported parameter: " + sKey);
			}
			if (mParameters[sKey] === undefined && mBindingParameters[sKey] !== undefined) {
				delete mBindingParameters[sKey];
				bChanged = true;
			} else if (mBindingParameters[sKey] !== mParameters[sKey]) {
				if (typeof mParameters[sKey] === "object") {
					mBindingParameters[sKey] = jQuery.extend(true, {}, mParameters[sKey]);
				} else {
					mBindingParameters[sKey] = mParameters[sKey];
				}
				bChanged = true;
			}
		}

		if (bChanged) {
			this.applyParameters(mBindingParameters, ChangeReason.Change);
		}
	};

	/**
	 * Returns the query options for the given path relative to this binding. Uses the options
	 * resulting from the binding parameters or the options inherited from the parent binding by
	 * using {@link Context#getQueryOptionsForPath}.
	 *
	 * @param {string} sPath
	 *   The relative path for which the query options are requested
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context that is used to compute the inherited query options; only relevant for the
	 *   call from ODataListBinding#doCreateCache as this.oContext might not yet be set
	 * @returns {object}
	 *   The computed query options
	 *
	 * @private
	 */
	ODataParentBinding.prototype.getQueryOptionsForPath = function (sPath, oContext) {
		var mQueryOptions;

		if (Object.keys(this.mParameters).length) {
			// binding has parameters -> all query options need to be defined at the binding
			mQueryOptions = this.mQueryOptions;
			sPath.replace(rNotMetaContext, "") // transform path to metadata path
				.split("/").some(function (sSegment) {
					mQueryOptions = mQueryOptions.$expand && mQueryOptions.$expand[sSegment];
					if (!mQueryOptions || mQueryOptions === true) {
						mQueryOptions = {};
						return true;
					}
				});
			return jQuery.extend(true, {}, mQueryOptions);
		}

		oContext = oContext || this.oContext;
		// oContext is always set; as getQueryOptionsForPath is called only from ODLB#doCreateCache
		// binding has no parameters -> no own query options
		if (!this.bRelative || !oContext.getQueryOptionsForPath) {
			// absolute or quasi-absolute -> no inheritance and no query options -> no options
			return {};
		}
		return oContext.getQueryOptionsForPath(_Helper.buildPath(this.sPath, sPath));
	};

	/**
	 * Initializes the OData list binding. Fires a 'change' event in case the binding has a
	 * resolved path.
	 *
	 * @protected
	 * @see sap.ui.model.Binding#initialize
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#initialize
	ODataParentBinding.prototype.initialize = function () {
		if (!this.bRelative || this.oContext) {
			this._fireChange({reason : ChangeReason.Change});
		}
	};

	/**
	 * Updates the value for the given property name inside the entity with the given relative path;
	 * the value is updated in this binding's cache or in its parent context in case it has no
	 * cache.
	 *
	 * @param {string} [sGroupId=getUpdateGroupId()]
	 *   The group ID to be used for this update call.
	 * @param {string} sPropertyName
	 *   Name of property to update
	 * @param {any} vValue
	 *   The new value
	 * @param {string} sEditUrl
	 *   The edit URL for the entity which is updated
	 * @param {string} [sPath]
	 *   Some relative path
	 * @returns {SyncPromise}
	 *   A promise on the outcome of the cache's <code>update</code> call
	 * @throws {Error}
	 *   If the cache promise for this binding is not yet fulfilled
	 *
	 * @private
	 */
	ODataParentBinding.prototype.updateValue = function (sGroupId, sPropertyName, vValue, sEditUrl,
			sPath) {
		var oCache;

		if (!this.oCachePromise.isFulfilled()) {
			throw new Error("PATCH request not allowed");
		}

		oCache = this.oCachePromise.getResult();
		if (oCache) {
			sGroupId = sGroupId || this.getUpdateGroupId();
			return oCache.update(sGroupId, sPropertyName, vValue, sEditUrl, sPath);
		}

		return this.oContext.updateValue(sGroupId, sPropertyName, vValue, sEditUrl,
			_Helper.buildPath(this.sPath, sPath));
	};

	return function (oPrototype) {
		jQuery.extend(oPrototype, ODataParentBinding.prototype);
	};

}, /* bExport= */ false);
