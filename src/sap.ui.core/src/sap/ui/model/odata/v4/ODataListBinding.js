/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataListBinding
sap.ui.define([
	"./Context",
	"./ODataParentBinding",
	"./lib/_AggregationCache",
	"./lib/_AggregationHelper",
	"./lib/_Cache",
	"./lib/_GroupLock",
	"./lib/_Helper",
	"sap/base/Log",
	"sap/base/util/uid",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/Binding",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/FilterType",
	"sap/ui/model/ListBinding",
	"sap/ui/model/Sorter",
	"sap/ui/model/odata/OperationMode"
], function (Context, asODataParentBinding, _AggregationCache, _AggregationHelper, _Cache,
		_GroupLock, _Helper, Log, uid, SyncPromise, Binding, ChangeReason, FilterOperator,
		FilterProcessor, FilterType, ListBinding, Sorter, OperationMode) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataListBinding",
		mSupportedEvents = {
			AggregatedDataStateChange : true,
			change : true,
			createCompleted : true,
			createSent : true,
			dataReceived : true,
			dataRequested : true,
			DataStateChange : true,
			patchCompleted : true,
			patchSent : true,
			refresh : true
		};

	/**
	 * Do <strong>NOT</strong> call this private constructor, but rather use
	 * {@link sap.ui.model.odata.v4.ODataModel#bindList} instead!
	 *
	 * @param {sap.ui.model.odata.v4.ODataModel} oModel
	 *   The OData V4 model
	 * @param {string} sPath
	 *   The binding path in the model; must not end with a slash
	 * @param {sap.ui.model.Context} [oContext]
	 *   The parent context which is required as base for a relative path
	 * @param {sap.ui.model.Sorter | sap.ui.model.Sorter[]} [vSorters]
	 *   The dynamic sorters to be used initially; supported since 1.39.0
	 * @param {sap.ui.model.Filter | sap.ui.model.Filter[]} [vFilters]
	 *   The dynamic application filters to be used initially; supported since 1.39.0
	 * @param {object} [mParameters]
	 *   Map of binding parameters
	 * @throws {Error}
	 *   If incorrect binding parameters are provided or an unsupported operation mode is used
	 *
	 * @alias sap.ui.model.odata.v4.ODataListBinding
	 * @author SAP SE
	 * @class List binding for an OData V4 model.
	 *   An event handler can only be attached to this binding for the following events:
	 *   'AggregatedDataStateChange', 'change', 'dataReceived', 'dataRequested', 'DataStateChange'
	 *   and 'refresh'. For other events, an error is thrown.
	 * @extends sap.ui.model.ListBinding
	 * @hideconstructor
	 * @mixes sap.ui.model.odata.v4.ODataParentBinding
	 * @public
	 * @since 1.37.0
	 * @version ${version}
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
	var ODataListBinding = ListBinding.extend("sap.ui.model.odata.v4.ODataListBinding", {
			constructor : function (oModel, sPath, oContext, vSorters, vFilters, mParameters) {
				ListBinding.call(this, oModel, sPath);
				// initialize mixin members
				asODataParentBinding.call(this);

				if (sPath.slice(-1) === "/") {
					throw new Error("Invalid path: " + sPath);
				}

				mParameters = _Helper.clone(mParameters) || {};
				this.checkBindingParameters(mParameters, ["$$aggregation", "$$canonicalPath",
					"$$groupId", "$$operationMode", "$$ownRequest", "$$patchWithoutSideEffects",
					"$$updateGroupId"]);
				this.aApplicationFilters = _Helper.toArray(vFilters);
				this.sChangeReason = oModel.bAutoExpandSelect ? "AddVirtualContext" : undefined;
				this.oDiff = undefined;
				this.aFilters = [];
				this.sGroupId = mParameters.$$groupId;
				this.bHasAnalyticalInfo = false;
				this.oHeaderContext = this.bRelative
					? null
					: Context.create(oModel, this, sPath);
				this.sOperationMode = mParameters.$$operationMode || oModel.sOperationMode;
				this.mPreviousContextsByPath = {};
				this.aPreviousData = [];
				this.aSorters = _Helper.toArray(vSorters);
				this.sUpdateGroupId = mParameters.$$updateGroupId;
				// Note: $$operationMode is validated before, oModel.sOperationMode also
				// Just check for the case that no mode was specified, but sort/filter takes place
				if (!this.sOperationMode
						&& (this.aSorters.length || this.aApplicationFilters.length)) {
					throw new Error("Unsupported operation mode: " + this.sOperationMode);
				}

				// Note: clone() dropped $$aggregation : undefined, which is good
				this.applyParameters(mParameters); // calls #reset
				if (!this.bRelative || oContext && !oContext.fetchValue) {
					this.createReadGroupLock(this.getGroupId(), true);
				}
				this.setContext(oContext);
				oModel.bindingCreated(this);
			}
		});

	asODataParentBinding(ODataListBinding.prototype);

	/**
	 * Attach event handler <code>fnFunction</code> to the 'createCompleted' event of this binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 *
	 * @public
	 * @since 1.66.0
	 */
	ODataListBinding.prototype.attachCreateCompleted = function (fnFunction, oListener) {
		this.attachEvent("createCompleted", fnFunction, oListener);
	};

	/**
	 * Detach event handler <code>fnFunction</code> from the 'createCompleted' event of this
	 * binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 *
	 * @public
	 * @since 1.66.0
	 */
	ODataListBinding.prototype.detachCreateCompleted = function (fnFunction, oListener) {
		this.detachEvent("createCompleted", fnFunction, oListener);
	};

	/**
	 * Attach event handler <code>fnFunction</code> to the 'createSent' event of this binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 *
	 * @public
	 * @since 1.66.0
	 */
	ODataListBinding.prototype.attachCreateSent = function (fnFunction, oListener) {
		this.attachEvent("createSent", fnFunction, oListener);
	};

	/**
	 * Detach event handler <code>fnFunction</code> from the 'createSent' event of this
	 * binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 *
	 * @public
	 * @since 1.66.0
	 */
	ODataListBinding.prototype.detachCreateSent = function (fnFunction, oListener) {
		this.detachEvent("createSent", fnFunction, oListener);
	};

	/**
	 * Deletes the entity identified by the edit URL.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID to be used for the DELETE request; if no group ID is specified, it
	 *   defaults to <code>getUpdateGroupId()</code>()
	 * @param {string} sEditUrl
	 *   The edit URL to be used for the DELETE request
	 * @param {number} oContext
	 *   The context to be deleted
	 * @param {object} [oETagEntity]
	 *   An entity with the ETag of the binding for which the deletion was requested. This is
	 *   provided if the deletion is delegated from a context binding with empty path to a list
	 *   binding.
	 * @returns {Promise}
	 *   A promise which is resolved without a result in case of success, or rejected with an
	 *   instance of <code>Error</code> in case of failure.
	 *
	 * @private
	 */
	ODataListBinding.prototype._delete = function (oGroupLock, sEditUrl, oContext, oETagEntity) {
		var bFireChange = false,
			that = this;

		return this.deleteFromCache(oGroupLock, sEditUrl, String(oContext.iIndex), oETagEntity,
			function (iIndex, aEntities) {
				var sContextPath, i, sPredicate, sResolvedPath, i$skipIndex;

				if (oContext.created()) {
					// happens only for a created context that is not transient anymore
					that.destroyCreated(oContext, true);
				} else {
					// prepare all contexts for deletion
					for (i = iIndex; i < that.aContexts.length; i += 1) {
						oContext = that.aContexts[i];
						if (oContext) {
							that.mPreviousContextsByPath[oContext.getPath()] = oContext;
						}
					}
					sResolvedPath = that.oModel.resolve(that.sPath, that.oContext);
					that.aContexts.splice(iIndex, 1); // adjust the contexts array
					for (i = iIndex; i < that.aContexts.length; i += 1) {
						if (that.aContexts[i]) {
							i$skipIndex = i - that.iCreatedContexts;
							// calculate the context path and try to re-use the context for it
							sPredicate = _Helper.getPrivateAnnotation(aEntities[i], "predicate");
							sContextPath = sResolvedPath + (sPredicate || "/" + i$skipIndex);
							oContext = that.mPreviousContextsByPath[sContextPath];
							if (oContext) {
								delete that.mPreviousContextsByPath[sContextPath];
								if (oContext.iIndex === i$skipIndex) {
									oContext.checkUpdate(); // same row, but different data
								} else {
									oContext.iIndex = i$skipIndex; // same data, but different row
								}
							} else {
								oContext
									= Context.create(that.oModel, that, sContextPath, i$skipIndex);
							}
							that.aContexts[i] = oContext;
						}
					}
					that.iMaxLength -= 1; // this doesn't change Infinity
				}
				bFireChange = true;
			}
		).then(function () {
			// Fire the change asynchronously so that Cache#delete is finished and #getContexts can
			// read the data synchronously. This is important for extended change detection.
			if (bFireChange) {
				that._fireChange({reason : ChangeReason.Remove});
			}
		});
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#adjustPredicate
	 */
	ODataListBinding.prototype.adjustPredicate = function (sTransientPredicate, sPredicate,
			oContext) {
		var that = this;

		/*
		 * Replace $uid also in previous data to avoid useless diff in ODLB#getContexts.
		 *
		 * @param {string} sOldPath - The old path containing the transient predicate
		 * @param {string} sNewPath - The path with the transient predicate replaced
		 */
		function adjustPreviousData(sOldPath, sNewPath) {
			var iIndex = that.aPreviousData.indexOf(sOldPath);

			if (iIndex >= 0) {
				that.aPreviousData[iIndex] = sNewPath;
			}
		}

		if (oContext) {
			oContext.adjustPredicate(sTransientPredicate, sPredicate, adjustPreviousData);
		} else {
			this.oHeaderContext.adjustPredicate(sTransientPredicate, sPredicate);
			this.aContexts.forEach(function (oContext) {
				oContext.adjustPredicate(sTransientPredicate, sPredicate, adjustPreviousData);
			});
		}
	};

	/**
	 * Applies the given map of parameters to this binding's parameters and triggers the
	 * creation of a new cache if called with a change reason.
	 *
	 * @param {object} mParameters
	 *   Map of binding parameters, {@link sap.ui.model.odata.v4.ODataModel#constructor}
	 * @param {sap.ui.model.ChangeReason} [sChangeReason]
	 *   A change reason for {@link #reset}
	 * @throws {Error}
	 *   If disallowed binding parameters are provided
	 *
	 * @private
	 */
	ODataListBinding.prototype.applyParameters = function (mParameters, sChangeReason) {
		var sApply,
			sOldApply = this.mQueryOptions && this.mQueryOptions.$apply;

		if ("$$aggregation" in mParameters) {
			if ("$apply" in mParameters) {
				throw new Error("Cannot combine $$aggregation and $apply");
			}
			// Note: this validates mParameters.$$aggregation!
			sApply = _AggregationHelper.buildApply(mParameters.$$aggregation).$apply;
			if (sChangeReason === "" && sApply !== sOldApply) {
				sChangeReason = ChangeReason.Change;
			}
		}
		this.mQueryOptions = this.oModel.buildQueryOptions(mParameters, true);
		this.mParameters = mParameters; // store mParameters at binding after validation
		if (sApply) {
			this.mQueryOptions.$apply = sApply;
		}

		if (sChangeReason === "") { // unchanged $apply derived from $$aggregation
			return;
		}
		if (this.isRootBindingSuspended()) {
			this.setResumeChangeReason(sChangeReason);
			return;
		}

		this.removeCachesAndMessages("");
		this.fetchCache(this.oContext);
		this.reset(sChangeReason);
	};

	/**
	 * The 'change' event is fired when new contexts are created or removed, or the binding's parent
	 * context is changed. Controls use the event to get notified about changes to the binding
	 * contexts of this list binding. Registered event handlers are called with the reason and
	 * detailed reason as parameters.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @param {object} oEvent.getParameters()
	 * @param {sap.ui.model.ChangeReason} oEvent.getParameters().reason
	 *   The reason for the 'change' event: {@link sap.ui.model.ChangeReason.Add} when a new
	 *   context is created, {@link sap.ui.model.ChangeReason.Remove} when a context is removed,
	 *   {@link sap.ui.model.ChangeReason.Context} when the parent context is changed, or
	 *   {@link sap.ui.model.ChangeReason.Change} for other changes
	 * @param {string} oEvent.getParameters().detailedReason
	 *   During automatic determination of $expand and $select, a "virtual" context is first added
	 *   with detailed reason "AddVirtualContext" and then removed with detailed reason
	 *   "RemoveVirtualContext" (since 1.69.0); <code>undefined</code> is used in all other cases
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataListBinding#change
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The 'createCompleted' event is fired when the backend has responded to a POST request
	 * triggered for a {@link #create} on this binding. For each 'createSent' event, a
	 * 'createCompleted' event is fired.
	 *
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.model.odata.v4.ODataListBinding} oEvent.getSource() This binding
	 * @param {object} oEvent.getParameters() Object containing all event parameters
	 * @param {sap.ui.model.odata.v4.Context} oEvent.getParameters().context
	 *   The context for the created entity
	 * @param {boolean} oEvent.getParameters().success
	 *   Whether the POST was successfully processed; in case of an error, the error is already
	 *   reported to the {@link sap.ui.core.message.MessageManager}
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataListBinding#createCompleted
	 * @public
	 * @since 1.66.0
	 */

	/**
	 * The 'createSent' event is fired when a POST request triggered for a {@link #create} on this
	 * binding is sent to the backend. For each 'createSent' event, a 'createCompleted' event is
	 * fired.
	 *
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.model.odata.v4.ODataListBinding} oEvent.getSource() This binding
	 * @param {object} oEvent.getParameters() Object containing all event parameters
	 * @param {sap.ui.model.odata.v4.Context} oEvent.getParameters().context
	 *   The context for the created entity
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataListBinding#createSent
	 * @public
	 * @since 1.66.0
	 */

	/**
	 * The 'dataReceived' event is fired after the back-end data has been processed and the
	 * registered 'change' event listeners have been notified. It is only fired for GET requests.
	 * The 'dataReceived' event is to be used by applications for example to switch off a busy
	 * indicator or to process an error.
	 *
	 * If back-end requests are successful, the event has almost no parameters. For compatibility
	 * with {@link sap.ui.model.Binding#event:dataReceived}, an event parameter
	 * <code>data : {}</code> is provided: "In error cases it will be undefined", but otherwise it
	 * is not. Use the binding's contexts via
	 * {@link #getCurrentContexts oEvent.getSource().getCurrentContexts()} to access the response
	 * data. Note that controls bound to this data may not yet have been updated, meaning it is not
	 * safe for registered event handlers to access data via control APIs.
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
	 * @name sap.ui.model.odata.v4.ODataListBinding#dataReceived
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The 'dataRequested' event is fired directly after data has been requested from a backend.
	 * It is only fired for GET requests. The 'dataRequested' event is to be used by applications
	 * for example to switch on a busy indicator. Registered event handlers are called without
	 * parameters.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataListBinding#dataRequested
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The 'patchCompleted' event is fired when the backend has responded to the last PATCH request
	 * for this binding. If there is more than one PATCH request in a $batch, the event is fired
	 * only once. Only bindings using an own data service request fire a 'patchCompleted' event.
	 * For each 'patchSent' event, a 'patchCompleted' event is fired.
	 *
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.model.odata.v4.ODataListBinding} oEvent.getSource() This binding
	 * @param {object} oEvent.getParameters() Object containing all event parameters
	 * @param {boolean} oEvent.getParameters().success
	 *   Whether all PATCHes are successfully processed
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataListBinding#patchCompleted
	 * @public
	 * @since 1.59.0
	 */

	/**
	 * The 'patchSent' event is fired when the first PATCH request for this binding is sent to the
	 * backend. If there is more than one PATCH request in a $batch, the event is fired only once.
	 * Only bindings using an own data service request fire a 'patchSent' event. For each
	 * 'patchSent' event, a 'patchCompleted' event is fired.
	 *
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.model.odata.v4.ODataListBinding} oEvent.getSource() This binding
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataListBinding#patchSent
	 * @public
	 * @since 1.59.0
	 */

	/**
	 * The 'refresh' event is fired when the binding is initialized (since 1.67.0), or its parent
	 * context is changed or one of the methods {@link #changeParameters}, {@link #filter},
	 * {@link #refresh}, {@link #resume}, {@link #setAggregation} or {@link #sort} is called.
	 * Controls use the event to get notified about a refresh of the binding contexts of this list
	 * binding. Registered event handlers are called with the change reason as parameter.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @param {object} oEvent.getParameters()
	 * @param {sap.ui.model.ChangeReason} oEvent.getParameters().reason
	 *   The reason for the 'refresh' event is
	 *   <ul>
	 *   <li> {@link sap.ui.model.ChangeReason.Change Change} on {@link #setAggregation},
	 *   <li> {@link sap.ui.model.ChangeReason.Context Context} when the binding's
	 *     parent context is changed,
	 *   <li> {@link sap.ui.model.ChangeReason.Filter Filter} on {@link #filter},
	 *   <li> {@link sap.ui.model.ChangeReason.Refresh Refresh} on {@link #refresh}, or when the
	 *     binding is initialized,
	 *   <li> {@link sap.ui.model.ChangeReason.Sort Sort} on {@link #sort}.
	 *   </ul>
	 *   {@link #changeParameters} leads to {@link sap.ui.model.ChangeReason.Filter Filter} if one
	 *   of the parameters '$filter' and '$search' is changed, otherwise it leads to
	 *   {@link sap.ui.model.ChangeReason.Sort Sort} if the parameter '$orderby' is
	 *   changed; in other cases, it leads to {@link sap.ui.model.ChangeReason.Change Change}.<br>
	 *   {@link #resume} leads to {@link sap.ui.model.ChangeReason.Change Change}; if APIs firing
	 *   change events have been called on the binding while suspended, the &quot;strongest&quot;
	 *   change reason in the order
	 *   {@link sap.ui.model.ChangeReason.Filter Filter},
	 *   {@link sap.ui.model.ChangeReason.Sort Sort},
	 *   {@link sap.ui.model.ChangeReason.Refresh Refresh},
	 *   {@link sap.ui.model.ChangeReason.Change Change} is used.
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataListBinding#refresh
	 * @public
	 * @since 1.37.0
	 */

	// See class documentation
	// @override
	// @public
	// @see sap.ui.base.EventProvider#attachEvent
	// @since 1.37.0
	ODataListBinding.prototype.attachEvent = function (sEventId) {
		if (!(sEventId in mSupportedEvents)) {
			throw new Error("Unsupported event '" + sEventId
				+ "': v4.ODataListBinding#attachEvent");
		}
		return ListBinding.prototype.attachEvent.apply(this, arguments);
	};

	/**
	 * Creates a new entity and inserts it at the start or the end of the list.
	 *
	 * For creating the new entity, the binding's update group ID is used, see binding parameter
	 * $$updateGroupId of {@link sap.ui.model.odata.v4.ODataModel#bindList}.
	 *
	 * You can call {@link sap.ui.model.odata.v4.Context#delete} to delete the created context
	 * again. As long as the context is transient (see
	 * {@link sap.ui.model.odata.v4.Context#isTransient}), {@link #resetChanges} and a call to
	 * {@link sap.ui.model.odata.v4.ODataModel#resetChanges} with the update group ID as parameter
	 * also delete the created context together with other changes.
	 *
	 * If the creation of the entity on the server failed, the creation is repeated
	 * automatically. If the binding's update group ID has
	 * {@link sap.ui.model.odata.v4.SubmitMode.API}, it is repeated with the next call of
	 * {@link sap.ui.model.odata.v4.ODataModel#submitBatch}. Otherwise it is repeated with the next
	 * update for the entity. Since 1.67.0, {@link sap.ui.model.odata.v4.ODataModel#submitBatch} can
	 * also be used for group IDs with {@link sap.ui.model.odata.v4.SubmitMode.Auto} in order to
	 * repeat the creation even if there is no update for the entity.
	 *
	 * Each time the data for the created entity is sent to the server, a {@link #event:createSent}
	 * event is fired and each time the client receives a response for the creation, a
	 * {@link #event:createCompleted} event is fired, independent of whether the creation was
	 * successful or not.
	 *
	 * The initial data for the created entity can be supplied via the parameter
	 * <code>oInitialData</code> and modified via property bindings. Properties that are not part of
	 * the initial data show the default value from the service metadata on the UI, but they are not
	 * sent to the server. If there is no default value, <code>null</code> is used instead, even if
	 * the property is not <code>Nullable</code>.
	 *
	 * Note: If a server requires a property in the request, you must supply this property in the
	 * initial data, for example if the server requires a unit for an amount. This also applies if
	 * this property has a default value.
	 *
	 * Note: After creation, the created entity is refreshed to ensure that the data specified in
	 * this list binding's $expand is available; to skip this refresh, set <code>bSkipRefresh</code>
	 * to <code>true</code>.
	 *
	 * Note: A deep create is not supported. The dependent entity has to be created using a second
	 * list binding. Note that it is not supported to bind relative to a transient context.
	 *
	 * Note: The binding must have the parameter <code>$count : true</code> when creating an entity
	 * at the end. Otherwise the collection length may be unknown and there is no clear position to
	 * place this entity at.
	 *
	 * @param {object} [oInitialData={}]
	 *   The initial data for the created entity
	 * @param {boolean} [bSkipRefresh=false]
	 *   Whether an automatic refresh of the created entity will be skipped
	 * @param {boolean} [bAtEnd=false]
	 *   Whether the entity is inserted at the end of the list. When creating multiple entities,
	 *   this parameter must have the same value for each entity. Supported since 1.66.0
	 * @returns {sap.ui.model.odata.v4.Context}
	 *   The context object for the created entity; its method
	 *   {@link sap.ui.model.odata.v4.Context#created} returns a promise that is resolved when the
	 *   creation is finished
	 * @throws {Error}
	 *   If the binding's root binding is suspended, if a relative binding is not yet resolved, if
	 *   entities are created both at the start and at the end, or if <code>bAtEnd</code> is
	 *   <code>true</code> and the binding does not use the parameter <code>$count=true</code>
	 *
	 * @public
	 * @since 1.43.0
	 */
	ODataListBinding.prototype.create = function (oInitialData, bSkipRefresh, bAtEnd) {
		var oContext,
			oCreatePathPromise = this.fetchResourcePath(),
			oCreatePromise,
			oGroupLock,
			sResolvedPath = this.oModel.resolve(this.sPath, this.oContext),
			sTransientPredicate = "($uid=" + uid() + ")",
			sTransientPath = sResolvedPath + sTransientPredicate,
			that = this;

		if (!sResolvedPath) {
			throw new Error("Binding is not yet resolved: " + this);
		}

		bAtEnd = !!bAtEnd; // normalize to simplify comparisons
		if (bAtEnd && !this.mQueryOptions.$count) {
			throw new Error("Must set $count to create at the end");
		}
		if (this.bCreatedAtEnd !== undefined && this.bCreatedAtEnd !== bAtEnd) {
			throw new Error("Creating entities at the start and at the end is not supported.");
		}
		this.bCreatedAtEnd = bAtEnd;

		this.checkSuspended();

		// only for createInCache
		oGroupLock = this.lockGroup(this.getUpdateGroupId(), true, true, function () {
			that.destroyCreated(oContext, true);
			return Promise.resolve().then(function () {
				// Fire the change asynchronously so that Cache#delete is finished and #getContexts
				// can read the data synchronously. This is important for extended change detection.
				that._fireChange({reason : ChangeReason.Remove});
			});
		});
		oCreatePromise = this.createInCache(oGroupLock, oCreatePathPromise, "", sTransientPredicate,
			oInitialData,
			function (oError) { // error callback
				that.oModel.reportError("POST on '" + oCreatePathPromise
					+ "' failed; will be repeated automatically", sClassName, oError);

				that.fireEvent("createCompleted", {context : oContext, success : false});
			},
			function () { // submit callback
				that.fireEvent("createSent", {context : oContext});
			}
		).then(function (oCreatedEntity) {
			var sGroupId, sPredicate;

			if (!(oInitialData && oInitialData["@$ui5.keepTransientPath"])) {
				// refreshSingle requires the new key predicate in oContext.getPath()
				sPredicate = _Helper.getPrivateAnnotation(oCreatedEntity, "predicate");
				if (sPredicate) {
					that.adjustPredicate(sTransientPredicate, sPredicate, oContext);
					that.oModel.checkMessages();
				}
			}
			that.fireEvent("createCompleted", {context : oContext, success : true});
			if (!bSkipRefresh) {
				sGroupId = that.getGroupId();
				if (!that.oModel.isDirectGroup(sGroupId) && !that.oModel.isAutoGroup(sGroupId)) {
					sGroupId = "$auto";
				}

				return that.refreshSingle(oContext, that.lockGroup(sGroupId));
			}
		}, function (oError) {
			oGroupLock.unlock(true); // createInCache failed, so the lock might still be blocking
			throw oError;
		});

		this.iCreatedContexts += 1;
		oContext = Context.create(this.oModel, this, sTransientPath, -this.iCreatedContexts,
			oCreatePromise);
		this.aContexts.unshift(oContext);
		this._fireChange({reason : ChangeReason.Add});

		return oContext;
	};

	/**
	 * Creates contexts for this list binding in the given range for the given OData response.
	 * Fires change and dataReceived events. Destroys contexts that became
	 * obsolete and shrinks the array by removing trailing <code>undefined</code>.
	 *
	 * @param {number} iStart
	 *   The start index of the range
	 * @param {number} iLength
	 *   The number of contexts in the range
	 * @param {object[]} aResults
	 *   The OData entities read from the cache for the given range
	 * @returns {boolean}
	 *   <code>true</code>, if contexts have been created or dropped or <code>isLengthFinal</code>
	 *   has changed
	 *
	 * @private
	 */
	ODataListBinding.prototype.createContexts = function (iStart, iLength, aResults) {
		var bChanged = false,
			oContext,
			sContextPath,
			i,
			iCount = aResults.$count,
			i$skipIndex,
			bLengthFinal = this.bLengthFinal,
			oModel = this.oModel,
			sPath = oModel.resolve(this.sPath, this.oContext),
			sPredicate,
			bStartBeyondRange = iStart > this.aContexts.length,
			that = this;

		/*
		 * Shrinks contexts to the new length, destroys unneeded contexts
		 */
		function shrinkContexts() {
			var i,
				iNewLength = that.iMaxLength + that.iCreatedContexts;

			if (iNewLength >= that.aContexts.length) {
				return;
			}

			for (i = iNewLength; i < that.aContexts.length; i += 1) {
				if (that.aContexts[i]) {
					that.aContexts[i].destroy();
				}
			}
			while (iNewLength > 0 && !that.aContexts[iNewLength - 1]) {
				iNewLength -= 1;
			}
			that.aContexts.length = iNewLength;
			bChanged = true;
		}

		for (i = iStart; i < iStart + aResults.length; i += 1) {
			if (this.aContexts[i] === undefined && aResults[i - iStart]) {
				bChanged = true;
				i$skipIndex = i - this.iCreatedContexts; // index on server ($skip)
				sPredicate = _Helper.getPrivateAnnotation(aResults[i - iStart], "predicate")
					|| _Helper.getPrivateAnnotation(aResults[i - iStart], "transientPredicate");
				sContextPath = sPath + (sPredicate || "/" + i$skipIndex);
				oContext = this.mPreviousContextsByPath[sContextPath];
				if (oContext && (!oContext.created() || oContext.isTransient())) {
					// reuse the previous context, unless it is created and persisted
					delete this.mPreviousContextsByPath[sContextPath];
					oContext.iIndex = i$skipIndex;
					oContext.checkUpdate();
				} else {
					oContext = Context.create(oModel, this, sContextPath, i$skipIndex);
				}
				this.aContexts[i] = oContext;
			}
		}
		// destroy previous contexts which are not reused
		if (Object.keys(this.mPreviousContextsByPath).length) {
			sap.ui.getCore().addPrerenderingTask(this.destroyPreviousContexts.bind(this));
		}
		if (iCount !== undefined) { // server count is available or "non-empty short read"
			this.bLengthFinal = true;
			this.iMaxLength = iCount - this.iCreatedContexts;
			shrinkContexts();
		} else {
			if (!aResults.length) { // "empty short read"
				this.iMaxLength = iStart - this.iCreatedContexts;
				shrinkContexts();
			} else if (this.aContexts.length > this.iMaxLength + this.iCreatedContexts) {
				// upper boundary obsolete: reset it
				this.iMaxLength = Infinity;
			}
			// If we started to read beyond the range that we read before and the result is
			// empty, we cannot say anything about the length
			if (!(bStartBeyondRange && aResults.length === 0)) {
				this.bLengthFinal
					= this.aContexts.length === this.iMaxLength + this.iCreatedContexts;
			}
		}
		if (this.bLengthFinal !== bLengthFinal) {
			// bLengthFinal changed --> send change event even if no new data is available
			bChanged = true;
		}
		return bChanged;
	};

	/**
	 * Destroys the object. The object must not be used anymore after this function was called.
	 *
	 * @public
	 * @since 1.40.1
	 */
	// @override
	ODataListBinding.prototype.destroy = function () {
		if (this.bHasAnalyticalInfo && this.aContexts === undefined) {
			return;
		}
		this.aContexts.forEach(function (oContext) {
			oContext.destroy();
		});
		this.destroyPreviousContexts();
		if (this.oHeaderContext) {
			this.oHeaderContext.destroy();
		}
		this.oModel.bindingDestroyed(this);
		this.aApplicationFilters = undefined;
		this.aContexts = undefined;
		this.oDiff = undefined;
		this.aFilters = undefined;
		this.oHeaderContext = undefined;
//		this.mParameters = undefined;
		this.mPreviousContextsByPath = undefined;
		this.aPreviousData = undefined;
		this.mQueryOptions = undefined;
		this.aSorters = undefined;

		asODataParentBinding.prototype.destroy.call(this);
		ListBinding.prototype.destroy.call(this);
	};

	/**
	 * Removes the given context for a created entity from the list of contexts and destroys it.
	 *
	 * @param {sap.ui.model.Context} oContext
	 *   The context instance for the created entity to be destroyed
	 * @param {boolean} bDestroyLater
	 *   Whether to destroy the context later so that the control has time to handle the context's
	 *   dependent bindings before.
	 *
	 * @private
	 */
	ODataListBinding.prototype.destroyCreated = function (oContext, bDestroyLater) {
		var i,
			iIndex = oContext.getModelIndex();

		this.iCreatedContexts -= 1;
		for (i = 0; i < iIndex; i += 1) {
			this.aContexts[i].iIndex += 1;
		}
		if (!this.iCreatedContexts) {
			this.bCreatedAtEnd = undefined;
		}
		this.aContexts.splice(iIndex, 1);
		if (bDestroyLater && this.iCurrentEnd) {
			// Add the context to mPreviousContextsByPath although it definitely won't be reused.
			// Then it is destroyed later, but only if there is a listener (iCurrentEnd is set by
			// getContexts and mPreviousContextsByPath is only cleared when getContexts is called)
			this.mPreviousContextsByPath[oContext.getPath()] = oContext;
		} else {
			oContext.destroy();
		}
		// The path of all contexts in aContexts after the removed one is untouched, still points to
		// the same data, hence no checkUpdate is needed.
	};

	/**
	 * Clears mPreviousContextsByPath, destroying all contexts.
	 *
	 * @private
	 */
	ODataListBinding.prototype.destroyPreviousContexts = function () {
		var mPreviousContextsByPath = this.mPreviousContextsByPath;

		if (mPreviousContextsByPath) { // binding may have been destroyed already
			Object.keys(mPreviousContextsByPath).forEach(function (sPath) {
				mPreviousContextsByPath[sPath].destroy();
			});
			this.mPreviousContextsByPath = {};
		}
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#doCreateCache
	 */
	ODataListBinding.prototype.doCreateCache = function (sResourcePath, mQueryOptions, oContext,
			sDeepResourcePath) {
		var oAggregation = this.mParameters.$$aggregation,
			bAggregate = oAggregation && (oAggregation.groupLevels.length
				|| _AggregationHelper.hasMinOrMax(oAggregation.aggregate)
				|| _AggregationHelper.hasGrandTotal(oAggregation.aggregate));

		mQueryOptions = this.inheritQueryOptions(mQueryOptions, oContext);

		if (!bAggregate && mQueryOptions.$$filterBeforeAggregate) {
			mQueryOptions.$apply = "filter(" +  mQueryOptions.$$filterBeforeAggregate + ")/"
				+ mQueryOptions.$apply;
			delete mQueryOptions.$$filterBeforeAggregate;
		}
		// w/o grouping or min/max, $apply is sufficient; else _AggregationCache is needed
		return bAggregate
			? _AggregationCache.create(this.oModel.oRequestor, sResourcePath, oAggregation,
				mQueryOptions)
			: _Cache.create(this.oModel.oRequestor, sResourcePath, mQueryOptions,
				this.oModel.bAutoExpandSelect, sDeepResourcePath);
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
	ODataListBinding.prototype.doFetchQueryOptions = function (oContext) {
		var that = this;

		return this.fetchResolvedQueryOptions(oContext).then(function (mQueryOptions) {
			return that.fetchFilter(oContext, mQueryOptions.$filter).then(function (aFilters) {
				return _Helper.mergeQueryOptions(mQueryOptions,
					that.getOrderby(mQueryOptions.$orderby), aFilters);
			});
		});
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataParentBinding#doSetProperty
	 */
	ODataListBinding.prototype.doSetProperty = function () {};

	/*
	 * Delegates to {@link sap.ui.model.ListBinding#enableExtendedChangeDetection} while disallowing
	 * the <code>vKey</code> parameter.
	 */
	// @override
	ODataListBinding.prototype.enableExtendedChangeDetection = function (bDetectUpdates, vKey) {
		if (vKey !== undefined) {
			throw new Error("Unsupported property 'key' with value '" + vKey
				+ "' in binding info for " + this);
		}

		return ListBinding.prototype.enableExtendedChangeDetection.apply(this, arguments);
	};

	/**
	 * Fetches the data and creates contexts for the given range.
	 *
	 * @param {number} iStart
	 *   The index where to start the retrieval of contexts
	 * @param {number} iLength
	 *   The number of contexts to retrieve beginning from the start index, <code>Infinity</code>
	 *   may be used to retrieve all data
	 * @param {number} iMaximumPrefetchSize
	 *   The maximum number of rows to read before and after the given range
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} [oGroupLock]
	 *   A lock for the group ID to be used, defaults to the binding's group ID
	 * @param {boolean} [bAsync]
	 *   Whether the function must be async even if the data is available synchronously
	 * @param {function} [fnDataRequested]
	 *   The function is called just before a back-end request is sent.
	 *   If no back-end request is needed, the function is not called.
	 * @returns {sap.ui.base.SyncPromise|Promise}
	 *   A promise that resolves with a boolean indicating whether the binding's contexts have been
	 *   modified; it rejects when iStart or iLength are negative or when the request failed
	 *
	 * @private
	 */
	ODataListBinding.prototype.fetchContexts = function (iStart, iLength, iMaximumPrefetchSize,
			oGroupLock, bAsync, fnDataRequested) {
		var oPromise,
			that = this;

		if (this.bCreatedAtEnd) {
			// Note: We still have to read iLength rows in this case to get all entities from
			// the server. The created entities then are placed behind using the calculated or
			// estimated length.
			iStart += this.iCreatedContexts;
		}
		oGroupLock = oGroupLock || this.lockGroup();
		oPromise = this.fetchData(iStart, iLength, iMaximumPrefetchSize, oGroupLock,
			fnDataRequested);
		if (bAsync) {
			oPromise = Promise.resolve(oPromise);
		}

		return oPromise.then(function (oResult) {
			return oResult && that.createContexts(iStart, iLength, oResult.value);
		}, function (oError) {
			oGroupLock.unlock(true);
			throw oError;
		});
	};

	/**
	 * Reads the requested range from the cache and returns an object as described in _Cache#read.
	 *
	 * @param {number} iIndex
	 *   The start index of the range
	 * @param {number} iLength
	 *   The length of the range, <code>Infinity</code> may be used to retrieve all data
	 * @param {number} iMaximumPrefetchSize
	 *   The maximum number of rows to read before and after the given range
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} [oGroupLock]
	 *   A lock for the group ID to be used, defaults to the binding's group ID
	 * @param {function} [fnDataRequested]
	 *   The function is called just before a back-end request is sent.
	 *   If no back-end request is needed, the function is not called.
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise to be resolved with the requested range as described in _Cache#read, or
	 *   <code>undefined</code> w/o reading if the result is irrelevant because the context changed
	 *
	 * @private
	 */
	ODataListBinding.prototype.fetchData = function (iIndex, iLength, iMaximumPrefetchSize,
		oGroupLock, fnDataRequested) {
		var oContext = this.oContext,
			that = this;

		return this.oCachePromise.then(function (oCache) {
			// ensure that the result is still relevant
			if (that.bRelative && oContext !== that.oContext) {
				return undefined;
			}

			if (oCache) {
				return oCache.read(iIndex, iLength, iMaximumPrefetchSize, oGroupLock,
					fnDataRequested);
			}

			oGroupLock.unlock();
			return oContext.fetchValue(that.sReducedPath).then(function (aResult) {
				var iCount;

				// aResult may be undefined e.g. in case of a missing $expand in parent binding
				aResult = aResult || [];
				iCount = aResult.$count;
				aResult = aResult.slice(iIndex, iIndex + iLength);
				aResult.$count = iCount;

				return {value : aResult};
			});
		});
	};

	/**
	 * Returns a URL by which the complete content of the list can be downloaded in JSON format. The
	 * request delivers all entities considering the binding's query options (such as filters or
	 * sorters).
	 *
	 * @returns {sap.ui.base.SyncPromise<string>}
	 *   A promise that is resolved with the download URL.
	 * @throws {Error}
	 *   If the binding is unresolved
	 *
	 * @private
	 */
	ODataListBinding.prototype.fetchDownloadUrl = function () {
		var oModel = this.oModel;

		if (this.isRelative() && !this.oContext) {
			throw new Error("Binding is unresolved");
		}
		return this.withCache(function (oCache, sPath) {
			var mQueryOptions = oCache.mQueryOptions,
				sMetaPath = _Helper.getMetaPath(sPath); // the binding's meta path rel. to the cache

			if (sPath) {
				// reduce the query options to the child path
				mQueryOptions = _Helper.getQueryOptionsForPath(mQueryOptions, sPath);
				// add the custom query options again
				mQueryOptions = _Helper.merge({}, oModel.mUriParameters, mQueryOptions);
			}
			return oModel.sServiceUrl
				+ _Helper.buildPath(oCache.sResourcePath, sPath)
				+ oModel.oRequestor.buildQueryString(_Helper.buildPath(oCache.sMetaPath, sMetaPath),
					mQueryOptions);
		});
	};

	/**
	 * Requests a $filter query option value for the this binding; the value is computed from the
	 * given arrays of dynamic application and control filters and the given static filter.
	 *
	 * @param {sap.ui.model.Context} oContext
	 *   The context instance to be used; it is given as a parameter and this.oContext is unused
	 *   because setContext calls this method (indirectly) before calling the superclass to ensure
	 *   that the cache promise is already created when the events are fired.
	 * @param {string} sStaticFilter
	 *   The static filter value
	 * @returns {sap.ui.base.SyncPromise} A promise which resolves with an array that consists of
	 *   two filters, the first one ("$filter") has to be be applied after and the second one
	 *   ("$$filterBeforeAggregate") has to be applied before aggregating the data.
	 *   Both can be <code>undefined</code>. It rejects with an error if a filter has an unknown
	 *   operator or an invalid path.
	 *
	 * @private
	 */
	ODataListBinding.prototype.fetchFilter = function (oContext, sStaticFilter) {
		var oCombinedFilter, aFilters, oMetaModel, oMetaContext;

		/**
		 * Returns the $filter value for the given single filter using the given Edm type to
		 * format the filter's operand(s).
		 *
		 * @param {sap.ui.model.Filter} oFilter The filter
		 * @param {string} sEdmType The Edm type
		 * @param {boolean} bWithinAnd Whether the embedding filter is an 'and'
		 * @returns {string} The $filter value
		 */
		function getSingleFilterValue(oFilter, sEdmType, bWithinAnd) {
			var sFilter, sFilterPath, bToLower, sValue;

			function setCase(sText) {
				return bToLower ? "tolower(" + sText + ")" : sText;
			}

			bToLower = sEdmType === "Edm.String" && oFilter.bCaseSensitive === false;
			sFilterPath = setCase(decodeURIComponent(oFilter.sPath));
			sValue = setCase(_Helper.formatLiteral(oFilter.oValue1, sEdmType));

			switch (oFilter.sOperator) {
				case FilterOperator.BT :
					sFilter = sFilterPath + " ge " + sValue + " and " + sFilterPath + " le "
						+ setCase(_Helper.formatLiteral(oFilter.oValue2, sEdmType));
					break;
				case FilterOperator.NB :
					sFilter = wrap(sFilterPath + " lt " + sValue + " or " + sFilterPath + " gt "
						+ setCase(_Helper.formatLiteral(oFilter.oValue2, sEdmType)), bWithinAnd);
					break;
				case FilterOperator.EQ :
				case FilterOperator.GE :
				case FilterOperator.GT :
				case FilterOperator.LE :
				case FilterOperator.LT :
				case FilterOperator.NE :
					sFilter = sFilterPath + " " + oFilter.sOperator.toLowerCase() + " " + sValue;
					break;
				case FilterOperator.Contains :
				case FilterOperator.EndsWith :
				case FilterOperator.NotContains :
				case FilterOperator.NotEndsWith :
				case FilterOperator.NotStartsWith :
				case FilterOperator.StartsWith :
					sFilter = oFilter.sOperator.toLowerCase().replace("not", "not ")
						+ "(" + sFilterPath + "," + sValue + ")";
					break;
				default :
					throw new Error("Unsupported operator: " + oFilter.sOperator);
			}
			return sFilter;
		}

		/**
		 * Fetches the $filter value for the given filter.
		 * @param {sap.ui.model.Filter} oFilter The filter
		 * @param {object} mLambdaVariableToPath The map from lambda variable to full path
		 * @param {boolean} [bWithinAnd] Whether the embedding filter is an 'and'
		 * @returns {sap.ui.base.SyncPromise} A promise which resolves with the $filter value or
		 *   rejects with an error if the filter value uses an unknown operator
		 */
		function fetchFilter(oFilter, mLambdaVariableToPath, bWithinAnd) {
			var sResolvedPath;

			if (!oFilter) {
				return SyncPromise.resolve();
			}

			if (oFilter.aFilters) {
				return SyncPromise.all(oFilter.aFilters.map(function (oSubFilter) {
					return fetchFilter(oSubFilter, mLambdaVariableToPath, oFilter.bAnd);
				})).then(function (aFilterStrings) {
					// wrap it if it's an 'or' filter embedded in an 'and'
					return wrap(aFilterStrings.join(oFilter.bAnd ? " and " : " or "),
						bWithinAnd && !oFilter.bAnd);
				});
			}

			sResolvedPath = oMetaModel.resolve(
				replaceLambdaVariables(oFilter.sPath, mLambdaVariableToPath), oMetaContext);

			return oMetaModel.fetchObject(sResolvedPath).then(function (oPropertyMetadata) {
				var oCondition, sLambdaVariable, sOperator;

				if (!oPropertyMetadata) {
					throw new Error("Type cannot be determined, no metadata for path: "
						+ sResolvedPath);
				}

				sOperator = oFilter.sOperator;
				if (sOperator === FilterOperator.All || sOperator === FilterOperator.Any) {
					oCondition = oFilter.oCondition;
					sLambdaVariable = oFilter.sVariable;
					if (sOperator === FilterOperator.Any && !oCondition) {
						return oFilter.sPath + "/any()";
					}
					// multifilters are processed in parallel, so clone mLambdaVariableToPath
					// to allow same lambda variables in different filters
					mLambdaVariableToPath = Object.create(mLambdaVariableToPath);
					mLambdaVariableToPath[sLambdaVariable]
						= replaceLambdaVariables(oFilter.sPath, mLambdaVariableToPath);

					return fetchFilter(
						oCondition, mLambdaVariableToPath
					).then(function (sFilterValue) {
						return oFilter.sPath + "/" + oFilter.sOperator.toLowerCase()
							+ "(" + sLambdaVariable + ":" + sFilterValue + ")";
					});
				}
				return getSingleFilterValue(oFilter, oPropertyMetadata.$Type, bWithinAnd);
			});
		}

		/**
		 * Replaces an optional lambda variable in the first segment of the given path by the
		 * correct path.
		 *
		 * @param {string} sPath The path with an optional lambda variable at the beginning
		 * @param {object} mLambdaVariableToPath The map from lambda variable to full path
		 * @returns {string} The path with replaced lambda variable
		 */
		function replaceLambdaVariables(sPath, mLambdaVariableToPath) {
			var aSegments = sPath.split("/");

			aSegments[0] = mLambdaVariableToPath[aSegments[0]];
			return aSegments[0] ? aSegments.join("/") : sPath;
		}

		/**
		 * Wraps the filter string in round brackets if requested.
		 *
		 * @param {string} sFilter The filter string
		 * @param {boolean} bWrap Whether to wrap
		 * @returns {string} The resulting filter string
		 */
		function wrap(sFilter, bWrap) {
			return bWrap ? "(" + sFilter + ")" : sFilter;
		}

		oCombinedFilter = FilterProcessor.combineFilters(this.aFilters, this.aApplicationFilters);
		if (!oCombinedFilter) {
			return SyncPromise.resolve([sStaticFilter]);
		}
		aFilters = _AggregationHelper.splitFilter(oCombinedFilter, this.mParameters.$$aggregation);
		oMetaModel = this.oModel.getMetaModel();
		oMetaContext = oMetaModel.getMetaContext(this.oModel.resolve(this.sPath, oContext));

		return SyncPromise.all([
			fetchFilter(aFilters[0], {}, /*bWithAnd*/sStaticFilter).then(function (sFilter) {
				return sFilter && sStaticFilter
					? sFilter + " and (" + sStaticFilter + ")"
					: sFilter || sStaticFilter;
			}),
			fetchFilter(aFilters[1], {})
		]);
	};

	/**
	 * Requests the value for the given path and index; the value is requested from this binding's
	 * cache or from its context in case it has no cache.
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
	 *
	 * @private
	 */
	ODataListBinding.prototype.fetchValue = function (sPath, oListener, bCached) {
		var that = this;

		return this.oCachePromise.then(function (oCache) {
			var oGroupLock, sRelativePath;

			if (oCache) {
				oGroupLock = bCached ? _GroupLock.$cached : that.lockGroup();
				sRelativePath = that.getRelativePath(sPath);
				if (sRelativePath !== undefined) {
					return oCache.fetchValue(oGroupLock, sRelativePath, undefined, oListener);
				}
			}
			if (that.oContext) {
				return that.oContext.fetchValue(sPath, oListener, bCached);
			}
		});
	};

	/**
	 * Filters the list with the given filters.
	 *
	 * If there are pending changes an error is thrown. Use {@link #hasPendingChanges} to check if
	 * there are pending changes. If there are changes, call
	 * {@link sap.ui.model.odata.v4.ODataModel#submitBatch} to submit the changes or
	 * {@link sap.ui.model.odata.v4.ODataModel#resetChanges} to reset the changes before calling
	 * {@link #filter}.
	 *
	 * Filters are case sensitive unless the property <code>caseSensitive</code> is set to
	 * <code>false</code>. This property has to be set on each filter, it is not inherited from a
	 * multi-filter.
	 *
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} [vFilters]
	 *   The dynamic filters to be used; replaces the dynamic filters given in
	 *   {@link sap.ui.model.odata.v4.ODataModel#bindList}.
	 *   The filter executed on the list is created from the following parts, which are combined
	 *   with a logical 'and':
	 *   <ul>
	 *   <li> Dynamic filters of type {@link sap.ui.model.FilterType.Application}
	 *   <li> Dynamic filters of type {@link sap.ui.model.FilterType.Control}
	 *   <li> The static filters, as defined in the '$filter' binding parameter
	 *   </ul>
	 *
	 * @param {sap.ui.model.FilterType} [sFilterType=sap.ui.model.FilterType.Application]
	 *   The filter type to be used
	 * @returns {sap.ui.model.odata.v4.ODataListBinding}
	 *   <code>this</code> to facilitate method chaining
	 * @throws {Error}
	 *   If there are pending changes or if an unsupported operation mode is used (see
	 *   {@link sap.ui.model.odata.v4.ODataModel#bindList})
	 *
	 * @public
	 * @see sap.ui.model.ListBinding#filter
	 * @since 1.39.0
	 */
	ODataListBinding.prototype.filter = function (vFilters, sFilterType) {
		if (this.sOperationMode !== OperationMode.Server) {
			throw new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server");
		}
		if (this.hasPendingChanges()) {
			throw new Error("Cannot filter due to pending changes");
		}

		if (sFilterType === FilterType.Control) {
			this.aFilters = _Helper.toArray(vFilters);
		} else {
			this.aApplicationFilters = _Helper.toArray(vFilters);
		}

		if (this.isRootBindingSuspended()) {
			this.setResumeChangeReason(ChangeReason.Filter);
			return this;
		}

		this.createReadGroupLock(this.getGroupId(), true);
		this.removeCachesAndMessages("");
		this.fetchCache(this.oContext);
		this.reset(ChangeReason.Filter);

		return this;
	};

	/**
	 * Returns already created binding contexts for all entities in this list binding for the range
	 * determined by the given start index <code>iStart</code> and <code>iLength</code>.
	 * If at least one of the entities in the given range has not yet been loaded, fires a
	 * {@link #event:change} event on this list binding once these entities have been loaded
	 * <b>asynchronously</b>. A further call to this method in the 'change' event handler with the
	 * same index range then yields the updated array of contexts.
	 *
	 * @param {number} [iStart=0]
	 *   The index where to start the retrieval of contexts
	 * @param {number} [iLength]
	 *   The number of contexts to retrieve beginning from the start index; defaults to the model's
	 *   size limit, see {@link sap.ui.model.Model#setSizeLimit}; <code>Infinity</code> may be used
	 *   since 1.53.0 to retrieve all data
	 * @param {number} [iMaximumPrefetchSize=0]
	 *   The maximum number of contexts to read before and after the given range; with this,
	 *   controls can prefetch data that is likely to be needed soon, e.g. when scrolling down in a
	 *   table. Negative values will be treated as 0. Supported since 1.39.0; <code>Infinity</code>
	 *   may be used since 1.53.0 to prefetch all data and thus disable paging.
	 * @returns {sap.ui.model.odata.v4.Context[]}
	 *   The array of already created contexts with the first entry containing the context for
	 *   <code>iStart</code>
	 * @throws {Error}
	 *   If the binding's root binding is suspended, if extended change detection is enabled and
	 *   <code>iMaximumPrefetchSize</code> is set or <code>iStart</code> is not 0
	 *
	 * @protected
	 * @see sap.ui.model.ListBinding#getContexts
	 * @since 1.37.0
	 */
	ODataListBinding.prototype.getContexts = function (iStart, iLength, iMaximumPrefetchSize) {
		var sChangeReason,
			aContexts,
			bDataRequested = false,
			bFireChange = false,
			oGroupLock,
			oPromise,
			bRefreshEvent = !!this.sChangeReason,
			oVirtualContext,
			that = this;

		Log.debug(this + "#getContexts(" + iStart + ", " + iLength + ", "
				+ iMaximumPrefetchSize + ")",
			undefined, sClassName);

		this.checkSuspended();

		if (iStart !== 0 && this.bUseExtendedChangeDetection) {
			throw new Error("Unsupported operation: v4.ODataListBinding#getContexts,"
				+ " first parameter must be 0 if extended change detection is enabled, but is "
				+ iStart);
		}

		if (iMaximumPrefetchSize !== undefined && this.bUseExtendedChangeDetection) {
			throw new Error("Unsupported operation: v4.ODataListBinding#getContexts,"
				+ " third parameter must not be set if extended change detection is enabled");
		}

		if (this.bRelative && !this.oContext) { // unresolved relative binding
			this.aPreviousData = []; // compute diff from scratch when binding is resolved again
			return [];
		}

		sChangeReason = this.sChangeReason || ChangeReason.Change;
		this.sChangeReason = undefined;

		if (sChangeReason === "AddVirtualContext") {
			// Note: this task is queued _before_ any SubmitMode.Auto task!
			sap.ui.getCore().addPrerenderingTask(function () {
				if (!that.isRootBindingSuspended()) {
					// Note: first result of getContexts after refresh is ignored
					that.sChangeReason = "RemoveVirtualContext";
					that._fireChange({
						detailedReason : that.sChangeReason,
						reason : ChangeReason.Change
					});
					that.reset(ChangeReason.Refresh);
				}
				oVirtualContext.destroy();
			}, true);
			oVirtualContext = Context.create(this.oModel, this,
				this.oModel.resolve(this.sPath, this.oContext) + "/" + Context.VIRTUAL,
				Context.VIRTUAL);
			return [oVirtualContext];
		}

		if (sChangeReason === "RemoveVirtualContext") {
			return [];
		}

		iStart = iStart || 0;
		iLength = iLength || this.oModel.iSizeLimit;
		if (!iMaximumPrefetchSize || iMaximumPrefetchSize < 0) {
			iMaximumPrefetchSize = 0;
		}

		oGroupLock = this.oReadGroupLock;
		this.oReadGroupLock = undefined;
		if (!this.oDiff) { // w/o E.C.D there won't be a diff
			// make sure "refresh" is followed by async "change"
			oPromise = this.fetchContexts(iStart, iLength, iMaximumPrefetchSize, oGroupLock,
				/*bAsync=*/bRefreshEvent, function () {
					bDataRequested = true;
					that.fireDataRequested();
				});
			this.resolveRefreshPromise(oPromise);
			oPromise.then(function (bChanged) {
				if (that.bUseExtendedChangeDetection) {
					that.oDiff = {
						aDiff : that.getDiff(iLength),
						iLength : iLength
					};
				}
				if (bFireChange) {
					if (bChanged || (that.oDiff && that.oDiff.aDiff.length)) {
						that._fireChange({reason : sChangeReason});
					} else { // we cannot keep a diff if we do not tell the control to fetch it!
						that.oDiff = undefined;
					}
				}
				if (bDataRequested) {
					that.fireDataReceived({data : {}});
				}
			}, function (oError) {
				// cache shares promises for concurrent read
				if (bDataRequested) {
					that.fireDataReceived(oError.canceled ? {data : {}} : {error : oError});
				}
				throw oError;
			}).catch(function (oError) {
				that.oModel.reportError("Failed to get contexts for "
						+ that.oModel.sServiceUrl
						+ that.oModel.resolve(that.sPath, that.oContext).slice(1)
						+ " with start index " + iStart + " and length " + iLength,
					sClassName, oError);
			});
			// in case of asynchronous processing ensure to fire a change event
			bFireChange = true;
		}
		this.iCurrentBegin = iStart;
		this.iCurrentEnd = iStart + iLength;
		aContexts = this.getContextsInViewOrder(iStart, iLength);
		if (this.bUseExtendedChangeDetection) {
			if (this.oDiff && iLength !== this.oDiff.iLength) {
				throw new Error("Extended change detection protocol violation: Expected "
					+ "getContexts(0," + this.oDiff.iLength + "), but got getContexts(0,"
					+ iLength + ")");
			}
			aContexts.dataRequested = !this.oDiff;
			aContexts.diff = this.oDiff ? this.oDiff.aDiff : [];
		}
		this.oDiff = undefined;
		return aContexts;
	};

	/**
	 * Returns the requested range of contexts in view order.
	 *
	 * @param {number} iStart
	 *   The index where to start the retrieval of contexts
	 * @param {number} iLength
	 *   The number of contexts to retrieve beginning from the start index
	 * @returns {sap.ui.model.odata.v4.Context[]}
	 *   The array of already created contexts with the first entry containing the context for
	 *   <code>iStart</code>
	 *
	 * @private
	 */
	ODataListBinding.prototype.getContextsInViewOrder = function (iStart, iLength) {
		var aContexts, i, iCount;

		if (this.bCreatedAtEnd) {
			aContexts = [];
			iCount = Math.min(iLength, this.getLength() - iStart);
			for (i = 0; i < iCount; i += 1) {
				aContexts[i] = this.aContexts[this.getModelIndex(iStart + i)];
			}
		} else {
			aContexts = this.aContexts.slice(iStart, iStart + iLength);
		}

		return aContexts;
	};

	/**
	 * Returns the contexts that were requested by a control last time. Does not trigger a data
	 * request. In the time between the {@link #event:dataRequested} event and the
	 * {@link #event:dataReceived} event, the resulting array contains <code>undefined</code> at
	 * those indexes where the data is not yet available.
	 *
	 * @returns {sap.ui.model.odata.v4.Context[]}
	 *   The contexts
	 *
	 * @public
	 * @see sap.ui.model.ListBinding#getCurrentContexts
	 * @since 1.39.0
	 */
	// @override
	ODataListBinding.prototype.getCurrentContexts = function () {
		var aContexts,
			iLength = Math.min(this.iCurrentEnd, this.iMaxLength + this.iCreatedContexts)
				- this.iCurrentBegin;

		aContexts = this.getContextsInViewOrder(this.iCurrentBegin, iLength);

		while (aContexts.length < iLength) {
			aContexts.push(undefined);
		}

		return aContexts;
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#getDependentBindings
	 */
	ODataListBinding.prototype.getDependentBindings = function () {
		var that = this;

		return this.oModel.getDependentBindings(this).filter(function (oDependentBinding) {
			return !(oDependentBinding.oContext.getPath() in that.mPreviousContextsByPath);
		});
	};

	/**
	 * Computes the "diff" needed for extended change detection.
	 *
	 * @param {number} iLength
	 *   The length of the range requested in getContexts
	 * @returns {object}
	 *   The array of differences which is
	 *   <ul>
	 *   <li>the comparison of aResult with the data retrieved in the previous request, in case of
	 *   <code>this.bDetectUpdates === true</code></li>
	 *   <li>the comparison of current context paths with the context paths of the previous request,
	 *   in case of <code>this.bDetectUpdates === false</code></li>
	 *   </ul>
	 *
	 * @private
	 */
	ODataListBinding.prototype.getDiff = function (iLength) {
		var aDiff,
			aNewData,
			that = this;

		aNewData = this.getContextsInViewOrder(0, iLength).map(function (oContext) {
			return that.bDetectUpdates
				? JSON.stringify(oContext.getValue())
				: oContext.getPath();
		});

		aDiff = this.diffData(this.aPreviousData, aNewData);
		this.aPreviousData = aNewData;

		return aDiff;
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.ListBinding#getDistinctValues
	 * @since 1.37.0
	 */
	// @override
	ODataListBinding.prototype.getDistinctValues = function () {
		throw new Error("Unsupported operation: v4.ODataListBinding#getDistinctValues");
	};


	/**
	 * Returns a URL by which the complete content of the list can be downloaded in JSON format. The
	 * request delivers all entities considering the binding's query options (such as filters or
	 * sorters).
	 *
	 * The returned URL does not specify <code>$skip</code> and <code>$top</code> and leaves it up
	 * to the server how many rows it delivers. Many servers tend to choose a small limit without
	 * <code>$skip</code> and <code>$top</code>, so it might be wise to add an appropriate value for
	 * <code>$top</code> at least.
	 *
	 * Additionally, you must be aware of server-driven paging and be ready to send a follow-up
	 * request if the response contains <code>@odata.nextlink</code>.
	 *
	 * @returns {string}
	 *   The download URL
     * @throws {Error}
	 *   If the binding is unresolved or if the URL determination is not finished yet
	 *
	 * @function
	 * @public
	 * @see #requestDownloadUrl
	 * @since 1.74.0
	 */
	ODataListBinding.prototype.getDownloadUrl = _Helper.createGetMethod("fetchDownloadUrl", true);

	/**
	 * Returns the filter information as an abstract syntax tree.
	 * Consumers must not rely on the origin information to be available, future filter
	 * implementations will not provide this information.
	 *
	 * If the system query option <code>$filter</code> is present, it will be added to the AST as a
	 * node with the following structure:
	 *   <ul>
	 *   <li><code>expression</code>: the value of the system query option <code>$filter</code>
	 *   <li><code>syntax</code>: the OData version of this bindings model, e.g. "OData 4.0"
	 *   <li><code>type</code>: "Custom"
	 *   </ul>
	 *
	 * @param {boolean} [bIncludeOrigin=false] whether to include information about the filter
	 *   objects from which the tree has been created
	 * @returns {object} The AST of the filter tree including the static filter as string or null if
	 *   no filters are set
	 * @private
	 * @ui5-restricted sap.ui.table, sap.ui.export
	 */
	// @override
	ODataListBinding.prototype.getFilterInfo = function (bIncludeOrigin) {
		var oCombinedFilter = FilterProcessor.combineFilters(this.aFilters,
				this.aApplicationFilters),
			oResultAST = null,
			oStaticAST;

		if (oCombinedFilter) {
			oResultAST = oCombinedFilter.getAST(bIncludeOrigin);
		}

		if (this.mQueryOptions.$filter) {
			oStaticAST = {
				expression : this.mQueryOptions.$filter,
				syntax : "OData " + this.oModel.getODataVersion(),
				type : "Custom"
			};
			if (oResultAST) {
				oResultAST = {
					left : oResultAST,
					op : "&&",
					right : oStaticAST,
					type : "Logical"
				};
			} else {
				oResultAST = oStaticAST;
			}
		}

		return oResultAST;
	};

	/**
	 * Returns the header context which allows binding to <code>$count</code>. If known, the value
	 * of such a binding is the sum of the element count of the collection on the server and the
	 * number of transient entities created on the client. Otherwise it is <code>undefined</code>.
	 * The value is a number and its type is <code>Edm.Int64</code>.
	 *
	 * The count is known to the binding in the following situations:
	 * <ul>
	 *   <li>The server-side count has been requested via the system query option
	 *     <code>$count</code>.
	 *   <li>A "short read" in a paged collection (the server delivered less elements than
	 *     requested) indicated that the server has no more unread elements.
	 *   <li>It has been read completely in one request, for example an embedded collection via
	 *     <code>$expand</code>.
	 * </ul>
	 *
	 * The <code>$count</code> is unknown, if the binding is relative, but has no context.
	 *
	 * @returns {sap.ui.model.odata.v4.Context}
	 *   The header context or <code>null</code> if the binding is relative and has no context
	 *
	 * @public
	 * @since 1.45.0
	 */
	ODataListBinding.prototype.getHeaderContext = function () {
		// Since we never throw the header context away, we may deliver it only when valid
		return (this.bRelative && !this.oContext) ? null : this.oHeaderContext;
	};

	/**
	 * Converts the view index of a context to the model index in case there are contexts created at
	 * the end.
	 *
	 * @param {number} iViewIndex The view index
	 * @returns {number} The model index
	 *
	 * @private
	 */
	ODataListBinding.prototype.getModelIndex = function (iViewIndex) {
		if (!this.bCreatedAtEnd) {
			return iViewIndex;
		}
		return iViewIndex < this.getLength() - this.iCreatedContexts
			? iViewIndex + this.iCreatedContexts
			: this.getLength() - iViewIndex - 1;
	};

	/**
	 * Returns the number of entries in the list. As long as the client does not know the size on
	 * the server, an estimated length is returned.
	 *
	 * @returns {number}
	 *   The number of entries in the list
	 *
	 * @public
	 * @see sap.ui.model.ListBinding#getLength
	 * @since 1.37.0
	 */
	// @override
	ODataListBinding.prototype.getLength = function () {
		if (this.bLengthFinal) {
			return this.iMaxLength + this.iCreatedContexts;
		}
		return this.aContexts.length ? this.aContexts.length + 10 : 0;
	};

	/**
	 * Builds the value for the OData V4 '$orderby' system query option from the given sorters
	 * and the optional static '$orderby' value which is appended to the sorters.
	 *
	 * @param {string} [sOrderbyQueryOption]
	 *   The static '$orderby' system query option which is appended to the converted 'aSorters'
	 *   parameter.
	 * @returns {string}
	 *   The concatenated '$orderby' system query option
	 * @throws {Error}
	 *   If 'aSorters' contains elements that are not {@link sap.ui.model.Sorter} instances.
	 *
	 * @private
	 */
	ODataListBinding.prototype.getOrderby = function (sOrderbyQueryOption) {
		var aOrderbyOptions = [],
			that = this;

		this.aSorters.forEach(function (oSorter) {
			if (oSorter instanceof Sorter) {
				aOrderbyOptions.push(oSorter.sPath + (oSorter.bDescending ? " desc" : ""));
			} else {
				throw new Error("Unsupported sorter: " + oSorter + " - " + that);
			}
		});
		if (sOrderbyQueryOption) {
			aOrderbyOptions.push(sOrderbyQueryOption);
		}
		return aOrderbyOptions.join(',');
	};

	/**
	 * Returns the query options of the binding.
	 *
	 * @param {boolean} [bWithSystemQueryOptions=false]
	 *   Whether system query options should be returned as well. The parameter value
	 *   <code>true</code> is not supported.
	 * @returns {object} mQueryOptions
	 *   The object with the query options. Query options can be provided with
	 *   {@link sap.ui.model.odata.v4.ODataModel#bindList},
	 *   {@link sap.ui.model.odata.v4.ODataModel#bindContext},
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#changeParameters}, and
	 *   {@link sap.ui.model.odata.v4.ODataContextBinding#changeParameters}. System query options
	 *   can also be calculated, e.g. <code>$filter</code> can be calculated based on provided
	 *   filter objects.
	 * @throws {Error}
	 *   If <code>bWithSystemQueryOptions</code> is <code>true</code>
	 *
	 * @public
	 * @since 1.66.0
	 */
	ODataListBinding.prototype.getQueryOptions = function (bWithSystemQueryOptions) {
		var oResult = {},
			that = this;

		if (bWithSystemQueryOptions) {
			throw new Error("Unsupported parameter value: bWithSystemQueryOptions: "
				+ bWithSystemQueryOptions);
		}

		Object.keys(this.mQueryOptions).forEach(function (sKey) {
			if (sKey[0] !== "$") {
				oResult[sKey] = _Helper.clone(that.mQueryOptions[sKey]);
			}
		});

		return oResult;
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataParentBinding#getQueryOptionsFromParameters
	 */
	ODataListBinding.prototype.getQueryOptionsFromParameters = function () {
		return this.mQueryOptions;
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#hasPendingChangesForPath
	 */
	ODataListBinding.prototype.hasPendingChangesForPath = function (sPath) {
		if (this.oCache === undefined) {
			// as long as cache is not yet known there can be only changes caused by created
			// entities; sPath does not matter
			return this.iCreatedContexts > 0;
		}
		return asODataParentBinding.prototype.hasPendingChangesForPath.apply(this, arguments);
	};

	/**
	 * Enhance the inherited query options by the given query options if this binding does not have
	 * any binding parameters. If both have a '$orderby', the resulting '$orderby' is the
	 * concatenation of both '$orderby' with the given one first. If both have a '$filter', the
	 * resulting '$filter' is the conjunction of both '$filter'. '$select' and '$expand' are merged
	 * because the binding may have acquired them via autoExpandSelect.
	 *
	 * @param {object} mQueryOptions
	 *   The query options
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context instance to be used, must be <code>undefined</code> for absolute bindings
	 * @returns {object} The merged query options
	 *
	 * @private
	 */
	ODataListBinding.prototype.inheritQueryOptions = function (mQueryOptions, oContext) {
		var mInheritedQueryOptions;

		if (!Object.keys(this.mParameters).length) {
			// mix-in inherited static query options
			mInheritedQueryOptions = this.getQueryOptionsForPath("", oContext);
			if (mQueryOptions.$orderby && mInheritedQueryOptions.$orderby) {
				mQueryOptions.$orderby += "," + mInheritedQueryOptions.$orderby;
			}
			if (mQueryOptions.$filter && mInheritedQueryOptions.$filter) {
				mQueryOptions.$filter = "(" + mQueryOptions.$filter + ") and ("
					+ mInheritedQueryOptions.$filter + ")";
			}
			mQueryOptions = Object.assign({}, mInheritedQueryOptions, mQueryOptions);
			// mix-in $select and $expand
			_Helper.aggregateQueryOptions(mQueryOptions, mInheritedQueryOptions);
		}

		return mQueryOptions;
	};

	/**
	 * Initializes the OData list binding: Fires an event in case the binding has a resolved path
	 * and its root binding is not suspended. If the model's parameter <code>autoExpandSelect</code>
	 * is used (see {@link sap.ui.model.odata.v4.ODataModel#constructor}), it fires a 'change'
	 * event, else it fires a 'refresh' event (since 1.67.0).
	 *
	 * @protected
	 * @see sap.ui.model.Binding#initialize
	 * @see #getRootBinding
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#initialize
	ODataListBinding.prototype.initialize = function () {
		if ((!this.bRelative || this.oContext) && !this.getRootBinding().isSuspended()) {
			if (this.oModel.bAutoExpandSelect) {
				this._fireChange({
					detailedReason : this.sChangeReason,
					reason : ChangeReason.Change
				});
			} else {
				// ensure that the contexts are not delivered in getContexts for the refresh event,
				// even if data is available
				this.sChangeReason = ChangeReason.Refresh;
				this._fireRefresh({reason : ChangeReason.Refresh});
			}
		}
	};

	/**
	 * Returns <code>true</code> if the length has been determined by the data returned from
	 * server. If the length is a client side estimation <code>false</code> is returned.
	 *
	 * @returns {boolean}
	 *   If <code>true</code> the length is determined by server side data
	 *
	 * @public
	 * @see sap.ui.model.ListBinding#isLengthFinal
	 * @since 1.37.0
	 */
	// @override
	ODataListBinding.prototype.isLengthFinal = function () {
		// some controls use .bLengthFinal on list binding instead of calling isLengthFinal
		return this.bLengthFinal;
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#refreshInternal
	 */
	ODataListBinding.prototype.refreshInternal = function (sResourcePathPrefix, sGroupId,
			bCheckUpdate, bKeepCacheOnError) {
		var that = this;

		// calls refreshInternal on all given bindings and returns an array of promises
		function refreshAll(aBindings) {
			return aBindings.map(function (oBinding) {
				// Call refreshInternal with bCheckUpdate = false because property bindings
				// should not check for updates yet, otherwise they will cause a "Failed to
				// drill down..." when the row is no longer part of the collection. They get
				// another update request in createContexts, when the context for the row is
				// reused.
				return oBinding.refreshInternal(sResourcePathPrefix, sGroupId, false,
					bKeepCacheOnError);
			});
		}

		if (this.isRootBindingSuspended()) {
			this.refreshSuspended(sGroupId);
			return SyncPromise.all(refreshAll(that.getDependentBindings()));
		}

		this.createReadGroupLock(sGroupId, this.isRoot());
		return this.oCachePromise.then(function (oCache) {
			var aDependentBindings,
				oPromise = that.oRefreshPromise;

			if (oCache && !oPromise) { // do not refresh twice
				that.removeCachesAndMessages(sResourcePathPrefix);
				that.fetchCache(that.oContext);
				oPromise = that.createRefreshPromise();
				if (bKeepCacheOnError) {
					oPromise = oPromise.catch(function (oError) {
						return that.fetchResourcePath(that.oContext).then(function (sResourcePath) {
							if (!that.bRelative || oCache.$resourcePath === sResourcePath) {
								that.oCache = oCache;
								that.oCachePromise = SyncPromise.resolve(oCache);
								oCache.setActive(true);
								that._fireChange({reason : ChangeReason.Change});
							}
							throw oError;
						});
					});
				}
			}
			// Note: after reset the dependent bindings cannot be found any more
			aDependentBindings = that.getDependentBindings();
			that.reset(ChangeReason.Refresh); // this may reset that.oRefreshPromise
			return SyncPromise.all(refreshAll(aDependentBindings).concat(oPromise));
		});
	};

	/**
	 * Refreshes the single entity the given <code>oContext</code> is pointing to, refreshes also
	 * dependent bindings and checks for updates once the data is received.
	 *
	 * @param {sap.ui.model.odata.v4.Context} oContext
	 *   The context object for the entity to be refreshed
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID to be used for refresh
	 * @param {boolean} [bAllowRemoval=false]
	 *   Allows the list binding to remove the given context from its collection because the
	 *   entity does not match the binding's filter anymore,
	 *   see {@link sap.ui.model.odata.v4.ODataListBinding#filter}; a removed context is
	 *   destroyed, see {@link sap.ui.model.Context#destroy}.
	 *   Supported since 1.55.0
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which resolves with the entity when the entity is updated in the
	 *   cache, or <code>undefined</code> if <code>bAllowRemoval</code> is set to true.
	 * @throws {Error}
	 *   If the given context does not represent a single entity (see {@link #getHeaderContext})
	 *
	 * @private
	 */
	ODataListBinding.prototype.refreshSingle = function (oContext, oGroupLock, bAllowRemoval) {
		var sResourcePathPrefix = oContext.getPath().slice(1),
			that = this;

		if (oContext === this.oHeaderContext) {
			throw new Error("Unsupported header context: " + oContext);
		}

		return this.withCache(function (oCache, sPath, oBinding) {
			var bDataRequested = false,
				aPromises = [],
				bRemoved = false;

			function fireDataReceived(oData) {
				if (bDataRequested) {
					that.fireDataReceived(oData);
				}
			}

			function fireDataRequested() {
				bDataRequested = true;
				that.fireDataRequested();
			}

			function onRemove() {
				var i, iIndex;

				if (oContext.created()) {
					that.destroyCreated(oContext);
				} else {
					iIndex = oContext.getModelIndex();
					that.aContexts.splice(iIndex, 1);
					for (i = iIndex; i < that.aContexts.length; i += 1) {
						if (that.aContexts[i]) {
							that.aContexts[i].iIndex -= 1;
						}
					}
					oContext.destroy();
					that.iMaxLength -= 1; // this doesn't change Infinity
				}
				bRemoved = true;
				that._fireChange({reason : ChangeReason.Remove});
			}

			aPromises.push(
				(bAllowRemoval
					? oCache.refreshSingleWithRemove(oGroupLock, sPath, oContext.getModelIndex(),
						fireDataRequested, onRemove)
					: oCache.refreshSingle(oGroupLock, sPath, oContext.getModelIndex(),
						fireDataRequested))
				.then(function (oEntity) {
					var aUpdatePromises = [];

					fireDataReceived({data : {}});
					if (!bRemoved) { // do not update removed context
						aUpdatePromises.push(oContext.checkUpdate());
						if (bAllowRemoval) {
							aUpdatePromises.push(
								that.refreshDependentBindings(sResourcePathPrefix,
									oGroupLock.getGroupId()));
						}
					}

					return SyncPromise.all(aUpdatePromises).then(function () {
						return oEntity;
					});
				}, function (oError) {
					fireDataReceived({error : oError});
					throw oError;
				}).catch(function (oError) {
					oGroupLock.unlock(true);
					that.oModel.reportError("Failed to refresh entity: " + oContext, sClassName,
						oError);
				})
			);

			if (!bAllowRemoval) {
				// call refreshInternal on all dependent bindings to ensure that all resulting data
				// requests are in the same batch request
				aPromises.push(that.refreshDependentBindings(sResourcePathPrefix,
					oGroupLock.getGroupId()));
			}

			return SyncPromise.all(aPromises).then(function (aResults) {
				return aResults[0];
			});
		});
	};

	/**
	 * Requests the entities for the given index range of the binding's collection and resolves with
	 * the corresponding contexts.
	 *
	 * @param {number} [iStart=0]
	 *   The index where to start the retrieval of contexts; must be greater than or equal to 0
	 * @param {number} [iLength]
	 *   The number of contexts to retrieve beginning from the start index; defaults to the model's
	 *   size limit, see {@link sap.ui.model.Model#setSizeLimit}; must be greater than 0,
	 *   <code>Infinity</code> may be used to retrieve all data
	 * @param {string} [sGroupId]
	 *   The group ID to be used for the request; if not specified, the group ID for this binding is
	 *   used, see {@link sap.ui.model.odata.v4.ODataListBinding#constructor}.
	 *   Valid values are <code>undefined</code>, '$auto', '$auto.*', '$direct' or application group
	 *   IDs as specified in {@link sap.ui.model.odata.v4.ODataModel}.
	 * @returns {Promise<sap.ui.model.odata.v4.Context[]>}
	 *   A promise which is resolved with the array of the contexts, the first entry containing the
	 *   context for <code>iStart</code>; it is rejected if <code>iStart</code> or
	 *   <code>iLength</code> are less than 0 or when requesting the data fails
	 * @throws {Error} If the binding is relative and has no context, if the binding's root binding
	 *   is suspended or if the given group ID is invalid
	 *
	 * @public
	 * @since 1.70.0
	 */
	ODataListBinding.prototype.requestContexts = function (iStart, iLength, sGroupId) {
		var that = this;

		if (this.bRelative && !this.oContext) {
			throw new Error("Unresolved binding: " + this.sPath);
		}
		this.checkSuspended();
		this.oModel.checkGroupId(sGroupId);

		iStart = iStart || 0;
		iLength = iLength || this.oModel.iSizeLimit;
		return Promise.resolve(
				this.fetchContexts(iStart, iLength, 0, this.lockGroup(sGroupId, true))
			).then(function (bChanged) {
				if (bChanged) {
					that._fireChange({reason : ChangeReason.Change});
				}
				return that.getContextsInViewOrder(iStart, iLength);
			}, function (oError) {
				that.oModel.reportError("Failed to get contexts for "
					+ that.oModel.sServiceUrl
					+ that.oModel.resolve(that.sPath, that.oContext).slice(1)
					+ " with start index " + iStart + " and length " + iLength,
					sClassName, oError);
				throw oError;
			});
	};

	/**
	 * Returns a URL by which the complete content of the list can be downloaded in JSON format. The
	 * request delivers all entities considering the binding's query options (such as filters or
	 * sorters).
	 *
	 * The returned URL does not specify <code>$skip</code> and <code>$top</code> and leaves it up
	 * to the server how many rows it delivers. Many servers tend to choose a small limit without
	 * <code>$skip</code> and <code>$top</code>, so it might be wise to add an appropriate value for
	 * <code>$top</code> at least.
	 *
	 * Additionally, you must be aware of server-driven paging and be ready to send a follow-up
	 * request if the response contains <code>@odata.nextlink</code>.
	 *
	 * @returns {Promise<string>}
	 *   A promise that is resolved with the download URL
	 * @throws {Error}
	 *   If the binding is unresolved
	 *
	 * @function
	 * @public
	 * @see #getDownloadUrl
	 * @since 1.74.0
	 */
	ODataListBinding.prototype.requestDownloadUrl = _Helper.createRequestMethod("fetchDownloadUrl");

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataParentBinding#requestSideEffects
	 */
	ODataListBinding.prototype.requestSideEffects = function (sGroupId, aPaths, oContext) {
		var bAllContextsTransient,
			oModel = this.oModel,
			// Hash set of collection-valued navigation property meta paths (relative to the cache's
			// root) which need to be refreshed, maps string to <code>true</code>
			mNavigationPropertyPaths = {},
			oPromise,
			aPromises,
			bSingle = oContext && oContext !== this.oHeaderContext;

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
			oPromise = this.oCache.requestSideEffects(this.lockGroup(sGroupId), aPaths,
				mNavigationPropertyPaths,
				/*iStart*/bSingle ? oContext.getModelIndex() : this.iCurrentBegin,
				/*iLength*/bSingle ? undefined : this.iCurrentEnd - this.iCurrentBegin);
			if (oPromise) {
				aPromises = [oPromise];
				this.visitSideEffects(sGroupId, aPaths, bSingle ? oContext : undefined,
					mNavigationPropertyPaths, aPromises);

				return SyncPromise.all(aPromises.map(reportError));
			}
		}
		if (bSingle) {
			return this.refreshSingle(oContext, this.lockGroup(sGroupId), false);
		}
		if (this.aContexts.length) {
			bAllContextsTransient = this.aContexts.every(function (oContext) {
				return oContext.isTransient();
			});
			if (bAllContextsTransient) {
				return SyncPromise.resolve();
			}
		}
		return this.refreshInternal("", sGroupId, false, true);
	};

	/**
	 * Resets the binding's contexts array and its members related to current contexts and length
	 * calculation. All bindings dependent to the header context are requested to check for updates.
	 *
	 * @param {sap.ui.model.ChangeReason} [sChangeReason]
	 *   A change reason; if given, a refresh event with this reason is fired and the next
	 *   getContexts() fires a change event with this reason. Change reason "change" is ignored
	 *   as long as the binding is still empty.
	 *
	 * @private
	 */
	ODataListBinding.prototype.reset = function (sChangeReason) {
		var bEmpty = this.iCurrentEnd === 0,
			that = this;

		if (this.aContexts) {
			this.aContexts.forEach(function (oContext) {
				that.mPreviousContextsByPath[oContext.getPath()] = oContext;
			});
		}
		this.aContexts = [];
		this.iCreatedContexts = 0; // number of (client-side) created contexts in aContexts
		// true if contexts have been created at the end, false if contexts have been created at the
		// start, undefined if there are no created contexts
		this.bCreatedAtEnd = undefined;
		// the range of array indices for getCurrentContexts
		this.iCurrentBegin = this.iCurrentEnd = 0;
		// upper boundary for server-side list length (based on observations so far)
		// Note: Created entities are excluded
		// Compare only this.aContexts.length and this.iMaxLength + this.iCreatedContexts!
		// Note: the binding's length can be greater than this.iMaxLength due to iCreatedContexts!
		this.iMaxLength = Infinity;
		this.bLengthFinal = false;
		if (sChangeReason && !(bEmpty && sChangeReason === ChangeReason.Change)) {
			this.sChangeReason = sChangeReason;
			this._fireRefresh({reason : sChangeReason});
		}
		// Update after the refresh event, otherwise $count is fetched before the request
		if (this.getHeaderContext()) {
			this.oModel.getDependentBindings(this.oHeaderContext).forEach(function (oBinding) {
				oBinding.checkUpdate();
			});
		}
	};

	/**
	 * Resumes this binding and all dependent bindings and fires a change or refresh event
	 * afterwards.
	 *
	 * @param {boolean} bCheckUpdate
	 *   Parameter is ignored; dependent property bindings of a list binding never call checkUpdate
	 *
	 * @private
	 */
	ODataListBinding.prototype.resumeInternal = function () {
		var aBindings = this.getDependentBindings(),
			sChangeReason = this.sResumeChangeReason;

		this.sResumeChangeReason = ChangeReason.Change;

		this.removeCachesAndMessages("");
		this.reset();
		this.fetchCache(this.oContext);
		aBindings.forEach(function (oDependentBinding) {
			// do not call checkUpdate in dependent property bindings because the cache of this
			// binding is reset and the binding has not yet fired a change event
			oDependentBinding.resumeInternal(false);
		});
		if (this.sChangeReason === "AddVirtualContext") {
			// In a refresh event the table would ignore the result -> no virtual context -> no
			// auto-$expand/$select. The refresh event is sent later after the change event with
			// reason "RemoveVirtualContext".
			this._fireChange({
				detailedReason : this.sChangeReason,
				reason : sChangeReason
			});
		} else {
			this._fireRefresh({reason : sChangeReason});
		}

		// Update after the change event, otherwise $count is fetched before the request
		this.oModel.getDependentBindings(this.oHeaderContext).forEach(function (oBinding) {
			oBinding.checkUpdate();
		});
	};

	/**
	 * Sets a new data aggregation object and derives the system query option <code>$apply</code>
	 * implicitly from it.
	 *
	 * @param {object} [oAggregation]
	 *   An object holding the information needed for data aggregation; see also
	 *   <a href="http://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData
	 *   Extension for Data Aggregation Version 4.0</a>. Since 1.76.0, <code>undefined</code> can be
	 *   used to remove the data aggregation object, which allows to set <code>$apply</code>
	 *   explicitly afterwards. <code>null</code> is not supported.
	 * @param {object} [oAggregation.aggregate]
	 *   A map from aggregatable property names or aliases to objects containing the following
	 *   details:
	 *   <ul>
	 *   <li><code>grandTotal</code>: An optional boolean that tells whether a grand total for this
	 *     aggregatable property is needed (since 1.59.0)
	 *   <li><code>subtotals</code>: An optional boolean that tells whether subtotals for this
	 *     aggregatable property are needed
	 *   <li><code>with</code>: An optional string that provides the name of the method (for
	 *     example "sum") used for aggregation of this aggregatable property; see
	 *     "3.1.2 Keyword with". Both, "average" and "countdistinct" are not supported for subtotals
	 *     or grand totals.
	 *   <li><code>name</code>: An optional string that provides the original aggregatable
	 *     property name in case a different alias is chosen as the name of the dynamic property
	 *     used for aggregation of this aggregatable property; see "3.1.1 Keyword as"
	 *   </ul>
	 * @param {object} [oAggregation.group]
	 *   A map from groupable property names to empty objects
	 * @param {string[]} [oAggregation.groupLevels]
	 *   A list of groupable property names used to determine group levels. They may, but don't need
	 *   to, be repeated in <code>oAggregation.group</code>. Group levels cannot be combined with
	 *   filtering, with the system query option <code>$count</code>, or with an aggregatable
	 *   property for which a grand total is needed; only a single group level is supported.
	 * @throws {Error}
	 *   If the given data aggregation object is unsupported, if the system query option
	 *   <code>$apply</code> has been specified explicitly before, or if there are pending changes
	 *
	 * @example <caption>First group level is product category including subtotals for the net
	 *     amount in display currency. On leaf level, transaction currency is used as an additional
	 *     dimension and the net amount is averaged.</caption>
	 *   oListBinding.setAggregation({
	 *     aggregate : {
	 *       AverageNetAmountInTransactionCurrency : {
	 *         name : "NetAmountInTransactionCurrency", // original name
	 *         with : "average" // aggregation method
	 *       },
	 *       NetAmountInDisplayCurrency : {subtotals : true}
	 *     },
	 *     group : {
	 *       ProductCategory : {}, // optional
	 *       TransactionCurrency : {}
	 *     },
	 *     groupLevels : ['ProductCategory']
	 *   });
	 * @public
	 * @since 1.55.0
	 */
	ODataListBinding.prototype.setAggregation = function (oAggregation) {
		var mParameters;

		if (this.hasPendingChanges()) {
			throw new Error("Cannot set $$aggregation due to pending changes");
		}

		mParameters = Object.assign({}, this.mParameters);
		if (oAggregation === undefined) {
			delete mParameters.$$aggregation;
		} else {
			mParameters.$$aggregation = _Helper.clone(oAggregation);
		}
		this.applyParameters(mParameters, "");
	};

	/**
	 * Sets the context and resets the cached contexts of the list items.
	 *
	 * @param {sap.ui.model.Context} oContext
	 *   The context object
	 * @throws {Error}
	 *   For relative bindings containing transient entities
	 *
	 * @private
	 * @see sap.ui.model.Binding#setContext
	 */
	// @override
	ODataListBinding.prototype.setContext = function (oContext) {
		var i,
			sResolvedPath,
			that = this;

		if (this.oContext !== oContext) {
			if (this.bRelative) {
				// Keep the header context even if we lose the parent context, so that the header
				// context remains unchanged if the parent context is temporarily dropped during a
				// refresh.
				for (i = 0; i < that.iCreatedContexts; i += 1) {
					if (that.aContexts[i].isTransient()) {
						// to allow switching the context for new created entities (transient or
						// not), we first have to implement a store/restore mechanism for them
						throw new Error("setContext on relative binding is forbidden if a "
							+ "transient entity exists: " + that);
					}
				}

				this.reset();
				this.fetchCache(oContext);
				if (oContext) {
					sResolvedPath = this.oModel.resolve(this.sPath, oContext);
					if (this.oHeaderContext && this.oHeaderContext.getPath() !== sResolvedPath) {
						this.oHeaderContext.destroy();
						this.oHeaderContext = null;
					}
					if (!this.oHeaderContext) {
						this.oHeaderContext = Context.create(this.oModel, this, sResolvedPath);
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
	 * Sort the entries represented by this list binding according to the given sorters.
	 * The sorters are stored at this list binding and they are used for each following data
	 * request.
	 *
	 * If there are pending changes an error is thrown. Use {@link #hasPendingChanges} to check if
	 * there are pending changes. If there are changes, call
	 * {@link sap.ui.model.odata.v4.ODataModel#submitBatch} to submit the changes or
	 * {@link sap.ui.model.odata.v4.ODataModel#resetChanges} to reset the changes before calling
	 * {@link #sort}.
	 *
	 * @param {sap.ui.model.Sorter | sap.ui.model.Sorter[]} [vSorters]
	 *   The dynamic sorters to be used; they replace the dynamic sorters given in
	 *   {@link sap.ui.model.odata.v4.ODataModel#bindList}.
	 *   Static sorters, as defined in the '$orderby' binding parameter, are always executed after
	 *   the dynamic sorters.
	 * @returns {sap.ui.model.odata.v4.ODataListBinding}
	 *   <code>this</code> to facilitate method chaining
	 * @throws {Error}
	 *   If there are pending changes or if an unsupported operation mode is used (see
	 *   {@link sap.ui.model.odata.v4.ODataModel#bindList}).
	 *
	 * @public
	 * @see sap.ui.model.ListBinding#sort
	 * @since 1.39.0
	 */
	ODataListBinding.prototype.sort = function (vSorters) {
		if (this.sOperationMode !== OperationMode.Server) {
			throw new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server");
		}
		if (this.hasPendingChanges()) {
			throw new Error("Cannot sort due to pending changes");
		}

		this.aSorters = _Helper.toArray(vSorters);

		if (this.isRootBindingSuspended()) {
			this.setResumeChangeReason(ChangeReason.Sort);
			return this;
		}

		this.createReadGroupLock(this.getGroupId(), true);
		this.removeCachesAndMessages("");
		this.fetchCache(this.oContext);
		this.reset(ChangeReason.Sort);

		return this;
	};

	/**
	 * Updates the binding's system query option <code>$apply</code> based on the given data
	 * aggregation information. Its value is
	 * "groupby((&lt;dimension_1,...,dimension_N,unit_or_text_1,...,unit_or_text_K>),
	 * aggregate(&lt;measure> with &lt;method> as &lt;alias>, ...))" where the "aggregate" part is
	 * only present if measures are given and both "with" and "as" are optional.
	 *
	 * @param {object[]} aAggregation
	 *   An array with objects holding the information needed for data aggregation; see also
	 *   <a href="http://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData Extension
	 *   for Data Aggregation Version 4.0</a>
	 * @param {string} aAggregation[].name
	 *   The name of an OData property. A property which is neither a dimension nor a measure, but
	 *   for instance a text property or in some cases a unit property, has no further details.
	 * @param {boolean} [aAggregation[].grouped]
	 *   Its presence is used to detect a dimension; the dimension is ignored unless at least one of
	 *   <code>inResult</code> and <code>visible</code> is <code>true</code>
	 * @param {boolean} [aAggregation[].inResult]
	 *   Dimensions only: see above
	 * @param {boolean} [aAggregation[].visible]
	 *   Dimensions only: see above
	 * @param {boolean} [aAggregation[].total]
	 *   Its presence is used to detect a measure
	 * @param {boolean} [aAggregation[].max]
	 *   Measures only: Whether the maximum value (ignoring currencies or units of measure) for this
	 *   measure is needed (since 1.55.0); filtering and sorting is supported in this case
	 *   (since 1.58.0)
	 * @param {boolean} [aAggregation[].min]
	 *   Measures only: Whether the minimum value (ignoring currencies or units of measure) for this
	 *   measure is needed (since 1.55.0); filtering and sorting is supported in this case
	 *   (since 1.58.0)
	 * @param {string} [aAggregation[].with]
	 *   Measures only: The name of the method (for example "sum") used for aggregation of this
	 *   measure; see "3.1.2 Keyword with" (since 1.55.0)
	 * @param {string} [aAggregation[].as]
	 *   Measures only: The alias, that is the name of the dynamic property used for aggregation of
	 *   this measure; see "3.1.1 Keyword as" (since 1.55.0)
	 * @returns {object}
	 *   The return object contains a property <code>measureRangePromise</code> if and only if at
	 *   least one measure has requested a minimum or maximum value; its value is a
	 *   promise which resolves with the measure range map as soon as data has been received; the
	 *   measure range map contains measure names as keys and objects as values which have a
	 *   <code>min</code> and <code>max</code> property as requested above. In case of multiple
	 *   calls to this method while the binding's root binding is suspended, only the last call's
	 *   promise will resolve with the right result; the other calls just get the same result as the
	 *   last call, which may or may not fit to their <code>aAggregation</code> argument.
	 *   <code>undefined</code> is returned instead of an empty object.
	 * @throws {Error}
	 *   If a property is both a dimension and a measure
	 *
	 * @protected
	 * @see sap.ui.model.analytics.AnalyticalBinding#updateAnalyticalInfo
	 * @see #changeParameters
	 * @see #setAggregation
	 * @since 1.53.0
	 */
	ODataListBinding.prototype.updateAnalyticalInfo = function (aAggregation) {
		var oAggregation = {
				aggregate : {},
				group : {}
			},
			bHasMinMax = false,
			that = this;

		aAggregation.forEach(function (oColumn) {
			var oDetails = {};

			if ("total" in oColumn) { // measure
				if ("grouped" in oColumn) {
					throw new Error("Both dimension and measure: " + oColumn.name);
				}
				if (oColumn.as) {
					oDetails.name = oColumn.name;
					oAggregation.aggregate[oColumn.as] = oDetails;
				} else {
					oAggregation.aggregate[oColumn.name] = oDetails;
				}
				if (oColumn.min) {
					oDetails.min = true;
					bHasMinMax = true;
				}
				if (oColumn.max) {
					oDetails.max = true;
					bHasMinMax = true;
				}
				if (oColumn.with) {
					oDetails.with = oColumn.with;
				}
			} else if (!("grouped" in oColumn) || oColumn.inResult || oColumn.visible) {
				// dimension or unit/text property
				oAggregation.group[oColumn.name] = oDetails;
			}
		});
		this.setAggregation(oAggregation);
		this.bHasAnalyticalInfo = true;
		if (bHasMinMax) {
			return {
				measureRangePromise : Promise.resolve(
					this.getRootBindingResumePromise().then(function () {
						return that.oCachePromise;
					}).then(function (oCache) {
						return oCache.getMeasureRangePromise();
					}))
			};
		}
	};

	return ODataListBinding;
});