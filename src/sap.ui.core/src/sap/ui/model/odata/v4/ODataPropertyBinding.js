/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataPropertyBinding
sap.ui.define([
	"./Context",
	"./ODataBinding",
	"./lib/_Cache",
	"./lib/_Helper",
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/BindingMode",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/PropertyBinding"
], function (Context, asODataBinding, _Cache, _Helper, Log, SyncPromise, BindingMode, ChangeReason,
		PropertyBinding) {
	"use strict";
	/*eslint max-nested-callbacks: 0 */

	var sClassName = "sap.ui.model.odata.v4.ODataPropertyBinding",
		aImmutableEmptyArray = Object.freeze([]),
		mSupportedEvents = {
			AggregatedDataStateChange : true,
			change : true,
			dataReceived : true,
			dataRequested : true,
			DataStateChange : true
		},
		sVirtualPath = "/" + Context.VIRTUAL, // a snippet indicating a virtual path
		/**
		 * @alias sap.ui.model.odata.v4.ODataPropertyBinding
		 * @author SAP SE
		 * @class Property binding for an OData V4 model.
		 *   An event handler can only be attached to this binding for the following events:
		 *   'AggregatedDataStateChange', 'change', 'dataReceived', 'dataRequested' and
		 *   'DataStateChange'. For unsupported events, an error is thrown.
		 * @extends sap.ui.model.PropertyBinding
		 * @hideconstructor
		 * @mixes sap.ui.model.odata.v4.ODataBinding
		 * @public
		 * @since 1.37.0
		 * @version ${version}
		 * @borrows sap.ui.model.odata.v4.ODataBinding#getGroupId as #getGroupId
		 * @borrows sap.ui.model.odata.v4.ODataBinding#getRootBinding as #getRootBinding
		 * @borrows sap.ui.model.odata.v4.ODataBinding#getUpdateGroupId as #getUpdateGroupId
		 * @borrows sap.ui.model.odata.v4.ODataBinding#hasPendingChanges as #hasPendingChanges
		 * @borrows sap.ui.model.odata.v4.ODataBinding#isInitial as #isInitial
		 * @borrows sap.ui.model.odata.v4.ODataBinding#refresh as #refresh
		 * @borrows sap.ui.model.odata.v4.ODataBinding#requestRefresh as #requestRefresh
		 * @borrows sap.ui.model.odata.v4.ODataBinding#resetChanges as #resetChanges
		 * @borrows sap.ui.model.odata.v4.ODataBinding#toString as #toString
		 */
		ODataPropertyBinding
			= PropertyBinding.extend("sap.ui.model.odata.v4.ODataPropertyBinding", {
				constructor : constructor
			});

	//*********************************************************************************************
	// ODataPropertyBinding
	//*********************************************************************************************

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
	 */
	function constructor(oModel, sPath, oContext, mParameters) {
		PropertyBinding.call(this, oModel, sPath);
		// initialize mixin members
		asODataBinding.call(this);

		if (sPath.endsWith("/")) {
			throw new Error("Invalid path: " + sPath);
		}
		this.mScope = undefined;
		if (mParameters) {
			if (typeof mParameters.scope === "object") {
				this.mScope = mParameters.scope;
				mParameters = {...mParameters};
				delete mParameters.scope;
			}
			this.checkBindingParameters(mParameters,
				["$$groupId", "$$ignoreMessages", "$$noPatch"]);
			this.sGroupId = mParameters.$$groupId;
			this.bNoPatch = mParameters.$$noPatch;
			this.setIgnoreMessages(mParameters.$$ignoreMessages);
		} else {
			this.sGroupId = undefined;
			this.bNoPatch = false;
		}
		if (this.sPath === "@$ui5.context.isSelected") {
			this.bNoPatch = true;
		}
		this.oCheckUpdateCallToken = undefined;
		this.oContext = oContext;
		this.bHasDeclaredType = undefined; // whether the binding info declares a type
		this.bInitial = true;
		// Note: system query options supported at property binding only for ".../$count"
		this.mQueryOptions = this.oModel.buildQueryOptions(_Helper.clone(mParameters),
			/*bSystemQueryOptionsAllowed*/sPath.endsWith("$count"));
		this.vValue = undefined;
		// BEWARE: #doFetchOrGetQueryOptions uses #isRoot which relies on this.oContext!
		this.fetchCache(oContext);
		oModel.bindingCreated(this);
	}

	asODataBinding(ODataPropertyBinding.prototype);

	/**
	 * The 'change' event is fired when the binding is initialized or refreshed or its type is
	 * changed or its parent context is changed. It is to be used by controls to get notified about
	 * changes to the value of this property binding. Registered event handlers are called with the
	 * change reason as parameter.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 *    The event object
	 * @param {function():Object<any>} oEvent.getParameters
	 *   Function which returns an object containing all event parameters
	 * @param {sap.ui.model.ChangeReason} oEvent.getParameters.reason
	 *   The reason for the 'change' event could be
	 *   <ul>
	 *     <li> {@link sap.ui.model.ChangeReason.Change Change} when the binding is initialized,
	 *       when it gets a new type via {@link #setType}, or when the data state is reset via
	 *       {@link sap.ui.model.odata.v4.ODataModel#resetChanges},
	 *       {@link sap.ui.model.odata.v4.ODataContextBinding#resetChanges},
	 *       {@link sap.ui.model.odata.v4.ODataListBinding#resetChanges} or
	 *       {@link sap.ui.model.odata.v4.ODataPropertyBinding#resetChanges},
	 *     <li> {@link sap.ui.model.ChangeReason.Refresh Refresh} when the binding is refreshed,
	 *     <li> {@link sap.ui.model.ChangeReason.Context Context} when the parent context is
	 *       changed.
	 *   </ul>
	 *
	 * @event sap.ui.model.odata.v4.ODataPropertyBinding#change
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The 'dataReceived' event is fired after the back-end data has been processed and the
	 * registered 'change' event listeners have been notified. It is only fired for GET requests.
	 * The 'dataReceived' event is to be used by applications for example to switch off a busy
	 * indicator or to process an error.
	 *
	 * If back-end requests are successful, the event has almost no parameters. For compatibility
	 * with {@link sap.ui.model.Binding#event:dataReceived 'dataReceived'}, an event parameter
	 * <code>data : {}</code> is provided: "In error cases it will be undefined", but otherwise it
	 * is not. Use {@link #getValue() oEvent.getSource().getValue()} to access the response data.
	 * Note that controls bound to this data may not yet have been updated, meaning it is not safe
	 * for registered event handlers to access data via control APIs.
	 *
	 * If a back-end request fails, the 'dataReceived' event provides an <code>Error</code> in the
	 * 'error' event parameter.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 *    The event object
	 * @param {function():Object<any>} oEvent.getParameters
	 *   Function which returns an object containing all event parameters
	 * @param {object} [oEvent.getParameters.data]
	 *   An empty data object if a back-end request succeeds
	 * @param {Error} [oEvent.getParameters.error] The error object if a back-end request failed.
	 *   If there are multiple failed back-end requests, the error of the first one is provided.
	 *
	 * @event sap.ui.model.odata.v4.ODataPropertyBinding#dataReceived
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The 'dataRequested' event is fired directly after data has been requested from a back end.
	 * It is only fired for GET requests. The 'dataRequested' event is to be used by applications
	 * for example to switch on a busy indicator. Registered event handlers are called without
	 * parameters.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 *
	 * @event sap.ui.model.odata.v4.ODataPropertyBinding#dataRequested
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * See {@link sap.ui.base.EventProvider#attachEvent}
	 *
	 * @param {string} sEventId The identifier of the event to listen for
	 * @param {object} [_oData]
	 * @param {function} [_fnFunction]
	 * @param {object} [_oListener]
	 * @returns {this} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @see sap.ui.base.EventProvider#attachEvent
	 * @since 1.37.0
	 */
	// @override sap.ui.base.EventProvider#attachEvent
	ODataPropertyBinding.prototype.attachEvent = function (sEventId, _oData, _fnFunction,
			_oListener) {
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
	 * <code>undefined</code>. As described above, this may initiate a change event depending on the
	 * previous value and the <code>bForceUpdate</code> parameter. In the end the data state is
	 * checked (see {@link sap.ui.model.PropertyBinding#checkDataState}) even if there is no change
	 * event. If there are multiple synchronous <code>checkUpdateInternal</code> calls the data
	 * state is checked only after the last call is processed.
	 *
	 * @param {boolean} [bForceUpdate]
	 *   If <code>true</code> the change event is always fired except there is no context for a
	 *   relative binding and the (old and new) value is <code>undefined</code>. If
	 *   <code>undefined</code> a change event is also fired in case the data state contains control
	 *   messages, see {@link sap.ui.model.DataState#getControlMessages}.
	 * @param {sap.ui.model.ChangeReason} [sChangeReason=ChangeReason.Change]
	 *   The change reason for the change event
	 * @param {string} [sGroupId=getGroupId()]
	 *   The group ID to be used for the read.
	 * @param {boolean} [bPreventBubbling]
	 *   Whether the dataRequested and dataReceived events related to the refresh must not be
	 *   bubbled up to the model
	 * @param {any} [vValue]
	 *   The new value obtained from the cache, see {@link #onChange}
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved without a defined result when the check is finished, or
	 *   rejected in case of an error. If the cache is no longer the active cache when the response
	 *   arrives, that response is ignored almost silently (that is, with a canceled error) and the
	 *   value remains unchanged.
	 *
	 * @private
	 * @see sap.ui.model.PropertyBinding#checkDataState
	 */
	// @override sap.ui.model.odata.v4.ODataBinding#checkUpdateInternal
	ODataPropertyBinding.prototype.checkUpdateInternal = function (bForceUpdate, sChangeReason,
			sGroupId, bPreventBubbling, vValue) {
		var bDataRequested = false,
			iHashHash = this.sPath.indexOf("##"),
			bIsMeta = iHashHash >= 0,
			oMetaModel = this.oModel.getMetaModel(),
			mParametersForDataReceived = {data : {}},
			sResolvedPath = this.getResolvedPath(),
			oCallToken = {
				// a resolved binding fires a change event if checkUpdateInternal is called at least
				// once with bForceUpdate=true; an unresolved binding only fires if it had a value
				// before
				forceUpdate : sResolvedPath
					&& (bForceUpdate
						|| bForceUpdate === undefined
							&& this.getDataState().getControlMessages().length > 0
						|| this.oCheckUpdateCallToken && this.oCheckUpdateCallToken.forceUpdate)
			},
			vType = this.oType, // either the type or a promise resolving with it
			that = this;

		this.oCheckUpdateCallToken = oCallToken;
		if (!vType && sResolvedPath && this.sInternalType !== "any" && !bIsMeta
				&& !sResolvedPath.includes(sVirtualPath)) {
			vType = oMetaModel.fetchUI5Type(this.sReducedPath || sResolvedPath);
		}
		if (vValue === undefined) {
			// if called via #onChange, we need to fetch implicit values
			vValue = this.oCachePromise.then(function (oCache) {
				var sDataPath, sMetaPath;

				if (oCache) {
					return oCache.fetchValue(that.lockGroup(sGroupId || that.getGroupId()),
							/*sPath*/undefined, function () {
								bDataRequested = true;
								that.fireDataRequested(bPreventBubbling);
							}, that)
						.then(function (vResult) {
							that.checkSameCache(oCache);

							return vResult;
						});
				}
				if (!that.isResolved()) {
					return undefined;
				}
				if (sResolvedPath.includes(sVirtualPath)) {
					// below virtual context: no change event
					oCallToken.forceUpdate = false;
				}
				if (!bIsMeta) { // relative data binding
					return that.oContext.fetchValue(that.sReducedPath, that);
				} // else: metadata binding
				sDataPath = that.sPath.slice(0, iHashHash);
				sMetaPath = that.sPath.slice(iHashHash + 2);
				if (sMetaPath[0] === "/") {
					sMetaPath = "." + sMetaPath;
				}
				return oMetaModel.fetchObject(sMetaPath,
					oMetaModel.getMetaContext(that.oModel.resolve(sDataPath, that.oContext)),
					that.mScope && {scope : that.mScope});
			}).then(function (vValue0) {
				if (!vValue0 || typeof vValue0 !== "object") {
					return vValue0;
				}
				if (that.sInternalType === "any" && (that.getBindingMode() === BindingMode.OneTime
						|| !bIsMeta && (that.getBindingMode() === BindingMode.OneWay
							|| that.sPath[that.sPath.lastIndexOf("/") + 1] === "#"))) {
					if (bIsMeta) {
						return vValue0;
					} else if (that.bRelative) {
						return _Helper.publicClone(vValue0);
					}
				}
				Log.error("Accessed value is not primitive", sResolvedPath, sClassName);
			}, function (oError) {
				that.oModel.reportError("Failed to read path " + sResolvedPath, sClassName, oError);
				if (oError.canceled) { // canceled -> value remains unchanged
					oCallToken.forceUpdate = false;
					return that.vValue;
				}
				mParametersForDataReceived = {error : oError};
				// oError is re-thrown below
			});
			if (bForceUpdate && vValue.isFulfilled()) {
				if (vType && vType.isFulfilled && vType.isFulfilled()) {
					this.doSetType(vType.getResult());
				}
				this.vValue = vValue.getResult();
			}
			// Use Promise to become async so that only the latest sync call to checkUpdateInternal
			// wins
			vValue = Promise.resolve(vValue);
		}
		return SyncPromise.all([vValue, vType]).then(function (aResults) {
			var oType = aResults[1],
				vValue0 = aResults[0];

			if (oCallToken === that.oCheckUpdateCallToken) { // latest call to checkUpdateInternal
				that.oCheckUpdateCallToken = undefined;
				that.doSetType(oType);
				if (oCallToken.forceUpdate || that.vValue !== vValue0
						|| vValue0 && typeof vValue0 === "object") {
					that.bInitial = false;
					that.vValue = vValue0;
					that._fireChange({reason : sChangeReason || ChangeReason.Change});
				}
				that.checkDataState();
			}
			if (bDataRequested) {
				that.fireDataReceived(mParametersForDataReceived, bPreventBubbling);
			}
			if (mParametersForDataReceived.error) {
				throw mParametersForDataReceived.error;
			}
		});
	};

	/**
	 * Destroys the object. The object must not be used anymore after this function was called.
	 *
	 * @public
	 * @see sap.ui.model.Binding#destroy
	 * @since 1.39.0
	 */
	// @override sap.ui.model.Binding#destroy
	ODataPropertyBinding.prototype.destroy = function () {
		this.oModel.bindingDestroyed(this);
		this.oCheckUpdateCallToken = undefined;
		this.mQueryOptions = undefined;
		this.vValue = undefined;

		asODataBinding.prototype.destroy.call(this);
		PropertyBinding.prototype.destroy.apply(this, arguments);
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#doCreateCache
	 */
	ODataPropertyBinding.prototype.doCreateCache = function (sResourcePath, mQueryOptions) {
		return _Cache.createProperty(this.oModel.oRequestor, sResourcePath, mQueryOptions);
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#doFetchOrGetQueryOptions
	 */
	ODataPropertyBinding.prototype.doFetchOrGetQueryOptions = function () {
		return this.isRoot() ? this.mQueryOptions : undefined;
	};

	/**
	 * Sets the given type for this binding while keeping its internal type.
	 *
	 * @param {sap.ui.model.Type} oType
	 *   The type for this binding
	 *
	 * @private
	 * @see sap.ui.model.PropertyBinding#setType
	 */
	ODataPropertyBinding.prototype.doSetType = function (oType) {
		PropertyBinding.prototype.setType.call(this, oType, this.sInternalType);
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#getDependentBindings
	 */
	ODataPropertyBinding.prototype.getDependentBindings = function () {
		return aImmutableEmptyArray;
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#getResumePromise
	 */
	ODataPropertyBinding.prototype.getResumePromise = function () {};

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
	 *   If the binding is unresolved (see {@link sap.ui.model.Binding#isResolved}), if the metadata
	 *   is not loaded yet or if the property cannot be found in the metadata
	 *
	 * @public
	 * @since 1.45.0
	 */
	ODataPropertyBinding.prototype.getValueListType = function () {
		var sResolvedPath = this.getResolvedPath();

		if (!sResolvedPath) {
			throw new Error(this + " is unresolved");
		}
		return this.getModel().getMetaModel().getValueListType(sResolvedPath);
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#hasPendingChangesInDependents
	 */
	ODataPropertyBinding.prototype.hasPendingChangesInDependents = function () {
		return false;
	};

	/**
	 * @override
	 * @see sap.ui.model.Binding#initialize
	 */
	ODataPropertyBinding.prototype.initialize = function () {
		if (this.isResolved()) {
			if (this.isRootBindingSuspended()) {
				this.sResumeChangeReason = ChangeReason.Change;
			} else {
				this.checkUpdate(true);
			}
		}
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#isMeta
	 */
	ODataPropertyBinding.prototype.isMeta = function () {
		return this.sPath.includes("##");
	};

	/**
	 * Change handler for the cache. The cache calls this method when the value is changed.
	 *
	 * @param {any} vValue
	 *   The new value
	 * @param {boolean} [bForceUpdate]
	 *   Update the bound control even if no data have been changed.
	 *
	 * @private
	 */
	ODataPropertyBinding.prototype.onChange = function (vValue, bForceUpdate) {
		this.checkUpdateInternal(bForceUpdate, undefined, undefined, false, vValue)
			.catch(this.oModel.getReporter());
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#onDelete
	 */
	ODataPropertyBinding.prototype.onDelete = function () {
		// nothing to do
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#refreshInternal
	 */
	ODataPropertyBinding.prototype.refreshInternal = function (_sResourcePathPrefix, sGroupId,
			bCheckUpdate, bKeepCacheOnError) {
		var that = this;

		if (this.isRootBindingSuspended()) {
			this.refreshSuspended(sGroupId);
			return SyncPromise.resolve();
		}
		return this.oCachePromise.then(function () {
			if (that.oCache && that.oCache.reset) {
				that.oCache.reset();
			} else {
				that.fetchCache(that.oContext, false, /*bKeepQueryOptions*/true, bKeepCacheOnError);
			}

			if (bCheckUpdate) {
				return that.checkUpdateInternal(undefined, ChangeReason.Refresh, sGroupId,
					/*bPreventBubbling*/bKeepCacheOnError);
			}
		});
	};

	/**
	 * Requests the value of the property binding.
	 *
	 * @returns {Promise<any|undefined>}
	 *   A promise resolved with the resulting value or <code>undefined</code> if it could not be
	 *   determined, or rejected in case of an error
	 *
	 * @public
	 * @since 1.69
	 */
	ODataPropertyBinding.prototype.requestValue = function () {
		var that = this;

		return Promise.resolve(this.checkUpdateInternal(false).then(function () {
			return that.getValue();
		}));
	};

	/**
	 * Requests information to retrieve a value list for this property.
	 *
	 * @param {boolean} [bAutoExpandSelect]
	 *   The value of the parameter <code>autoExpandSelect</code> for value list models created by
	 *   this method. If the value list model is this binding's model, this flag has no effect.
	 *   Supported since 1.68.0
	 * @returns {Promise<Object<object>>}
	 *   See {@link sap.ui.model.odata.v4.ODataMetaModel#requestValueListInfo}
	 * @throws {Error}
	 *   If the binding is unresolved (see {@link sap.ui.model.Binding#isResolved})
	 *
	 * @public
	 * @since 1.45.0
	 */
	ODataPropertyBinding.prototype.requestValueListInfo = function (bAutoExpandSelect) {
		var sResolvedPath = this.getResolvedPath();

		if (!sResolvedPath) {
			throw new Error(this + " is unresolved");
		}
		return this.getModel().getMetaModel()
			.requestValueListInfo(sResolvedPath, bAutoExpandSelect, this.oContext);
	};

	/**
	 * Determines which type of value list exists for this property.
	 *
	 * @returns {Promise<sap.ui.model.odata.v4.ValueListType>}
	 *   A promise that is resolved with the type of the value list. It is rejected if the property
	 *   cannot be found in the metadata.
	 * @throws {Error}
	 *   If the binding is unresolved (see {@link sap.ui.model.Binding#isResolved})
	 *
	 * @public
	 * @since 1.47.0
	 */
	ODataPropertyBinding.prototype.requestValueListType = function () {
		var sResolvedPath = this.getResolvedPath();

		if (!sResolvedPath) {
			throw new Error(this + " is unresolved");
		}
		return this.getModel().getMetaModel().requestValueListType(sResolvedPath);
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#resetChangesInDependents
	 */
	ODataPropertyBinding.prototype.resetChangesInDependents = function () {};

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
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Binding#resume
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#resume
	ODataPropertyBinding.prototype.resume = function () {
		throw new Error("Unsupported operation: resume");
	};

	/**
	 * Resumes this binding and checks for updates if the parameter <code>bCheckUpdate</code> is
	 * set.
	 *
	 * @param {boolean} bCheckUpdate
	 *   Whether this property binding shall call <code>checkUpdate</code>
	 * @param {boolean} [bParentHasChanges]
	 *   Whether there are changes on the parent binding that become active after resuming
	 *
	 * @private
	 */
	ODataPropertyBinding.prototype.resumeInternal = function (bCheckUpdate, bParentHasChanges) {
		var sResumeChangeReason = this.sResumeChangeReason;

		this.sResumeChangeReason = undefined;

		this.fetchCache(this.oContext);
		if (bCheckUpdate) {
			this.checkUpdateInternal(bParentHasChanges ? undefined : false, sResumeChangeReason)
				.catch(this.oModel.getReporter());
		}
	};

	/**
	 * Sets the (base) context if the binding path is relative. Invokes (@link #fetchCache) to
	 * create a cache and {@link #checkUpdate} to check for the current value if the
	 * context has changed. In case of absolute bindings nothing is done.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @throws {Error}
	 *   If the binding's root binding is suspended
	 *
	 * @private
	 */
	// @override sap.ui.model.Binding#setContext
	ODataPropertyBinding.prototype.setContext = function (oContext) {
		if (this.oContext !== oContext) {
			if (this.bRelative) {
				this.checkSuspended(true);
				this.deregisterChangeListener();
				if (oContext) {
					if (this.oType && !this.bHasDeclaredType
						// Note: this.oType => this.sReducedPath
						&& _Helper.getMetaPath(this.oModel.resolve(this.sPath, oContext))
							!== _Helper.getMetaPath(this.sReducedPath)) {
						this.doSetType(undefined);
					}
					this.sReducedPath = undefined;
				}
			}
			this.oContext = oContext;
			this.sResumeChangeReason = undefined;
			if (this.bRelative) {
				this.fetchCache(this.oContext);
				this.checkUpdateInternal(this.bInitial || undefined, ChangeReason.Context)
					.catch(this.oModel.getReporter());
			}
		}
	};

	/**
	 * Sets the optional type and internal type for this binding; used for formatting and parsing.
	 * Fires a change event if the type has changed.
	 *
	 * @param {sap.ui.model.Type} oType
	 *   The type for this binding
	 * @param {string} _sInternalType
	 *   The internal type of the element property which owns this binding, for example "any",
	 *   "boolean", "float", "int", "string"; see {@link sap.ui.model.odata.type} for more
	 *   information
	 *
	 * @public
	 * @see sap.ui.model.PropertyBinding#setType
	 * @since 1.43.0
	 */
	// @override sap.ui.model.PropertyBinding#setType
	ODataPropertyBinding.prototype.setType = function (oType, _sInternalType) {
		var oOldType = this.oType;

		this.bHasDeclaredType = !!oType;
		if (oType && oType.getName() === "sap.ui.model.odata.type.DateTimeOffset") {
			oType.setV4();
		}
		PropertyBinding.prototype.setType.apply(this, arguments);
		if (!this.bInitial && oOldType !== oType) {
			this._fireChange({reason : ChangeReason.Change});
		}
	};

	/**
	 * Sets the new current value and updates the cache. If the value cannot be accepted or cannot
	 * be updated on the server, an error is logged to the console and added to the message manager
	 * as a technical message. Unless preconditions fail synchronously, a
	 * {@link sap.ui.model.odata.v4.ODataModel#event:propertyChange 'propertyChange'} event is
	 * fired and provides a promise on the outcome of the asynchronous operation. Since 1.122.0
	 * this method allows updates to the client-side annotation "@$ui5.context.isSelected". Note:
	 * Changing the value of a client-side annotation never initiates a PATCH request, no matter
	 * which <code>sGroupId</code> is given. Thus, it cannot be reverted via {@link #resetChanges}.
	 *
	 * @param {any} vValue
	 *   The new value which must be primitive
	 * @param {string} [sGroupId]
	 *   The group ID to be used for this update call; if not specified, the update group ID for
	 *   this binding (or its relevant parent binding) is used, see {@link #getUpdateGroupId}.
	 *   Valid values are <code>undefined</code>, '$auto', '$auto.*', '$direct' or application group
	 *   IDs as specified in {@link sap.ui.model.odata.v4.ODataModel}. When writing to a client-side
	 *   annotation, this parameter is ignored.
	 * @throws {Error} If
	 *   <ul>
	 *     <li> the binding's root binding is suspended.
	 *     <li> the new value is not primitive.
	 *     <li> no value has been read before and the binding does not have the parameter
	 *       <code>$$noPatch</code>.
	 *     <li> the binding is not relative to an {@link sap.ui.model.odata.v4.Context}.
	 *     <li> the binding has the parameter <code>$$noPatch</code> and a group ID has been given.
	 *   </ul>
	 *
	 * @public
	 * @see sap.ui.model.PropertyBinding#setValue
	 * @since 1.37.0
	 */
	ODataPropertyBinding.prototype.setValue = function (vValue, sGroupId) {
		var oGroupLock,
			oPromise,
			sResolvedPath = this.getResolvedPath(),
			that = this;

		function reportError(oError) {
			that.oModel.reportError("Failed to update path " + sResolvedPath, sClassName, oError);

			return oError;
		}

		this.checkSuspended();
		if (this.bNoPatch && sGroupId) {
			throw reportError(new Error("Must not specify a group ID (" + sGroupId
				+ ") with $$noPatch"));
		}
		_Helper.checkGroupId(sGroupId);
		if (typeof vValue === "function" || (vValue && typeof vValue === "object")) {
			throw reportError(new Error("Not a primitive value"));
		}
		if (!this.bNoPatch && this.vValue === undefined) {
			throw reportError(new Error("Must not change a property before it has been read"));
		}

		if (this.vValue !== vValue) {
			if (this.oCache) {
				reportError(new Error("Cannot set value on this binding as it is not relative"
					+ " to a sap.ui.model.odata.v4.Context"));
				return; // do not update this.vValue!
			}
			oGroupLock = this.bNoPatch ? null : this.lockGroup(sGroupId, true, true);
			oPromise = this.oContext.doSetProperty(this.sPath, vValue, oGroupLock);
			oPromise.catch(function (oError) {
				if (oGroupLock) {
					oGroupLock.unlock(true);
				}
				reportError(oError);
			});
			if (!oPromise.isRejected() && that.oModel.hasListeners("propertyChange")) {
				that.oModel.firePropertyChange({
					context : that.oContext,
					path : that.sPath,
					promise : oPromise.isPending() ? oPromise.getResult() : undefined,
					reason : ChangeReason.Binding,
					resolvedPath : sResolvedPath,
					value : vValue
				});
			} // else: do not construct parameter object in vain
		}
	};

	/**
	 * Returns <code>true</code>, as this binding supports the feature of not propagating model
	 * messages to the control.
	 *
	 * @returns {boolean} <code>true</code>
	 *
	 * @public
	 * @see sap.ui.model.Binding#getIgnoreMessages
	 * @see sap.ui.model.Binding#setIgnoreMessages
	 * @since 1.82.0
	 */
	// @override sap.ui.model.Binding#supportsIgnoreMessages
	ODataPropertyBinding.prototype.supportsIgnoreMessages = function () {
		return true;
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Binding#suspend
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#suspend
	ODataPropertyBinding.prototype.suspend = function () {
		throw new Error("Unsupported operation: suspend");
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#updateAfterCreate
	 */
	ODataPropertyBinding.prototype.updateAfterCreate = function () {
		return this.checkUpdateInternal();
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#visitSideEffects
	 */
	ODataPropertyBinding.prototype.visitSideEffects = function () {};

	return ODataPropertyBinding;
});
