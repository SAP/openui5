/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataContextBinding
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/Binding",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ContextBinding",
	"./Context",
	"./lib/_Cache",
	"./lib/_Helper",
	"./ODataParentBinding"
], function (jQuery, SyncPromise, Binding, ChangeReason, ContextBinding, Context, _Cache, _Helper,
		asODataParentBinding) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataContextBinding",
		mSupportedEvents = {
			change : true,
			dataReceived : true,
			dataRequested : true
		};

	/**
	 * Do <strong>NOT</strong> call this private constructor, but rather use
	 * {@link sap.ui.model.odata.v4.ODataModel#bindContext} instead!
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
	 * @alias sap.ui.model.odata.v4.ODataContextBinding
	 * @author SAP SE
	 * @class Context binding for an OData V4 model.
	 *   An event handler can only be attached to this binding for the following events: 'change',
	 *   'dataReceived', and 'dataRequested'.
	 *   For other events, an error is thrown.
	 *
	 *   A context binding can also be used as an <i>operation binding</i> to support bound actions,
	 *   action imports, bound functions and function imports. If you want to control the execution
	 *   time of an operation, for example a function import named "GetNumberOfAvailableItems",
	 *   create a context binding for the path "/GetNumberOfAvailableItems(...)" (as specified here,
	 *   including the three dots). Such an operation binding is <i>deferred</i>, meaning that it
	 *   does not request automatically, but only when you call {@link #execute}. {@link #refresh}
	 *   is always ignored for actions and action imports. For bound functions and function imports,
	 *   it is ignored if {@link #execute} has not yet been called. Afterwards it results in another
	 *   call of the function with the parameter values of the last execute.
	 *
	 *   The binding parameter for bound actions or bound functions may be given in the binding
	 *   path, for example "/SalesOrderList('42')/name.space.SalesOrder_Confirm". This can be
	 *   used if the exact entity for the binding parameter is known in advance. If you use a
	 *   relative binding instead, the operation path is a concatenation of the parent context's
	 *   canonical path and the deferred binding's path.
	 *
	 *   <b>Example</b>: You have a table with a list binding to "/SalesOrderList". In
	 *   each row you have a button to confirm the sales order, with the relative binding
	 *   "name.space.SalesOrder_Confirm(...)". Then the parent context for such a button
	 *   refers to an entity in "SalesOrderList", so its canonical path is
	 *   "/SalesOrderList('<i>SalesOrderID</i>')" and the resulting path for the action
	 *   is "/SalesOrderList('<i>SalesOrderID</i>')/name.space.SalesOrder_Confirm".
	 *
	 *   This also works if the relative path of the deferred operation binding starts with a
	 *   navigation property. Then this navigation property will be part of the operation's
	 *   resource path, which is still valid.
	 *
	 *   A deferred operation binding is not allowed to have another deferred operation binding as
	 *   parent.
	 *
	 * @extends sap.ui.model.ContextBinding
	 * @mixes sap.ui.model.odata.v4.ODataParentBinding
	 * @public
	 * @since 1.37.0
	 * @version ${version}
	 *
	 * @borrows sap.ui.model.odata.v4.ODataBinding#getRootBinding as #getRootBinding
	 * @borrows sap.ui.model.odata.v4.ODataBinding#hasPendingChanges as #hasPendingChanges
	 * @borrows sap.ui.model.odata.v4.ODataBinding#isInitial as #isInitial
	 * @borrows sap.ui.model.odata.v4.ODataBinding#refresh as #refresh
	 * @borrows sap.ui.model.odata.v4.ODataBinding#resetChanges as #resetChanges
	 * @borrows sap.ui.model.odata.v4.ODataParentBinding#changeParameters as #changeParameters
	 * @borrows sap.ui.model.odata.v4.ODataParentBinding#initialize as #initialize
	 * @borrows sap.ui.model.odata.v4.ODataParentBinding#resume as #resume
	 * @borrows sap.ui.model.odata.v4.ODataParentBinding#suspend as #suspend
	 */
	var ODataContextBinding = ContextBinding.extend("sap.ui.model.odata.v4.ODataContextBinding", {
			constructor : function (oModel, sPath, oContext, mParameters) {
				var iPos = sPath.indexOf("(...)");

				ContextBinding.call(this, oModel, sPath);

				if (sPath.slice(-1) === "/") {
					throw new Error("Invalid path: " + sPath);
				}

				this.mAggregatedQueryOptions = {};
				this.bAggregatedQueryOptionsInitial = true;
				this.oCachePromise = SyncPromise.resolve();
				this.mCacheByContext = undefined;
				this.sGroupId = undefined;
				this.bInheritExpandSelect = false;
				this.oOperation = undefined;
				// auto-$expand/$select: promises to wait until child bindings have provided
				// their path and query options
				this.aChildCanUseCachePromises = [];
				// a lock to ensure that submitBatch waits for an expected read
				this.oReadGroupLock = undefined;
				this.oReturnValueContext = null;
				this.sUpdateGroupId = undefined;

				if (iPos >= 0) { // deferred operation binding
					this.oOperation = {
						bAction : undefined,
						mParameters : {},
						sResourcePath : undefined
					};
					if (iPos !== this.sPath.length - 5) {
						throw new Error(
							"The path must not continue after a deferred operation: " + this.sPath);
					}
				}

				this.applyParameters(jQuery.extend(true, {}, mParameters));
				this.oElementContext = this.bRelative
					? null
					: Context.create(this.oModel, this, sPath);
				if (!this.oOperation && (!this.bRelative || oContext && !oContext.fetchValue)) {
					this.createReadGroupLock(this.getGroupId(), true);
				}
				this.setContext(oContext);
				oModel.bindingCreated(this);
			},
			metadata : {
				publicMethods : []
			}
		});

	asODataParentBinding(ODataContextBinding.prototype);

	/**
	 * Deletes the entity in <code>this.oElementContext</code>, identified by the edit URL.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID to be used for the DELETE request; if no group ID is specified, it
	 *   defaults to <code>getUpdateGroupId()</code>
	 * @param {string} sEditUrl
	 *   The edit URL to be used for the DELETE request
	 * @returns {Promise}
	 *   A promise which is resolved without a result in case of success, or rejected with an
	 *   instance of <code>Error</code> in case of failure.
	 * @throws {Error} If the binding has pending changes
	 *
	 * @private
	 */
	ODataContextBinding.prototype._delete = function (oGroupLock, sEditUrl) {
		var that = this;

		// a context binding without path can simply delegate to its parent context.
		if (this.sPath === "" && this.oContext.delete) {
			return this.oContext._delete(oGroupLock);
		}
		if (this.hasPendingChanges()) {
			throw new Error("Cannot delete due to pending changes");
		}

		return this.deleteFromCache(oGroupLock, sEditUrl, "", function () {
			that.oElementContext.destroy();
			that.oElementContext = null;
			if (that.oReturnValueContext) {
				that.oReturnValueContext.destroy();
				that.oReturnValueContext = null;
			}
			that._fireChange({reason : ChangeReason.Remove});
		});
	};

	/**
	 * Calls the OData operation that corresponds to this operation binding.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID to be used for the request; defaults to this binding's group ID
	 * @returns {Promise}
	 *   A promise that is resolved without data or a return value context when the operation call
	 *   succeeded, or rejected with an instance of <code>Error</code> in case of failure. A return
	 *   value context is a {@link sap.ui.model.odata.v4.Context} which represents a bound operation
	 *   response. It is created only if the operation is bound and has a single entity return
	 *   value from the same entity set as the operation's binding parameter and has a parent
	 *   context which points to an entity from an entity set.
	 *
	 * @private
	 * @see #execute for details
	 */
	ODataContextBinding.prototype._execute = function (oGroupLock) {
		var oMetaModel = this.oModel.getMetaModel(),
			oOperationMetadata,
			oPromise,
			sResolvedPath = this.oModel.resolve(this.sPath, this.oContext),
			that = this;

		/*
		 * Fires a "change" event and refreshes dependent bindings.
		 */
		function fireChangeAndRefreshDependentBindings() {
			that._fireChange({reason : ChangeReason.Change});
			that.oModel.getDependentBindings(that).forEach(function (oDependentBinding) {
				oDependentBinding.refreshInternal(oGroupLock.getGroupId(), true);
			});
		}

		oGroupLock.setGroupId(this.getGroupId());
		oPromise = oMetaModel.fetchObject(oMetaModel.getMetaPath(sResolvedPath) + "/@$ui5.overload")
			.then(function (aOperationMetadata) {
				var fnGetEntity, iIndex, sPath;

				if (!aOperationMetadata) {
					throw new Error("Unknown operation: " + sResolvedPath);
				}
				if (aOperationMetadata.length !== 1) {
					throw new Error("Unsupported overloads for " + sResolvedPath);
				}
				if (that.bRelative && that.oContext.getBinding) {
					iIndex = that.sPath.lastIndexOf("/");
					sPath = iIndex >= 0 ? that.sPath.slice(0, iIndex) : "";
					fnGetEntity = that.oContext.getObject.bind(that.oContext, sPath);
				}
				oOperationMetadata = aOperationMetadata[0];
				return that.createCacheAndRequest(oGroupLock, sResolvedPath, oOperationMetadata,
					fnGetEntity);
			}).then(function (oResponseEntity) {
				fireChangeAndRefreshDependentBindings();
				if (that.hasReturnValueContext(oOperationMetadata)) {
					if (that.oReturnValueContext) {
						that.oReturnValueContext.destroy();
					}
					that.oReturnValueContext = Context.create(that.oModel, that,
						sResolvedPath.slice(0, sResolvedPath.indexOf("("))
							+ _Helper.getPrivateAnnotation(oResponseEntity, "predicate"));
					return that.oReturnValueContext;
				}
			}, function (oError) {
				fireChangeAndRefreshDependentBindings();
				throw oError;
			}).catch(function (oError) {
				oGroupLock.unlock(true);
				if (that.oReturnValueContext) {
					that.oReturnValueContext.destroy();
					that.oReturnValueContext = null;
				}
				that.oModel.reportError("Failed to execute " + sResolvedPath, sClassName, oError);
				throw oError;
			});

		return Promise.resolve(oPromise);
	};

	/**
	 * Applies the given map of parameters to this binding's parameters.
	 *
	 * @param {object} [mParameters]
	 *   Map of binding parameters, {@link sap.ui.model.odata.v4.ODataModel#constructor}
	 * @param {sap.ui.model.ChangeReason} [sChangeReason]
	 *   A change reason, used to distinguish calls by {@link #constructor} from calls by
	 *   {@link sap.ui.model.odata.v4.ODataParentBinding#changeParameters}
	 * @throws {Error} If the binding parameter $$inheritExpandSelect is set to <code>true</code>
	 *   and the binding is no operation binding or the binding has one of the parameters $expand or
	 *   $select.
	 *
	 * @private
	 */
	ODataContextBinding.prototype.applyParameters = function (mParameters, sChangeReason) {
		var oBindingParameters = this.oModel.buildBindingParameters(mParameters,
			["$$groupId", "$$inheritExpandSelect", "$$ownRequest", "$$updateGroupId"]);

		if (oBindingParameters.$$inheritExpandSelect) {
			if (!this.oOperation) {
				throw new Error("Unsupported binding parameter $$inheritExpandSelect: "
					+ "binding is not an operation binding");
			}
			if (oBindingParameters.$expand || oBindingParameters.$select) {
				throw new Error("Must not set parameter $$inheritExpandSelect on binding which has "
					+ "$expand or $select");
			}
		}

		this.sGroupId = oBindingParameters.$$groupId;
		this.sUpdateGroupId = oBindingParameters.$$updateGroupId;
		this.bInheritExpandSelect = oBindingParameters.$$inheritExpandSelect;
		this.mQueryOptions = this.oModel.buildQueryOptions(mParameters, true);
		this.mParameters = mParameters; // store mParameters at binding after validation
		if (!this.oOperation) {
			this.fetchCache(this.oContext);
			if (sChangeReason) {
				this.refreshInternal(undefined, true);
			} else {
				this.checkUpdate();
			}
		} else if (this.oOperation.bAction === false) {
			// Note: sChangeReason ignored here, "filter"/"sort" not suitable for ContextBinding
			this.execute();
		}
	};

	/**
	 * The 'AggregatedDataStateChange' event is not supported by this binding.
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataContextBinding#AggregatedDataStateChange
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The 'change' event is fired when the binding is initialized or its parent context is changed.
	 * It is to be used by controls to get notified about changes to the bound context of this
	 * context binding.
	 * Registered event handlers are called with the change reason as parameter.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @param {object} oEvent.getParameters
	 * @param {sap.ui.model.ChangeReason} oEvent.getParameters.reason
	 *   The reason for the 'change' event: {@link sap.ui.model.ChangeReason.Change} when the
	 *   binding is initialized, {@link sap.ui.model.ChangeReason.Refresh} when the binding is
	 *   refreshed, and {@link sap.ui.model.ChangeReason.Context} when the parent context is changed
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataContextBinding#change
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The 'dataReceived' event is fired after the back-end data has been processed. It is to be
	 * used by applications, for example to switch off a busy indicator or to process an error. In
	 * case of a deferred operation binding, 'dataReceived' is not fired: Whatever should happen in
	 * the event handler attached to that event, can instead be done once the <code>oPromise</code>
	 * returned by {@link #execute} fulfills or rejects (using
	 * <code>oPromise.then(function () {...}, function () {...})</code>).
	 *
	 * If back-end requests are successful, the event has almost no parameters. For compatibility
	 * with {@link sap.ui.model.Binding#event:dataReceived}, an event parameter
	 * <code>data : {}</code> is provided: "In error cases it will be undefined", but otherwise it
	 * is not. Use the binding's bound context via
	 * {@link #getBoundContext oEvent.getSource().getBoundContext()} to access the response data.
	 * Note that controls bound to this data may not yet have been updated, meaning it is not safe
	 * for registered event handlers to access data via control APIs.
	 *
	 * If a back-end request fails, the 'dataReceived' event provides an <code>Error</code> in the
	 * 'error' event parameter.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @param {object} oEvent.getParameters
	 * @param {object} [oEvent.getParameters.data]
	 *   An empty data object if a back-end request succeeds
	 * @param {Error} [oEvent.getParameters.error] The error object if a back-end request failed.
	 *   If there are multiple failed back-end requests, the error of the first one is provided.
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataContextBinding#dataReceived
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The 'dataRequested' event is fired directly after data has been requested from a backend.
	 * It is to be used by applications, for example to switch on a busy indicator. Registered event
	 * handlers are called without parameters. In case of a deferred operation binding,
	 * 'dataRequested' is not fired: Whatever should happen in the event handler attached to that
	 * event, can instead be done before calling {@link #execute}.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataContextBinding#dataRequested
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The 'DataStateChange' event is not supported by this binding.
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataContextBinding#DataStateChange
	 * @public
	 * @since 1.37.0
	 */

	// See class documentation
	// @override
	// @public
	// @see sap.ui.base.EventProvider#attachEvent
	// @since 1.37.0
	ODataContextBinding.prototype.attachEvent = function (sEventId) {
		if (!(sEventId in mSupportedEvents)) {
			throw new Error("Unsupported event '" + sEventId
				+ "': v4.ODataContextBinding#attachEvent");
		}
		return ContextBinding.prototype.attachEvent.apply(this, arguments);
	};

	/**
	 * Creates a single cache and sends a GET/POST request.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID to be used for the request
	 * @param {string} sPath
	 *   The absolute binding path to the bound operation or operation import, e.g.
	 *   "/Entity('0815')/bound.Operation(...)" or "/OperationImport(...)"
	 * @param {object} oOperationMetadata
	 *   The operation's metadata
	 * @param {function} [fnGetEntity]
	 *   An optional function which may be called to access the existing entity data (if already
	 *   loaded) in case of a bound operation
	 * @returns {SyncPromise}
	 *   The request promise
	 * @throws {Error}
	 *   If a collection-valued parameter for an operation other than a V4 action is encountered,
	 *   or if the given metadata is neither an "Action" nor a "Function"
	 *
	 * @private
	 */
	ODataContextBinding.prototype.createCacheAndRequest = function (oGroupLock, sPath,
		oOperationMetadata, fnGetEntity) {
		var bAction = oOperationMetadata.$kind === "Action",
			oCache,
			vEntity = fnGetEntity,
			sETag,
			bHasReturnValueContext = this.hasReturnValueContext(oOperationMetadata),
			oModel = this.oModel,
			sMetaPath = oModel.getMetaModel().getMetaPath(sPath) + "/@$ui5.overload/0/$ReturnType",
			mParameters = jQuery.extend({}, this.oOperation.mParameters),
			oParentQueryOptions,
			oRequestor = oModel.oRequestor,
			mQueryOptions = jQuery.extend({}, oModel.mUriParameters, this.mQueryOptions);

		if (!bAction && oOperationMetadata.$kind !== "Function") {
			throw new Error("Not an operation: " + sPath);
		}

		if (this.bInheritExpandSelect) {
			if (bHasReturnValueContext) {
				// has return value context => the parent binding has cache query options
				oParentQueryOptions = this.oContext.getBinding().mCacheQueryOptions;
				if ("$select" in oParentQueryOptions) {
					mQueryOptions.$select = oParentQueryOptions.$select;
				}
				if ("$expand" in oParentQueryOptions) {
					mQueryOptions.$expand = oParentQueryOptions.$expand;
				}
			} else {
				throw new Error("Must not set parameter $$inheritExpandSelect on binding which has "
					+ "no return value context");
			}
		}

		this.oOperation.bAction = bAction;
		if (bAction && fnGetEntity) {
			vEntity = fnGetEntity();
			sETag = vEntity && vEntity["@odata.etag"];
		}
		sPath = oRequestor.getPathAndAddQueryOptions(sPath, oOperationMetadata, mParameters,
			mQueryOptions, vEntity);
		this.mCacheQueryOptions = mQueryOptions;
		oCache = _Cache.createSingle(oRequestor, sPath, mQueryOptions, oModel.bAutoExpandSelect,
			bAction, sMetaPath, bHasReturnValueContext);
		this.oCachePromise = SyncPromise.resolve(oCache);
		return bAction
			? oCache.post(oGroupLock, mParameters, sETag)
			: oCache.fetchValue(oGroupLock);
	};

	/**
	 * Destroys the object. The object must not be used anymore after this function was called.
	 *
	 * @public
	 * @since 1.40.1
	 */
	// @override
	ODataContextBinding.prototype.destroy = function () {
		if (this.oElementContext) {
			this.oElementContext.destroy();
		}
		if (this.oReturnValueContext) {
			this.oReturnValueContext.destroy();
		}
		this.oModel.bindingDestroyed(this);
		this.oCachePromise = undefined;
		this.oContext = undefined;
		ContextBinding.prototype.destroy.apply(this);
	};

	/**
	 * Hook method for {@link sap.ui.model.odata.v4.ODataBinding#fetchCache} to create a cache for
	 * this binding with the given resource path and query options.
	 *
	 * @param {string} sResourcePath
	 *   The resource path, for example "EMPLOYEES('1')"
	 * @param {object} mQueryOptions
	 *   The query options
	 * @returns {sap.ui.model.odata.v4.lib._Cache}
	 *   The new cache instance
	 *
	 * @private
	 */
	ODataContextBinding.prototype.doCreateCache = function (sResourcePath, mQueryOptions) {
		return _Cache.createSingle(this.oModel.oRequestor, sResourcePath, mQueryOptions,
			this.oModel.bAutoExpandSelect);
	};

	/**
	 * Hook method for {@link sap.ui.model.odata.v4.ODataBinding#fetchQueryOptionsForOwnCache} to
	 * determine the query options for this binding.
	 *
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise resolving with the binding's query options
	 *
	 * @private
	 */
	ODataContextBinding.prototype.doFetchQueryOptions = function () {
		return SyncPromise.resolve(this.mQueryOptions);
	};

	/**
	 * Calls the OData operation that corresponds to this operation binding.
	 *
	 * Parameters for the operation must be set via {@link #setParameter} beforehand.
	 *
	 * The value of this binding is the result of the operation. To access a result of primitive
	 * type, bind a control to the path "value", for example
	 * <code>&lt;Text text="{value}"/></code>. If the result has a complex or entity type, you
	 * can bind properties as usual, for example <code>&lt;Text text="{street}"/></code>.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID to be used for the request; if not specified, the group ID for this binding is
	 *   used, see {@link sap.ui.model.odata.v4.ODataContextBinding#constructor}.
	 *   Valid values are <code>undefined</code>, '$auto', '$direct' or application group IDs as
	 *   specified in {@link sap.ui.model.odata.v4.ODataModel#submitBatch}.
	 * @returns {Promise}
	 *   A promise that is resolved without data or a return value context when the operation
	 *   call succeeded, or rejected with an instance of <code>Error</code> in case of failure,
	 *   for instance if the operation metadata is not found, if overloading is not supported, or if
	 *   a collection-valued function parameter is encountered.
	 *   A return value context is a {@link sap.ui.model.odata.v4.Context} which represents a bound
	 *   operation response. It is created only if the operation is bound and has a single entity
	 *   return value from the same entity set as the operation's binding parameter and has a
	 *   parent context which is a {@link sap.ui.model.odata.v4.Context} and points to an entity
	 *   from an entity set.
	 * @throws {Error} If the binding's root binding is suspended, the given group ID is invalid, if
	 *   the binding is not a deferred operation binding (see
	 *   {@link sap.ui.model.odata.v4.ODataContextBinding}), if the binding is not resolved or
	 *   relative to a transient context (see {@link sap.ui.model.odata.v4.Context#isTransient}), or
	 *   if deferred operation bindings are nested.
	 *
	 * @public
	 * @since 1.37.0
	 */
	ODataContextBinding.prototype.execute = function (sGroupId) {
		var sResolvedPath = this.oModel.resolve(this.sPath, this.oContext);

		this.checkSuspended();
		this.oModel.checkGroupId(sGroupId);
		if (!this.oOperation) {
			throw new Error("The binding must be deferred: " + this.sPath);
		}
		if (this.bRelative) {
			if (!sResolvedPath) {
				throw new Error("Unresolved binding: " + this.sPath);
			}
			if (this.oContext.isTransient && this.oContext.isTransient()) {
				throw new Error("Execute for transient context not allowed: " + sResolvedPath);
			}
			if (this.oContext.getPath().indexOf("(...)") >= 0) {
				throw new Error("Nested deferred operation bindings not supported: "
					+ sResolvedPath);
			}
		}

		return this._execute(this.oModel.lockGroup(sGroupId, true));
	};

	/**
	 * Requests the value for the given path; the value is requested from this binding's
	 * cache or from its context in case it has no cache. For a suspended binding, requesting the
	 * value is canceled by throwing a "canceled" error.
	 *
	 * @param {string} sPath
	 *   Some absolute path
	 * @param {sap.ui.model.odata.v4.ODataPropertyBinding} [oListener]
	 *   A property binding which registers itself as listener at the cache
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise on the outcome of the cache's <code>read</code> call
	 * @throws {Error} If the binding's root binding is suspended, a "canceled" error is thrown
	 *
	 * @private
	 */
	ODataContextBinding.prototype.fetchValue = function (sPath, oListener) {
		var oError,
			oGroupLock,
			oRootBinding = this.getRootBinding(),
			that = this;

		// dependent binding will update its value when the suspended binding is resumed
		if (oRootBinding && oRootBinding.isSuspended()) {
			oError = new Error("Suspended binding provides no value");
			oError.canceled = "noDebugLog";
			throw oError;
		}
		return this.oCachePromise.then(function (oCache) {
			var bDataRequested = false,
				sRelativePath;

			if (oCache) {
				sRelativePath = that.getRelativePath(sPath);
				if (sRelativePath !== undefined) {
					// Unless there is a refresh, a lock is not required here, only set the group ID
					oGroupLock = that.oModel.lockGroup(that.getGroupId(), that.oReadGroupLock);
					that.oReadGroupLock = undefined;
					return oCache.fetchValue(oGroupLock, sRelativePath, function () {
						bDataRequested = true;
						that.fireDataRequested();
					}, oListener).then(function (vValue) {
						if (bDataRequested) {
							that.fireDataReceived({data : {}});
						}
						return vValue;
					}, function (oError) {
						oGroupLock.unlock(true);
						if (bDataRequested) {
							that.oModel.reportError("Failed to read path " + that.sPath, sClassName,
								oError);
							that.fireDataReceived(oError.canceled ? {data : {}} : {error : oError});
						}
						throw oError;
					});
				}
			}
			if (!that.oOperation && that.oContext && that.oContext.fetchValue) {
				return that.oContext.fetchValue(sPath, oListener);
			}
		});
	};

	/**
	 * Returns the bound context.
	 *
	 * @returns {sap.ui.model.odata.v4.Context}
	 *   The bound context
	 *
	 * @function
	 * @name sap.ui.model.odata.v4.ODataContextBinding#getBoundContext
	 * @public
	 * @since 1.39.0
	 */


	/**
	 * Determines whether an operation binding creates a return value context on {@link #execute}.
	 * The following conditions must hold for a return value context to be created:
	 * 1. operation is bound.
	 * 2. operation has single entity return value. Note: existence of EntitySetPath
	 *    implies the return value is an entity or a collection thereof;
	 *    see OData V4 spec part 3, 12.1.3. It thus ensures the "entity" in this condition.
	 * 3. EntitySetPath of operation is the binding parameter.
	 * 4. operation binding has a V4 parent context pointing to an entity from an entity set w/o
	 *    navigation properties.
	 *
	 * @param {object} oMetadata The operation metadata
	 * @returns {boolean} Whether a return value context is created
	 *
	 * @private
	 */
	ODataContextBinding.prototype.hasReturnValueContext = function (oMetadata) {
		var oMetaModel = this.oModel.getMetaModel(),
			aMetaSegments = oMetaModel.getMetaPath(this.oModel.resolve(this.sPath, this.oContext))
				.split("/");

		return oMetadata.$IsBound // case 1
			&& oMetadata.$ReturnType && !oMetadata.$ReturnType.$isCollection
				&& oMetadata.$EntitySetPath // case 2
			&& oMetadata.$EntitySetPath.indexOf("/") < 0 // case 3
			&& this.bRelative && this.oContext && this.oContext.getBinding
				&& aMetaSegments.length === 3
				&& oMetaModel.getObject("/" + aMetaSegments[1]).$kind === "EntitySet"; // case 4
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#refreshInternal
	 */
	ODataContextBinding.prototype.refreshInternal = function (sGroupId, bCheckUpdate) {
		var that = this;

		if (this.oOperation && this.oOperation.bAction !== false) {
			return;
		}

		this.createReadGroupLock(sGroupId, this.isRefreshable());
		this.oCachePromise.then(function (oCache) {
			if (!that.oElementContext) { // refresh after delete
				that.oElementContext = Context.create(that.oModel, that,
					that.oModel.resolve(that.sPath, that.oContext));
				if (!oCache) { // make sure event IS fired
					that._fireChange({reason : ChangeReason.Refresh});
				}
			}
			if (!that.oOperation) {
				if (oCache) {
					// remove all cached Caches before fetching a new one
					that.mCacheByContext = undefined;
					that.fetchCache(that.oContext);
					// Do not fire a change event, or else ManagedObject destroys and recreates the
					// binding hierarchy causing a flood of events
				}
				that.oModel.getDependentBindings(that).forEach(function (oDependentBinding) {
					oDependentBinding.refreshInternal(sGroupId, bCheckUpdate);
				});
			} else {
				// ignore returned promise, error handling takes place in _execute
				that._execute(that.oReadGroupLock);
				that.oReadGroupLock = undefined;
			}
		});
	};

	/**
	 * Resumes this binding and all dependent bindings and fires a change event afterwards.
	 *
	 * @param {boolean} bCheckUpdate
	 *   Whether dependent property bindings shall call <code>checkUpdate</code>
	 *
	 * @private
	 */
	ODataContextBinding.prototype.resumeInternal = function (bCheckUpdate) {
		if (!this.oOperation) {
			this.mAggregatedQueryOptions = {};
			this.bAggregatedQueryOptionsInitial = true;
			this.mCacheByContext = undefined;
			this.fetchCache(this.oContext);
			this.oModel.getDependentBindings(this).forEach(function (oDependentBinding) {
				oDependentBinding.resumeInternal(bCheckUpdate);
			});
			this._fireChange({reason : ChangeReason.Change});
		} else if (this.oOperation.bAction === false) {
			// ignore returned promise, error handling takes place in execute
			this.execute();
		}
	};

	/**
	 * Sets the (base) context which is used when the binding path is relative.
	 * Fires a change event if the bound context is changed.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 *
	 * @private
	 * @see sap.ui.model.Binding#setContext
	 */
	// @override
	ODataContextBinding.prototype.setContext = function (oContext) {
		if (this.oContext !== oContext) {
			if (this.bRelative && (this.oContext || oContext)) {
				if (this.oElementContext) {
					this.oElementContext.destroy();
					this.oElementContext = null;
				}
				if (this.oReturnValueContext) {
					this.oReturnValueContext.destroy();
					this.oReturnValueContext = null;
				}
				this.fetchCache(oContext);
				if (oContext) {
					this.oElementContext = Context.create(this.oModel, this,
						this.oModel.resolve(this.sPath, oContext));
				}
				// call Binding#setContext because of data state etc.; fires "change"
				Binding.prototype.setContext.call(this, oContext);
			} else {
				// remember context even if no "change" fired
				this.oContext = oContext;
			}
		}
	};

	/**
	 * Sets a parameter for an operation call.
	 *
	 * @param {string} sParameterName
	 *   The parameter name
	 * @param {any} vValue
	 *   The parameter value
	 * @returns {sap.ui.model.odata.v4.ODataContextBinding}
	 *   <code>this</code> to enable method chaining
	 * @throws {Error} If the binding is not a deferred operation binding (see
	 *   {@link sap.ui.model.odata.v4.ODataContextBinding}) or if the value is missing
	 *
	 * @public
	 * @since 1.37.0
	 */
	ODataContextBinding.prototype.setParameter = function (sParameterName, vValue) {
		if (!this.oOperation) {
			throw new Error("The binding must be deferred: " + this.sPath);
		}
		if (!sParameterName) {
			throw new Error("Missing parameter name");
		}
		if (vValue === undefined) {
			throw new Error("Missing value for parameter: " + sParameterName);
		}
		this.oOperation.mParameters[sParameterName] = vValue;
		this.oOperation.bAction = undefined; // "not yet executed"
		return this;
	};

	return ODataContextBinding;
});
