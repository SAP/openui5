/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataContextBinding
sap.ui.define([
	"./Context",
	"./ODataParentBinding",
	"./lib/_Cache",
	"./lib/_GroupLock",
	"./lib/_Helper",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/Binding",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ContextBinding"
], function (Context, asODataParentBinding, _Cache, _GroupLock, _Helper, SyncPromise, Binding,
		ChangeReason, ContextBinding) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataContextBinding",
		mSupportedEvents = {
			AggregatedDataStateChange : true,
			change : true,
			dataReceived : true,
			dataRequested : true,
			DataStateChange : true,
			patchCompleted : true,
			patchSent : true
		};

	/**
	 * Returns the path for the return value context. Supports bound operations on an entity or a
	 * collection.
	 *
	 * @param {string} sPath
	 *   The bindings's path; either a resolved model path or a resource path; for example:
	 *   "Artists(ArtistID='42',IsActiveEntity=true)/special.cases.EditAction(...)" or
	 *   "/Artists(ArtistID='42',IsActiveEntity=true)/special.cases.EditAction(...)" or
	 *   "Artists/special.cases.Create(...)" or "/Artists/special.cases.Create(...)"
	 * @param {string} sResponsePredicate The key predicate of the response entity
	 * @returns {string} The path for the return value context.
	 */
	function getReturnValueContextPath(sPath, sResponsePredicate) {
		var sBoundParameterPath = sPath.slice(0, sPath.lastIndexOf("/")),
			i = sBoundParameterPath.indexOf("(");

		return (i < 0 ? sBoundParameterPath : sPath.slice(0, i)) + sResponsePredicate;
	}

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
	 *   An event handler can only be attached to this binding for the following events:
	 *   'AggregatedDataStateChange', 'change', 'dataReceived', 'dataRequested', and
	 *   'DataStateChange'. For other events, an error is thrown.
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
	 * @hideconstructor
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
	 * @borrows sap.ui.model.odata.v4.ODataParentBinding#attachPatchCompleted as
	 *   #attachPatchCompleted
	 * @borrows sap.ui.model.odata.v4.ODataParentBinding#attachPatchSent as #attachPatchSent
	 * @borrows sap.ui.model.odata.v4.ODataParentBinding#changeParameters as #changeParameters
	 * @borrows sap.ui.model.odata.v4.ODataParentBinding#detachPatchCompleted as
	 *   #detachPatchCompleted
	 * @borrows sap.ui.model.odata.v4.ODataParentBinding#detachPatchSent as #detachPatchSent
	 * @borrows sap.ui.model.odata.v4.ODataParentBinding#initialize as #initialize
	 * @borrows sap.ui.model.odata.v4.ODataParentBinding#resume as #resume
	 * @borrows sap.ui.model.odata.v4.ODataParentBinding#suspend as #suspend
	 */
	var ODataContextBinding = ContextBinding.extend("sap.ui.model.odata.v4.ODataContextBinding", {
			constructor : function (oModel, sPath, oContext, mParameters) {
				var iPos = sPath.indexOf("(...)");

				ContextBinding.call(this, oModel, sPath);
				// initialize mixin members
				asODataParentBinding.call(this);

				if (sPath.slice(-1) === "/") {
					throw new Error("Invalid path: " + sPath);
				}
				this.oOperation = undefined;
				this.oParameterContext = null;
				this.oReturnValueContext = null;
				if (iPos >= 0) { // deferred operation binding
					if (iPos !== this.sPath.length - /*"(...)".length*/5) {
						throw new Error(
							"The path must not continue after a deferred operation: " + this.sPath);
					}

					this.oOperation = {
						bAction : undefined,
						mChangeListeners : {}, // map from path to an array of change listeners
						mParameters : {},
						sResourcePath : undefined
					};
					if (!this.bRelative) {
						this.oParameterContext = Context.create(this.oModel, this,
							this.sPath + "/$Parameter");
					}
				}

				mParameters = _Helper.clone(mParameters) || {};
				// Note: needs this.oOperation
				this.checkBindingParameters(mParameters, ["$$canonicalPath", "$$groupId",
					"$$inheritExpandSelect", "$$ownRequest", "$$patchWithoutSideEffects",
					"$$updateGroupId"]);
				this.sGroupId = mParameters.$$groupId;
				this.bInheritExpandSelect = mParameters.$$inheritExpandSelect;
				this.sUpdateGroupId = mParameters.$$updateGroupId;

				this.applyParameters(mParameters);
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
	 *
	 * @private
	 */
	ODataContextBinding.prototype._delete = function (oGroupLock, sEditUrl) {
		// In case the context binding has an empty path, the respective context in the parent
		// needs to be removed as well. As there could be more levels of bindings pointing to the
		// same entity, first go up the binding hierarchy and find the context pointing to the same
		// entity in the highest level binding.
		// In case that top binding is a list binding, perform the deletion from there but use the
		// ETag of this binding.
		// In case the top binding is a context binding, perform the deletion from here but destroy
		// the context(s) in that uppermost binding. Note that no data may be available in the
		// uppermost context binding and hence the deletion would not work there, BCP 1980308439.
		var oEmptyPathParentContext = this._findEmptyPathParentContext(this.oElementContext),
			oEmptyPathParentBinding = oEmptyPathParentContext.getBinding();

		// In case the uppermost parent reached with empty paths is a list binding, delete there.
		if (!oEmptyPathParentBinding.execute) {
			return this.fetchValue("", undefined, true).then(function (oEntity) {
				// In the Cache, the request is generated with a reference to the entity data
				// first. So, hand over the complete entity to have the ETag of the correct binding
				// in the request.
				return oEmptyPathParentContext._delete(oGroupLock, oEntity);
			});
			// fetchValue will fail if the entity has not been read. The same happens with the
			// deleteFromCache call below. In Context#delete the error is reported.
		}

		return this.deleteFromCache(oGroupLock, sEditUrl, "", undefined, function () {
			oEmptyPathParentBinding._destroyContextAfterDelete();
		});
	};

	/**
	 * Destroys the element context and, if available, the return value context, and fires a
	 * change. The method is called by #_delete, possibly at another context binding for the same
	 * entity, after the successful deletion in the back-end.
	 *
	 * @private
	 */
	ODataContextBinding.prototype._destroyContextAfterDelete = function () {
		this.oElementContext.destroy();
		this.oElementContext = null;
		if (this.oReturnValueContext) {
			this.oReturnValueContext.destroy();
			this.oReturnValueContext = null;
		}
		this._fireChange({reason : ChangeReason.Remove});
	};

	/**
	 * Calls the OData operation that corresponds to this operation binding.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID to be used for the request
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
			sResolvedPath = this.getResolvedPath(),
			that = this;

		/*
		 * Fires a "change" event and refreshes dependent bindings.
		 * @returns {sap.ui.base.SyncPromise} A promise resolving when the refresh is finished
		 */
		function fireChangeAndRefreshDependentBindings() {
			that._fireChange({reason : ChangeReason.Change});
			return that.refreshDependentBindings("", oGroupLock.getGroupId(), true);
		}

		oPromise = oMetaModel.fetchObject(oMetaModel.getMetaPath(sResolvedPath) + "/@$ui5.overload")
			.then(function (aOperationMetadata) {
				var fnGetEntity, iIndex, sPath;

				if (!aOperationMetadata) {
					throw new Error("Unknown operation: " + sResolvedPath);
				}
				if (aOperationMetadata.length !== 1) {
					throw new Error("Expected a single overload, but found "
						+ aOperationMetadata.length + " for " + sResolvedPath);
				}
				if (that.bRelative && that.oContext.getBinding) {
					iIndex = that.sPath.lastIndexOf("/");
					sPath = iIndex >= 0 ? that.sPath.slice(0, iIndex) : "";
					fnGetEntity = that.oContext.getValue.bind(that.oContext, sPath);
				}
				oOperationMetadata = aOperationMetadata[0];
				return that.createCacheAndRequest(oGroupLock, sResolvedPath, oOperationMetadata,
					fnGetEntity);
			}).then(function (oResponseEntity) {
				var sContextPredicate, oOldValue, sResponsePredicate;

				return fireChangeAndRefreshDependentBindings().then(function () {
					if (that.isReturnValueLikeBindingParameter(oOperationMetadata)) {
						oOldValue = that.oContext.getValue();
						sContextPredicate = oOldValue &&
							_Helper.getPrivateAnnotation(oOldValue, "predicate");
						sResponsePredicate = _Helper.getPrivateAnnotation(
							oResponseEntity, "predicate");
						if (sContextPredicate === sResponsePredicate) {
							// this is synchronous, because the entity to be patched is available in
							// the context (we already read its predicate)
							that.oContext.patch(oResponseEntity);
						}
					}

					if (that.hasReturnValueContext(oOperationMetadata)) {
						if (that.oReturnValueContext) {
							that.oReturnValueContext.destroy();
						}
						that.oReturnValueContext = Context.createReturnValueContext(that.oModel,
							that, getReturnValueContextPath(sResolvedPath, sResponsePredicate));
						// set the resource path for late property requests
						that.oCache.setResourcePath(that.oReturnValueContext.getPath().slice(1));

						return that.oReturnValueContext;
					}
				});
			}, function (oError) {
				/*
				 * Adjusts the target of a given message according to the operation metadata of this
				 * binding.
				 *
				 * For a bound operation:
				 * In case the original target is '_it/Property' with '_it' as the name of the
				 * binding parameter, the result is '/Set(key)/Property' where '/Set(key)' is the
				 * current context the operation is called on.
				 * In case the target points to a certain parameter like 'Param' the result is
				 * '/Set(key)/name.space.Action(...)/$Parameter/Param' with 'name.space.Action' as
				 * the full-qualified operation name.
				 *
				 * For an unbound operation:
				 * In case the target points to a certain parameter like 'Param' the result is
				 * '/ActionImport/$Parameter/Param' with 'ActionImport' as the name of the operation
				 * import.
				 *
				 * All other targets are deleted because they can not be associated to operation
				 * parameters or the binding parameter and the message is reported as unbound.
				 *
				 * @param {object} oMessage
				 *   The message which target should be adjusted.
				 */
				function adjustTarget(oMessage) {
					var sParameterName,
						aSegments;

					/*
					* Checks whether sParameterName exists in the metadata as operation parameter.
					*/
					function hasParameterName() {
						return oOperationMetadata.$Parameter.some(function (oParameter) {
							return sParameterName === oParameter.$Name;
						});
					}

					if (oMessage.target) {
						aSegments = oMessage.target.split("/");
						sParameterName = aSegments.shift();

						if (oOperationMetadata.$IsBound
							&& sParameterName === oOperationMetadata.$Parameter[0].$Name) {
							oMessage.target = _Helper.buildPath(that.oContext.getPath(),
								aSegments.join("/"));
							return;
						} else if (hasParameterName()) {
							oMessage.target = that.oParameterContext.getPath() + "/"
								+ oMessage.target;
							return;
						}
					}
					// parameter unknown, or target is falsy -> delete target
					delete oMessage.target;
				}

				if (oOperationMetadata) {
					if (oError.error) {
						adjustTarget(oError.error);
						if (oError.error.details) {
							oError.error.details.forEach(adjustTarget);
						}
					}
				}

				// Note: this must be done after the targets have been normalized, because otherwise
				// a child reports the messages from the error response with wrong targets
				return fireChangeAndRefreshDependentBindings().then(function () {
					throw oError;
				});
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
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#adjustPredicate
	 */
	ODataContextBinding.prototype.adjustPredicate = function (sTransientPredicate, sPredicate) {
		if (this.oElementContext) {
			this.oElementContext.adjustPredicate(sTransientPredicate, sPredicate);
		}
		// this.oReturnValueContext cannot have the transient predicate; it results from execute,
		// but execute is not possible with a transient predicate
	};

	/**
	 * Applies the given map of parameters to this binding's parameters.
	 *
	 * @param {object} mParameters
	 *   Map of binding parameters, {@link sap.ui.model.odata.v4.ODataModel#constructor}
	 * @param {sap.ui.model.ChangeReason} [sChangeReason]
	 *   A change reason, used to distinguish calls by {@link #constructor} from calls by
	 *   {@link sap.ui.model.odata.v4.ODataParentBinding#changeParameters}
	 *
	 * @private
	 */
	ODataContextBinding.prototype.applyParameters = function (mParameters, sChangeReason) {
		this.mQueryOptions = this.oModel.buildQueryOptions(mParameters, true);
		this.mParameters = mParameters; // store mParameters at binding after validation

		if (this.isRootBindingSuspended()) {
			return;
		}

		if (!this.oOperation) {
			this.fetchCache(this.oContext);
			if (sChangeReason) {
				this.refreshInternal("", undefined, true)
					.catch(function () {/*avoid "Uncaught (in promise)"*/});
			} else {
				this.checkUpdate();
			}
		} else if (this.oOperation.bAction === false) {
			// Note: sChangeReason ignored here, "filter"/"sort" not suitable for ContextBinding
			this.execute();
		}
	};

	/**
	 * The 'change' event is fired when the binding is initialized or its parent context is changed.
	 * It is to be used by controls to get notified about changes to the bound context of this
	 * context binding.
	 * Registered event handlers are called with the change reason as parameter.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @param {object} oEvent.getParameters()
	 * @param {sap.ui.model.ChangeReason} oEvent.getParameters().reason
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
	 * The 'dataReceived' event is fired after the back-end data has been processed. It is only
	 * fired for GET requests. The 'dataReceived' event is to be used by applications, for example
	 * to switch off a busy indicator or to process an error. In case of a deferred operation
	 * binding, 'dataReceived' is not fired: Whatever should happen in the event handler attached
	 * to that event, can instead be done once the <code>oPromise</code> returned by
	 * {@link #execute} fulfills or rejects (using <code>oPromise.then(function () {...}, function
	 * () {...})</code>).
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
	 * @param {object} oEvent.getParameters()
	 * @param {object} [oEvent.getParameters().data]
	 *   An empty data object if a back-end request succeeds
	 * @param {Error} [oEvent.getParameters().error] The error object if a back-end request failed.
	 *   If there are multiple failed back-end requests, the error of the first one is provided.
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataContextBinding#dataReceived
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The 'dataRequested' event is fired directly after data has been requested from a back-end.
	 * It is only fired for GET requests. The 'dataRequested' event is to be used by
	 * applications, for example to switch on a busy indicator. Registered event handlers are
	 * called without parameters. In case of a deferred operation binding, 'dataRequested' is not
	 * fired: Whatever should happen in the event handler attached to that event, can instead be
	 * done before calling {@link #execute}.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataContextBinding#dataRequested
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The 'patchCompleted' event is fired when the back-end has responded to the last PATCH
	 * request for this binding. If there is more than one PATCH request in a $batch, the event is
	 * fired only once. Only bindings using an own data service request fire a 'patchCompleted'
	 * event. For each 'patchSent' event, a 'patchCompleted' event is fired.
	 *
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.model.odata.v4.ODataContextBinding} oEvent.getSource() This binding
	 * @param {object} oEvent.getParameters() Object containing all event parameters
	 * @param {boolean} oEvent.getParameters().success
	 *   Whether all PATCHes are successfully processed
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataContextBinding#patchCompleted
	 * @public
	 * @since 1.59.0
	 */

	/**
	 * The 'patchSent' event is fired when the first PATCH request for this binding is sent to the
	 * back-end. If there is more than one PATCH request in a $batch, the event is fired only once.
	 * Only bindings using an own data service request fire a 'patchSent' event. For each
	 * 'patchSent' event, a 'patchCompleted' event is fired.
	 *
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.model.odata.v4.ODataContextBinding} oEvent.getSource() This binding
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataContextBinding#patchSent
	 * @public
	 * @since 1.59.0
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
	 *  Returns this operation binding's cache query options.
	 *
	 *  @returns {object} The query options
	 *
	 * @private
	 */
	ODataContextBinding.prototype.computeOperationQueryOptions = function () {
		return Object.assign({}, this.oModel.mUriParameters, this.getQueryOptionsFromParameters());
	};

	/**
	 * Creates a single cache for an operation and sends a GET/POST request.
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
			oModel = this.oModel,
			sMetaPath = oModel.getMetaModel().getMetaPath(sPath) + "/@$ui5.overload/0/$ReturnType",
			sOriginalResourcePath = sPath.slice(1),
			mParameters = Object.assign({}, this.oOperation.mParameters),
			oRequestor = oModel.oRequestor,
			that = this;

		/*
		 * Returns the original resource path to be used for bound messages.
		 *
		 * @param {object} The response entity
		 * @returns {string} The original resource path
		 */
		function getOriginalResourcePath(oResponseEntity) {
			if (that.hasReturnValueContext(oOperationMetadata)) {
				return getReturnValueContextPath(sOriginalResourcePath,
					_Helper.getPrivateAnnotation(oResponseEntity, "predicate"));
			}
			if (that.isReturnValueLikeBindingParameter(oOperationMetadata)
				&& _Helper.getPrivateAnnotation(vEntity, "predicate")
					=== _Helper.getPrivateAnnotation(oResponseEntity, "predicate")) {
				// return value is *same* as binding parameter: attach messages to the latter
				return sOriginalResourcePath.slice(0, sOriginalResourcePath.lastIndexOf("/"));
			}

			return sOriginalResourcePath;
		}

		if (!bAction && oOperationMetadata.$kind !== "Function") {
			throw new Error("Not an operation: " + sPath);
		}

		if (this.bInheritExpandSelect
			&& !this.isReturnValueLikeBindingParameter(oOperationMetadata)) {
			throw new Error("Must not set parameter $$inheritExpandSelect on this binding");
		}

		this.oOperation.bAction = bAction;
		if (bAction && fnGetEntity) {
			vEntity = fnGetEntity();
		}
		this.mCacheQueryOptions = this.computeOperationQueryOptions();
		sPath = oRequestor.getPathAndAddQueryOptions(sPath, oOperationMetadata, mParameters,
			this.mCacheQueryOptions, vEntity);
		oCache = _Cache.createSingle(oRequestor, sPath, this.mCacheQueryOptions,
			oModel.bAutoExpandSelect, getOriginalResourcePath, bAction, sMetaPath,
			oOperationMetadata.$ReturnType
				&& !oOperationMetadata.$ReturnType.$Type.startsWith("Edm."));
		this.oCache = oCache;
		this.oCachePromise = SyncPromise.resolve(oCache);
		return bAction
			? oCache.post(oGroupLock, mParameters, vEntity)
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
			this.oElementContext = undefined;
		}
		if (this.oParameterContext) {
			this.oParameterContext.destroy();
			this.oParameterContext = undefined;
		}
		if (this.oReturnValueContext) {
			this.oReturnValueContext.destroy();
			this.oReturnValueContext = undefined;
		}
		this.oModel.bindingDestroyed(this);
		this.mCacheByResourcePath = undefined;
		this.oOperation = undefined;
		this.mParameters = undefined;
		this.mQueryOptions = undefined;

		asODataParentBinding.prototype.destroy.call(this);
		ContextBinding.prototype.destroy.call(this);
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#doCreateCache
	 */
	ODataContextBinding.prototype.doCreateCache = function (sResourcePath, mQueryOptions, oContext,
			sDeepResourcePath) {
		return _Cache.createSingle(this.oModel.oRequestor, sResourcePath, mQueryOptions,
			this.oModel.bAutoExpandSelect, function () {
				return sDeepResourcePath;
			});
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#doDeregisterChangeListener
	 */
	ODataContextBinding.prototype.doDeregisterChangeListener = function (sPath, oListener) {
		if (this.oOperation && (sPath === "$Parameter" || sPath.startsWith("$Parameter/"))) {
			_Helper.removeByPath(this.oOperation.mChangeListeners,
				sPath.slice(/*"$Parameter/".length*/11), oListener);
			return;
		}
		asODataParentBinding.prototype.doDeregisterChangeListener.apply(this, arguments);
	};

	/**
	 * Hook method for {@link sap.ui.model.odata.v4.ODataBinding#fetchQueryOptionsForOwnCache} to
	 * determine the query options for this binding.
	 *
	 * @param {sap.ui.model.Context} oContext
	 *   The context instance to be used
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise resolving with the binding's query options
	 *
	 * @private
	 */
	ODataContextBinding.prototype.doFetchQueryOptions = function (oContext) {
		return this.fetchResolvedQueryOptions(oContext);
	};

	/**
	 * Handles setting a parameter property in case of a deferred operation binding, otherwise it
	 * returns <code>undefined</code>.
	 *
	 * @override
	 * @see sap.ui.model.odata.v4.ODataParentBinding#doSetProperty
	 */
	ODataContextBinding.prototype.doSetProperty = function (sPath, vValue, oGroupLock) {
		if (this.oOperation && (sPath === "$Parameter" || sPath.startsWith("$Parameter/"))) {
			_Helper.updateAll(this.oOperation.mChangeListeners, "", this.oOperation.mParameters,
				_Cache.makeUpdateData(sPath.split("/").slice(1), vValue));
			this.oOperation.bAction = undefined; // "not yet executed"
			if (oGroupLock) {
				oGroupLock.unlock();
			}
			return SyncPromise.resolve();
		}
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
	 *   Valid values are <code>undefined</code>, '$auto', '$auto.*', '$direct' or application group
	 *   IDs as specified in {@link sap.ui.model.odata.v4.ODataModel}.
	 * @returns {Promise}
	 *   A promise that is resolved without data or with a return value context when the operation
	 *   call succeeded, or rejected with an instance of <code>Error</code> in case of failure,
	 *   for instance if the operation metadata is not found, if overloading is not supported, or if
	 *   a collection-valued function parameter is encountered.
	 *
	 *   A return value context is a {@link sap.ui.model.odata.v4.Context} which represents a bound
	 *   operation response. It is created only if the operation is bound and has a single entity
	 *   return value from the same entity set as the operation's binding parameter and has a
	 *   parent context which is a {@link sap.ui.model.odata.v4.Context} and points to an entity
	 *   from an entity set.
	 *
	 *   If a return value context is created, it must be used instead of
	 *   <code>this.getBoundContext()</code>. All bound messages will be related to the return value
	 *   context only. Such a message can only be connected to a corresponding control if the
	 *   control's property bindings use the return value context as binding context.
	 * @throws {Error} If the binding's root binding is suspended, the given group ID is invalid, if
	 *   the binding is not a deferred operation binding (see
	 *   {@link sap.ui.model.odata.v4.ODataContextBinding}), if the binding is not resolved or
	 *   relative to a transient context (see {@link sap.ui.model.odata.v4.Context#isTransient}), or
	 *   if deferred operation bindings are nested, or if the OData resource path for a deferred
	 *   operation binding's context cannot be determined.
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

		return this._execute(this.lockGroup(sGroupId, true));
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
	 * @param {boolean} [bCached=false]
	 *   Whether to return cached values only and not trigger a request
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise on the outcome of the cache's <code>fetchValue</code> call; it is rejected in
	 *   case cached values are asked for, but not found
	 * @throws {Error} If the binding's root binding is suspended, a "canceled" error is thrown
	 *
	 * @private
	 */
	ODataContextBinding.prototype.fetchValue = function (sPath, oListener, bCached) {
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
				sRelativePath = oCache || that.oOperation
					? that.getRelativePath(sPath)
					: undefined,
				aSegments,
				vValue;

			if (that.oOperation) {
				if (sRelativePath === undefined) {
					// a reduced path to a property of the binding parameter
					return that.oContext.fetchValue(sPath, oListener, bCached);
				}
				aSegments = sRelativePath.split("/");
				if (aSegments[0] === "$Parameter") {
					if (aSegments.length === 1) {
						return undefined;
					}
					_Helper.addByPath(that.oOperation.mChangeListeners,
						sRelativePath.slice(/*"$Parameter/".length*/11), oListener);

					vValue = _Helper.drillDown(that.oOperation.mParameters, aSegments.slice(1));

					return vValue === undefined ? null : vValue;
				}
			}

			if (oCache && sRelativePath !== undefined) {
				if (bCached) {
					oGroupLock = _GroupLock.$cached;
				} else {
					oGroupLock = that.oReadGroupLock || that.lockGroup();
					that.oReadGroupLock = undefined;
				}

				return that.resolveRefreshPromise(
					oCache.fetchValue(oGroupLock, sRelativePath, function () {
						bDataRequested = true;
						that.fireDataRequested();
					}, oListener)
				).then(function (vValue) {
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

			if (!that.oOperation && that.oContext) {
				return that.oContext.fetchValue(sPath, oListener, bCached);
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
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#getDependentBindings
	 */
	ODataContextBinding.prototype.getDependentBindings = function () {
		return this.oModel.getDependentBindings(this);
	};

	/**
	 * Returns the context pointing to the parameters of a deferred operation binding.
	 *
	 * @returns {sap.ui.model.odata.v4.Context}
	 *   The parameter context
	 * @throws {Error}
	 *   If the binding is not a deferred operation binding (see
	 *   {@link sap.ui.model.odata.v4.ODataContextBinding})
	 *
	 * @public
	 * @since 1.73
	 */
	ODataContextBinding.prototype.getParameterContext = function () {
		if (!this.oOperation) {
			throw new Error("Not a deferred operation binding: " + this);
		}
		return this.oParameterContext;
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataParentBinding#getQueryOptionsFromParameters
	 */
	ODataContextBinding.prototype.getQueryOptionsFromParameters = function () {
		var mParentQueryOptions, mQueryOptions;

		if (!this.bInheritExpandSelect) {
			return this.mQueryOptions;
		}

		mParentQueryOptions = this.oContext.getBinding().getCacheQueryOptions();
		mQueryOptions = Object.assign({}, this.mQueryOptions);
		if ("$select" in mParentQueryOptions) {
			mQueryOptions.$select = mParentQueryOptions.$select;
		}
		if ("$expand" in mParentQueryOptions) {
			mQueryOptions.$expand = mParentQueryOptions.$expand;
		}

		return mQueryOptions;
	};

	/**
	 * Returns the resolved path by calling {@link sap.ui.model.odata.v4.ODataModel#resolve} and
	 * replacing all occurrences of transient predicates with the corresponding key predicates.
	 *
	 * @returns {string}
	 *   The resolved path with replaced transient predicates
	 * @throws {Error}
	 *   If an entity related to a segment with a transient predicate does not have key predicates
	 *
	 * @private
	 */
	ODataContextBinding.prototype.getResolvedPath = function () {
		var sPath = "",
			sResolvedPath = this.oModel.resolve(this.sPath, this.oContext),
			aSegments,
			that = this;

		if (sResolvedPath && sResolvedPath.includes("($uid=")) {
			aSegments = sResolvedPath.slice(1).split("/");
			sResolvedPath = "";
			aSegments.forEach(function (sSegment) {
				var oEntity, sPredicate, iTransientPredicate;

				sPath += "/" + sSegment;
				iTransientPredicate = sSegment.indexOf("($uid=");
				if (iTransientPredicate >= 0) {
					oEntity = that.oContext.getValue(sPath);
					sPredicate = oEntity && _Helper.getPrivateAnnotation(oEntity, "predicate");
					if (!sPredicate) {
						throw new Error("No key predicate known at " + sPath);
					}
					sResolvedPath += "/" + sSegment.slice(0, iTransientPredicate) + sPredicate;
				} else {
					sResolvedPath += "/" + sSegment;
				}
			});
		}
		return sResolvedPath;
	};

	/**
	 * Determines whether an operation binding creates a return value context on {@link #execute}.
	 * The following conditions must hold for a return value context to be created:
	 * 1. Operation is bound.
	 * 2. Operation has single entity return value. Note: existence of EntitySetPath
	 *    implies the return value is an entity or a collection thereof;
	 *    see OData V4 spec part 3, 12.1.3. It thus ensures the "entity" in this condition.
	 * 3. EntitySetPath of operation is the binding parameter.
	 * 4. Operation binding has
	 *    (a) a V4 parent context which
	 *    (b) points to an entity from an entity set w/o navigation properties.
	 *
	 * @param {object} oMetadata The operation metadata
	 * @returns {boolean} Whether a return value context is created
	 *
	 * @private
	 */
	ODataContextBinding.prototype.hasReturnValueContext = function (oMetadata) {
		var oMetaModel = this.oModel.getMetaModel(),
			aMetaSegments;

		if (!this.isReturnValueLikeBindingParameter(oMetadata)) {
			return false;
		}

		aMetaSegments = oMetaModel.getMetaPath(this.oModel.resolve(this.sPath, this.oContext))
			.split("/");

		return aMetaSegments.length === 3
			&& oMetaModel.getObject("/" + aMetaSegments[1]).$kind === "EntitySet"; // case 4b
	};

	/**
	 * Initializes the OData context binding: Fires a 'change' event in case the binding has a
	 * resolved path and its root binding is not suspended.
	 *
	 * @protected
	 * @see sap.ui.model.Binding#initialize
	 * @see #getRootBinding
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#initialize
	ODataContextBinding.prototype.initialize = function () {
		if ((!this.bRelative || this.oContext) && !this.getRootBinding().isSuspended()) {
			this._fireChange({reason : ChangeReason.Change});
		}
	};

	/**
	 * Determines whether an operation's return value is like its binding parameter in the following
	 * sense:
	 * 1. Operation is bound.
	 * 2. Operation has single entity return value. Note: existence of EntitySetPath
	 *    implies the return value is an entity or a collection thereof;
	 *    see OData V4 spec part 3, 12.1.3. It thus ensures the "entity" in this condition.
	 * 3. EntitySetPath of operation is the binding parameter.
	 * 4. Operation binding has
	 *    (a) a V4 parent context.
	 *
	 * @param {object} oMetadata The operation metadata
	 * @returns {boolean} Whether operation's return value is like its binding parameter
	 *
	 * @private
	 */
	ODataContextBinding.prototype.isReturnValueLikeBindingParameter = function (oMetadata) {
		if (!(this.bRelative && this.oContext && this.oContext.getBinding)) { // case 4a
			return false;
		}

		return oMetadata.$IsBound // case 1
			&& oMetadata.$ReturnType && !oMetadata.$ReturnType.$isCollection
				&& oMetadata.$EntitySetPath // case 2
			&& oMetadata.$EntitySetPath.indexOf("/") < 0; // case 3
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#refreshInternal
	 */
	ODataContextBinding.prototype.refreshInternal = function (sResourcePathPrefix, sGroupId,
			bCheckUpdate, bKeepCacheOnError) {
		var that = this;

		if (this.oOperation && this.oOperation.bAction !== false) {
			return SyncPromise.resolve();
		}

		if (this.isRootBindingSuspended()) {
			this.refreshSuspended(sGroupId);
			return this.refreshDependentBindings(sResourcePathPrefix, sGroupId, bCheckUpdate,
				bKeepCacheOnError);
		}

		this.createReadGroupLock(sGroupId, this.isRoot());
		return this.oCachePromise.then(function (oCache) {
			var oPromise = that.oRefreshPromise,
				oReadGroupLock = that.oReadGroupLock;

			if (!that.oElementContext) { // refresh after delete
				that.oElementContext = Context.create(that.oModel, that,
					that.oModel.resolve(that.sPath, that.oContext));
				if (!oCache) { // make sure event IS fired
					that._fireChange({reason : ChangeReason.Refresh});
				}
			}
			if (that.oOperation) {
				that.oReadGroupLock = undefined;
				return that._execute(oReadGroupLock);
			}
			if (oCache && !oPromise) { // do not refresh twice
				// remove all cached Caches before fetching a new one
				that.removeCachesAndMessages(sResourcePathPrefix);
				that.fetchCache(that.oContext);
				// Do not fire a change event, or else ManagedObject destroys and recreates the
				// binding hierarchy causing a flood of events.
				oPromise = that.createRefreshPromise();
				if (bKeepCacheOnError) {
					oPromise = oPromise.catch(function (oError) {
						return that.fetchResourcePath(that.oContext).then(function (sResourcePath) {
							if (!that.bRelative || oCache.$resourcePath === sResourcePath) {
								that.oCache = oCache;
								that.oCachePromise = SyncPromise.resolve(oCache);
								oCache.setActive(true);
								return that.checkUpdateInternal();
							}
						}).then(function () {
							throw oError;
						});
					});
				}
				if (!bCheckUpdate) {
					// If bCheckUpdate is unset, dependent bindings do not call fetchValue, and we
					// have to call it here.
					// Note: this resets that.oRefreshPromise
					that.fetchValue("").catch(function () {/*avoid "Uncaught (in promise)"*/});
				}
			}
			return SyncPromise.all([
				oPromise,
				that.refreshDependentBindings(sResourcePathPrefix, sGroupId, bCheckUpdate,
					bKeepCacheOnError)
			]);
		});
	};

	/**
	 * Refreshes the given context if it is this binding's return value context.
	 *
	 * @param {sap.ui.model.odata.v4.Context} oContext
	 *   The context to refresh
	 * @param {string} sGroupId
	 *   The group ID for the refresh
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise resolving without a defined result when the refresh is finished if the context is
	 *   this binding's return value context; <code>null</code> otherwise
	 *
	 * @private
	 */
	ODataContextBinding.prototype.refreshReturnValueContext = function (oContext, sGroupId) {
		var oCache,
			oModel = this.oModel;

		if (this.oReturnValueContext !== oContext) {
			return null;
		}

		this.mCacheQueryOptions = this.computeOperationQueryOptions();
		oCache = _Cache.createSingle(oModel.oRequestor,
			this.oReturnValueContext.getPath().slice(1), this.mCacheQueryOptions, true);
		this.oCache = oCache;
		this.oCachePromise = SyncPromise.resolve(oCache);
		this.createReadGroupLock(sGroupId, true);
		return this.refreshDependentBindings("", sGroupId, true);
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataParentBinding#requestSideEffects
	 */
	ODataContextBinding.prototype.requestSideEffects = function (sGroupId, aPaths, oContext) {
		var oModel = this.oModel,
			// Hash set of collection-valued navigation property meta paths (relative to the cache's
			// root) which need to be refreshed, maps string to <code>true</code>
			mNavigationPropertyPaths = {},
			aPromises = [];

		/*
		 * Adds an error handler to the given promise which reports errors to the model.
		 *
		 * @param {Promise} oPromise - A promise
		 * @return {Promise} A promise including an error handler
		 */
		function reportError(oPromise) {
			return oPromise.catch(function (oError) {
				oModel.reportError("Failed to request side effects", sClassName, oError);
				throw oError;
			});
		}

		if (aPaths.indexOf("") < 0) {
			try {
				aPromises.push(
					this.oCache.requestSideEffects(this.lockGroup(sGroupId), aPaths,
						mNavigationPropertyPaths, oContext && oContext.getPath().slice(1)));

				this.visitSideEffects(sGroupId, aPaths, oContext, mNavigationPropertyPaths,
					aPromises);

				return SyncPromise.all(aPromises.map(reportError));
			} catch (e) {
				if (!e.message.startsWith("Unsupported collection-valued navigation property ")) {
					throw e;
				}
			}
		}
		return oContext && this.refreshReturnValueContext(oContext, sGroupId)
			|| this.refreshInternal("", sGroupId, true, true);
	};

	/**
	 * Returns a promise on the value for the given path relative to this binding. The function
	 * allows access to the complete data the binding points to (if <code>sPath</code> is "") or
	 * any part thereof. The data is a JSON structure as described in
	 * <a
	 * href="http://docs.oasis-open.org/odata/odata-json-format/v4.0/odata-json-format-v4.0.html">
	 * "OData JSON Format Version 4.0"</a>.
	 * Note that the function clones the result. Modify values via
	 * {@link sap.ui.model.odata.v4.Context#setProperty}.
	 *
	 * If you want {@link #requestObject} to read fresh data, call
	 * <code>oBinding.refresh()</code> first.
	 *
	 * @param {string} [sPath=""]
	 *   A path relative to this context binding
	 * @returns {Promise}
	 *   A promise on the requested value; in case there is no bound context this promise resolves
	 *   with <code>undefined</code>
	 * @throws {Error}
	 *   If the context's root binding is suspended
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.ODataContext#requestObject
	 * @since 1.69
	 */
	ODataContextBinding.prototype.requestObject = function (sPath) {
		return this.oElementContext
			? this.oElementContext.requestObject(sPath)
			: Promise.resolve();
	};

	/**
	 * Resumes this binding and all dependent bindings and fires a change event afterwards.
	 *
	 * @param {boolean} bCheckUpdate
	 *   Whether dependent property bindings shall call <code>checkUpdateInternal</code>
	 *
	 * @private
	 */
	ODataContextBinding.prototype.resumeInternal = function (bCheckUpdate) {
		var sChangeReason = this.sResumeChangeReason;

		this.sResumeChangeReason = ChangeReason.Change;

		if (!this.oOperation) {
			this.mAggregatedQueryOptions = {};
			this.bAggregatedQueryOptionsInitial = true;
			this.removeCachesAndMessages("");
			this.fetchCache(this.oContext);
			this.getDependentBindings().forEach(function (oDependentBinding) {
				oDependentBinding.resumeInternal(bCheckUpdate);
			});
			this._fireChange({reason : sChangeReason});
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
				if (this.oParameterContext) {
					this.oParameterContext.destroy();
					this.oParameterContext = null;
				}
				this.fetchCache(oContext);
				if (oContext) {
					this.oElementContext = Context.create(this.oModel, this,
						this.oModel.resolve(this.sPath, oContext));
					if (this.oOperation) {
						this.oParameterContext = Context.create(this.oModel, this,
							this.oModel.resolve(this.sPath + "/$Parameter", oContext));
					}
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
		var vOldValue;

		if (!this.oOperation) {
			throw new Error("The binding must be deferred: " + this.sPath);
		}
		if (!sParameterName) {
			throw new Error("Missing parameter name");
		}
		if (vValue === undefined) {
			throw new Error("Missing value for parameter: " + sParameterName);
		}

		vOldValue = this.oOperation.mParameters[sParameterName];
		this.oOperation.mParameters[sParameterName] = vValue;
		_Helper.informAll(this.oOperation.mChangeListeners, sParameterName, vOldValue, vValue);

		this.oOperation.bAction = undefined; // "not yet executed"

		return this;
	};

	return ODataContextBinding;
});
