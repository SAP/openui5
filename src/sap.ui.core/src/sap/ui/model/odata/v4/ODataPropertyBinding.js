/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataPropertyBinding
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/BindingMode",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/PropertyBinding",
	"./lib/_Cache",
	"./lib/_SyncPromise",
	"./ODataBinding"
], function (jQuery, BindingMode, ChangeReason, PropertyBinding, _Cache, _SyncPromise,
		asODataBinding) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataPropertyBinding",
		oDoFetchQueryOptionsPromise = _SyncPromise.resolve({}),
		mSupportedEvents = {
			AggregatedDataStateChange : true,
			change : true,
			dataReceived : true,
			dataRequested : true,
			DataStateChange : true
		};

	/**
	 * Do <strong>NOT</strong> call this private constructor, but rather use
	 * {@link sap.ui.model.odata.v4.ODataModel#bindProperty} instead!
	 *
	 * @param {sap.ui.model.odata.v4.ODataModel} oModel
	 *   The OData V4 model
	 * @param {string} sPath
	 *   The binding path in the model; must not end with a slash
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @param {object} [mParameters]
	 *   Map of binding parameters
	 * @throws {Error}
	 *   If disallowed binding parameters are provided
	 *
	 * @alias sap.ui.model.odata.v4.ODataPropertyBinding
	 * @author SAP SE
	 * @class Property binding for an OData V4 model.
	 *   An event handler can only be attached to this binding for the following events: 'change',
	 *   'dataReceived', and 'dataRequested'.
	 *   For unsupported events, an error is thrown.
	 * @extends sap.ui.model.PropertyBinding
	 * @mixes sap.ui.model.odata.v4.ODataBinding
	 * @public
	 * @since 1.37.0
	 * @version ${version}
	 * @borrows sap.ui.model.odata.v4.ODataBinding#hasPendingChanges as #hasPendingChanges
	 * @borrows sap.ui.model.odata.v4.ODataBinding#isInitial as #isInitial
	 * @borrows sap.ui.model.odata.v4.ODataBinding#refresh as #refresh
	 * @borrows sap.ui.model.odata.v4.ODataBinding#resetChanges as #resetChanges
	 * @borrows sap.ui.model.odata.v4.ODataBinding#resume as #resume
	 * @borrows sap.ui.model.odata.v4.ODataBinding#suspend as #suspend
	 */
	var ODataPropertyBinding
		= PropertyBinding.extend("sap.ui.model.odata.v4.ODataPropertyBinding", {
			constructor : function (oModel, sPath, oContext, mParameters) {
				var oBindingParameters;

				PropertyBinding.call(this, oModel, sPath);

				if (sPath.slice(-1) === "/") {
					throw new Error("Invalid path: " + sPath);
				}
				oBindingParameters = this.oModel.buildBindingParameters(mParameters, ["$$groupId"]);
				this.sGroupId = oBindingParameters.$$groupId;
				// Note: no system query options supported at property binding
				this.mQueryOptions = this.oModel.buildQueryOptions(mParameters,
					/*bSystemQueryOptionsAllowed*/false);
				this.oCachePromise = _SyncPromise.resolve();
				this.fetchCache(oContext);
				this.oContext = oContext;
				this.bInitial = true;
				this.bRequestTypeFailed = false;
				this.vValue = undefined;
				oModel.bindingCreated(this);
			},
			metadata : {
				publicMethods : []
			}
		});

	asODataBinding(ODataPropertyBinding.prototype);

	/**
	 * The 'change' event is fired when the binding is initialized or refreshed or its type is
	 * changed or its parent context is changed. It is to be used by controls to get notified about
	 * changes to the value of this property binding. Registered event handlers are called with the
	 * change reason as parameter.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @param {object} oEvent.getParameters
	 * @param {sap.ui.model.ChangeReason} oEvent.getParameters.reason
	 *   The reason for the 'change' event: {@link sap.ui.model.ChangeReason.Change} when the
	 *   binding is initialized, {@link sap.ui.model.ChangeReason.Refresh} when the binding is
	 *   refreshed, and {@link sap.ui.model.ChangeReason.Context} when the parent context is changed
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataPropertyBinding#change
	 * @public
	 * @see sap.ui.base.Event
	 * @since 1.37.0
	 */

	/**
	 * The 'dataRequested' event is fired directly after data has been requested from a back end.
	 * It is to be used by applications for example to switch on a busy indicator. Registered event
	 * handlers are called without parameters.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataPropertyBinding#dataRequested
	 * @public
	 * @see sap.ui.base.Event
	 * @since 1.37.0
	 */

	/**
	 * The 'dataReceived' event is fired after the back-end data has been processed and the
	 * registered 'change' event listeners have been notified. It is to be used by applications for
	 * example to switch off a busy indicator or to process an error.
	 *
	 * If back-end requests are successful, the event has no parameters. Use
	 * {@link #getValue() oEvent.getSource().getValue()} to access the response data. Note that
	 * controls bound to this data may not yet have been updated, meaning it is not safe for
	 * registered event handlers to access data via control APIs.
	 *
	 * If a back-end request fails, the 'dataReceived' event provides an <code>Error</code> in the
	 * 'error' event parameter.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @param {object} oEvent.getParameters
	 * @param {Error} [oEvent.getParameters.error] The error object if a back-end request failed.
	 *   If there are multiple failed back-end requests, the error of the first one is provided.
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataPropertyBinding#dataReceived
	 * @public
	 * @see sap.ui.base.Event
	 * @since 1.37.0
	 */

	// See class documentation
	// @override
	// @public
	// @see sap.ui.base.EventProvider#attachEvent
	// @since 1.37.0
	ODataPropertyBinding.prototype.attachEvent = function (sEventId) {
		if (!(sEventId in mSupportedEvents)) {
			throw new Error("Unsupported event '" + sEventId
				+ "': v4.ODataPropertyBinding#attachEvent");
		}
		return PropertyBinding.prototype.attachEvent.apply(this, arguments);
	};

	/**
	 * Updates the binding's value and sends a change event if necessary. A change event is sent
	 * if the <code>bForceUpdate</code> parameter is set to <code>true</code> or if the value
	 * has changed unless the request to read the new value has been cancelled by a later request.
	 * If a relative binding has no context the <code>bForceUpdate</code> parameter
	 * is ignored and the change event is only fired if the old value was not
	 * <code>undefined</code>.
	 * If the binding has no type, the property's type is requested from the meta model and set.
	 * Note: The change event is only sent asynchronously after reading the binding's value and
	 * type information.
	 * If the binding's path cannot be resolved or if reading the binding's value fails or if the
	 * value read is invalid (e.g. not a primitive value), the binding's value is reset to
	 * <code>undefined</code>. As described above, this may trigger a change event depending on the
	 * previous value and the <code>bForceUpdate</code> parameter.
	 *
	 * @param {boolean} [bForceUpdate=false]
	 *   If <code>true</code> the change event is always fired except there is no context for a
	 *   relative binding and the value is <code>undefined</code>.
	 * @param {sap.ui.model.ChangeReason} [sChangeReason=ChangeReason.Change]
	 *   The change reason for the change event
	 * @param {string} [sGroupId=getGroupId()]
	 *   The group ID to be used for the read.
	 * @returns {Promise}
	 *   A Promise to be resolved when the check is finished
	 *
	 * @private
	 * @see sap.ui.model.Binding#checkUpdate
	 */
	// @override
	ODataPropertyBinding.prototype.checkUpdate = function (bForceUpdate, sChangeReason, sGroupId) {
		var oChangeReason = {reason : sChangeReason || ChangeReason.Change},
			bDataRequested = false,
			bFire = false,
			mParametersForDataReceived,
			oPromise,
			aPromises = [],
			oReadPromise,
			sResolvedPath = this.oModel.resolve(this.sPath, this.oContext),
			that = this;

		if (!sResolvedPath) {
			oPromise = Promise.resolve();
			if (that.vValue !== undefined) {
				oPromise = oPromise.then(function () {
					that._fireChange(oChangeReason);
				});
			}
			that.vValue = undefined; // ensure value is reset
			return oPromise;
		}
		if (!this.bRequestTypeFailed && !this.oType && this.sInternalType !== "any") {
			// request type only once
			aPromises.push(this.oModel.getMetaModel().fetchUI5Type(sResolvedPath)
				.then(function (oType) {
					that.setType(oType, that.sInternalType);
				})["catch"](function (oError) {
					that.bRequestTypeFailed = true;
					jQuery.sap.log.warning(oError.message, sResolvedPath, sClassName);
				})
			);
		}
		oReadPromise = this.oCachePromise.then(function (oCache) {
			if (oCache) {
				sGroupId = sGroupId || that.getGroupId();
				return oCache.fetchValue(sGroupId, /*sPath*/undefined, function () {
					bDataRequested = true;
					that.fireDataRequested();
				}, that);
			}
			if (that.oContext.getIndex() === -2) {
				bForceUpdate = false; // no "change" event for virtual parent context
			}
			return that.oContext.fetchValue(that.sPath, that);
		});
		aPromises.push(oReadPromise.then(function (vValue) {
			if (vValue && typeof vValue === "object") {
				jQuery.sap.log.error("Accessed value is not primitive", sResolvedPath, sClassName);
				vValue = undefined;
			}
			bFire = that.vValue !== vValue;
			that.vValue = vValue;
		})["catch"](function (oError) {
			// do not rethrow, ManagedObject doesn't react on this either
			// throwing an exception would cause "Uncaught (in promise)" in Chrome
			that.oModel.reportError("Failed to read path " + sResolvedPath, sClassName, oError);
			if (!oError.canceled) {
				// fire change event only if error was not caused by refresh
				// and value was not undefined
				bFire = that.vValue !== undefined;
				mParametersForDataReceived = {error : oError};
				that.vValue = undefined;
			}
			return oError.canceled;
		}));

		return Promise.all(aPromises).then(function (aResults) {
			var bCanceled = aResults[aPromises.length - 1];

			if (!bCanceled) {
				that.bInitial = false;
				if (bForceUpdate || bFire) {
					that._fireChange(oChangeReason);
				}
			}
			if (bDataRequested) {
				that.fireDataReceived(mParametersForDataReceived);
			}
		});
	};

	/**
	 * Destroys the object. The object must not be used anymore after this function was called.
	 *
	 * @public
	 * @since 1.39.0
	 */
	// @override
	ODataPropertyBinding.prototype.destroy = function () {
		var that = this;

		this.oCachePromise.then(function (oCache) {
			if (oCache) {
				oCache.deregisterChange(undefined, that);
			} else if (that.oContext) {
				that.oContext.deregisterChange(that.sPath, that);
			}
		});
		this.oModel.bindingDestroyed(this);
		this.oCachePromise = undefined;
		PropertyBinding.prototype.destroy.apply(this, arguments);
	};

	/**
	 * Hook method for {@link ODataBinding#fetchCache} to create a cache for this binding with the
	 * given resource path and query options.
	 *
	 * @param {string} sResourcePath
	 *   The resource path, for example "EMPLOYEES('1')/Name"
	 * @param {object} mQueryOptions
	 *   The query options
	 * @returns {sap.ui.model.odata.v4.lib._Cache}
	 *   The new cache instance
	 *
	 * @private
	 */
	ODataPropertyBinding.prototype.doCreateCache = function (sResourcePath, mQueryOptions) {
		return _Cache.createProperty(this.oModel.oRequestor, sResourcePath, mQueryOptions);
	};

	/**
	 * Hook method for {@link ODataBinding#fetchUseOwnCache} to determine the query options for
	 * this binding.
	 *
	 * @returns {SyncPromise}
	 *   A promise resolving with an empty map as a property binding has no query options
	 *
	 * @private
	 */
	ODataPropertyBinding.prototype.doFetchQueryOptions = function () {
		return oDoFetchQueryOptionsPromise;
	};

	/**
	 * Returns the current value.
	 *
	 * @returns {any}
	 *   The current value
	 *
	 * @public
	 * @see sap.ui.model.PropertyBinding#getValue
	 * @since 1.37.0
	 */
	ODataPropertyBinding.prototype.getValue = function () {
		return this.vValue;
	};

	/**
	 * Determines which type of value list exists for this property.
	 *
	 * @returns {sap.ui.model.odata.v4.ValueListType}
	 *   The value list type
	 * @throws {Error}
	 *   If the binding is relative and has no context, if the metadata is not loaded yet or if the
	 *   property cannot be found in the metadata
	 *
	 * @public
	 * @since 1.45.0
	 */
	ODataPropertyBinding.prototype.getValueListType = function () {
		var sResolvedPath = this.getModel().resolve(this.sPath, this.oContext);

		if (!sResolvedPath) {
			throw new Error(this + " is not resolved yet");
		}
		return this.getModel().getMetaModel().getValueListType(sResolvedPath);
	};

	/**
	 * Change handler for the cache. The cache calls this method when the value is changed.
	 *
	 * @param {any} vValue
	 *   The new value
	 *
	 * @private
	 */
	ODataPropertyBinding.prototype.onChange = function (vValue) {
		this.vValue = vValue;
		this._fireChange({reason : ChangeReason.Change});
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#refreshInternal
	 */
	ODataPropertyBinding.prototype.refreshInternal = function (sGroupId, bCheckUpdate) {
		this.fetchCache(this.oContext);
		if (bCheckUpdate) {
			this.checkUpdate(true, ChangeReason.Refresh, sGroupId);
		}
	};

	/**
	 * Requests information to retrieve a value list for this property.
	 *
	 * @returns {Promise}
	 *   A promise which is resolved with a map of qualifier to value list mapping objects
	 *   structured as defined by <code>com.sap.vocabularies.Common.v1.ValueListMappingType</code>;
	 *   the map entry with key "" represents the mapping without qualifier. Each entry has an
	 *   additional property "$model" which is the {@link sap.ui.model.odata.v4.ODataModel} instance
	 *   to read value list data via this mapping.
	 *
	 *   For fixed values, only one mapping is expected and the qualifier is ignored. The mapping
	 *   is available with key "".
	 *
	 *   The promise is rejected with an error if there is no value list information available
	 *   for this property. Use {@link #getValueListType} to determine if value list information
	 *   exists. It is also rejected with an error if the value list metadata is inconsistent.
	 *
	 *   An inconsistency can result from one of the following reasons:
	 *   <ul>
	 *    <li> There is a reference, but the referenced service does not contain mappings for the
	 *     property.
	 *    <li> The referenced service contains annotation targets in the namespace of the data
	 *     service that are not mappings for the property.
	 *    <li> Two different referenced services contain a mapping using the same qualifier.
	 *    <li> A service is referenced twice.
	 *    <li> No mappings have been found.
	 *   </ul>
	 * @throws {Error}
	 *   If the binding is relative and has no context
	 *
	 * @public
	 * @since 1.45.0
	 */
	ODataPropertyBinding.prototype.requestValueListInfo = function () {
		var sResolvedPath = this.getModel().resolve(this.sPath, this.oContext);

		if (!sResolvedPath) {
			throw new Error(this + " is not resolved yet");
		}
		return this.getModel().getMetaModel().requestValueListInfo(sResolvedPath);
	};

	/**
	 * Determines which type of value list exists for this property.
	 *
	 * @returns {Promise}
	 *   A promise that is resolved with the type of the value list. It is rejected if the property
	 *   cannot be found in the metadata.
	 * @throws {Error}
	 *   If the binding is relative and has no context
	 *
	 * @public
	 * @since 1.47.0
	 */
	ODataPropertyBinding.prototype.requestValueListType = function () {
		var sResolvedPath = this.getModel().resolve(this.sPath, this.oContext);

		if (!sResolvedPath) {
			throw new Error(this + " is not resolved yet");
		}
		return this.getModel().getMetaModel().requestValueListType(sResolvedPath);
	};

	/**
	 * A method to reset invalid data state, to be called by
	 * {@link sap.ui.model.odata.v4.ODataBinding#resetChanges}.
	 * Fires a change event if the data state is invalid to ensure that invalid user input, having
	 * not passed the validation, is also reset.
	 *
	 * @private
	 */
	ODataPropertyBinding.prototype.resetInvalidDataState = function () {
		if (this.getDataState().isControlDirty()) {
			this._fireChange({reason : ChangeReason.Change});
		}
	};

	/**
	 * Sets the (base) context if the binding path is relative. Triggers (@link #fetchCache) to
	 * create a cache and {@link #checkUpdate} to check for the current value if the
	 * context has changed. In case of absolute bindings nothing is done.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 *
	 * @private
	 * @see sap.ui.model.Binding#setContext
	 */
	// @override
	ODataPropertyBinding.prototype.setContext = function (oContext) {
		if (this.oContext !== oContext) {
			if (this.bRelative && this.oContext && this.oContext.deregisterChange) {
				this.oContext.deregisterChange(this.sPath, this);
			}
			this.oContext = oContext;
			if (this.bRelative) {
				this.fetchCache(this.oContext);
				this.checkUpdate(false, ChangeReason.Context);
			}
		}
	};

	/**
	 * Sets the optional type and internal type for this binding; used for formatting and parsing.
	 * Fires a change event if the type has changed.
	 *
	 * @param {sap.ui.model.Type} oType
	 *   The type for this binding
	 * @param {string} sInternalType
	 *   The internal type of the element property which owns this binding, for example "any",
	 *   "boolean", "float", "int", "string"; see {@link sap.ui.model.odata.type} for more
	 *   information
	 *
	 * @public
	 * @since 1.43.0
	 * @see sap.ui.model.PropertyBinding#setType
	 */
	// @override
	ODataPropertyBinding.prototype.setType = function (oType) {
		var oOldType = this.oType;

		if (oType && oType.getName() === "sap.ui.model.odata.type.DateTimeOffset") {
			oType.setV4();
		}
		PropertyBinding.prototype.setType.apply(this, arguments);
		if (!this.bInitial && oOldType !== oType) {
			this._fireChange({reason : ChangeReason.Change});
		}
	};

	/**
	 * Sets the new current value and updates the cache.
	 *
	 * @param {any} vValue
	 *   The new value which must be primitive
	 * @param {string} [sGroupId]
	 *   The group ID to be used for this update call; if not specified, the update group ID for
	 *   this binding (or its relevant parent binding) is used, see
	 *   {@link sap.ui.model.odata.v4.ODataPropertyBinding#constructor}.
	 *   Valid values are <code>undefined</code>, '$auto', '$direct' or application group IDs as
	 *   specified in {@link sap.ui.model.odata.v4.ODataModel#submitBatch}.
	 * @throws {Error}
	 *   If the new value is not primitive or the binding is not relative
	 *
	 * @public
	 * @see sap.ui.model.PropertyBinding#setValue
	 * @since 1.37.0
	 */
	ODataPropertyBinding.prototype.setValue = function (vValue, sGroupId) {
		var that = this;

		function reportError(oError) {
			that.oModel.reportError("Failed to update path "
				+ that.oModel.resolve(that.sPath, that.oContext),
				sClassName, oError);
		}

		if (typeof vValue === "function" || typeof vValue === "object") {
			throw new Error("Not a primitive value");
		}
		this.oModel.checkGroupId(sGroupId);

		if (this.vValue !== vValue) {
			this.oCachePromise.then(function (oCache) {
				if (oCache) {
					jQuery.sap.log.error("Cannot set value on this binding",
						that.oModel.resolve(that.sPath, that.oContext), sClassName);
					// do not update that.vValue!
				} else if (that.oContext) {
					that.oContext.updateValue(sGroupId, that.sPath, vValue, reportError)
					["catch"](function () {
						// updateValue is only rejected when the PATCH was canceled
						// Avoid "Uncaught (in promise)"
					});
				} else {
					jQuery.sap.log.warning("Cannot set value on relative binding without context",
						that.sPath, sClassName);
					// do not update that.vValue!
				}
			});
		}
	};

	/**
	 * Returns a string representation of this object including the binding path. If the binding is
	 * relative, the parent path is also given, separated by a '|'.
	 *
	 * @return {string} A string description of this binding
	 * @public
	 * @since 1.37.0
	 */
	ODataPropertyBinding.prototype.toString = function () {
		return sClassName + ": " + (this.bRelative ? this.oContext + "|" : "") + this.sPath;
	};

	return ODataPropertyBinding;
}, /* bExport= */ true);
