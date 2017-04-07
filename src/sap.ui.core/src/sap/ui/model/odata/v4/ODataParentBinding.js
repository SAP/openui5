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

	var sClassName = "sap.ui.model.odata.v4.ODataParentBinding";

	/**
	 * Changes this binding's parameters and refreshes the binding.
	 *
	 * If there are pending changes an error is thrown. Use {@link #hasPendingChanges} to check if
	 * there are pending changes. If there are changes, call
	 * {@link sap.ui.model.odata.v4.ODataModel#submitBatch} to submit the changes or
	 * {@link sap.ui.model.odata.v4.ODataModel#resetChanges} to reset the changes before calling
	 * {@link #changeParameters}.
	 *
	 * The parameters are changed according to the given map of parameters: Parameters with an
	 * <code>undefined</code> value are removed, the other parameters are set, and missing
	 * parameters remain unchanged.
	 *
	 * @param {object} mParameters
	 *   Map of binding parameters, see {@link sap.ui.model.odata.v4.ODataModel#bindList} and
	 *   {@link sap.ui.model.odata.v4.ODataModel#bindContext}
	 * @throws {Error}
	 *   If there are pending changes or if <code>mParameters</code> is missing,
	 *   contains binding-specific or unsupported parameters, or contains unsupported values.
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
		if (this.hasPendingChanges()) {
			throw new Error("Cannot change parameters due to pending changes");
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

	/*
	 * Checks dependent bindings for updates or refreshes the binding if the canonical path of its
	 * parent context changed.
	 *
	 * @throws {Error} If called with parameters
	 */
	// @override
	ODataParentBinding.prototype.checkUpdate = function () {
		var that = this;

		function updateDependents() {
			// Do not fire a change event in ListBinding, there is no change in the list of contexts
			// Skip bindings that have been created via ODataListBinding#create: context with index
			// -1 does not exist any more after a refresh and updates via cache directly notify the
			// bindings
			that.oModel.getDependentBindings(that, true).forEach(function (oDependentBinding) {
				oDependentBinding.checkUpdate();
			});
		}

		if (arguments.length > 0) {
			throw new Error("Unsupported operation: " + sClassName + "#checkUpdate must not be"
				+ " called with parameters");
		}

		this.oCachePromise.then(function (oCache) {
			if (oCache && that.bRelative && that.oContext.fetchCanonicalPath) {
				that.oContext.fetchCanonicalPath().then(function (sCanonicalPath) {
					// entity of context changed
					if (oCache.$canonicalPath !== sCanonicalPath) {
						that.refreshInternal();
					} else {
						updateDependents();
					}
				})["catch"](function (oError) {
					that.oModel.reportError("Failed to update " + that, sClassName, oError);
				});
			} else {
				updateDependents();
			}
		});
	};

	/**
	 * Creates the entity in the cache. If the binding doesn't have a cache, it forwards to the
	 * parent binding adjusting <code>sPathInCache</code>.
	 *
	 * @param {string} sUpdateGroupId
	 *   The group ID to be used for the POST request
	 * @param {string|SyncPromise} vCreatePath
	 *   The path for the POST request or a SyncPromise that resolves with that path
	 * @param {string} sPathInCache
	 *   The path within the cache where to create the entity
	 * @param {object} oInitialData
	 *   The initial data for the created entity
	 * @param {function} fnCancelCallback
	 *   A function which is called after a transient entity has been canceled from the cache
	 * @returns {SyncPromise}
	 *   The create Promise which is resolved without data when the POST request has been
	 *   successfully sent and the entity has been marked as non-transient
	 *
	 * @private
	 */
	ODataParentBinding.prototype.createInCache = function (sUpdateGroupId, vCreatePath,
			sPathInCache, oInitialData, fnCancelCallback) {
		var that = this;

		return this.oCachePromise.then(function (oCache) {
			if (oCache) {
				return oCache.create(sUpdateGroupId, vCreatePath, sPathInCache, oInitialData,
					fnCancelCallback, function (oError) {
						// error callback
						that.oModel.reportError("POST on '" + vCreatePath
								+ "' failed; will be repeated automatically",
							"sap.ui.model.odata.v4.ODataParentBinding", oError);
				});
			}
			return that.oContext.getBinding().createInCache(sUpdateGroupId, vCreatePath,
				_Helper.buildPath(that.oContext.iIndex, that.sPath, sPathInCache), oInitialData,
				fnCancelCallback);
		});
	};

	/**
	 * Creates the query options for a child binding with the meta path given by its base
	 * meta path and relative meta path. Requires that meta data for the meta path is already
	 * loaded so that synchronous access to all prefixes of the relative meta path is possible.
	 * If the relative meta path contains segments which are not a structural property or a
	 * navigation property, the child query options cannot be created and the method returns
	 * undefined.
	 *
	 * @param {string} sBaseMetaPath The meta path which is the starting point for the relative
	 *   meta path
	 * @param {string} sChildMetaPath The relative meta path
	 *
	 * @returns {object} The query options for the child binding or undefined in case the query
	 *   options cannot be created
	 *
	 * @private
	 */
	ODataParentBinding.prototype.createChildQueryOptions = function (sBaseMetaPath,
			sChildMetaPath) {
		var sExpandSelectPath = "",
			i,
			aMetaPathSegments = sChildMetaPath.split("/"),
			oMetaModel = this.oModel.oMetaModel,
			oProperty,
			sPropertyMetaPath = sBaseMetaPath,
			mQueryOptions = {},
			mQueryOptionsForPathPrefix = mQueryOptions;

		if (sChildMetaPath === "") {
			return {};
		}

		for (i = 0; i < aMetaPathSegments.length; i += 1) {
			sPropertyMetaPath = _Helper.buildPath(sPropertyMetaPath, aMetaPathSegments[i]);
			sExpandSelectPath = _Helper.buildPath(sExpandSelectPath, aMetaPathSegments[i]);
			oProperty = oMetaModel.getObject(sPropertyMetaPath);
			if (oProperty.$kind === "NavigationProperty") {
				mQueryOptionsForPathPrefix.$expand = {};
				mQueryOptionsForPathPrefix = mQueryOptionsForPathPrefix.$expand[sExpandSelectPath]
					= {};
				sExpandSelectPath = "";
			} else if (oProperty.$kind !== "Property") {
				return undefined;
			}
		}
		if (oProperty.$kind === "Property") {
			mQueryOptionsForPathPrefix.$select = [sExpandSelectPath];
		}
		return mQueryOptions;
	};

	/**
	 * Deletes the entity in the cache. If the binding doesn't have a cache, it forwards to the
	 * parent binding adjusting the path.
	 *
	 * @param {string} sGroupId
	 *   The group ID to be used for the DELETE request
	 * @param {string} sEditUrl
	 *   The edit URL to be used for the DELETE request
	 * @param {string} sPath
	 *   The path of the entity relative to this binding
	 * @param {function} fnCallback
	 *   A function which is called after the entity has been deleted from the server and from the
	 *   cache; the index of the entity is passed as parameter
	 * @returns {SyncPromise}
	 *   A promise which is resolved without a result in case of success, or rejected with an
	 *   instance of <code>Error</code> in case of failure
	 * @throws {Error}
	 *   If this binding is a deferred operation binding, if the group ID is neither '$auto'
	 *   nor '$direct' or if the cache promise for this binding is not yet fulfilled
	 *
	 * @private
	 */
	ODataParentBinding.prototype.deleteFromCache = function (sGroupId, sEditUrl, sPath,
			fnCallback) {
		var oCache = this.oCachePromise.getResult();

		if (this.oOperation) {
			throw new Error("Cannot delete a deferred operation");
		}

		if (!this.oCachePromise.isFulfilled()) {
			throw new Error("DELETE request not allowed");
		}

		if (oCache) {
			sGroupId = sGroupId || this.getUpdateGroupId();
			if (sGroupId !== "$auto" && sGroupId !== "$direct") {
				throw new Error("Illegal update group ID: " + sGroupId);
			}
			return oCache._delete(sGroupId, sEditUrl, sPath, fnCallback);
		}
		return this.oContext.getBinding().deleteFromCache(sGroupId, sEditUrl,
			_Helper.buildPath(this.oContext.iIndex, this.sPath, sPath), fnCallback);
	};

	/**
	 * Determines whether a child binding with the given context and path can use
	 * the cache of this binding or one of its ancestor bindings. If this is the case, enhances
	 * the aggregated query options of this binding with the query options computed from the child
	 * binding's path; the aggregated query options initially hold the binding's local query
	 * options.
	 *
	 * @param {sap.ui.model.Context} oContext The child binding's context
	 * @param {string} sChildPath The child binding's binding path
	 * @returns {SyncPromise} A promise resolved with a boolean value indicating whether the child
	 *   binding can use this binding's or an ancestor binding's cache.
	 *
	 * @private
	 */
	ODataParentBinding.prototype.fetchIfChildCanUseCache = function (oContext, sChildPath) {
		var sBaseMetaPath,
			oCanUseCachePromise,
			sChildMetaPath,
			aPromises,
			that = this;

		// Cache is not yet created
		sBaseMetaPath = this.oModel.oMetaModel.getMetaPath(oContext.getPath());
		sChildMetaPath = this.oModel.oMetaModel.getMetaPath("/" + sChildPath).slice(1);
		aPromises = [
			this.doFetchQueryOptions(this.oContext),
			// After access to complete meta path of property, the metadata of all prefix paths
			// is loaded so that synchronous access in createChildQueryOptions via getObject is
			// possible
			this.oModel.oMetaModel.fetchObject(_Helper.buildPath(sBaseMetaPath, sChildMetaPath))
		];
		oCanUseCachePromise = _SyncPromise.all(aPromises).then(function (aResult) {
			var mChildQueryOptions,
				mLocalQueryOptions = aResult[0],
				oProperty = aResult[1];

			// this.mAggregatedQueryOptions contains the aggregated query options of all child
			// bindings which can use the cache of this binding or an ancestor binding merged
			// with this binding's local query options
			that.mAggregatedQueryOptions = that.mAggregatedQueryOptions ||
				jQuery.extend(true, {}, mLocalQueryOptions);
			if (oProperty && (oProperty.$kind === "Property"
					|| oProperty.$kind === "NavigationProperty")) {
				mChildQueryOptions = that.createChildQueryOptions(sBaseMetaPath, sChildMetaPath);
				if (mChildQueryOptions){
					that.mergeChildQueryOptions(mChildQueryOptions);
					return true;
				}
				return false;
			}
			jQuery.sap.log.error("Failed to enhance query options for "
					+ "auto-$expand/$select as the child binding's path '"
					+  sChildPath
					+ "' does not point to a property",
				JSON.stringify(oProperty),
				"sap.ui.model.odata.v4.ODataParentBinding");
			return false;
		});
		that.aChildCanUseCachePromises.push(oCanUseCachePromise);
		return oCanUseCachePromise;
	};

	/**
	 * Returns a promise on the binding's query options. In auto-$expand/$select mode the $select is
	 * enriched with the key properties if there was a $select before.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context instance to be used
	 * @returns {SyncPromise}
	 *   A promise resolving with the binding's query options
	 *
	 * @private
	 */
	ODataParentBinding.prototype.fetchQueryOptionsWithKeys = function (oContext) {
		var oMetaModel,
			sMetaPath,
			sResolvedPath = this.oModel.resolve(this.sPath, oContext),
			that = this;

		if (!sResolvedPath || !this.oModel.bAutoExpandSelect) {
			return _SyncPromise.resolve(this.mQueryOptions);
		}
		oMetaModel = this.oModel.getMetaModel();
		sMetaPath = oMetaModel.getMetaPath(sResolvedPath);
		return oMetaModel.fetchObject(sMetaPath + "/").then(function (oType) {
			var aSelect = that.mQueryOptions && that.mQueryOptions.$select;

			if (aSelect && oType.$Key) {
				oType.$Key.forEach(function (sKey) {
					if (aSelect.indexOf(sKey) < 0) {
						aSelect.push(sKey);
					}
				});
			}
			return that.mQueryOptions;
		});
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
			// getMetaPath needs an absolute path, a relative path starting with an index would not
			// result in a correct meta path -> first add, then remove '/'
			this.oModel.oMetaModel.getMetaPath("/" + sPath).slice(1)
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
	 * Merges the given child query options into this binding's aggregated query options.
	 *
	 * Note: * is an item in $select and $expand just as others, that is it must be part of the
	 * array of items and one must not ignore the other items if * is provided. See
	 * "5.1.2 System Query Option $expand" and "5.1.3 System Query Option $select" in specification
	 * "OData Version 4.0 Part 2: URL Conventions".
	 *
	 * @param {object} mChildQueryOptions The map of child query options
	 *
	 * @private
	 */
	ODataParentBinding.prototype.mergeChildQueryOptions = function (mChildQueryOptions) {
		/*
		 * Recursively merges the given query options into the given aggregated query options.
		 */
		function merge(mAggregatedQueryOptions, mQueryOptions) {
			var mExpandChild,
				aSelectChild;

			mExpandChild = mQueryOptions && mQueryOptions.$expand;
			if (mExpandChild) {
				mAggregatedQueryOptions.$expand = mAggregatedQueryOptions.$expand || {};
				Object.keys(mExpandChild).forEach(function (sExpandPath) {
					if (mAggregatedQueryOptions.$expand[sExpandPath]) {
						merge(mAggregatedQueryOptions.$expand[sExpandPath],
							mQueryOptions.$expand[sExpandPath]);
					} else {
						mAggregatedQueryOptions.$expand[sExpandPath] = mExpandChild[sExpandPath];
					}
				});
			}
			aSelectChild = mQueryOptions && mQueryOptions.$select;
			if (aSelectChild) {
				mAggregatedQueryOptions.$select = mAggregatedQueryOptions.$select || [];
				aSelectChild.forEach(function (sSelectPath) {
					if (mAggregatedQueryOptions.$select.indexOf(sSelectPath) < 0) {
						mAggregatedQueryOptions.$select.push(sSelectPath);
					}
				});
			}
		}

		merge(this.mAggregatedQueryOptions, mChildQueryOptions);
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
