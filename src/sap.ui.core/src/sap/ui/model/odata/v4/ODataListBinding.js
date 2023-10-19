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
	"./lib/_Parser",
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/Binding",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/FilterType",
	"sap/ui/model/ListBinding",
	"sap/ui/model/Sorter",
	"sap/ui/model/odata/OperationMode"
], function (Context, asODataParentBinding, _AggregationCache, _AggregationHelper, _Cache,
		_GroupLock, _Helper, _Parser, Log, SyncPromise, Binding, ChangeReason, Filter,
		FilterOperator, FilterProcessor, FilterType, ListBinding, Sorter, OperationMode) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataListBinding",
		mSupportedEvents = {
			AggregatedDataStateChange : true,
			change : true,
			createActivate : true,
			createCompleted : true,
			createSent : true,
			dataReceived : true,
			dataRequested : true,
			DataStateChange : true,
			patchCompleted : true,
			patchSent : true,
			refresh : true
		},
		/**
		 * @alias sap.ui.model.odata.v4.ODataListBinding
		 * @author SAP SE
		 * @class List binding for an OData V4 model.
		 *   An event handler can only be attached to this binding for the following events:
		 *   'AggregatedDataStateChange', 'change', 'createActivate', 'createCompleted',
		 *   'createSent', 'dataReceived', 'dataRequested', 'DataStateChange', 'patchCompleted',
		 *   'patchSent', and 'refresh'. For other events, an error is thrown.
		 * @extends sap.ui.model.ListBinding
		 * @hideconstructor
		 * @mixes sap.ui.model.odata.v4.ODataParentBinding
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
		 * @borrows sap.ui.model.odata.v4.ODataParentBinding#attachPatchCompleted as
		 *   #attachPatchCompleted
		 * @borrows sap.ui.model.odata.v4.ODataParentBinding#attachPatchSent as #attachPatchSent
		 * @borrows sap.ui.model.odata.v4.ODataParentBinding#changeParameters as #changeParameters
		 * @borrows sap.ui.model.odata.v4.ODataParentBinding#detachPatchCompleted as
		 *   #detachPatchCompleted
		 * @borrows sap.ui.model.odata.v4.ODataParentBinding#detachPatchSent as #detachPatchSent
		 * @borrows sap.ui.model.odata.v4.ODataParentBinding#resume as #resume
		 * @borrows sap.ui.model.odata.v4.ODataParentBinding#suspend as #suspend
		 */
		ODataListBinding = ListBinding.extend("sap.ui.model.odata.v4.ODataListBinding", {
				constructor : constructor
			});

	//*********************************************************************************************
	// ODataListBinding
	//*********************************************************************************************

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
	 */
	function constructor(oModel, sPath, oContext, vSorters, vFilters, mParameters) {
		ListBinding.call(this, oModel, sPath);
		// initialize mixin members
		asODataParentBinding.call(this);

		if (sPath.endsWith("/")) {
			throw new Error("Invalid path: " + sPath);
		}

		mParameters = _Helper.clone(mParameters) || {};
		this.checkBindingParameters(mParameters, ["$$aggregation", "$$canonicalPath",
			"$$getKeepAliveContext", "$$groupId", "$$operationMode", "$$ownRequest",
			"$$patchWithoutSideEffects", "$$sharedRequest", "$$updateGroupId"]);
		// number of active (client-side) created contexts in aContexts
		this.iActiveContexts = 0;
		this.aApplicationFilters = _Helper.toArray(vFilters);
		this.sChangeReason = oModel.bAutoExpandSelect && !_Helper.isDataAggregation(mParameters)
			? "AddVirtualContext"
			: undefined;
		// BEWARE: #doReplaceWith can insert a context w/ negative index, but w/o #created promise
		// into aContexts' area of "created contexts"! And via "keep alive" or selection, we may
		// end up w/ #created promise outside that area!
		this.iCreatedContexts = 0; // number of (client-side) created contexts in aContexts
		this.iDeletedContexts = 0; // number of (client-side) deleted contexts
		this.oDiff = undefined;
		this.aFilters = [];
		this.sGroupId = mParameters.$$groupId;
		this.bHasAnalyticalInfo = false;
		this.oHeaderContext = this.bRelative
			? null
			: Context.createNewContext(oModel, this, sPath);
		this.sOperationMode = mParameters.$$operationMode || oModel.sOperationMode;
		// map<string,sap.ui.model.odata.v4.Context>
		// Maps a string path to a v4.Context with that path. A context may either be
		// - an element of this.aContexts (then it knows its index) or
		// - a value of this.mPreviousContextsByPath.
		// Contexts which have previously been part of this.aContexts are parked here for
		// reuse (and thus still remember their index) and get destroyed by
		// #destroyPreviousContexts after the next call to #createContexts.
		// A kept-alive context may be parked here for a longer time, with undefined index.
		this.mPreviousContextsByPath = {};
		this.aPreviousData = null; // no previous data for E.C.D. known yet
		this.bRefreshKeptElements = false; // refresh kept elements when resuming?
		this.sResumeAction = undefined; // a special resume action for $$sharedRequest
		this.bSharedRequest = "$$sharedRequest" in mParameters
			? mParameters.$$sharedRequest
			: oModel.bSharedRequests;
		this.aSorters = _Helper.toArray(vSorters);
		this.sUpdateGroupId = mParameters.$$updateGroupId;
		// Note: $$operationMode is validated before, oModel.sOperationMode also
		// Just check for the case that no mode was specified, but sort/filter takes place
		if (!this.sOperationMode && (this.aSorters.length || this.aApplicationFilters.length)) {
			throw new Error("Unsupported operation mode: " + this.sOperationMode);
		}

		// Note: clone() dropped $$aggregation : undefined, which is good
		this.applyParameters(mParameters); // calls #reset
		if (!this.bRelative || oContext && !oContext.fetchValue) { // @see #isRoot
			// do this before #setContext fires an event!
			this.createReadGroupLock(this.getGroupId(), true);
		}
		this.setContext(oContext);
		oModel.bindingCreated(this);
	}

	asODataParentBinding(ODataListBinding.prototype);

	/**
	 * Attach event handler <code>fnFunction</code> to the 'createActivate' event of this binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @returns {this} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @since 1.98.0
	 */
	ODataListBinding.prototype.attachCreateActivate = function (fnFunction, oListener) {
		return this.attachEvent("createActivate", fnFunction, oListener);
	};

	/**
	 * Detach event handler <code>fnFunction</code> from the 'createActivate' event of this binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @returns {this} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @since 1.98.0
	 */
	ODataListBinding.prototype.detachCreateActivate = function (fnFunction, oListener) {
		return this.detachEvent("createActivate", fnFunction, oListener);
	};

	/**
	 * Attach event handler <code>fnFunction</code> to the 'createCompleted' event of this binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @returns {this} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @since 1.66.0
	 */
	ODataListBinding.prototype.attachCreateCompleted = function (fnFunction, oListener) {
		return this.attachEvent("createCompleted", fnFunction, oListener);
	};

	/**
	 * Detach event handler <code>fnFunction</code> from the 'createCompleted' event of this
	 * binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @returns {this} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @since 1.66.0
	 */
	ODataListBinding.prototype.detachCreateCompleted = function (fnFunction, oListener) {
		return this.detachEvent("createCompleted", fnFunction, oListener);
	};

	/**
	 * Attach event handler <code>fnFunction</code> to the 'createSent' event of this binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @returns {this} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @since 1.66.0
	 */
	ODataListBinding.prototype.attachCreateSent = function (fnFunction, oListener) {
		return this.attachEvent("createSent", fnFunction, oListener);
	};

	/**
	 * Detach event handler <code>fnFunction</code> from the 'createSent' event of this
	 * binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @returns {this} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @since 1.66.0
	 */
	ODataListBinding.prototype.detachCreateSent = function (fnFunction, oListener) {
		return this.detachEvent("createSent", fnFunction, oListener);
	};

	/**
	 * Adjusts the paths of all contexts of this binding by replacing the given transient predicate
	 * with the given predicate. Recursively adjusts all child bindings. Creates a cache and copies
	 * the created entities from the parent cache if necessary.
	 *
	 * @param {string} sTransientPredicate - The transient predicate to be replaced
	 * @param {string} sPredicate - The new predicate
	 * @param {sap.ui.model.odata.v4.Context} [oContext] - The only context that changed
	 *
	 * @override
	 * @private
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
			var iIndex = that.aPreviousData?.indexOf(sOldPath);

			if (iIndex >= 0) {
				that.aPreviousData[iIndex] = sNewPath;
			}
		}

		if (oContext) { // "root call" by #create: we KNOW oContext is affected
			oContext.adjustPredicate(sTransientPredicate, sPredicate, adjustPreviousData);
		} else { // recursive call: we KNOW some parent context was affected
			// => reduced path may, but need not, be affected; other contexts for sure are!
			asODataParentBinding.prototype.adjustPredicate.apply(this, arguments);
			if (this.mCacheQueryOptions && !this.oContext.getPath().includes("($uid=")) {
				// There are mCacheQueryOptions, but #prepareDeepCreate prevented creating the cache
				this.fetchCache(this.oContext, /*bIgnoreParentCache*/true);
			}
			this.oHeaderContext.adjustPredicate(sTransientPredicate, sPredicate);
			this.aContexts.forEach(function (oContext) {
				oContext.adjustPredicate(sTransientPredicate, sPredicate, adjustPreviousData);
			});
		}
	};

	/**
	 * Applies the given map of parameters to this binding's parameters and triggers the
	 * creation of a new cache if called with a change reason. Since 1.111.0, the header context is
	 * deselected.
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
			oOldAggregation = this.mParameters && this.mParameters.$$aggregation,
			sOldApply = this.mQueryOptions && this.mQueryOptions.$apply;

		if ("$$getKeepAliveContext" in mParameters && "$apply" in mParameters) {
			throw new Error("Cannot combine $$getKeepAliveContext and $apply");
		}
		if ("$$aggregation" in mParameters) {
			if ("$apply" in mParameters) {
				throw new Error("Cannot combine $$aggregation and $apply");
			}
			if (!sChangeReason) { // called from c'tor or #setAggregation
				_AggregationHelper.validateAggregationAndSetPath(mParameters.$$aggregation,
					this.oModel.bAutoExpandSelect, this.oModel.oInterface.fetchMetadata,
					this.getResolvedPath());
			}
			sApply = _AggregationHelper.buildApply(mParameters.$$aggregation).$apply;
		}
		this.mQueryOptions = this.oModel.buildQueryOptions(mParameters, true);
		this.oQueryOptionsPromise = undefined; // @see #doFetchOrGetQueryOptions
		this.mParameters = mParameters; // store mParameters at binding after validation
		if (sApply) {
			this.mQueryOptions.$apply = sApply;
		}

		if (sChangeReason === "") { // called from #setAggregation
			if (this.mQueryOptions.$apply === sOldApply
				&& (!this.mParameters.$$aggregation || !oOldAggregation
					|| this.isUnchangedParameter("$$aggregation", oOldAggregation))) {
				return; // unchanged $apply derived from $$aggregation
			}
			// unless called from updateAnalyticalInfo, use ChangeReason.Filter so that the table
			// resets completely incl. first visible row
			sChangeReason = this.bHasAnalyticalInfo ? ChangeReason.Change : ChangeReason.Filter;
		}
		if (this.isRootBindingSuspended()) {
			this.setResumeChangeReason(sChangeReason);
			return;
		}

		this.removeCachesAndMessages("");
		this.fetchCache(this.oContext);
		this.reset(sChangeReason);
		if (this.oHeaderContext) {
			this.oHeaderContext.setSelected(false);
			// Update after the refresh event, otherwise $count is fetched before the request
			this.oHeaderContext.checkUpdate();
		}
	};

	/**
	 * The 'change' event is fired when new contexts are created or removed, or the binding's parent
	 * context is changed. Controls use the event to get notified about changes to the binding
	 * contexts of this list binding. Registered event handlers are called with the reason and
	 * detailed reason as parameters.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 *    The event object
	 * @param {function():Object<any>} oEvent.getParameters
	 *   Function which returns an object containing all event parameters
	 * @param {sap.ui.model.ChangeReason} oEvent.getParameters.reason
	 *   The reason for the 'change' event is
	 *   <ul>
	 *     <li> {@link sap.ui.model.ChangeReason.Add Add} when a new context is created,
	 *     <li> {@link sap.ui.model.ChangeReason.Remove Remove} when a context is removed,
	 *     <li> {@link sap.ui.model.ChangeReason.Context Context} when the parent context is
	 *       changed,
	 *     <li> {@link sap.ui.model.ChangeReason.Change Change} for other changes.
	 *   </ul>
	 *   Additionally each {@link #event:refresh 'refresh'} event is followed by a 'change' event
	 *   repeating the change reason when the requested data is available.
	 * @param {string} oEvent.getParameters.detailedReason
	 *   During automatic determination of $expand and $select, a "virtual" context is first added
	 *   with detailed reason "AddVirtualContext" and then removed with detailed reason
	 *   "RemoveVirtualContext" (since 1.69.0); <code>undefined</code> is used in all other cases
	 *
	 * @event sap.ui.model.odata.v4.ODataListBinding#change
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The 'createActivate' event is fired when a property is changed on a context in an 'inactive'
	 * state (see {@link #create}). The context then changes its state to 'transient'. Since
	 * 1.109.0, this default behavior can be prevented by calling
	 * {@link sap.ui.base.Event#preventDefault}. The context will then remain in the 'inactive'
	 * state.
	 *
	 *
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.model.odata.v4.ODataListBinding} oEvent.getSource() This binding
	 * @param {function():Object<any>} oEvent.getParameters
	 *   Function which returns an object containing all event parameters
	 * @param {sap.ui.model.odata.v4.Context} oEvent.getParameters.context The affected context
	 *
	 * @event sap.ui.model.odata.v4.ODataListBinding#createActivate
	 * @public
	 * @see sap.ui.model.odata.v4.Context#isInactive
	 * @since 1.98.0
	 */

	/**
	 * The 'createCompleted' event is fired when the back end has responded to a POST request
	 * triggered for a {@link #create} on this binding. For each 'createSent' event, a
	 * 'createCompleted' event is fired.
	 *
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.model.odata.v4.ODataListBinding} oEvent.getSource() This binding
	 * @param {function():Object<any>} oEvent.getParameters
	 *   Function which returns an object containing all event parameters
	 * @param {sap.ui.model.odata.v4.Context} oEvent.getParameters.context
	 *   The context for the created entity
	 * @param {boolean} oEvent.getParameters.success
	 *   Whether the POST was successfully processed; in case of an error, the error is already
	 *   reported to the {@link sap.ui.core.message.MessageManager}
	 *
	 * @event sap.ui.model.odata.v4.ODataListBinding#createCompleted
	 * @public
	 * @since 1.66.0
	 */

	/**
	 * The 'createSent' event is fired when a POST request triggered for a {@link #create} on this
	 * binding is sent to the back end. For each 'createSent' event, a 'createCompleted' event is
	 * fired.
	 *
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.model.odata.v4.ODataListBinding} oEvent.getSource() This binding
	 * @param {function():Object<any>} oEvent.getParameters
	 *   Function which returns an object containing all event parameters
	 * @param {sap.ui.model.odata.v4.Context} oEvent.getParameters.context
	 *   The context for the created entity
	 *
	 * @event sap.ui.model.odata.v4.ODataListBinding#createSent
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
	 * with {@link sap.ui.model.Binding#event:dataReceived 'dataReceived'}, an event parameter
	 * <code>data : {}</code> is provided: "In error cases it will be undefined", but otherwise it
	 * is not. Use the binding's contexts via
	 * {@link #getCurrentContexts oEvent.getSource().getCurrentContexts()} to access the response
	 * data. Note that controls bound to this data may not yet have been updated, meaning it is not
	 * safe for registered event handlers to access data via control APIs.
	 *
	 * If a back-end request fails, the 'dataReceived' event provides an <code>Error</code> in the
	 * 'error' event parameter.
	 *
	 * Since 1.106 this event is bubbled up to the model, unless a listener calls
	 * {@link sap.ui.base.Event#cancelBubble oEvent.cancelBubble()}.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 *    The event object
	 * @param {function} oEvent.cancelBubble
	 *   A callback function to prevent that the event is bubbled up to the model
	 * @param {function():Object<any>} oEvent.getParameters
	 *   Function which returns an object containing all event parameters
	 * @param {object} [oEvent.getParameters.data]
	 *   An empty data object if a back-end request succeeds
	 * @param {Error} [oEvent.getParameters.error] The error object if a back-end request failed.
	 *   If there are multiple failed back-end requests, the error of the first one is provided.
	 *
	 * @event sap.ui.model.odata.v4.ODataListBinding#dataReceived
	 * @public
	 * @see sap.ui.model.odata.v4.ODataModel#event:dataReceived
	 * @since 1.37.0
	 */

	/**
	 * The 'dataRequested' event is fired directly after data has been requested from a back end.
	 * It is only fired for GET requests. The 'dataRequested' event is to be used by applications
	 * for example to switch on a busy indicator. Registered event handlers are called without
	 * parameters.
	 *
	 * Since 1.106 this event is bubbled up to the model, unless a listener calls
	 * {@link sap.ui.base.Event#cancelBubble oEvent.cancelBubble()}.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @param {function} oEvent.cancelBubble
	 *   A callback function to prevent that the event is bubbled up to the model
	 *
	 * @event sap.ui.model.odata.v4.ODataListBinding#dataRequested
	 * @public
	 * @see sap.ui.model.odata.v4.ODataModel#event:dataRequested
	 * @since 1.37.0
	 */

	/**
	 * The 'patchCompleted' event is fired when the back end has responded to the last PATCH request
	 * for this binding. If there is more than one PATCH request in a $batch, the event is fired
	 * only once. Only bindings using an own data service request fire a 'patchCompleted' event.
	 * For each 'patchSent' event, a 'patchCompleted' event is fired.
	 *
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.model.odata.v4.ODataListBinding} oEvent.getSource() This binding
	 * @param {function():Object<any>} oEvent.getParameters
	 *   Function which returns an object containing all event parameters
	 * @param {boolean} oEvent.getParameters.success
	 *   Whether all PATCHes are successfully processed
	 *
	 * @event sap.ui.model.odata.v4.ODataListBinding#patchCompleted
	 * @public
	 * @since 1.59.0
	 */

	/**
	 * The 'patchSent' event is fired when the first PATCH request for this binding is sent to the
	 * back end. If there is more than one PATCH request in a $batch, the event is fired only once.
	 * Only bindings using an own data service request fire a 'patchSent' event. For each
	 * 'patchSent' event, a 'patchCompleted' event is fired.
	 *
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.model.odata.v4.ODataListBinding} oEvent.getSource() This binding
	 *
	 * @event sap.ui.model.odata.v4.ODataListBinding#patchSent
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
	 *    The event object
	 * @param {function():Object<any>} oEvent.getParameters
	 *   Function which returns an object containing all event parameters
	 * @param {sap.ui.model.ChangeReason} oEvent.getParameters.reason
	 *   The reason for the 'refresh' event could be
	 *   <ul>
	 *     <li> {@link sap.ui.model.ChangeReason.Context Context} when the binding's
	 *       parent context is changed,
	 *     <li> {@link sap.ui.model.ChangeReason.Filter Filter} on {@link #filter} and
	 *       {@link #setAggregation},
	 *     <li> {@link sap.ui.model.ChangeReason.Refresh Refresh} on {@link #refresh}, or when the
	 *       binding is initialized,
	 *     <li> {@link sap.ui.model.ChangeReason.Sort Sort} on {@link #sort}.
	 *   </ul>
	 *   {@link #changeParameters} leads to {@link sap.ui.model.ChangeReason.Filter Filter} if one
	 *   of the parameters '$filter' and '$search' is changed, otherwise it leads to
	 *   {@link sap.ui.model.ChangeReason.Sort Sort} if the parameter '$orderby' is
	 *   changed; in other cases, it leads to {@link sap.ui.model.ChangeReason.Change Change}.
	 *   <br>
	 *   If APIs that would normally fire change events have been called while the binding is
	 *   suspended, {@link #resume} leads to the &quot;strongest&quot; change reason in the order
	 *   {@link sap.ui.model.ChangeReason.Filter Filter},
	 *   {@link sap.ui.model.ChangeReason.Sort Sort},
	 *   {@link sap.ui.model.ChangeReason.Refresh Refresh},
	 *   {@link sap.ui.model.ChangeReason.Change Change}.
	 *
	 * @event sap.ui.model.odata.v4.ODataListBinding#refresh
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
	ODataListBinding.prototype.attachEvent = function (sEventId, _oData, _fnFunction, _oListener) {
		if (!(sEventId in mSupportedEvents)) {
			throw new Error("Unsupported event '" + sEventId
				+ "': v4.ODataListBinding#attachEvent");
		}
		return ListBinding.prototype.attachEvent.apply(this, arguments);
	};

	/**
	 * @override
	 * @see sap.ui.model.Binding#_checkDataStateMessages
	 */
	ODataListBinding.prototype._checkDataStateMessages = function (oDataState, sResolvedPath) {
		if (sResolvedPath) {
			oDataState.setModelMessages(this.oModel.getMessagesByPath(sResolvedPath, true));
		}
	};

	/**
	 * Checks that deep create is possible in this binding.
	 *
	 * @throws {Error} If deep create is not possible
	 *
	 * @private
	 */
	ODataListBinding.prototype.checkDeepCreate = function () {
		if (!this.oModel.bAutoExpandSelect) {
			throw new Error("Deep create is only supported with autoExpandSelect");
		}
		if (!this.oContext.isTransient()) {
			throw new Error("Unexpected ODataContextBinding in deep create");
		}
		if (this.sPath.includes("/")) {
			throw new Error("Invalid path '" + this.sPath + "' in deep create");
		}
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataParentBinding#checkKeepAlive
	 */
	ODataListBinding.prototype.checkKeepAlive = function (oContext, bKeepAlive) {
		if (this.isRelative() && !this.mParameters.$$ownRequest) {
			throw new Error("Missing $$ownRequest at " + this);
		}
		if (oContext === this.oHeaderContext) {
			throw new Error("Unsupported header context " + oContext);
		}
		if (_Helper.isDataAggregation(this.mParameters)) {
			throw new Error("Unsupported $$aggregation at " + this);
		}
		if (this.bSharedRequest) {
			throw new Error("Unsupported $$sharedRequest at " + this);
		}
		// fail when really resetting keep-alive on a non-deleted context which is not in the
		// collection and there are pending changes
		if (!bKeepAlive && oContext && oContext.getIndex() === undefined && oContext.isKeepAlive()
				&& !oContext.isDeleted() && oContext.hasPendingChanges()) {
			throw new Error("Not allowed due to pending changes: " + oContext);
		}
	};

	/**
	 * Collapses the group node that the given context points to.
	 *
	 * @param {sap.ui.model.odata.v4.Context} oContext
	 *   The context corresponding to the group node
	 * @param {boolean} [bSilent]
	 *   Whether no ("change") events should be fired
	 * @throws {Error}
	 *   If the binding's root binding is suspended
	 *
	 * @private
	 * @see #expand
	 */
	ODataListBinding.prototype.collapse = function (oContext, bSilent) {
		var aContexts = this.aContexts,
			iCount = this.oCache.collapse(
				_Helper.getRelativePath(oContext.getPath(), this.oHeaderContext.getPath())),
			iModelIndex = oContext.getModelIndex(),
			i,
			that = this;

		if (iCount > 0) {
			aContexts.splice(iModelIndex + 1, iCount).forEach(function (oContext) {
				if (!oContext.created()) {
					that.mPreviousContextsByPath[oContext.getPath()] = oContext;
				} // else: created (even persisted) is kept inside "context" annotation
			});
			for (i = iModelIndex + 1; i < aContexts.length; i += 1) {
				if (aContexts[i]) {
					aContexts[i].iIndex = i;
				}
			}
			this.iMaxLength -= iCount;
			if (!bSilent) {
				this._fireChange({reason : ChangeReason.Change});
			}
		} // else: collapse before expand has finished
	};

	/**
	 * Creates a new entity and inserts it at the start or the end of the list.
	 *
	 * For creating the new entity, the binding's update group ID is used, see
	 * {@link #getUpdateGroupId}.
	 *
	 * You can call {@link sap.ui.model.odata.v4.Context#delete} to delete the created context
	 * again. As long as the context is {@link sap.ui.model.odata.v4.Context#isTransient transient}
	 * and {@link sap.ui.model.odata.v4.Context#isInactive active}, {@link #resetChanges} and a call
	 * to {@link sap.ui.model.odata.v4.ODataModel#resetChanges} with the update group ID as
	 * parameter also delete the created context together with other changes.
	 *
	 * If the creation of the entity on the server failed, the creation is repeated
	 * automatically. If the binding's update group ID has
	 * {@link sap.ui.model.odata.v4.SubmitMode.API}, it is repeated with the next call of
	 * {@link sap.ui.model.odata.v4.ODataModel#submitBatch}. Otherwise it is repeated with the next
	 * update for the entity. Since 1.67.0, {@link sap.ui.model.odata.v4.ODataModel#submitBatch} can
	 * also be used for group IDs with {@link sap.ui.model.odata.v4.SubmitMode.Auto} in order to
	 * repeat the creation even if there is no update for the entity.
	 *
	 * Each time the data for the created entity is sent to the server, a
	 * {@link #event:createSent 'createSent'} event is fired and each time the client receives a
	 * response for the creation, a {@link #event:createCompleted 'createCompleted'} event is fired,
	 * independent of whether the creation was successful or not.
	 *
	 * The initial data for the created entity can be supplied via the parameter
	 * <code>oInitialData</code> and modified via property bindings. Properties that are not part of
	 * the initial data show the default value from the service metadata on the UI, but they are not
	 * sent to the server. If there is no default value, <code>null</code> is used instead, even if
	 * the property is not <code>Nullable</code>. The initial data may contain instance annotations.
	 *
	 * Note: If a server requires a property in the request, you must supply this property in the
	 * initial data, for example if the server requires a unit for an amount. This also applies if
	 * this property has a default value.
	 *
	 * Note: After creation, the created entity is refreshed to ensure that the data specified in
	 * this list binding's $expand is available. This refresh is done via the group ID of the
	 * binding, unless the group ID has {@link sap.ui.model.odata.v4.SubmitMode.API}, in which case
	 * '$auto' is used. To skip this refresh, set <code>bSkipRefresh</code> to <code>true</code>. To
	 * avoid errors you must skip this refresh when using
	 * {@link sap.ui.model.odata.v4.Context#requestSideEffects} in the same $batch to refresh the
	 * complete collection containing the newly created entity.
	 *
	 * Since 1.115.0 it is possible to create nested entities in a collection-valued navigation
	 * property together with the entity (so-called "deep create"), for example a list of items for
	 * an order. For this purpose, bind the list relative to a transient context. Calling this
	 * method then adds a transient entity to the parent's navigation property, which is sent with
	 * the payload of the parent entity. Such a nested context cannot be inactive.
	 *
	 * <b>Note:</b> After a succesful creation of the main entity the context returned for a
	 * nested entity is no longer valid. Do not use the
	 * {@link sap.ui.model.odata.v4.Context#created created} promise of such a context! New contexts
	 * are created for the nested collection because it is not possible to reliably assign the
	 * response entities to those of the request, especially if the count differs. For this reason,
	 * the <code>created</code> promises of all nested contexts are always rejected with an instance
	 * of <code>Error</code>, even if the deep create succeeds. This error always has the property
	 * <code>canceled</code> with the value <code>true</code>.
	 *
	 * Since 1.118.0 deep create also supports single-valued navigation properties; no API call is
	 * required in this case. Simply bind properties of the related entity relative to a transient
	 * context. An update to the property adds it to the POST request of the parent entity, and by
	 * this the create becomes deep.
	 *
	 * Deep create requires the <code>autoExpandSelect</code> parameter at the
	 * {@link sap.ui.model.odata.v4.ODataModel#constructor model}. The refresh after a deep create
	 * is optimized. Only the (navigation) properties missing from the POST response are actually
	 * requested. If the POST response contains all required properties, no request is sent at all.
	 *
	 * Note: Creating at the end is only allowed if the final length of the binding is known (see
	 * {@link #isLengthFinal}), so that there is a clear position to place this entity at. This is
	 * the case if the complete collection has been read or if the system query option
	 * <code>$count</code> is <code>true</code> and the binding has processed at least one request.
	 *
	 * Creating a new child beneath an existing and visible parent node (which must either be a leaf
	 * or expanded, but not collapsed) is supported (@experimental as of version 1.117.0) in case of
	 * a recursive hierarchy (see {@link #setAggregation}). The parent node must be identified via a
	 * {@link sap.ui.model.odata.v4.Context} instance given as
	 * <code>oInitialData["@$ui5.node.parent"]</code>. <code>oAggregation.expandTo</code> (see
	 * {@link #setAggregation}) must be one, <code>bSkipRefresh</code> must be set, but both
	 * <code>bAtEnd</code> and <code>bInactive</code> must not be set. No other creation or
	 * {@link sap.ui.model.odata.v4.Context#move move} must be pending, and no other modification
	 * (including collapse of some ancestor node) must happen while this creation is pending!
	 * Creating a new root works the same way with <code>oInitialData["@$ui5.node.parent"]</code>
	 * being <code>null</code> or absent; <code>oAggregation.expandTo</code> does not matter then
	 * (@experimental as of version 1.120.0).
	 *
	 * @param {Object<any>} [oInitialData={}]
	 *   The initial data for the created entity
	 * @param {boolean} [bSkipRefresh]
	 *   Whether an automatic refresh of the created entity will be skipped.
	 *   <br>
	 *   <b>Note:</b> Do not use this parameter for a deep create. It leads to multiple single row
	 *   requests if the POST response did not supply all properties of the nested list. If it is
	 *   not set, the model checks whether all required properties and child entities are available
	 *   on the client and requests only data that is missing.
	 * @param {boolean} [bAtEnd]
	 *   Whether the entity is inserted at the end of the list. Supported since 1.66.0.
	 *   Since 1.99.0 the first insertion determines the overall position of created contexts
	 *   within the binding's context list. Every succeeding insertion is relative to the created
	 *   contexts within this list.
	 * @param {boolean} [bInactive]
	 *   Create an inactive context. Such a context will only be sent to the server after the first
	 *   property update. From then on it behaves like any other created context.
	 *   Supported since 1.97.0
	 *   <br>
	 *   Since 1.98.0, when the first property updates happens, the context is no longer
	 *   {@link sap.ui.model.odata.v4.Context#isInactive inactive} and the
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#event:createActivate 'createActivate'} event
	 *   is fired. While inactive, it does not count as a {@link #hasPendingChanges pending change}
	 *   and does not contribute to the {@link #getCount count}.
	 * @returns {sap.ui.model.odata.v4.Context}
	 *   The context object for the created entity; its method
	 *   {@link sap.ui.model.odata.v4.Context#created} returns a promise that is resolved when the
	 *   creation is finished
	 * @throws {Error} If
	 *   <ul>
	 *     <li> the binding's root binding is suspended,
	 *     <li> a relative binding is unresolved,
	 *     <li> data aggregation is used (see {@link #setAggregation}),
	 *     <li> entities are created first at the end and then at the start,
	 *     <li> <code>bAtEnd</code> is <code>true</code> and the binding does not know the final
	 *       length,
	 *     <li> <code>bInactive</code> is <code>true</code>, the list binding is relative and does
	 *       not use the <code>$$ownRequest</code> parameter
	 *       (see {@link sap.ui.model.odata.v4.ODataModel#bindList}),
	 *     <li> the list binding has a transient parent context (takes part in a deep create), but
	 *       <ul>
	 *         <li> <code>bInactive</code> is <code>true</code>,
	 *         <li> or the <code>autoExpandSelect</code> parameter at the
	 *           {@link sap.ui.model.odata.v4.ODataModel#constructor model} is not set,
	 *         <li> or a context binding exists in the binding hierarchy between the binding and the
	 *           parent list binding,
	 *         <li> or its path contains more than a single navigation property (for example
	 *           "BP_2_SO/SO_2_SOITEM"),
	 *       </ul>
	 *     <li> an automatic refresh of the created entity cannot be performed and
	 *       <code>bSkipRefresh</code> is missing. This could be caused by a side-effects refresh
	 *       happening in parallel to creation (error thrown since 1.114.0; previously failed
	 *       without an adequate error message),
	 *     <li> the restrictions for creating in a recursive hierarchy (see above) are not met.
	 *   </ul>
	 * @public
	 * @since 1.43.0
	 */
	ODataListBinding.prototype.create = function (oInitialData, bSkipRefresh, bAtEnd, bInactive) {
		var oAggregation = this.mParameters.$$aggregation,
			iChildIndex, // used only in case of recursive hierarchy
			oContext,
			oCreatePathPromise = this.fetchResourcePath(),
			oCreatePromise,
			oEntityData,
			sGroupId = this.getUpdateGroupId(),
			oGroupLock,
			sResolvedPath = this.getResolvedPath(),
			sTransientPredicate = "($uid=" + _Helper.uid() + ")",
			sTransientPath = sResolvedPath + sTransientPredicate,
			i,
			that = this;

		if (!sResolvedPath) {
			throw new Error("Binding is unresolved: " + this);
		}
		this.checkSuspended();
		if (_Helper.isDataAggregation(this.mParameters)) {
			throw new Error("Cannot create in " + this + " when using data aggregation");
		}
		if (this.isTransient()) {
			this.checkDeepCreate();
			if (bInactive) {
				throw new Error("Must not create an inactive context in a deep create: " + this);
			}
		}

		bAtEnd = !!bAtEnd; // normalize to simplify comparisons
		if (bAtEnd && !(this.bLengthFinal || this.mParameters.$count)) {
			throw new Error(
				"Must know the final length to create at the end. Consider setting $count");
		}
		if (this.bFirstCreateAtEnd && !bAtEnd) {
			throw new Error("Cannot create at the start after creation at end");
		}
		if (bInactive) {
			if (this.isRelative() && !this.mParameters.$$ownRequest) {
				throw new Error("Missing $$ownRequest at " + this);
			}
			sGroupId = "$inactive." + sGroupId;
		} else if (!oAggregation) {
			this.iActiveContexts += 1;
		}

		if (this.bFirstCreateAtEnd === undefined) {
			this.bFirstCreateAtEnd = bAtEnd;
		}

		// clone data to avoid modifications outside the cache
		// remove any property starting with "@$ui5."
		oEntityData = _Helper.publicClone(oInitialData, true) || {};
		if (oAggregation) {
			if (!bSkipRefresh) {
				throw new Error("Missing bSkipRefresh");
			}
			if (arguments.length > 2) {
				throw new Error("Only the parameters oInitialData and bSkipRefresh are supported");
			}
			const oParentContext = oInitialData?.["@$ui5.node.parent"];
			if (oParentContext) {
				if (oAggregation.expandTo > 1) {
					throw new Error("Unsupported $$aggregation.expandTo: " + oAggregation.expandTo);
				}
				iChildIndex = this.aContexts.indexOf(oParentContext) + 1;
				if (iChildIndex <= 0) {
					throw new Error("Invalid parent context: " + oParentContext);
				}
				if (oParentContext.isExpanded() === false) {
					throw new Error("Unsupported collapsed parent: " + oParentContext);
				}
				oEntityData["@$ui5.node.parent"] = oParentContext.getCanonicalPath().slice(1);
			} else {
				iChildIndex = 0;
			}
		} else {
			this.iCreatedContexts += 1;
		}

		// only for createInCache
		oGroupLock = this.lockGroup(sGroupId, true, true, function () {
			if (!that.aContexts.includes(oContext)) { // #setContext changed the parent context
				that.mPreviousContextsByPath[oContext.getPath()] = oContext;
				that.destroyPreviousContextsLater([oContext.getPath()]);
				return;
			}

			oContext.setSelected(false);
			that.removeCreated(oContext);
			return Promise.resolve().then(function () {
				// Fire the change asynchronously so that Cache#delete is finished and #getContexts
				// can read the data synchronously. This is important for extended change detection.
				that._fireChange({reason : ChangeReason.Remove});
			});
		});
		oCreatePromise = this.createInCache(oGroupLock, oCreatePathPromise, sResolvedPath,
			sTransientPredicate, oEntityData, this.bFirstCreateAtEnd !== bAtEnd,
			function (oError) { // error callback
				that.oModel.reportError("POST on '" + oCreatePathPromise
					+ "' failed; will be repeated automatically", sClassName, oError);

				that.fireEvent("createCompleted", {context : oContext, success : false});
			},
			function () { // submit callback
				that.fireEvent("createSent", {context : oContext});
			}
		).then(function (oCreatedEntity) {
			// The entity was created on the server
			// Note: This code is not called for nested creates, they are always rejected
			var bDeepCreate, sGroupId, sPredicate;

			// refreshSingle requires the new key predicate in oContext.getPath()
			sPredicate = _Helper.getPrivateAnnotation(oCreatedEntity, "predicate");
			if (sPredicate) {
				that.adjustPredicate(sTransientPredicate, sPredicate, oContext);
				that.oModel.checkMessages();
			}
			that.fireEvent("createCompleted", {context : oContext, success : true});
			bDeepCreate = _Helper.getPrivateAnnotation(oCreatedEntity, "deepCreate");
			_Helper.deletePrivateAnnotation(oCreatedEntity, "deepCreate");
			sGroupId = that.getGroupId();
			if (that.oModel.isApiGroup(sGroupId)) {
				sGroupId = "$auto";
			}
			// currently the optimized update w/o bSkipRefresh is restricted to deep create
			return bSkipRefresh || bDeepCreate
				? oContext.updateAfterCreate(bSkipRefresh, sGroupId)
				: that.refreshSingle(oContext, that.lockGroup(sGroupId));
		}, function (oError) {
			oGroupLock.unlock(true); // createInCache failed, so the lock might still be blocking
			throw oError;
		});

		oContext = Context.create(this.oModel, this, sTransientPath,
			iChildIndex ?? -this.iCreatedContexts, oCreatePromise, bInactive);
		if (this.isTransient()) {
			oContext.created().catch(this.oModel.getReporter());
		}
		// to make sure that #fetchValue does not overtake #createInCache, avoid bCached flag!
		oContext.fetchValue().then(function (oElement) {
			if (oElement) {
				_Helper.setPrivateAnnotation(oElement, "context", oContext);
				_Helper.setPrivateAnnotation(oElement, "firstCreateAtEnd", that.bFirstCreateAtEnd);
			} // else: context already destroyed
		});

		if (iChildIndex !== undefined) {
			this.aContexts.splice(iChildIndex, 0, oContext);
			for (i = this.aContexts.length - 1; i > iChildIndex; i -= 1) {
				if (this.aContexts[i]) {
					this.aContexts[i].iIndex += 1;
				}
			}
			this.iMaxLength += 1;
		} else if (this.bFirstCreateAtEnd !== bAtEnd) {
			this.aContexts.splice(this.iCreatedContexts - 1, 0, oContext);
			for (i = this.iCreatedContexts - 1; i >= 0; i -= 1) {
				this.aContexts[i].iIndex = i - this.iCreatedContexts;
			}
		} else {
			this.aContexts.unshift(oContext);
		}
		this._fireChange({reason : ChangeReason.Add});

		return oContext;
	};

	/**
	 * Creates contexts for this list binding in the given range for the given OData response.
	 * Fires change events. Destroys contexts that became obsolete and shrinks the array by removing
	 * trailing <code>undefined</code>.
	 *
	 * @param {number} iStart
	 *   The start index of the range
	 * @param {object[]} aResults
	 *   The OData entities read from the cache for the given range
	 * @returns {boolean}
	 *   <code>true</code>, if contexts have been created or dropped or <code>isLengthFinal</code>
	 *   has changed
	 *
	 * @private
	 */
	ODataListBinding.prototype.createContexts = function (iStart, aResults) {
		var bChanged = false,
			oContext,
			sContextPath,
			iCount = aResults.$count,
			i$skipIndex,
			bLengthFinal = this.bLengthFinal,
			oModel = this.oModel,
			sPath = this.getResolvedPath(),
			sPredicate,
			bStartBeyondRange = iStart > this.aContexts.length,
			i,
			that = this;

		/*
		 * Shrinks contexts to the new length, destroys unneeded contexts
		 */
		function shrinkContexts() {
			var iNewLength = that.iMaxLength + that.iCreatedContexts,
				i;

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

		for (i = 0; i < aResults.length; i += 1) {
			if (this.aContexts[iStart + i] === undefined && aResults[i]) {
				bChanged = true;
				i$skipIndex = iStart + i - this.iCreatedContexts; // index on server ($skip)
				sPredicate = _Helper.getPrivateAnnotation(aResults[i], "predicate");
				sContextPath = sPath + (sPredicate || "/" + i$skipIndex);
				oContext = this.mPreviousContextsByPath[sContextPath];
				if (oContext && (!oContext.created() || oContext.isEffectivelyKeptAlive())) {
					// reuse the previous context, unless it is created (and persisted), but not
					// kept alive
					delete this.mPreviousContextsByPath[sContextPath];
					oContext.iIndex = i$skipIndex;
					oContext.checkUpdate();
				} else if (_Helper.hasPrivateAnnotation(aResults[i], "context")) {
					// created persisted contexts can be restored from their data, for example in
					// case of Recursive Hierarchy maintenance
					oContext = _Helper.getPrivateAnnotation(aResults[i], "context");
				} else {
					oContext = Context.create(oModel, this, sContextPath, i$skipIndex);
				}
				this.aContexts[iStart + i] = oContext;
			}
		}
		// destroy previous contexts which are not reused or kept-alive
		this.destroyPreviousContextsLater(Object.keys(this.mPreviousContextsByPath));
		if (iCount !== undefined) { // server count is available or "non-empty short read"
			this.bLengthFinal = true;
			this.iMaxLength = iCount - this.iActiveContexts;
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
	 * @override
	 * @see sap.ui.model.odata.v4.ODataParentBinding#delete
	 */
	ODataListBinding.prototype.delete = function (oGroupLock, sEditUrl, oContext, oETagEntity,
			bDoNotRequestCount, fnUndelete) {
		var bReset = false,
			that = this;

		if (this.mParameters.$$aggregation && oContext.iIndex === undefined) {
			throw new Error("Unsupported kept-alive context: " + oContext);
		}
		if (oContext.isDeleted()) {
			return oContext.oDeletePromise; // do not delete twice
		}

		const bExpanded = oContext.isExpanded();
		if (bExpanded) {
			this.collapse(oContext, /*bSilent*/true);
		}

		// When deleting a context with negative index, iCreatedContexts et al. must be adjusted.
		// However, when re-inserting, the context has lost its index. Beware: Do NOT use the
		// created() promise, because doReplaceWith places a context w/o the promise here.
		const bCreated = oContext.iIndex < 0;
		const sPath = oContext.iIndex === undefined
			// context is not in aContexts -> use the predicate
			? _Helper.getRelativePath(oContext.getPath(), this.oHeaderContext.getPath())
			: String(oContext.getModelIndex());

		this.iDeletedContexts += 1;

		return oContext.doDelete(oGroupLock, sEditUrl, sPath, oETagEntity, this,
			function (iIndex, iOffset) {
				if (iIndex !== undefined) {
					// An entity can only be deleted when its key predicate is known. So we can be
					// sure to have key predicates and the contexts are related to entities and not
					// rows. -> Shift them and adjust the indexes
					if (iOffset > 0) { // we're re-inserting
						delete that.mPreviousContextsByPath[oContext.getPath()];
						that.aContexts.splice(iIndex, 0, oContext);
						fnUndelete();
					} else { // we're deleting
						that.mPreviousContextsByPath[oContext.getPath()] = oContext;
						that.aContexts.splice(iIndex, 1);
						oContext.iIndex = undefined;
						// fire asynchronously so that multiple deletes only update the table once
						Promise.resolve().then(function () {
							that._fireChange({reason : ChangeReason.Remove});
						});
					}
					if (bCreated) {
						that.iCreatedContexts += iOffset;
						that.iActiveContexts += iOffset;
					} else {
						// iMaxLength is the number of server rows w/o the created entities
						that.iMaxLength += iOffset; // this doesn't change Infinity
					}
					that.aContexts.forEach(function (oContext0, i) {
						oContext0.iIndex = i - that.iCreatedContexts;
					});
				} else if (iOffset > 0) { // trying to reinsert an element w/o index
					bReset = true;
					fnUndelete();
				} else if (that.bLengthFinal && !bDoNotRequestCount) {
					// a kept-alive context is not in aContexts -> request the count
					that.oCache.requestCount(
						oGroupLock && !that.oModel.isApiGroup(oGroupLock.getGroupId())
							? oGroupLock.getUnlockedCopy()
							: that.lockGroup("$auto")
					).then(function (iCount) {
						var iOldMaxLength = that.iMaxLength;

						that.iMaxLength = iCount - that.iActiveContexts;
						// Note: Although we know that oContext is not in aContexts, a "change"
						// event needs to be fired in order to notify the control about the new
						// length, for example, to update the 'More' button or the scrollbar.
						if (iOldMaxLength !== that.iMaxLength) {
							that._fireChange({reason : ChangeReason.Remove});
						}
					});
				}
			}
		).then(function () {
			that.iDeletedContexts -= 1;
			if (!that.iDeletedContexts && !that.iCreatedContexts) {
				// all (created) contexts finally gone -> free to create at any end
				that.bFirstCreateAtEnd = undefined;
			}
			oContext.resetKeepAlive();
			oContext.iIndex = Context.VIRTUAL; // prevent further cache access via this context
			that.destroyPreviousContextsLater([oContext.getPath()]);
		}, function (oError) {
			that.iDeletedContexts -= 1;
			// if the cache has become inactive, the callback is not called -> undelete here
			fnUndelete();
			if (bReset) {
				that.oCache.reset(that.getKeepAlivePredicates());
				that.reset(ChangeReason.Change);
			} else {
				if (bExpanded) {
					// runs synchronously because it was expanded before
					that.expand(oContext, /*bSilent*/true).unwrap();
				}
				that._fireChange({reason : ChangeReason.Add});
			}
			throw oError;
		});
	};

	/**
	 * Destroys the object. The object must not be used anymore after this function was called.
	 *
	 * @public
	 * @see sap.ui.model.Binding#destroy
	 * @since 1.40.1
	 */
	// @override sap.ui.model.Binding#destroy
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
		// this.mParameters = undefined;
		this.mPreviousContextsByPath = undefined;
		this.aPreviousData = undefined;
		this.mQueryOptions = undefined;
		this.oQueryOptionsPromise = undefined;
		this.aSorters = undefined;

		asODataParentBinding.prototype.destroy.call(this);
		ListBinding.prototype.destroy.call(this);
	};

	/**
	 * Destroys the given context later so that the control has time to handle the context's
	 * dependent bindings before.
	 *
	 * @param {sap.ui.model.odata.v4.Context} oContext
	 *   The context instance to be destroyed
	 *
	 * @private
	 */
	ODataListBinding.prototype.destroyLater = function (oContext) {
		if (this.iCurrentEnd) {
			// Destroy later when the next #getContexts does not reuse it
			this.mPreviousContextsByPath[oContext.getPath()] = oContext;
		} else {
			// There seems to be no listener (iCurrentEnd is set by #getContexts), destroy now
			oContext.destroy();
		}
	};

	/**
	 * Removes and destroys contexts from mPreviousContextsByPath.
	 *
	 * @param {string[]} [aPathsToDelete]
	 *   If given, only contexts with paths in this list except kept-alive and pending deletes are
	 *   removed and destroyed (transient contexts are removed only); otherwise all contexts in the
	 *   list are removed and destroyed
	 *
	 * @private
	 */
	ODataListBinding.prototype.destroyPreviousContexts = function (aPathsToDelete) {
		var mPreviousContextsByPath = this.mPreviousContextsByPath,
			that = this;

		if (mPreviousContextsByPath) { // binding may have been destroyed already
			(aPathsToDelete || Object.keys(mPreviousContextsByPath)).forEach(function (sPath) {
				var oContext = mPreviousContextsByPath[sPath];

				if (oContext) {
					if (aPathsToDelete && (oContext.isEffectivelyKeptAlive()
							|| oContext.oDeletePromise && oContext.oDeletePromise.isPending())) {
						oContext.iIndex = undefined;
					} else {
						if (!oContext.isTransient()) {
							oContext.destroy();
							if (oContext.iIndex === undefined && that.oCache) {
								// was kept alive (or deleted)
								that.oCache.removeKeptElement(
									_Helper.getRelativePath(sPath, that.oHeaderContext.getPath()));
							}
						}
						delete mPreviousContextsByPath[sPath];
					}
				}
			});
		}
	};

	/**
	 * Removes and destroys the contexts with the given paths from mPreviousContextsByPaths in a
	 * prerendering task.
	 *
	 * @param {string[]} aPathsToDelete
	 *   Only contexts with paths in this list except kept-alive and pending deletes are removed and
	 *   destroyed (transient contexts are removed only)
	 *
	 * @private
	 */
	ODataListBinding.prototype.destroyPreviousContextsLater = function (aPathsToDelete) {
		if (aPathsToDelete.length) {
			this.oModel.addPrerenderingTask(
				this.destroyPreviousContexts.bind(this, aPathsToDelete));
		}
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#doCreateCache
	 */
	ODataListBinding.prototype.doCreateCache = function (sResourcePath, mQueryOptions, oContext,
			sDeepResourcePath, sGroupId, oOldCache) {
		var oCache,
			aKeepAlivePredicates,
			mKeptElementsByPredicate;

		if (oOldCache && oOldCache.getResourcePath() === sResourcePath
				&& oOldCache.$deepResourcePath === sDeepResourcePath) {
			aKeepAlivePredicates = this.getKeepAlivePredicates();
			if (this.iCreatedContexts || this.iDeletedContexts || aKeepAlivePredicates.length) {
				// Note: #inheritQueryOptions as called below should not matter in case of own
				// requests, which are a precondition for kept-alive elements
				oOldCache.reset(aKeepAlivePredicates, sGroupId, mQueryOptions,
					this.mParameters.$$aggregation, this.isGrouped());

				return oOldCache;
			}
		}

		mQueryOptions = this.inheritQueryOptions(mQueryOptions, oContext);
		oCache = this.getCacheAndMoveKeepAliveContexts(sResourcePath, mQueryOptions);
		if (oCache && this.mParameters.$$aggregation) {
			mKeptElementsByPredicate = {};
			aKeepAlivePredicates = this.getKeepAlivePredicates();
			aKeepAlivePredicates.forEach(function (sPredicate) {
				mKeptElementsByPredicate[sPredicate] = oCache.getValue(sPredicate);
			});
			oCache.setActive(false);
			oCache = undefined; // create _AggregationCache instead of _CollectionCache
		}
		oCache = oCache
			|| _AggregationCache.create(this.oModel.oRequestor, sResourcePath, sDeepResourcePath,
				mQueryOptions, this.mParameters.$$aggregation, this.oModel.bAutoExpandSelect,
				this.bSharedRequest, this.isGrouped());
		if (mKeptElementsByPredicate) {
			aKeepAlivePredicates.forEach(function (sPredicate) {
				oCache.addKeptElement(mKeptElementsByPredicate[sPredicate]);
			});
		} else if (this.bSharedRequest) {
			oCache.registerChangeListener("", this);
		}

		return oCache;
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#doFetchOrGetQueryOptions
	 */
	ODataListBinding.prototype.doFetchOrGetQueryOptions = function (oContext) {
		// Note: an absolute binding needs no parent context :-)
		var sMetaPath = oContext && _Helper.getMetaPath(oContext.getPath()),
			that = this;

		if (!(this.oQueryOptionsPromise && this.oQueryOptionsPromise.$metaPath === sMetaPath)) {
			this.oQueryOptionsPromise
				= this.fetchResolvedQueryOptions(oContext).then(function (mQueryOptions) {
					return that.fetchFilter(oContext, mQueryOptions.$filter)
						.then(function (aFilters) {
							return _Helper.mergeQueryOptions(mQueryOptions,
								that.getOrderby(mQueryOptions.$orderby), aFilters);
						});
				});
			this.oQueryOptionsPromise.$metaPath = sMetaPath;
		}

		return this.oQueryOptionsPromise;
	};

	/**
	 * Replaces the given old context with a new one for the given element and key predicate,
	 * placing the new one at the same index and returning it. If a context for the given key
	 * predicate already exists, it is reused. A newly created context will be kept-alive if the old
	 * context was, and then it will share the <code>fnOnBeforeDestroy</code> method - but it will
	 * be called with the new context as first argument.
	 *
	 * @param {sap.ui.model.odata.v4.Context} oOldContext - The old context
	 * @param {object} oElement - The element data
	 * @param {string} sPredicate - The key predicate
	 * @returns {sap.ui.model.odata.v4.Context} - The new context
	 * @throws {Error} If a reused context is already part of the collection (has an index), except
	 *   if it is the same instance as the given old context
	 *
	 * @private
	 */
	ODataListBinding.prototype.doReplaceWith = function (oOldContext, oElement, sPredicate) {
		var iModelIndex = oOldContext.getModelIndex(),
			bNew,
			fnOnBeforeDestroy = oOldContext.fnOnBeforeDestroy,
			fnOnBeforeDestroyClone,
			sPath = this.oHeaderContext.getPath() + sPredicate,
			oResult = this.mPreviousContextsByPath[sPath];

		if (oResult) {
			if (oResult === oOldContext) {
				return oResult; // shortcut
			}
			if (oResult.iIndex !== undefined) {
				throw new Error("Unexpected index: " + oResult);
			}
			oResult.iIndex = oOldContext.iIndex;
			delete this.mPreviousContextsByPath[sPath];
		} else {
			oResult = Context.create(this.oModel, this, sPath, oOldContext.iIndex);
			bNew = true;
		}
		if (iModelIndex === undefined) { // => oOldContext.iIndex === undefined
			this.mPreviousContextsByPath[sPath] = oResult;
			this.oCache.addKeptElement(oElement);
		} else {
			oOldContext.iIndex = undefined;
			this.aContexts[iModelIndex] = oResult;
			this.oCache.doReplaceWith(iModelIndex, oElement);
		}
		if (oOldContext.isKeepAlive()) {
			this.mPreviousContextsByPath[oOldContext.getPath()] = oOldContext;
			if (bNew) {
				if (fnOnBeforeDestroy) {
					fnOnBeforeDestroyClone
						= (fnOnBeforeDestroy.$original || fnOnBeforeDestroy).bind(null, oResult);
					fnOnBeforeDestroyClone.$original = fnOnBeforeDestroy;
				}
				oResult.setKeepAlive(true, fnOnBeforeDestroyClone);
			}
		} else { // Note: w/o a key predicate, oOldContext cannot be kept alive
			this.destroyLater(oOldContext);
		}
		this._fireChange({reason : ChangeReason.Change});

		return oResult;
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataParentBinding#doSetProperty
	 */
	ODataListBinding.prototype.doSetProperty = function () {};

	/**
	 * Expands the group node that the given context points to.
	 *
	 * @param {sap.ui.model.odata.v4.Context} oContext
	 *   The context corresponding to the group node
	 * @param {boolean} [bSilent]
	 *   Whether no ("change") events should be fired
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise that is resolved when the expand is successful and rejected when it fails
	 * @throws {Error}
	 *   If the binding's root binding is suspended
	 *
	 * @private
	 * @see #collapse
	 */
	ODataListBinding.prototype.expand = function (oContext, bSilent) {
		this.checkSuspended();
		let bDataRequested = false;

		return this.oCache.expand(this.lockGroup(),
			_Helper.getRelativePath(oContext.getPath(), this.oHeaderContext.getPath()),
			/*fnDataRequested*/ () => {
				bDataRequested = true;
				this.fireDataRequested();
			}
		).then((iCount) => {
			if (iCount) {
				this.insertGap(oContext.getModelIndex(), iCount);
				if (!bSilent) {
					this._fireChange({reason : ChangeReason.Change});
				}
			} // else: collapse before expand has finished, oContext already destroyed
			if (bDataRequested) {
				this.fireDataReceived({});
			}
		}, (oError) => {
			if (bDataRequested) {
				this.fireDataReceived({error : oError});
			}

			throw oError;
		});
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
	 *   modified; it rejects when iStart or iLength are negative, or when the request fails, or
	 *   if this binding is already destroyed when the response arrives
	 *
	 * @private
	 */
	ODataListBinding.prototype.fetchContexts = function (iStart, iLength, iMaximumPrefetchSize,
			oGroupLock, bAsync, fnDataRequested) {
		var oPromise,
			that = this;

		if (this.bFirstCreateAtEnd) {
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
			var oError;

			// Without the bAsync flag we would need the following test twice: once here for the
			// createContexts and once in the caller to be safe after the additional hop
			if (!that.aContexts) {
				oError = new Error("Binding already destroyed");
				oError.canceled = true;
				throw oError;
			}

			return oResult && that.createContexts(iStart, oResult.value);
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
	 *   A promise to be resolved with the requested range as described in _Cache#read or with
	 *   <code>undefined</code> if the context changed before reading; it is rejected to discard a
	 *   response because the cache is no longer active, in this case the error has the property
	 *   <code>canceled</code> with value <code>true</code>.
	 *
	 * @private
	 */
	ODataListBinding.prototype.fetchData = function (iIndex, iLength, iMaximumPrefetchSize,
		oGroupLock, fnDataRequested) {
		var oContext = this.oContext,
			that = this;

		return this.oCachePromise.then(function (oCache) {
			var aElements;

			if (that.bRelative && oContext !== that.oContext) {
				return undefined;
			}

			if (oCache) {
				if (!oCache.hasSentRequest() && ODataListBinding.isBelowCreated(oContext)) {
					aElements = oContext.getAndRemoveCollection(that.sPath);
					if (aElements) { // there is a collection from a finished deep create
						// copy the created elements into the newly created cache
						oCache.setPersistedCollection(aElements);
					}
				}

				return oCache.read(iIndex, iLength, iMaximumPrefetchSize, oGroupLock,
					fnDataRequested
				).then(function (oResult) {
					that.assertSameCache(oCache);

					return oResult;
				});
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
	 *   If the binding is unresolved or is {@link #isTransient transient} (part of a
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#create deep create}),
	 *
	 * @private
	 */
	ODataListBinding.prototype.fetchDownloadUrl = function () {
		var mUriParameters = this.oModel.mUriParameters;

		this.checkTransient();
		if (!this.isResolved()) {
			throw new Error("Binding is unresolved");
		}
		return this.withCache(function (oCache, sPath) {
			return oCache.getDownloadUrl(sPath, mUriParameters);
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

		/*
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
				case FilterOperator.BT:
					sFilter = sFilterPath + " ge " + sValue + " and " + sFilterPath + " le "
						+ setCase(_Helper.formatLiteral(oFilter.oValue2, sEdmType));
					break;
				case FilterOperator.NB:
					sFilter = wrap(sFilterPath + " lt " + sValue + " or " + sFilterPath + " gt "
						+ setCase(_Helper.formatLiteral(oFilter.oValue2, sEdmType)), bWithinAnd);
					break;
				case FilterOperator.EQ:
				case FilterOperator.GE:
				case FilterOperator.GT:
				case FilterOperator.LE:
				case FilterOperator.LT:
				case FilterOperator.NE:
					sFilter = sFilterPath + " " + oFilter.sOperator.toLowerCase() + " " + sValue;
					break;
				case FilterOperator.Contains:
				case FilterOperator.EndsWith:
				case FilterOperator.NotContains:
				case FilterOperator.NotEndsWith:
				case FilterOperator.NotStartsWith:
				case FilterOperator.StartsWith:
					sFilter = oFilter.sOperator.toLowerCase().replace("not", "not ")
						+ "(" + sFilterPath + "," + sValue + ")";
					break;
				default:
					throw new Error("Unsupported operator: " + oFilter.sOperator);
			}
			return sFilter;
		}

		/*
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

		/*
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

		/*
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
	 * @param {boolean} [bCached]
	 *   Whether to return cached values only and not trigger a request
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise on the outcome of the cache's <code>fetchValue</code> call; it is rejected in
	 *   case cached values are asked for, but not found
	 *
	 * @private
	 */
	ODataListBinding.prototype.fetchValue = function (sPath, oListener, bCached) {
		var oCachePromise = bCached && this.oCache !== undefined
				? SyncPromise.resolve(this.oCache)
				: this.oCachePromise,
			that = this;

		return oCachePromise.then(function (oCache) {
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
	 * @override
	 * @see sap.ui.model.odata.v4.ODataParentBinding#findContextForCanonicalPath
	 */
	ODataListBinding.prototype.findContextForCanonicalPath = function (sCanonicalPath) {
		var aKeptAliveContexts = Object.values(this.mPreviousContextsByPath)
				.filter(function (oCandidate) {
					return oCandidate.isEffectivelyKeptAlive();
				});

		function check(aContexts) {
			return aContexts.find(function (oCandidate) {
				var oPromise;

				if (oCandidate) {
					oPromise = oCandidate.fetchCanonicalPath();
					oPromise.caught();
					return oPromise.getResult() === sCanonicalPath;
				}
			});
		}

		return check(aKeptAliveContexts) || check(this.aContexts);
	};

	/**
	 * Filters the list with the given filters. Since 1.97.0, if filters are unchanged, no request
	 * is sent, regardless of pending changes. Since 1.111.0, the header context is deselected.
	 *
	 * If there are pending changes that cannot be ignored, an error is thrown. Use
	 * {@link #hasPendingChanges} to check if there are such pending changes. If there are, call
	 * {@link sap.ui.model.odata.v4.ODataModel#submitBatch} to submit the changes or
	 * {@link sap.ui.model.odata.v4.ODataModel#resetChanges} to reset the changes before calling
	 * {@link #filter}.
	 *
	 * Filters are case sensitive unless the property <code>caseSensitive</code> is set to
	 * <code>false</code>. This property has to be set on each filter, it is not inherited from a
	 * multi-filter.
	 *
	 * <h4>Application and Control Filters</h4>
	 * Each list binding maintains two separate lists of filters, one for filters defined by the
	 * control that owns the binding, and another list for filters that an application can define in
	 * addition. When executing the filter operation, both sets of filters are combined.
	 *
	 * By using the <code>sFilterType</code> parameter of the <code>filter</code> method, the
	 * caller can control which set of filters is modified.
	 *
	 * <h4>Auto-Grouping of Filters</h4>
	 * Filters are first grouped according to their binding path. All filters belonging to the same
	 * path are ORed, and after that the results of all paths are ANDed. Usually this means that all
	 * filters applied to the same property are ORed, while filters on different properties are
	 * ANDed.
	 * Please use either the automatic grouping of filters (where applicable) or explicit
	 * AND/OR filters, as a mixture of both is not supported.
	 *
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} [vFilters]
	 *   The dynamic filters to be used; replaces the dynamic filters given in
	 *   {@link sap.ui.model.odata.v4.ODataModel#bindList}.
	 *   The filter executed on the list is created from the following parts, which are combined
	 *   with a logical 'and':
	 *   <ul>
	 *     <li> Dynamic filters of type {@link sap.ui.model.FilterType.Application}
	 *     <li> Dynamic filters of type {@link sap.ui.model.FilterType.Control}
	 *     <li> The static filters, as defined in the '$filter' binding parameter
	 *   </ul>
	 *
	 * @param {sap.ui.model.FilterType} [sFilterType=sap.ui.model.FilterType.Application]
	 *   The filter type to be used
	 * @returns {this}
	 *   <code>this</code> to facilitate method chaining
	 * @throws {Error} If
	 *   <ul>
	 *     <li> there are pending changes that cannot be ignored,
	 *     <li> the binding is {@link #isTransient transient} (part of a
	 *       {@link sap.ui.model.odata.v4.ODataListBinding#create deep create}),
	 *     <li> an unsupported operation mode is used (see
	 *       {@link sap.ui.model.odata.v4.ODataModel#bindList}).
	 *   </ul>
	 *   The following pending changes are ignored:
	 *   <ul>
	 *     <li> changes relating to a {@link sap.ui.model.odata.v4.Context#isKeepAlive kept-alive}
	 *       context of this binding (since 1.97.0),
	 *     <li> {@link sap.ui.model.odata.v4.Context#isTransient transient} contexts of a
	 *       {@link #getRootBinding root binding} (since 1.98.0),
	 *     <li> {@link sap.ui.model.odata.v4.Context#delete deleted} contexts (since 1.108.0).
	 *   </ul>
	 *
	 * @public
	 * @see sap.ui.model.ListBinding#filter
	 * @see #setAggregation
	 * @since 1.39.0
	 */
	// @override sap.ui.model.ListBinding#filter
	ODataListBinding.prototype.filter = function (vFilters, sFilterType) {
		var aFilters = _Helper.toArray(vFilters);

		this.checkTransient();
		if (this.sOperationMode !== OperationMode.Server) {
			throw new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server");
		}

		if (sFilterType === FilterType.Control
				? _Helper.deepEqual(aFilters, this.aFilters)
				: _Helper.deepEqual(aFilters, this.aApplicationFilters)) {
			return this;
		}

		if (this.hasPendingChanges(true)) {
			throw new Error("Cannot filter due to pending changes");
		}

		if (sFilterType === FilterType.Control) {
			this.aFilters = aFilters;
		} else {
			this.aApplicationFilters = aFilters;
		}
		this.oQueryOptionsPromise = undefined;

		if (this.isRootBindingSuspended()) {
			this.setResumeChangeReason(ChangeReason.Filter);
			return this;
		}

		this.createReadGroupLock(this.getGroupId(), true);
		this.removeCachesAndMessages("");
		this.fetchCache(this.oContext);
		this.reset(ChangeReason.Filter);
		if (this.oHeaderContext) {
			this.oHeaderContext.setSelected(false);
			// Update after the refresh event, otherwise $count is fetched before the request
			this.oHeaderContext.checkUpdate();
		}

		return this;
	};

	/**
	 * Fires the 'createActivate' event.
	 *
	 * @param {sap.ui.model.odata.v4.Context} oContext
	 *   The context being activated
	 * @returns {boolean}
	 *   Whether the context should become active
	 *
	 * @private
	 */
	ODataListBinding.prototype.fireCreateActivate = function (oContext) {
		if (this.fireEvent("createActivate", {context : oContext}, true)) {
			this.iActiveContexts += 1;

			return true;
		}

		return false;
	};

	/**
	 * Returns the current object holding the information needed for data aggregation, see
	 * {@link #setAggregation}.
	 *
	 * @param {boolean} [bVerbose]
	 *   Whether to additionally return the "$"-prefixed values described below which obviously
	 *   cannot be given back to the setter (@experimental as of version 1.111.0). They are
	 *   retrieved from the pair of "Org.OData.Aggregation.V1.RecursiveHierarchy" and
	 *   "com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchy" annotations at this binding's
	 *   entity type, identified via the <code>hierarchyQualifier</code> given to
	 *   {@link #setAggregation}.
	 *   <ul>
	 *     <li> "$DistanceFromRootProperty" holds the path to the property which provides the raw
	 *       value for "@$ui5.node.level" (minus one) and should be used only to interpret the
	 *       response retrieved via {@link #getDownloadUrl}.
	 *     <li> "$DrillStateProperty" holds the path to the property which provides the raw value
	 *       for "@$ui5.node.isExpanded" and should be used only to interpret the response retrieved
	 *       via {@link #getDownloadUrl}.
	 *     <li> "$NodeProperty" holds the path to the property which provides the hierarchy node
	 *       value. That property is always $select'ed automatically and can be accessed as usual.
	 *   </ul>
	 * @returns {object|undefined}
	 *   The current data aggregation object, incl. some default values, or <code>undefined</code>
	 *   if there is no data aggregation
	 *
	 * @public
	 * @since 1.109.0
	 */
	ODataListBinding.prototype.getAggregation = function (bVerbose) {
		return _Helper.clone(this.mParameters.$$aggregation, function (sKey, vValue) {
			return sKey[0] === "$"
				&& !(bVerbose && ["$DistanceFromRootProperty", "$DrillStateProperty",
					"$NodeProperty"].includes(sKey))
				? undefined
				: vValue;
		});
	};

	/**
	 * Returns all current contexts of this list binding in no special order. Just like
	 * {@link #getCurrentContexts}, this method does not request any data from a back end and does
	 * not change the binding's state. In contrast to {@link #getCurrentContexts}, it does not only
	 * return those contexts that were last requested by a control, but all contexts that are
	 * currently available in the binding, including
	 * {@link sap.ui.model.odata.v4.Context#isKeepAlive kept-alive} contexts. To filter out
	 * kept-alive contexts that are not part of the list, you could check whether the index is
	 * <code>undefined</code>, as described in {@link sap.ui.model.odata.v4.Context#getIndex}.
	 *
	 * @returns {sap.ui.model.odata.v4.Context[]}
	 *   All current contexts of this list binding, in no special order
	 *
	 * @public
	 * @since 1.98.0
	 */
	ODataListBinding.prototype.getAllCurrentContexts = function () {
		var aElements;

		this.withCache(function (oCache, sPath) {
				aElements = oCache.getAllElements(sPath);
			}, "", /*bSync*/true);

		if (aElements && this.createContexts(0, aElements)) {
			// In the case that a control has requested new data and the data request is already
			// completed, but the new contexts are not yet created, we have to ensure that a change
			// event is fired to inform the control about these new contexts.
			this._fireChange({reason : ChangeReason.Change});
		}

		return this.aContexts.filter(function (oContext) {
			return oContext;
		}).concat(Object.values(this.mPreviousContextsByPath).filter(function (oContext) {
			return oContext.isEffectivelyKeptAlive();
		}));
	};

	/**
	 * Tries to get a cache from the model. This is only relevant for the $$getKeepAlive scenario
	 * when the model created a temporary binding for this binding's path. If there is such a
	 * binding, its contexts are moved here, it is destroyed and its cache is returned.
	 *
	 * @param {string} sResourcePath
	 *   The resource path for the cache
	 * @param {object} mQueryOptions
	 *   The query options for the cache
	 * @returns {sap.ui.model.odata.v4.lib._CollectionCache|undefined}
	 *   The cache or <code>undefined</code> if the model has no matching temporary binding
	 *
	 * @private
	 */
	ODataListBinding.prototype.getCacheAndMoveKeepAliveContexts = function (sResourcePath,
			mQueryOptions) {
		var oBinding,
			oCache,
			that = this;

		if (!this.mParameters.$$getKeepAliveContext) {
			return undefined;
		}
		// $$canonicalPath is not allowed, binding path and resource path are (almost) identical
		oBinding = this.oModel.releaseKeepAliveBinding("/" + sResourcePath);
		if (!oBinding) {
			return undefined;
		}

		Object.keys(oBinding.mParameters).concat(Object.keys(this.mParameters))
			.forEach(function (sParameter) {
				if ((sParameter[0] !== "$" || sParameter === "$$patchWithoutSideEffects"
						|| sParameter === "$$updateGroupId")
						&& that.mParameters[sParameter] !== oBinding.mParameters[sParameter]) {
					throw new Error(that + ": parameter does not match getKeepAliveContext: "
						+ sParameter);
				}
			});
		// createAndSetCache copies them to the cache later
		this.mLateQueryOptions = _Helper.clone(mQueryOptions);
		_Helper.aggregateExpandSelect(this.mLateQueryOptions, oBinding.mLateQueryOptions);
		this.mPreviousContextsByPath = oBinding.mPreviousContextsByPath;
		Object.values(this.mPreviousContextsByPath).forEach(function (oContext) {
			oContext.oBinding = that;
		});
		oCache = oBinding.oCache;
		oCache.setQueryOptions(mQueryOptions);
		// avoid that the cache is set inactive or that contexts are destroyed
		oBinding.oCache = null;
		oBinding.oCachePromise = SyncPromise.resolve(null);
		oBinding.mPreviousContextsByPath = {};
		oBinding.destroy();

		return oCache;
	};

	/**
	 * Returns already created binding contexts for all entities in this list binding for the range
	 * determined by the given start index <code>iStart</code> and <code>iLength</code>.
	 * If at least one of the entities in the given range has not yet been loaded, fires a
	 * {@link #event:change 'change'} event on this list binding once these entities have been
	 * loaded <b>asynchronously</b>. A further call to this method in the 'change' event handler
	 * with the same index range then yields the updated array of contexts.
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
	 * @param {boolean} [bKeepCurrent]
	 *   Whether this call keeps the result of {@link #getCurrentContexts} untouched; since 1.86.0.
	 * @returns {sap.ui.model.odata.v4.Context[]}
	 *   The array of already created contexts with the first entry containing the context for
	 *   <code>iStart</code>
	 * @throws {Error}
	 *   If the binding's root binding is suspended, if <code>iMaximumPrefetchSize</code> and
	 *   <code>bKeepCurrent</code> are set, if extended change detection is enabled and
	 *   <code>iMaximumPrefetchSize</code> or <code>bKeepCurrent</code> is set or
	 *   <code>iStart</code> is not 0
	 *
	 * @protected
	 * @since 1.37.0
	 */
	// @override @see sap.ui.model.ListBinding#getContexts
	ODataListBinding.prototype.getContexts = function (iStart, iLength, iMaximumPrefetchSize,
			bKeepCurrent) {
		var sChangeReason,
			aContexts,
			bDataRequested = false,
			bFireChange = false,
			oGroupLock,
			bPreventBubbling,
			oPromise,
			bRefreshEvent = !!this.sChangeReason, // ignored for "*VirtualContext"
			sResolvedPath = this.getResolvedPath(),
			oVirtualContext,
			that = this;

		Log.debug(this + "#getContexts(" + iStart + ", " + iLength + ", "
				+ iMaximumPrefetchSize + ")",
			undefined, sClassName);

		this.checkSuspended();

		iStart = iStart || 0;
		if (iStart !== 0 && this.bUseExtendedChangeDetection) {
			throw new Error("Unsupported operation: v4.ODataListBinding#getContexts,"
				+ " iStart must be 0 if extended change detection is enabled, but is " + iStart);
		}

		if (this.bUseExtendedChangeDetection) {
			if (iMaximumPrefetchSize !== undefined) {
				throw new Error("Unsupported operation: v4.ODataListBinding#getContexts,"
					+ " iMaximumPrefetchSize must not be set if extended change detection is"
					+ " enabled");
			}
			if (bKeepCurrent) {
				throw new Error("Unsupported operation: v4.ODataListBinding#getContexts,"
					+ " must not use bKeepCurrent if extended change detection is enabled");
			}
		}

		if (iMaximumPrefetchSize && bKeepCurrent) {
			throw new Error("Unsupported operation: v4.ODataListBinding#getContexts,"
				+ " must not use both iMaximumPrefetchSize and bKeepCurrent");
		}

		if (!this.isResolved()) { // unresolved relative binding
			this.aPreviousData = null; // compute diff from scratch when binding is resolved again
			return [];
		}

		sChangeReason = this.sChangeReason || ChangeReason.Change;
		this.sChangeReason = undefined;

		if (sChangeReason === "AddVirtualContext") {
			// Note: this task is queued _before_ any SubmitMode.Auto task!
			this.oModel.addPrerenderingTask(function () {
				var bOld = that.bUseExtendedChangeDetection;

				if (that.aContexts && !that.isRootBindingSuspended()) {
					// request data (before removing virtual context), but avoid E.C.D.
					// (see BCP: 2270085692 for some interesting discussions)
					that.bUseExtendedChangeDetection = false;
					that.getContexts(iStart, iLength, iMaximumPrefetchSize);
					that.bUseExtendedChangeDetection = bOld;
				} // else: w/o that.aContexts, binding is already destroyed: just avoid #getContexts
				that.oModel.addPrerenderingTask(function () {
					if (!that.isRootBindingSuspended()) {
						// Note: first result of getContexts after refresh is ignored
						that.sChangeReason = "RemoveVirtualContext";
						that._fireChange({
							detailedReason : "RemoveVirtualContext",
							reason : ChangeReason.Change
						});
						that.reset(ChangeReason.Refresh);
					}
				});
			}, true);
			oVirtualContext = Context.create(this.oModel, this,
				sResolvedPath + "/" + Context.VIRTUAL,
				Context.VIRTUAL);
			// Destroy later when the next #getContexts does not reuse it, or inside #destroy
			that.mPreviousContextsByPath[oVirtualContext.getPath()] = oVirtualContext;
			return [oVirtualContext];
		}

		if (sChangeReason === "RemoveVirtualContext"
				|| (this.oContext && this.oContext.iIndex === Context.VIRTUAL)) {
			return [];
		}

		iLength = iLength || this.oModel.iSizeLimit;
		if (!iMaximumPrefetchSize || iMaximumPrefetchSize < 0) {
			iMaximumPrefetchSize = 0;
		}

		oGroupLock = this.oReadGroupLock;
		this.oReadGroupLock = undefined;
		if (!this.oDiff) { // w/o E.C.D there won't be a diff
			// before fetchContexts needing it and resolveRefreshPromise destroying it
			bPreventBubbling = this.isRefreshWithoutBubbling();
			// make sure "refresh" is followed by async "change"
			oPromise = this.fetchContexts(iStart, iLength, iMaximumPrefetchSize, oGroupLock,
				/*bAsync*/bRefreshEvent, function () {
					bDataRequested = true;
					that.fireDataRequested(bPreventBubbling);
				});
			this.resolveRefreshPromise(oPromise).then(function (bChanged) {
				if (that.bUseExtendedChangeDetection) {
					that.oDiff = {
						aDiff : that.getDiff(iLength),
						iLength : iLength
					};
				}
				if (bFireChange) {
					if (bChanged || (that.oDiff && that.oDiff.aDiff?.length)) {
						that._fireChange({reason : sChangeReason});
					} else { // we cannot keep a diff if we do not tell the control to fetch it!
						that.oDiff = undefined;
					}
				}
				if (bDataRequested) {
					that.fireDataReceived({data : {}}, bPreventBubbling);
				}
			}, function (oError) {
				// cache shares promises for concurrent read
				if (bDataRequested) {
					that.fireDataReceived(oError.canceled ? {data : {}} : {error : oError},
						bPreventBubbling);
				}
				throw oError;
			}).catch(function (oError) {
				that.oModel.reportError("Failed to get contexts for "
						+ that.oModel.sServiceUrl + sResolvedPath.slice(1)
						+ " with start index " + iStart + " and length " + iLength,
					sClassName, oError);
			});
			// in case of asynchronous processing ensure to fire a change event
			bFireChange = true;
		} else if (oGroupLock) { // unexpected oReadGroupLock and oDiff
			if (oGroupLock.isLocked()) {
				throw new Error("Unexpected: " + oGroupLock);
			}
			Log.error("Unexpected", oGroupLock, sClassName);
		}
		if (!bKeepCurrent) {
			this.iCurrentBegin = iStart;
			this.iCurrentEnd = iStart + iLength;
		}
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
		var aContexts, iCount, i;

		if (this.bFirstCreateAtEnd) {
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
	 * Returns the count of elements.
	 *
	 * If known, the value represents the sum of the element count of the collection on the server
	 * and the number of {@link sap.ui.model.odata.v4.Context#isInactive active}
	 * {@link sap.ui.model.odata.v4.Context#isTransient transient} entities created on the client,
	 * minus the {@link #sap.ui.model.data.v4.Context#delete deleted} entities. Otherwise, it is
	 * <code>undefined</code>. The value is a number of type <code>Edm.Int64</code>. Since 1.91.0,
	 * in case of data aggregation with group levels, the count is the leaf count on the server; it
	 * is only determined if the <code>$count</code> system query option is given. Since 1.110.0,
	 * in case of a recursive hierarchy, the count is the number of nodes matching the current
	 * filter and search criteria (if any) or the number of all nodes; it is only determined if the
	 * <code>$count</code> system query option is given.
	 *
	 * The count is known to the binding in the following situations:
	 * <ul>
	 *   <li> The server-side count has been requested via the <code>$count</code> system query
	 *     option.
	 *   <li> A "short read" in a paged collection (the server delivered less elements than
	 *     requested) indicated that the server has no more unread elements.
	 *   <li> It has been read completely in one request, for example an embedded collection via
	 *     <code>$expand</code>.
	 * </ul>
	 *
	 * The <code>$count</code> is unknown if the binding is relative but has no context.
	 *
	 * The count is bindable via the header context (see {@link #getHeaderContext}) and path
	 * <code>$count</code>.
	 *
	 * Use <code>getHeaderContext().requestProperty("$count")</code> if you want to wait for the
	 * value.
	 *
	 * @returns {number|undefined}
	 *   The count of elements (leaves, nodes) or <code>undefined</code> if the count or the header
	 *   context is not available.
	 *
	 * @public
	 * @since 1.91.0
	 */
	ODataListBinding.prototype.getCount = function () {
		var oHeaderContext = this.getHeaderContext();

		return oHeaderContext ? oHeaderContext.getProperty("$count") : undefined;
	};

	/**
	 * Returns the contexts that were requested by a control last time. Does not trigger a data
	 * request. In the time between the {@link #event:dataRequested 'dataRequested'} event and the
	 * {@link #event:dataReceived 'dataReceived'} event, the resulting array contains
	 * <code>undefined</code> at those indexes where the data is not yet available or has been
	 * deleted.
	 *
	 * @returns {sap.ui.model.odata.v4.Context[]}
	 *   The contexts
	 *
	 * @public
	 * @see sap.ui.model.ListBinding#getCurrentContexts
	 * @see #getAllCurrentContexts
	 * @since 1.39.0
	 */
	// @override sap.ui.model.ListBinding#getCurrentContexts
	ODataListBinding.prototype.getCurrentContexts = function () {
		var aContexts,
			iLength = Math.min(this.iCurrentEnd, this.iMaxLength + this.iCreatedContexts)
				- this.iCurrentBegin;

		aContexts = this.getContextsInViewOrder(this.iCurrentBegin, iLength);

		if (iLength < Infinity) {
			while (aContexts.length < iLength) {
				aContexts.push(undefined);
			}
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
			return oDependentBinding.oContext.isEffectivelyKeptAlive()
				|| !(oDependentBinding.oContext.getPath() in that.mPreviousContextsByPath);
		});
	};

	/**
	 * Computes the "diff" needed for extended change detection.
	 *
	 * @param {number} iLength
	 *   The length of the range requested in getContexts
	 * @returns {object}
	 *   The array of differences which is the comparison of current versus previous data as given
	 *   by {@link #getContextData}, or <code>null</code> in case no previous data is known.
	 *
	 * @private
	 */
	ODataListBinding.prototype.getDiff = function (iLength) {
		var aPreviousData = this.aPreviousData,
			that = this;

		this.aPreviousData = this.getContextsInViewOrder(0, iLength).map(function (oContext) {
			return that.getContextData(oContext);
		});

		return aPreviousData ? this.diffData(aPreviousData, this.aPreviousData) : null;
	};

	/**
	 * Method not supported
	 *
	 * @param {string} [_sPath]
	 * @returns {Array}
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.ListBinding#getDistinctValues
	 * @since 1.37.0
	 */
	// @override sap.ui.model.ListBinding#getDistinctValues
	ODataListBinding.prototype.getDistinctValues = function (_sPath) {
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
	 * The URL cannot be determined synchronously in all cases; use {@link #requestDownloadUrl} to
	 * allow for asynchronous determination then.
	 *
	 * @returns {string}
	 *   The download URL
	 * @throws {Error}
	 *   If the binding is unresolved or if the URL cannot be determined synchronously (either due
	 *   to a pending metadata request or because the <code>autoExpandSelect</code> parameter at the
	 *   {@link sap.ui.model.odata.v4.ODataModel#constructor model} is used and the binding has been
	 *   newly created and is thus still automatically generating its $select and $expand system
	 *   query options from the binding hierarchy)
	 *
	 * @function
	 * @public
	 * @since 1.74.0
	 */
	ODataListBinding.prototype.getDownloadUrl = _Helper.createGetMethod("fetchDownloadUrl", true);

	/**
	 * @override
	 * @see sap.ui.model.ListBinding#getEntryData
	 */
	ODataListBinding.prototype.getEntryData = function (oContext) {
		return _Helper.publicClone(oContext.getValue(), false, true);
	};

	/**
	 * Returns the "entry key" for the given context needed for extended change detection.
	 *
	 * @param {sap.ui.model.Context} oContext
	 *   The context instance
	 * @returns {string}
	 *   A key for the given context which is unique across all contexts of this list binding
	 *
	 * @private
	 * @see sap.ui.model.ListBinding#enableExtendedChangeDetection
	 * @see sap.ui.model.ListBinding#getContextData
	 */
	ODataListBinding.prototype.getEntryKey = function (oContext) {
		return oContext.getPath();
	};

	/**
	 * Returns the filter information as an abstract syntax tree.
	 * Consumers must not rely on the origin information to be available, future filter
	 * implementations will not provide this information.
	 *
	 * If the system query option <code>$filter</code> is present, it will be added to the AST as a
	 * node with the following structure:
	 *   <ul>
	 *     <li> <code>expression</code>: the value of the system query option <code>$filter</code>
	 *     <li> <code>syntax</code>: the OData version of this bindings model, e.g. "OData 4.0"
	 *     <li> <code>type</code>: "Custom"
	 *   </ul>
	 *
	 * @param {boolean} [bIncludeOrigin] whether to include information about the filter objects
	 *   from which the tree has been created
	 * @returns {object} The AST of the filter tree including the static filter as string or null if
	 *   no filters are set
	 * @private
	 * @ui5-restricted sap.ui.table, sap.ui.export
	 */
	// @override sap.ui.model.ListBinding#getFilterInfo
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
	 * @override
	 * @see sap.ui.model.odata.v4.ODataParentBinding#getGeneration
	 */
	ODataListBinding.prototype.getGeneration = function () {
		return this.oHeaderContext.getGeneration(true)
			|| asODataParentBinding.prototype.getGeneration.call(this);
	};

	/**
	 * Returns the header context which allows binding to <code>$count</code>.
	 *
	 * @returns {sap.ui.model.odata.v4.Context|null}
	 *   The header context or <code>null</code> if the binding is relative and has no context
	 *
	 * @public
	 * @see #getCount
	 * @since 1.45.0
	 */
	ODataListBinding.prototype.getHeaderContext = function () {
		// Since we never throw the header context away, we may deliver it only when valid
		return this.isResolved() ? this.oHeaderContext : null;
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
		if (!this.bFirstCreateAtEnd) {
			return iViewIndex;
		}
		if (!this.bLengthFinal) { // created at end, but the read is pending and $count unknown yet
			return this.aContexts.length - iViewIndex - 1;
		}
		return iViewIndex < this.getLength() - this.iCreatedContexts
			? iViewIndex + this.iCreatedContexts
			// Note: the created rows are mirrored at the end
			: this.getLength() - iViewIndex - 1;
	};

	/**
	 * Calls {@link sap.ui.model.odata.v4.Context#setKeepAlive} at the context for the given path
	 * and returns it. Since 1.100.0 the function always returns such a context. If none exists yet,
	 * it is created without data and a request for its entity is sent.
	 *
	 * @param {string} sPath
	 *   The path of the context to be kept alive
	 * @param {boolean} [bRequestMessages]
	 *   Whether to request messages for the context's entity
	 * @param {string} [sGroupId]
	 *   The group ID used for read requests for the context's entity or its properties. If not
	 *   given, the binding's {@link #getGroupId group ID} is used. Supported since 1.100.0
	 * @returns {sap.ui.model.odata.v4.Context}
	 *   The kept-alive context
	 * @throws {Error} If
	 *   <ul>
	 *     <li> the group ID is invalid,
	 *     <li> the binding is unresolved,
	 *     <li> the given context path does not match this binding,
	 *     <li> the binding's root binding is suspended,
	 *     <li> the binding is {@link #isTransient transient} (part of a
	 *       {@link sap.ui.model.odata.v4.ODataListBinding#create deep create}).
	 *     <li> {@link sap.ui.model.odata.v4.Context#setKeepAlive} fails
	 *   </ul>
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.Model#getKeepAliveContext
	 * @since 1.99.0
	 */
	ODataListBinding.prototype.getKeepAliveContext = function (sPath, bRequestMessages, sGroupId) {
		var oContext = this.mPreviousContextsByPath[sPath]
				|| this.aContexts.find(function (oCandidate) {
					return oCandidate && oCandidate.getPath() === sPath;
				}),
			iPredicateIndex = _Helper.getPredicateIndex(sPath),
			sResolvedPath = this.getResolvedPath();

		this.checkKeepAlive();
		this.checkSuspended();
		this.checkTransient();
		_Helper.checkGroupId(sGroupId);
		if (!oContext) {
			if (!sResolvedPath) {
				throw new Error("Binding is unresolved: " + this);
			}
			if (sPath.slice(0, iPredicateIndex) !== sResolvedPath) {
				throw new Error(this + ": Not a valid context path: " + sPath);
			}
			oContext = Context.create(this.oModel, this, sPath);
			this.mPreviousContextsByPath[sPath] = oContext;
			this.oCachePromise.then(function (oCache) {
				// call ASAP so that dependent property bindings find the entity in the cache
				var oElement = {};

				_Helper.setPrivateAnnotation(oElement, "predicate", sPath.slice(iPredicateIndex));
				oCache.addKeptElement(oElement);
				if (sGroupId) {
					_Helper.setPrivateAnnotation(oElement, "groupId", sGroupId);
				}
			});
			// *request*Object so that requestProperty definitely runs after setKeepAlive and adds
			// to mLateProperties
			this.oModel.getMetaModel().requestObject(_Helper.getMetaPath(sResolvedPath) + "/")
				.then(function (oType) {
					// ensure that the key properties are requested even if unbound
					return oContext.requestProperty(oType.$Key.map(function (vKey) {
						return typeof vKey === "object" ? Object.values(vKey)[0] : vKey;
					}));
				})
				.catch(this.oModel.getReporter());
		}

		oContext.setKeepAlive(true, oContext.fnOnBeforeDestroy, bRequestMessages);
		return oContext;
	};

	/**
	 * Returns a list of key predicates of all kept-alive contexts.
	 *
	 * @returns {string[]} The list of key predicates
	 *
	 * @private
	 */
	ODataListBinding.prototype.getKeepAlivePredicates = function () {
		var sBindingPath;

		if (!this.getHeaderContext()) {
			return [];
		}
		sBindingPath = this.getHeaderContext().getPath();

		return Object.values(this.mPreviousContextsByPath).concat(this.aContexts)
			.filter(function (oContext) {
				return oContext.isEffectivelyKeptAlive();
			}).map(function (oContext) {
				return _Helper.getRelativePath(oContext.getPath(), sBindingPath);
			});
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
	// @override sap.ui.model.ListBinding#getLength
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
		return aOrderbyOptions.join(",");
	};

	/**
	 * Returns the parent node of a given child node (in case of a recursive hierarchy, see
	 * {@link sap.ui.model.odata.v4.ODataListBinding#setAggregation}, where
	 * <code>oAggregation.expandTo</code> must be equal to one).
	 *
	 * @param {sap.ui.model.odata.v4.Context} oNode
	 *   Some node which could have a parent
	 * @returns {sap.ui.model.odata.v4.Context|null}
	 *   The parent node, or <code>null</code> if the given node is a root node and thus has no
	 *   parent
	* @throws {Error} If
	 *   <ul>
	 *     <li> the given node is not part of a recursive hierarchy,
	 *     <li> <code>oAggregation.expandTo</code> is greater than one.
	 *    </ul>
	 *
	 * @private
	 * @see #requestParent
	 */
	ODataListBinding.prototype.getParent = function (oNode) {
		const oAggregation = this.mParameters.$$aggregation;

		if (!oAggregation || !oAggregation.hierarchyQualifier) {
			throw new Error("Missing recursive hierarchy");
		}
		if (oAggregation.expandTo > 1) {
			throw new Error("Unsupported $$aggregation.expandTo: " + oAggregation.expandTo);
		}
		if (this.aContexts[oNode.iIndex] !== oNode) {
			throw new Error("Not currently part of a recursive hierarchy: " + oNode);
		}
		const iParentIndex = this.oCache.getParentIndex(oNode.iIndex);

		return iParentIndex < 0 ? null : this.aContexts[iParentIndex];
	};

	/**
	 * Returns the query options of the binding.
	 *
	 * @param {boolean} [bWithSystemQueryOptions]
	 *   Whether system query options should be returned as well. The parameter value
	 *   <code>true</code> is not supported.
	 * @returns {Object<any>} mQueryOptions
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
	ODataListBinding.prototype.hasPendingChangesForPath = function (_sPath) {
		if (this.oCache === undefined) {
			// as long as cache is not yet known there can be only changes caused by created
			// entities; sPath does not matter
			return this.iActiveContexts > 0;
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

		if (_Helper.isEmptyObject(this.mParameters)) {
			// mix-in inherited static query options
			mInheritedQueryOptions = this.getQueryOptionsForPath("", oContext);
			if (mQueryOptions.$orderby && mInheritedQueryOptions.$orderby) {
				mQueryOptions.$orderby += "," + mInheritedQueryOptions.$orderby;
			}
			if (mQueryOptions.$filter && mInheritedQueryOptions.$filter) {
				mQueryOptions.$filter = "(" + mQueryOptions.$filter + ") and ("
					+ mInheritedQueryOptions.$filter + ")";
			}
			mQueryOptions = _Helper.merge({}, mInheritedQueryOptions, mQueryOptions);
			_Helper.aggregateExpandSelect(mQueryOptions, mInheritedQueryOptions);
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
	 * @see #getRootBinding
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#initialize
	ODataListBinding.prototype.initialize = function () {
		if (this.isResolved()) {
			if (this.isRootBindingSuspended()) {
				this.sResumeChangeReason = this.sChangeReason === "AddVirtualContext"
					? ChangeReason.Change
					: ChangeReason.Refresh;
			} else if (this.sChangeReason === "AddVirtualContext") {
				this._fireChange({
					detailedReason : "AddVirtualContext",
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
	 * Inserts a new gap into <code>this.aContexts</code> just after the given index and with the
	 * given positive length.
	 *
	 * @param {number} iPreviousIndex - Last index just before the new gap
	 * @param {number} iLength - Positive length of the new gap
	 *
	 * @private
	 */
	ODataListBinding.prototype.insertGap = function (iPreviousIndex, iLength) {
		const aContexts = this.aContexts;
		for (let i = aContexts.length - 1; i > iPreviousIndex; i -= 1) {
			const oMovingContext = aContexts[i];
			if (oMovingContext) {
				oMovingContext.iIndex += iLength;
				aContexts[i + iLength] = oMovingContext;
				delete aContexts[i]; // Note: iLength > 0
			}
			// else: nothing to do because !(i in aContexts) and aContexts[i + iLength]
			// has been deleted before (loop works backwards)
		}
		this.iMaxLength += iLength;
	};

	/**
	 * Tells whether the first given node is an ancestor of (or the same as) the second given node
	 * (in case of a recursive hierarchy).
	 *
	 * @param {sap.ui.model.odata.v4.Context} oAncestor - Some node which may be an ancestor
	 * @param {sap.ui.model.odata.v4.Context} oDescendant - Some node which may be a descendant
	 * @returns {boolean} Whether the assumed ancestor relation holds
	 * @throws {Error} If either context does not represent a node in a recursive hierarchy
	 *   according to its current expansion state
	 *
	 * @private
	 */
	ODataListBinding.prototype.isAncestorOf = function (oAncestor, oDescendant) {
		if (!this.mParameters.$$aggregation || !this.mParameters.$$aggregation.hierarchyQualifier) {
			throw new Error("Missing recursive hierarchy");
		}
		[oAncestor, oDescendant].forEach((oNode) => {
			if (this.aContexts[oNode.iIndex] !== oNode) {
				throw new Error("Not currently part of a recursive hierarchy: " + oNode);
			}
		});

		return this.oCache.isAncestorOf(oAncestor.iIndex, oDescendant.iIndex);
	};

	/**
	 * Returns whether the overall position of created entries is at the end of the list; this is
	 * determined by the first call to {@link #create}.
	 *
	 * @returns {boolean|undefined}
	 *   Whether the overall position of created contexts is at the end, or <code>undefined</code>
	 *   if there are no created contexts
	 *
	 * @public
	 * @since 1.99.0
	 */
	ODataListBinding.prototype.isFirstCreateAtEnd = function () {
		return this.bFirstCreateAtEnd;
	};

	/**
	 * Check whether this binding is an active $$getKeepAliveContext binding for the given path.
	 *
	 * @param {string} sPath - An absolute binding path
	 * @returns {boolean} - Whether this binding matches
	 *
	 * @private
	 */
	ODataListBinding.prototype.isKeepAliveBindingFor = function (sPath) {
		// When suspended it matches if it already has contexts. Then its getKeepAliveContext fails.
		return this.mParameters.$$getKeepAliveContext && this.getResolvedPath() === sPath
			&& (!this.isRootBindingSuspended() || this.aContexts.length
				|| !_Helper.isEmptyObject(this.mPreviousContextsByPath));
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
	// @override sap.ui.model.ListBinding#isLengthFinal
	ODataListBinding.prototype.isLengthFinal = function () {
		// some controls use .bLengthFinal on list binding instead of calling isLengthFinal
		return this.bLengthFinal;
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataParentBinding#isUnchangedParameter
	 */
	ODataListBinding.prototype.isUnchangedParameter = function (sName, vOtherValue) {
		if (sName === "$$aggregation") {
			vOtherValue = _Helper.clone(vOtherValue); // avoid modification due to normalization
			_AggregationHelper.buildApply(vOtherValue);

			return _Helper.deepEqual(
				_Helper.cloneNo$(this.mParameters.$$aggregation),
				_Helper.cloneNo$(vOtherValue)
			);
		}

		return asODataParentBinding.prototype.isUnchangedParameter.apply(this, arguments);
	};

	/**
	 * Keeps only those contexts that were requested by a control last time, and all created
	 * persisted or kept-alive contexts. All others are removed and later destroyed.
	 *
	 * @returns {sap.ui.model.odata.v4.Context[]} The list of kept contexts
	 *
	 * @see #getCurrentContexts
	 */
	ODataListBinding.prototype.keepOnlyVisibleContexts = function () {
		var aCreatedContexts = this.aContexts.slice(0, this.iCreatedContexts),
			aContexts = aCreatedContexts.filter(function (oContext) {
				// cannot request side effects for transient contexts
				// Note: do not use #isTransient because #created() may not be resolved yet,
				// although already persisted (timing issue, see caller)
				return !oContext.getProperty("@$ui5.context.isTransient");
			}).concat(
				this.getCurrentContexts().filter(function (oContext) {
					// avoid duplicates for created contexts
					// Note: avoid #created or #isTransient because there may be created contexts
					// outside aContexts' area of "created contexts" (via "keep alive" or selection)
					return oContext && !aCreatedContexts.includes(oContext);
				})
			),
			that = this;

		/**
		 * Keeps and requests created contexts, destroys others.
		 *
		 * @param {sap.ui.model.odata.v4.Context} oContext0 - A context, maybe created
		 */
		function keepOrDestroy(oContext0) {
			if (oContext0.created()) { // e.g. Recursive Hierarchy maintenance
				aContexts.push(oContext0);
			} else {
				that.destroyLater(oContext0);
			}
		}

		// add kept-alive contexts outside collection
		Object.keys(this.mPreviousContextsByPath).forEach(function (sPath) {
			var oContext = that.mPreviousContextsByPath[sPath];

			if (oContext.isEffectivelyKeptAlive()) {
				aContexts.push(oContext);
			}
		});

		// remove and later destroy others
		this.aContexts.slice(this.iCreatedContexts, this.iCurrentBegin)
			.forEach(function (oContext0, i) {
				delete that.aContexts[that.iCreatedContexts + i];
				keepOrDestroy(oContext0);
			});
		if (this.aContexts.length > this.iCurrentEnd && this.iCurrentEnd >= this.iCreatedContexts) {
			this.aContexts.slice(this.iCurrentEnd).forEach(keepOrDestroy);
			this.aContexts.length = this.iCurrentEnd;
		}

		return aContexts;
	};

	/**
	 * Moves the given (child) node to the given parent. An expanded (child) node is silently
	 * collapsed before and expanded after the move. A collapsed parent is automatically expanded;
	 * so is a leaf. The (child) node is added as the parent's 1st child (created persisted).
	 *
	 * @param {sap.ui.model.odata.v4.Context} oChildContext - The (child) node to be moved
	 * @param {sap.ui.model.odata.v4.Context} oParentContext - The new parent's context
	 * @returns {sap.ui.base.SyncPromise<void>}
	 *   A promise which is resolved without a defined result when the move is finished, or
	 *   rejected in case of an error
	 *
	 * @private
	 */
	ODataListBinding.prototype.move = function (oChildContext, oParentContext) {
		/*
		 * Sets the <code>iIndex</code> of every context instance inside the given range.
		 *
		 * @param {number} iFrom - Start index
		 * @param {number} iToInclusive - Inclusive end index
		 */
		const setIndices = (iFrom, iToInclusive) => {
			for (let i = iFrom; i <= iToInclusive; i += 1) {
				if (this.aContexts[i]) {
					this.aContexts[i].iIndex = i;
				}
			}
		};

		const bExpanded = oChildContext.isExpanded();
		if (bExpanded) {
			this.collapse(oChildContext, /*bSilent*/true);
		}

		const sChildPath = oChildContext.getCanonicalPath().slice(1);
		const sParentPath = oParentContext.getCanonicalPath().slice(1); // before #lockGroup!
		const oGroupLock = this.lockGroup(this.getUpdateGroupId(), true, true);

		return this.oCache.move(oGroupLock, sChildPath, sParentPath).then((iCount) => {
			if (iCount > 1) {
				iCount -= 1; // skip oChildContext which is treated below
				this.insertGap(oParentContext.getModelIndex(), iCount);
			}

			const iChildIndex = this.aContexts.indexOf(oChildContext);
			const iParentIndex = this.aContexts.indexOf(oParentContext); // Note: !== iChildIndex
			if (iChildIndex < iParentIndex) {
				this.aContexts.splice(iParentIndex + 1, 0, oChildContext);
				this.aContexts.splice(iChildIndex, 1); // parent moves to lower index!
				setIndices(iChildIndex, iParentIndex);
			} else if (iChildIndex > iParentIndex + 1) {
				this.aContexts.splice(iChildIndex, 1); // parent unaffected!
				this.aContexts.splice(iParentIndex + 1, 0, oChildContext);
				setIndices(iParentIndex + 1, iChildIndex);
			} // else: iChildIndex === iParentIndex + 1 => nothing to do
			if (!oChildContext.created()) {
				oChildContext.setCreatedPersisted();
			}
			if (bExpanded) {
				this.expand(oChildContext).unwrap(); // guaranteed to be sync! incl. _fireChange
			} else {
				this._fireChange({reason : ChangeReason.Change});
			}
		}, (oError) => {
			if (bExpanded) {
				this.expand(oChildContext, /*bSilent*/true).unwrap(); // guaranteed to be sync!
			}
			throw oError;
		});
	};

	/**
	 * Notification from the cache that the collection has changed. Currently, only bindings with
	 * bSharedRequest register at the cache and are notified when the cache has been reset.
	 *
	 * @private
	 */
	ODataListBinding.prototype.onChange = function () {
		var aDependentBindings,
			that = this;

		if (!this.oRefreshPromise) {
			// some other binding with the same cache is refreshing
			if (this.isRootBindingSuspended()) {
				this.sResumeAction = "onChange";
			} else {
				// Note: after reset the dependent bindings cannot be found anymore
				aDependentBindings = this.getDependentBindings();
				this.reset(ChangeReason.Refresh);
				SyncPromise.all(
					aDependentBindings.map(function (oBinding) {
						return oBinding.refreshInternal("");
					})
				).then(function () {
					return that.oHeaderContext.checkUpdateInternal();
				}).catch(this.oModel.getReporter());
			}
		}
	};

	/**
	 * Notification from a context that its effective keep-alive status changed.
	 *
	 * @param {sap.ui.model.odata.v4.Context} oContext - The context
	 *
	 * @private
	 */
	ODataListBinding.prototype.onKeepAliveChanged = function (oContext) {
		if (!oContext.isDeleted() // data of a deleted context must remain for the exclusion filter
				&& oContext.getPath() in this.mPreviousContextsByPath
				&& !oContext.isEffectivelyKeptAlive()) {
			this.destroyPreviousContextsLater([oContext.getPath()]);
		}
	};

	/**
	 * Prepares the nested binding for a deep create if it is below a transient parent context. Adds
	 * a transient collection to the parent binding's cache. Creates contexts for nested entities in
	 * the initial data.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   The parent context or <code>undefined</code> for absolute bindings
	 * @param {object} mQueryOptions
	 *   The binding's cache query options
	 * @returns {boolean}
	 *   Whether the binding must not create a cache, because the context is virtual or transient or
	 *   below a transient context, or there are no query options for a cache
	 *
	 * @private
	 */
	// @override sap.ui.model.odata.v4.ODataBinding#prepareDeepCreate
	ODataListBinding.prototype.prepareDeepCreate = function (oContext, mQueryOptions) {
		var that = this;

		if (!oContext) {
			// absolute or unresolved => create cache if there are query options
			return !mQueryOptions;
		}
		if (oContext.iIndex === Context.VIRTUAL) {
			return true; // virtual parent => no cache
		}
		if (!oContext.getPath().includes("($uid=")) {
			// not below a transient context => create cache if there are query options
			// Note: quasi-absolute bindings stop here because a base context has no "$uid"
			return !mQueryOptions;
		}

		// If there are mQueryOptions we must create a cache after the successful create
		// (in #adjustPredicate)
		this.mCacheQueryOptions = mQueryOptions;

		if (!this.oModel.bAutoExpandSelect) {
			// No deep create possible, but it must not create its own cache. It remains empty and
			// silent until the parent binding created the entity. Then it creates a cache (in
			// #adjustPredicate) and requests from the backend.
			return true;
		}

		oContext.withCache(function (oCache, sPath) {
			var aInitialDataCollection
					= oCache.addTransientCollection(sPath, mQueryOptions && mQueryOptions.$select),
				sResolvedPath = that.getResolvedPath();

			that.aContexts = aInitialDataCollection.map(function (oInitialData, i) {
				var oContext,
					sTransientPredicate
						= _Helper.getPrivateAnnotation(oInitialData, "transientPredicate"),
					oPromise = _Helper.getPrivateAnnotation(oInitialData, "promise");

				oContext = Context.create(that.oModel, that, sResolvedPath + sTransientPredicate,
					i - aInitialDataCollection.length, oPromise, false, true);
				oContext.created().catch(that.oModel.getReporter());

				_Helper.setPrivateAnnotation(oInitialData, "context", oContext);
				_Helper.setPrivateAnnotation(oInitialData, "firstCreateAtEnd", false);
				_Helper.deletePrivateAnnotation(oInitialData, "promise");

				return oContext;
			});
			that.iCreatedContexts = that.iActiveContexts = that.aContexts.length;
			that.bFirstCreateAtEnd = false;
		}, this.sPath);

		return true;
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#refreshInternal
	 */
	ODataListBinding.prototype.refreshInternal = function (sResourcePathPrefix, sGroupId,
			_bCheckUpdate, bKeepCacheOnError) {
		var that = this;

		// calls refreshInternal on all given bindings and returns an array of promises
		function refreshAll(aBindings) {
			return aBindings.map(function (oBinding) {
				if (oBinding.bIsBeingDestroyed
						|| oBinding.getContext().isEffectivelyKeptAlive()
						&& oBinding.hasPendingChanges()) {
					return;
				}
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
			// Note: side-effects (incl. refresh) are forbidden while suspended
			if (this.bSharedRequest) {
				this.sResumeAction = "resetCache";
			} else {
				this.refreshSuspended(sGroupId);
				this.bRefreshKeptElements = true;
			}
			return SyncPromise.all(refreshAll(that.getDependentBindings()));
		}

		this.createReadGroupLock(sGroupId, this.isRoot());
		return this.oCachePromise.then(function (oCache) {
			var iActiveContexts = that.iActiveContexts,
				iCreatedContexts = that.iCreatedContexts,
				aContexts = that.aContexts.slice(0, iCreatedContexts),
				aDependentBindings,
				oKeptElementsPromise,
				oPromise = that.oRefreshPromise;

			if (oCache && !oPromise) { // do not refresh twice
				that.removeCachesAndMessages(sResourcePathPrefix);
				if (that.bSharedRequest) {
					oPromise = that.createRefreshPromise();
					oCache.reset([]);
				} else {
					that.fetchCache(that.oContext, false, /*bKeepQueryOptions*/true,
						bKeepCacheOnError ? sGroupId : undefined);
					oKeptElementsPromise = that.refreshKeptElements(sGroupId);
					if (that.iCurrentEnd > 0) {
						oPromise = that.createRefreshPromise(
							/*bPreventBubbling*/bKeepCacheOnError
						).catch(function (oError) {
							if (!bKeepCacheOnError || oError.canceled) {
								throw oError;
							}
							return that.fetchResourcePath(that.oContext
							).then(function (sResourcePath) {
								var i;

								if (!that.bRelative || oCache.getResourcePath() === sResourcePath) {
									if (that.oCache === oCache) {
										oCache.restore(true);
									} else { // still needed in case of _AggregationCache
										oCache.setActive(true);
										that.oCache = oCache;
										that.oCachePromise = SyncPromise.resolve(oCache);
									}
									that.iActiveContexts = iActiveContexts;
									that.iCreatedContexts = iCreatedContexts;
									for (i = 0; i < iCreatedContexts; i += 1) {
										aContexts[i].iIndex = i - iCreatedContexts;
										delete that.mPreviousContextsByPath[aContexts[i].getPath()];
									}
									that.aContexts = aContexts; // restore created contexts
									that._fireChange({reason : ChangeReason.Change});
								}
								throw oError;
							});
						}).finally(function () {
							if (oCache.restore) {
								oCache.restore(false);
							}
						});
					}
				}
			}
			// Note: after reset the dependent bindings cannot be found anymore
			aDependentBindings = that.getDependentBindings();
			that.reset(ChangeReason.Refresh, !oCache || (bKeepCacheOnError ? false : undefined),
				sGroupId); // this may reset that.oRefreshPromise
			return SyncPromise.all(
				refreshAll(aDependentBindings).concat(oPromise, oKeptElementsPromise)
			).then(function () {
				// Update after refresh event, otherwise $count is fetched before the request.
				// Avoid update in case bKeepCacheOnError needs to roll back.
				return that.oHeaderContext.checkUpdateInternal(); // this is NOT done by refreshAll!
			});
		});
	};

	/**
	 * Refreshes the kept-alive elements. This needs to be called before the cache has filled the
	 * collection.
	 *
	 * @param {string} sGroupId
	 *   The effective group ID
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved without a defined result, or rejected with an error if the
	 *   refresh fails.
	 *
	 * @private
	 */
	ODataListBinding.prototype.refreshKeptElements = function (sGroupId) {
		var that = this;

		return this.oCachePromise.then(function (oCache) {
			return oCache.refreshKeptElements(that.lockGroup(sGroupId),
				function onRemove(sPredicate, iIndex) {
					var oContext = iIndex >= 0
						? that.aContexts[iIndex]
						: that.mPreviousContextsByPath[that.getResolvedPath() + sPredicate];

					oContext.resetKeepAlive();
					if (iIndex >= 0) { // Note: implies oContext.created()
						that.removeCreated(oContext);
					}
				});
		}).catch(function (oError) {
			that.oModel.reportError("Failed to refresh kept-alive elements", sClassName, oError);
			throw oError;
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
	 * @param {boolean} [bAllowRemoval]
	 *   Allows the list binding to remove the given context from its collection because the
	 *   entity does not match the binding's filter anymore,
	 *   see {@link sap.ui.model.odata.v4.ODataListBinding#filter}; a removed context is
	 *   destroyed, see {@link sap.ui.model.Context#destroy}.
	 *   Supported since 1.55.0
	 *
	 *   A removed context is destroyed unless it is
	 *   {@link sap.ui.model.odata.v4.Context#isKeepAlive kept alive} and still exists on the
	 *   server.
	 * @param {boolean} [bKeepCacheOnError]
	 *   If <code>true</code>, the binding data remains unchanged if the refresh fails
	 * @param {boolean} [bWithMessages]
	 *   Whether the "@com.sap.vocabularies.Common.v1.Messages" path is treated specially
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which resolves without a defined value when the entity is updated in the cache,
	 *   or rejects if the refresh failed.
	 * @throws {Error}
	 *   If the given context does not represent a single entity (see {@link #getHeaderContext}), or
	 *   if <code>bAllowRemoval && bWithMessages</code> are combined
	 *
	 * @private
	 */
	ODataListBinding.prototype.refreshSingle = function (oContext, oGroupLock, bAllowRemoval,
			bKeepCacheOnError, bWithMessages) {
		var sContextPath = oContext.getPath(),
			sResourcePathPrefix = sContextPath.slice(1),
			that = this;

		if (oContext === this.oHeaderContext) {
			throw new Error("Unsupported header context: " + oContext);
		}
		if (bAllowRemoval && bWithMessages) {
			throw new Error("Unsupported: bAllowRemoval && bWithMessages");
		}

		return this.withCache(function (oCache, sPath, oBinding) {
			var bDataRequested = false,
				bDestroyed = false,
				iModelIndex = oContext.getModelIndex(),
				sPredicate = _Helper.getRelativePath(sContextPath, that.oHeaderContext.getPath()),
				aPromises = [];

			function fireDataReceived(oData) {
				if (bDataRequested) {
					that.fireDataReceived(oData);
				}
			}

			function fireDataRequested() {
				bDataRequested = true;
				that.fireDataRequested();
			}

			/*
			 * Removes this context from the list bindings collection as it no longer matches the
			 * filter criteria, see
			 * {@link sap.ui.model.odata.v4.lib._Cache#refreshSingleWithRemove}.
			 *
			 * @param {boolean} bStillAlive
			 *   If <code>false</code>, the context does not match the filter criteria and, if the
			 *   context is kept-alive, the entity it points to no longer exists. If
			 *   <code>true</code>, the context is kept-alive and the entity it points to still
			 *   exists. In this case the context must not be destroyed.
			 */
			function onRemove(bStillAlive) {
				var iIndex = oContext.getModelIndex(),
					i;

				if (oContext.iIndex < 0) {
					if (bStillAlive) {
						that.mPreviousContextsByPath[sContextPath] = oContext;
					} else {
						oContext.resetKeepAlive();
						bDestroyed = true;
					}
					that.removeCreated(oContext);
				} else {
					if (iIndex === undefined) { // -> bStillAlive === false
						delete that.mPreviousContextsByPath[sContextPath];
					} else {
						that.aContexts.splice(iIndex, 1);
						that.iMaxLength -= 1; // this doesn't change Infinity
						for (i = iIndex; i < that.aContexts.length; i += 1) {
							if (that.aContexts[i]) {
								that.aContexts[i].iIndex -= 1;
							}
						}
						if (bStillAlive) {
							that.mPreviousContextsByPath[sContextPath] = oContext;
						}
					}

					if (!bStillAlive) {
						bDestroyed = true;
						oContext.destroy();
					}
				}
				if (iIndex !== undefined) {
					that._fireChange({reason : ChangeReason.Remove});
				}
			}

			if (iModelIndex < 0) {
				throw new Error("Cannot refresh. Hint: Side-effects refresh in parallel? "
					+ oContext);
			}
			aPromises.push(
				(bAllowRemoval
					? oCache.refreshSingleWithRemove(oGroupLock, sPath, iModelIndex, sPredicate,
						oContext.isEffectivelyKeptAlive(), fireDataRequested, onRemove)
					: oCache.refreshSingle(oGroupLock, sPath, iModelIndex, sPredicate,
						oContext.isKeepAlive(), bWithMessages, fireDataRequested))
				.then(function () {
					var aUpdatePromises = [];

					fireDataReceived({data : {}});
					oBinding.assertSameCache(oCache);
					if (!bDestroyed) { // do not update destroyed context
						aUpdatePromises.push(oContext.checkUpdateInternal());
						if (bAllowRemoval) {
							aUpdatePromises.push(
								oContext.refreshDependentBindings(sResourcePathPrefix,
									oGroupLock.getGroupId(), false, bKeepCacheOnError));
						}
					}

					return SyncPromise.all(aUpdatePromises);
				}, function (oError) {
					fireDataReceived({error : oError});
					throw oError;
				}).catch(function (oError) {
					oGroupLock.unlock(true);
					that.oModel.reportError("Failed to refresh entity: " + oContext, sClassName,
						oError);
					if (!oError.canceled) {
						throw oError;
					}
				})
			);

			if (!bAllowRemoval) {
				// call refreshInternal on all dependent bindings to ensure that all resulting data
				// requests are in the same batch request
				aPromises.push(oContext.refreshDependentBindings(sResourcePathPrefix,
					oGroupLock.getGroupId(), false, bKeepCacheOnError));
			}

			return SyncPromise.all(aPromises);
		});
	};

	/**
	 * Removes the given context for a created entity from the list of contexts and - unless it is
	 * kept alive - destroys it later so that the control has time to handle the context's dependent
	 * bindings before.
	 *
	 * @param {sap.ui.model.odata.v4.Context} oContext
	 *   The context instance for the created entity to be destroyed
	 *
	 * @private
	 */
	ODataListBinding.prototype.removeCreated = function (oContext) {
		var iIndex, i;

		if (this.mParameters.$$aggregation) {
			this.iMaxLength -= 1;
			iIndex = this.aContexts.indexOf(oContext);
			for (i = this.aContexts.length - 1; i > iIndex; i -= 1) {
				if (this.aContexts[i]) {
					this.aContexts[i].iIndex -= 1;
				}
			}
		} else {
			iIndex = oContext.getModelIndex(); // Note: MUST not be undefined, or we fail utterly!
			this.iCreatedContexts -= 1; // Note: affects #getModelIndex!
			if (!this.iCreatedContexts) {
				this.bFirstCreateAtEnd = undefined;
			}
			if (!oContext.isInactive()) {
				this.iActiveContexts -= 1;
			}
			for (i = 0; i < iIndex; i += 1) {
				this.aContexts[i].iIndex += 1;
			}
		}
		this.aContexts.splice(iIndex, 1);
		if (!oContext.isEffectivelyKeptAlive()) {
			this.destroyLater(oContext);
		}
		// The path of all contexts in aContexts after the removed one is untouched, still points to
		// the same data, hence no checkUpdate is needed.
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
	 *   used, see {@link #getGroupId}.
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

		if (!this.isResolved()) {
			throw new Error("Unresolved binding: " + this.sPath);
		}
		this.checkSuspended();
		_Helper.checkGroupId(sGroupId);

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
					+ that.getResolvedPath().slice(1)
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
	 * Requests an {@link sap.ui.model.Filter} object which can be used to filter the list binding
	 * by entries with model messages. With the filter callback, you can define if a message is
	 * considered when creating the filter for entries with messages.
	 *
	 * The resulting filter does not consider application or control filters specified for this list
	 * binding in its constructor or in its {@link #filter} method; add filters which you want to
	 * keep with the "and" conjunction to the resulting filter before calling {@link #filter}.
	 *
	 * @param {function(sap.ui.core.message.Message):boolean} [fnFilter]
	 *   A callback function to filter only relevant messages. The callback returns whether the
	 *   given {@link sap.ui.core.message.Message} is considered. If no callback function is given,
	 *   all messages are considered.
	 * @returns {Promise<sap.ui.model.Filter|null>}
	 *   A Promise that resolves with an {@link sap.ui.model.Filter} representing the entries with
	 *   messages; it resolves with <code>null</code> if the binding is not resolved or if there is
	 *   no message for any entry
	 * @throws {Error}
	 *   If the binding is {@link #isTransient transient} (part of a
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#create deep create}).
	 *
	 * @protected
	 * @see sap.ui.model.ListBinding#requestFilterForMessages
	 * @since 1.86.0
	 */
	// @override sap.ui.model.ListBinding#requestFilterForMessages
	ODataListBinding.prototype.requestFilterForMessages = function (fnFilter) {
		var oMetaModel = this.oModel.getMetaModel(),
			sMetaPath,
			sResolvedPath = this.oHeaderContext && this.oHeaderContext.getPath(),
			that = this;

		this.checkTransient();
		if (!sResolvedPath) {
			return Promise.resolve(null);
		}

		sMetaPath = _Helper.getMetaPath(sResolvedPath);
		return oMetaModel.requestObject(sMetaPath + "/").then(function (oEntityType) {
			var aFilters,
				mPredicates = {};

			that.oModel.getMessagesByPath(sResolvedPath, true).filter(function (oMessage) {
				return !fnFilter || fnFilter(oMessage);
			}).forEach(function (oMessage) {
				oMessage.getTargets().forEach(function (sTarget) {
					var sPredicate = sTarget.slice(sResolvedPath.length).split("/")[0];

					if (sPredicate && !sPredicate.startsWith("($uid=")) {
						mPredicates[sPredicate] = true;
					}
				});
			});

			aFilters = Object.keys(mPredicates).map(function (sPredicate) {
				return ODataListBinding.getFilterForPredicate(sPredicate, oEntityType,
					oMetaModel, sMetaPath);
			});

			if (aFilters.length === 0) {
				return null;
			}

			return aFilters.length === 1 ? aFilters[0] : new Filter({filters : aFilters});
		});
	};

	/**
	 * Requests the parent node of a given child node (in case of a recursive hierarchy, see
	 * {@link sap.ui.model.odata.v4.ODataListBinding#setAggregation}, where
	 * <code>oAggregation.expandTo</code> must be equal to one).
	 *
	 * @param {sap.ui.model.odata.v4.Context} oNode
	 *   Some node which could have a parent
	 * @returns {Promise<sap.ui.model.odata.v4.Context|null>} A promise which:
	 *   <ul>
	 *     <li> Resolves if successful with either the parent node or <code>null</code> for a root
	 *       node that has no parent</li>
	 *     <li> Rejects with an <code>Error</code> instance otherwise</li>
	 *   </ul>
	 * @throws {Error} If
	 *   <ul>
	 *     <li> the given node is not part of a recursive hierarchy,
	 *     <li> <code>oAggregation.expandTo</code> is greater than one.
	 *    </ul>
	 *
	 * @private
	 * @see #getParent
	 */
	ODataListBinding.prototype.requestParent = function (oNode) {
		const oAggregation = this.mParameters.$$aggregation;

		if (!oAggregation || !oAggregation.hierarchyQualifier) {
			throw new Error("Missing recursive hierarchy");
		}
		if (oAggregation.expandTo > 1) {
			throw new Error("Unsupported $$aggregation.expandTo: " + oAggregation.expandTo);
		}
		if (this.aContexts[oNode.iIndex] !== oNode) {
			throw new Error("Not currently part of a recursive hierarchy: " + oNode);
		}

		const iParentIndex = this.oCache.getParentIndex(oNode.iIndex);
		if (iParentIndex < 0) {
			return Promise.resolve(null);
		}
		return this.requestContexts(iParentIndex, 1).then(function (aResult) {
			return aResult[0];
		});
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataParentBinding#requestSideEffects
	 */
	ODataListBinding.prototype.requestSideEffects = function (sGroupId, aPaths, oContext) {
		var oModel = this.oModel,
			aPredicates,
			aPromises,
			bSingle = oContext && oContext !== this.oHeaderContext,
			that = this;

		/*
		 * Adds an error handler to the given promise which reports errors to the model and ignores
		 * cancellations.
		 *
		 * @param {Promise} oPromise - A promise
		 * @returns {Promise} A promise including an error handler
		 */
		function reportError(oPromise) {
			return oPromise.catch(function (oError) {
				oModel.reportError("Failed to request side effects", sClassName, oError);
				if (!oError.canceled) {
					throw oError;
				}
			});
		}

		if (_Helper.isDataAggregation(this.mParameters)) {
			if (bSingle) {
				throw new Error("Must not request side effects when using data aggregation");
			}

			if (_AggregationHelper.isAffected(this.mParameters.$$aggregation,
					this.aFilters.concat(this.aApplicationFilters), aPaths)) {
				return this.refreshInternal("", sGroupId, false, true);
			}

			return SyncPromise.resolve();
		}

		if (!bSingle && this.oCache && this.oCache.isDeletingInOtherGroup(sGroupId)) {
			throw new Error("Must not request side effects when there is a pending delete in a"
				+ " different batch group");
		}

		if (this.oCache && this.oCache.getPendingRequestsPromise()) {
			return SyncPromise.resolve(this.oCache.getPendingRequestsPromise()).then(function () {
				// Note: This is quite early! Transient predicate not yet replaced inside path,
				// #isTransient not yet updated etc. Be careful below!
				return that.requestSideEffects(sGroupId, aPaths, oContext);
			});
		}

		if (aPaths.indexOf("") < 0) {
			aPredicates
				= _Helper.getPredicates(bSingle ? [oContext] : this.keepOnlyVisibleContexts());
			if (aPredicates) {
				aPromises = this.oCache
					? [this.oCache.requestSideEffects(this.lockGroup(sGroupId), aPaths, aPredicates,
						bSingle, /*bWithMessages*/bSingle)]
					: []; // can happen if invoked via absolute side effect
				this.visitSideEffects(sGroupId, aPaths, bSingle ? oContext : undefined, aPromises);

				return SyncPromise.all(aPromises.map(reportError)).then(function () {
					return that.refreshDependentListBindingsWithoutCache();
				});
			}
		}
		if (bSingle) {
			return this.refreshSingle(oContext, this.lockGroup(sGroupId), /*bAllowRemoval*/false,
				/*bKeepCacheOnError*/true, /*bWithMessages*/true);
		}
		if (this.iCurrentEnd === 0) {
			return SyncPromise.resolve();
		}
		return this.refreshInternal("", sGroupId, false, true);
	};

	/**
	 * Resets the binding's contexts array and its members related to current contexts and length
	 * calculation.
	 *
	 * @param {sap.ui.model.ChangeReason} [sChangeReason]
	 *   A change reason; if given, a refresh event with this reason is fired and the next
	 *   getContexts() fires a change event with this reason. Change reason "change" is ignored
	 *   as long as the binding is still empty.
	 * @param {boolean} [bDrop]
	 *   By default, all created persisted contexts are dropped while transient ones are not.
	 *   (Deleted contexts are not affected here.) <code>true</code> also drops transient ones, and
	 *   <code>false</code> keeps inline creation rows only and transient ones where the POST is not
	 *   within the same $batch as the GET for the side-effects refresh.
	 * @param {string} [sGroupId]
	 *   The group ID to be used for refresh; used only in case <code>bDrop === false</code>
	 *
	 * @private
	 */
	ODataListBinding.prototype.reset = function (sChangeReason, bDrop, sGroupId) {
		var oContext,
			iCreated = 0, // index (and finally number) of created elements that we keep
			bEmpty = this.iCurrentEnd === 0,
			bKeepTransient = sGroupId && sGroupId !== this.getUpdateGroupId(),
			i,
			that = this;

		if (bDrop === true) { // drop 'em all
			this.iActiveContexts = 0;
			this.iCreatedContexts = 0;
		}
		if (this.aContexts) { // allow initial call from c'tor via #applyParameters
			this.aContexts.slice(this.iCreatedContexts).forEach(function (oContext) {
				that.mPreviousContextsByPath[oContext.getPath()] = oContext;
			});
			for (i = 0; i < this.iCreatedContexts; i += 1) {
				oContext = this.aContexts[i];
				if (bDrop === false
						? bKeepTransient && oContext.isTransient()
							|| oContext.isInactive() !== undefined
						: oContext.isTransient()) {
					this.aContexts[iCreated] = oContext;
					iCreated += 1;
				} else { // Note: inactive elements are always kept
					this.iActiveContexts -= 1;
					this.mPreviousContextsByPath[oContext.getPath()] = oContext;
				}
			}
			for (i = 0; i < iCreated; i += 1) {
				this.aContexts[i].iIndex = i - iCreated;
			}
			// Note: no strict need to keep the reference here
			this.aContexts.length = this.iCreatedContexts = iCreated;
		} else {
			this.aContexts = [];
		}
		if (!this.iCreatedContexts) {
			// true if contexts have been created at the end, false if contexts have been created at
			// the start, undefined if there are no created contexts
			this.bFirstCreateAtEnd = undefined;
		}
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
	};

	/**
	 * Resets the keep-alive flag on all contexts of this binding.
	 *
	 * @private
	 */
	ODataListBinding.prototype.resetKeepAlive = function () {
		var mPreviousContextsByPath = this.mPreviousContextsByPath;

		Object.keys(mPreviousContextsByPath).forEach(function (sPath) {
			mPreviousContextsByPath[sPath].resetKeepAlive();
		});
		this.aContexts.forEach(function (oContext) {
			oContext.resetKeepAlive();
		});
	};

	/**
	 * Restores all created elements, the bFirstCreateAtEnd flag and the iCreatedContexts,
	 * iActiveContexts counters from cache to this list binding.
	 *
	 * @private
	 */
	ODataListBinding.prototype.restoreCreated = function () {
		var that = this;

		this.withCache(function (oCache, sPath) {
			if (that.aContexts.length) {
				return; // already added in #prepareDeepCreate
			}
			oCache.getCreatedElements(sPath).forEach(function (oElement, i) {
				that.aContexts[i] = _Helper.getPrivateAnnotation(oElement, "context");
				that.bFirstCreateAtEnd
					= _Helper.getPrivateAnnotation(oElement, "firstCreateAtEnd");
				that.iCreatedContexts += 1;
				if (!oElement["@$ui5.context.isInactive"]) {
					that.iActiveContexts += 1;
				}
			});
		}).catch(this.oModel.getReporter());
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataParentBinding#resumeInternal
	 */
	ODataListBinding.prototype.resumeInternal = function (_bCheckUpdate, bParentHasChanges) {
		var sResumeAction = this.sResumeAction,
			sResumeChangeReason = this.sResumeChangeReason,
			bRefresh = bParentHasChanges || sResumeAction || sResumeChangeReason,
			that = this;

		this.sResumeAction = undefined;
		this.sResumeChangeReason = undefined;

		if (bRefresh) {
			this.removeCachesAndMessages("");
			if (sResumeAction === "onChange") {
				this.onChange();
				return;
			}
			if (sResumeAction === "resetCache") {
				this.oCache.reset([]);
				return;
			}
			this.reset();
			// if the parent binding resumes but there are no changes in the parent binding
			// ignore the parent cache and create an own cache
			this.fetchCache(this.oContext, !bParentHasChanges);

			if (this.bRefreshKeptElements) {
				this.bRefreshKeptElements = false;
				that.refreshKeptElements(that.getGroupId());
			}
		}
		this.getDependentBindings().forEach(function (oDependentBinding) {
			// do not call checkUpdate in dependent property bindings if the cache of this
			// binding is reset and the binding has not yet fired a change event
			oDependentBinding.resumeInternal(!bRefresh,
				!!sResumeChangeReason && !oDependentBinding.oContext.isEffectivelyKeptAlive());
		});
		if (this.sChangeReason === "AddVirtualContext") {
			// In a refresh event the table would ignore the result -> no virtual context -> no
			// auto-$expand/$select. The refresh event is sent later after the change event with
			// reason "RemoveVirtualContext".
			this._fireChange({
				detailedReason : "AddVirtualContext",
				reason : sResumeChangeReason
			});
		} else if (sResumeChangeReason) {
			this._fireRefresh({reason : sResumeChangeReason});
		} else {
			this.removeReadGroupLock();
		}
		// Update after the refresh event, otherwise $count is fetched before the request
		this.oHeaderContext.checkUpdate();
	};

	/**
	 * Sets a new data aggregation object and derives the system query option <code>$apply</code>
	 * implicitly from it.
	 *
	 * @param {object} [oAggregation]
	 *   An object holding the information needed for data aggregation; see also
	 *   <a href="https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData
	 *   Extension for Data Aggregation Version 4.0</a>. Since 1.76.0, <code>undefined</code> can be
	 *   used to remove the data aggregation object, which allows to set <code>$apply</code>
	 *   explicitly afterwards. <code>null</code> is not supported.
	 *   <br>
	 *   Since 1.89.0, the deprecated property <code>"grandTotal like 1.84" : true</code> can be
	 *   used to turn on the handling of grand totals like in 1.84.0, using aggregates of aggregates
	 *   and thus allowing to filter by aggregated properties while grand totals are needed. Beware
	 *   that methods like "average" or "countdistinct" are not compatible with this approach, and
	 *   it cannot be combined with group levels.
	 *   <br>
	 *   Since 1.105.0, either a recursive hierarchy or pure data aggregation is supported, but no
	 *   mix; <code>hierarchyQualifier</code> is the leading property that decides between those two
	 *   use cases - this is an <b>experimental API</b> and is only supported if the model uses the
	 *   <code>autoExpandSelect</code> parameter! Since 1.117.0, it is available for read-only
	 *   hierarchies.
	 * @param {object} [oAggregation.aggregate]
	 *   A map from aggregatable property names or aliases to objects containing the following
	 *   details:
	 *   <ul>
	 *     <li> <code>grandTotal</code>: An optional boolean that tells whether a grand total for
	 *       this aggregatable property is needed (since 1.59.0); not supported in this case are:
	 *       <ul>
	 *         <li> filtering by any aggregatable property (since 1.89.0),
	 *         <li> "$search" (since 1.93.0),
	 *         <li> the <code>vGroup</code> parameter of {@link sap.ui.model.Sorter}
	 *           (since 1.107.0),
	 *         <li> shared requests (since 1.108.0).
	 *       </ul>
	 *     <li> <code>subtotals</code>: An optional boolean that tells whether subtotals for this
	 *       aggregatable property are needed
	 *     <li> <code>with</code>: An optional string that provides the name of the method (for
	 *       example "sum") used for aggregation of this aggregatable property; see
	 *       "3.1.2 Keyword with".
	 *     <li> <code>name</code>: An optional string that provides the original aggregatable
	 *       property name in case a different alias is chosen as the name of the dynamic property
	 *       used for aggregation of this aggregatable property; see "3.1.1 Keyword as"
	 *      <li> <code>unit</code>: An optional string that provides the name of the custom
	 *       aggregate for a currency or unit of measure corresponding to this aggregatable property
	 *       (since 1.86.0). The custom aggregate must return the single value of that unit in case
	 *       there is only one, or <code>null</code> otherwise ("multi-unit situation"). (SQL
	 *       suggestion: <code>CASE WHEN MIN(Unit) = MAX(Unit) THEN MIN(Unit) END</code>)
	 *   </ul>
	 * @param {number} [oAggregation.expandTo=1]
	 *   The number (as a positive integer) of different levels initially available without calling
	 *   {@link sap.ui.model.odata.v4.Context#expand} (@experimental as of version 1.105.0;
	 *   available for read-only hierarchies since 1.117.0), supported only if a
	 *   <code>hierarchyQualifier</code> is given. Root nodes are on the first level. By default,
	 *   only root nodes are available; they are not yet expanded. Since 1.120.0,
	 *   <code>Number.MAX_SAFE_INTEGER</code> can be used to expand all levels.
	 * @param {boolean} [oAggregation.grandTotalAtBottomOnly]
	 *   Tells whether the grand totals for aggregatable properties are displayed at the bottom only
	 *   (since 1.86.0); <code>true</code> for bottom only, <code>false</code> for top and bottom,
	 *   the default is top only
	 * @param {object} [oAggregation.group]
	 *   A map from groupable property names to objects containing the following details:
	 *   <ul>
	 *     <li> <code>additionally</code>: An optional list of strings that provides the paths to
	 *       properties (like texts or attributes) related to this groupable property in a 1:1
	 *       relation (since 1.87.0). They are requested additionally via <code>groupby<code> and
	 *       must not change the actual grouping; a <code>unit</code> for an aggregatable property
	 *       must not be repeated here.
	 *   </ul>
	 * @param {string[]} [oAggregation.groupLevels]
	 *   A list of groupable property names used to determine group levels. They may, but don't need
	 *   to, be repeated in <code>oAggregation.group</code>. Group levels cannot be combined with:
	 *   <ul>
	 *     <li> filtering for aggregated properties,
	 *     <li> "$search" (since 1.93.0),
	 *     <li> the <code>vGroup</code> parameter of {@link sap.ui.model.Sorter} (since 1.107.0),
	 *     <li> shared requests (since 1.108.0).
	 *   </ul>
	 * @param {string} [oAggregation.hierarchyQualifier]
	 *   The qualifier for the pair of "Org.OData.Aggregation.V1.RecursiveHierarchy" and
	 *   "com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchy" annotations at this binding's
	 *   entity type (@experimental as of version 1.105.0; available for read-only hierarchies since
	 *   1.117.0). If present, a recursive hierarchy without data aggregation is defined, and the
	 *   only other supported properties are <code>expandTo</code> and <code>search</code>. A
	 *   recursive hierarchy cannot be combined with:
	 *   <ul>
	 *     <li> "$search",
	 *     <li> the <code>vGroup</code> parameter of {@link sap.ui.model.Sorter} (since 1.107.0),
	 *     <li> shared requests (since 1.108.0).
	 *   </ul>
	 * @param {string} [oAggregation.search]
	 *   Like the <a href=
	 *   "https://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part2-url-conventions.html#_Search_System_Query"
	 *   >"5.1.7 System Query Option $search"</a>, but applied before data aggregation
	 *   (since 1.93.0). Note that certain content will break the syntax of the system query option
	 *   <code>$apply</code> and result in an invalid request. If the OData service supports the
	 *   proposal <a href="https://issues.oasis-open.org/browse/ODATA-1452">ODATA-1452</a>, then
	 *   <code>ODataUtils.formatLiteral(sSearch, "Edm.String");</code> should be used to encapsulate
	 *   the whole search string beforehand (see {@link
	 *   sap.ui.model.odata.v4.ODataUtils.formatLiteral}).
	 * @param {boolean} [oAggregation.subtotalsAtBottomOnly]
	 *   Tells whether subtotals for aggregatable properties are displayed at the bottom only, as a
	 *   separate row after all children, when a group level node is expanded (since 1.86.0);
	 *   <code>true</code> for bottom only, <code>false</code> for top and bottom, the default is
	 *   top only (that is, as part of the group level node)
	 * @throws {Error} If
	 *   <ul>
	 *     <li> the given data aggregation object is unsupported,
	 *     <li> the <code>$apply</code> system query option has been specified explicitly before,
	 *     <li> the binding has a {@link sap.ui.model.odata.v4.Context#isKeepAlive kept-alive}
	 *       context when switching the use case of data aggregation (recursive hierarchy, pure data
	 *       aggregation, or none at all),
	 *     <li> there are pending changes,
	 *     <li> a recursive hierarchy is requested, but the model does not use the
	 *       <code>autoExpandSelect</code> parameter,
	 *     <li> the binding is {@link #isTransient transient} (part of a
	 *       {@link sap.ui.model.odata.v4.ODataListBinding#create deep create}),
	 *   </ul>
	 *
	 * @example <caption>First group level is product category including subtotals for the net
	 *     amount in display currency. On leaf level, transaction currency is used as an additional
	 *     dimension and the net amount is averaged.</caption>
	 *   oListBinding.setAggregation({
	 *     aggregate : {
	 *       AverageNetAmountInTransactionCurrency : {
	 *         name : "NetAmountInTransactionCurrency", // original name
	 *         "with" : "average", // aggregation method
	 *         unit : "TransactionCurrency"
	 *       },
	 *       NetAmountInDisplayCurrency : {subtotals : true, unit : "DisplayCurrency"},
	 *       SalesNumber : {grandTotal : true}
	 *     },
	 *     group : {
	 *       ProductCategory : {}, // optional
	 *       TransactionCurrency : {}
	 *     },
	 *     groupLevels : ['ProductCategory']
	 *   });
	 * @public
	 * @see #getAggregation
	 * @since 1.55.0
	 */
	ODataListBinding.prototype.setAggregation = function (oAggregation) {
		var mParameters;

		/*
		 * Returns the use case of data aggregation (recursive hierarchy, pure data aggregation, or
		 * none at all) as <code>true</code>, <code>false</code>, or <code>undefined</code>.
		 *
		 * @param {object} [oAggregation]
		 *   An object holding the information needed for data aggregation
		 * @returns {boolean|undefined}
		 *   The use case of data aggregation
		 */
		function useCase(oDataAggregationObject) {
			return oDataAggregationObject && !!oDataAggregationObject.hierarchyQualifier;
		}

		this.checkTransient();
		if (this.hasPendingChanges()) {
			throw new Error("Cannot set $$aggregation due to pending changes");
		}
		if (useCase(this.mParameters.$$aggregation) !== useCase(oAggregation)
				&& this.getKeepAlivePredicates().length) {
			throw new Error("Cannot set $$aggregation due to a kept-alive context");
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
	 * Sets the context and resets the cached contexts of the list items. This destroys all kept
	 * contexts.
	 *
	 * @param {sap.ui.model.Context} oContext
	 *   The context object
	 * @throws {Error}
	 *   If the binding's root binding is suspended
	 *
	 * @private
	 */
	// @override sap.ui.model.Binding#setContext
	ODataListBinding.prototype.setContext = function (oContext) {
		var sResolvedPath;

		if (this.oContext !== oContext) {
			if (this.bRelative) {
				this.checkSuspended(true);
				// Keep the header context even if we lose the parent context, so that the header
				// context remains unchanged if the parent context is temporarily dropped during a
				// refresh.
				this.reset(/*sChangeReason*/undefined, /*bDrop*/true);
				this.resetKeepAlive(); // before fetchCache to avoid that it copies data
				this.fetchCache(oContext);
				if (oContext) {
					this.restoreCreated();
					sResolvedPath = this.oModel.resolve(this.sPath, oContext);
					// Note: oHeaderContext is missing only if called from c'tor
					if (this.oHeaderContext && this.oHeaderContext.getPath() !== sResolvedPath) {
						// Do not destroy the context immediately to avoid timing issues with
						// dependent bindings, keep it in mPreviousContextsByPath to destroy it
						// later
						this.oHeaderContext.setSelected(false);
						this.mPreviousContextsByPath[this.oHeaderContext.getPath()]
							= this.oHeaderContext;
						this.oHeaderContext = null;
					}
					if (!this.oHeaderContext) {
						this.oHeaderContext = Context.create(this.oModel, this, sResolvedPath);
					}
					if (this.mParameters.$$aggregation) {
						_AggregationHelper.setPath(this.mParameters.$$aggregation, sResolvedPath);
					} else if (this.bHasPathReductionToParent && this.oModel.bAutoExpandSelect) {
						this.mCanUseCachePromiseByChildPath = {};
						this.sChangeReason = "AddVirtualContext"; // JIRA: CPOUI5ODATAV4-848
					}
					if (oContext.getBinding && oContext.getBinding().isRootBindingSuspended()) {
						// when becoming suspended, remain silent until resume
						this.oContext = oContext;
						this.setResumeChangeReason(ChangeReason.Context);

						return;
					}
				}
				// call Binding#setContext because of data state etc.; fires "change"
				Binding.prototype.setContext.call(this, oContext,
					{detailedReason : this.sChangeReason});
			} else {
				// remember context even if no "change" fired
				this.oContext = oContext;
			}
		}
	};

	/**
	 * Sort the entries represented by this list binding according to the given sorters.
	 * The sorters are stored at this list binding and they are used for each following data
	 * request. Since 1.97.0, if sorters are unchanged, no request is sent, regardless of pending
	 * changes.
	 *
	 * <b>Note:</b> To allow proper detection whether sorters are unchanged, care must be taken if a
	 * sorter uses a function (for example via the <code>vGroup</code> parameter): it must be the
	 * exact same function instance which was given before, and not a newly created one, for example
	 * because <code>Function.prototype.bind</code> is called repeatedly.
	 *
	 * If there are pending changes that cannot be ignored, an error is thrown. Use
	 * {@link #hasPendingChanges} to check if there are such pending changes. If there are, call
	 * {@link sap.ui.model.odata.v4.ODataModel#submitBatch} to submit the changes or
	 * {@link sap.ui.model.odata.v4.ODataModel#resetChanges} to reset the changes before calling
	 * {@link #sort}.
	 *
	 * @param {sap.ui.model.Sorter | sap.ui.model.Sorter[]} [vSorters]
	 *   The dynamic sorters to be used; they replace the dynamic sorters given in
	 *   {@link sap.ui.model.odata.v4.ODataModel#bindList}.
	 *   Static sorters, as defined in the '$orderby' binding parameter, are always executed after
	 *   the dynamic sorters.
	 * @returns {this}
	 *   <code>this</code> to facilitate method chaining
	 * @throws {Error}
	 * @throws {Error} If
	 *   <ul>
	 *     <li> there are pending changes that cannot be ignored,
	 *     <li> the binding is {@link #isTransient transient} (part of a
	 *       {@link sap.ui.model.odata.v4.ODataListBinding#create deep create}),
	 *     <li> an unsupported operation mode is used (see
	 *       {@link sap.ui.model.odata.v4.ODataModel#bindList}).
	 *   </ul>
	 *   The following pending changes are ignored:
	 *   <ul>
	 *     <li> changes relating to a {@link sap.ui.model.odata.v4.Context#isKeepAlive kept-alive}
	 *       context of this binding (since 1.97.0),
	 *     <li> {@link sap.ui.model.odata.v4.Context#isTransient transient} contexts of a
	 *       {@link #getRootBinding root binding} (since 1.98.0),
	 *     <li> {@link sap.ui.model.odata.v4.Context#delete deleted} contexts (since 1.108.0).
	 *   </ul>
	 *
	 * @public
	 * @see sap.ui.model.ListBinding#sort
	 * @since 1.39.0
	 */
	// @override sap.ui.model.ListBinding#sort
	ODataListBinding.prototype.sort = function (vSorters) {
		var aSorters = _Helper.toArray(vSorters);

		this.checkTransient();
		if (this.sOperationMode !== OperationMode.Server) {
			throw new Error("Operation mode has to be sap.ui.model.odata.OperationMode.Server");
		}

		if (_Helper.deepEqual(aSorters, this.aSorters)) {
			return this;
		}

		if (this.hasPendingChanges(true)) {
			throw new Error("Cannot sort due to pending changes");
		}

		this.aSorters = aSorters;
		this.oQueryOptionsPromise = undefined;

		if (this.isRootBindingSuspended()) {
			this.setResumeChangeReason(ChangeReason.Sort);
			return this;
		}

		this.createReadGroupLock(this.getGroupId(), true);
		this.removeCachesAndMessages("");
		this.fetchCache(this.oContext);
		this.reset(ChangeReason.Sort);
		if (this.oHeaderContext) {
			// Update after the refresh event, otherwise $count is fetched before the request
			this.oHeaderContext.checkUpdate();
		}

		return this;
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#updateAfterCreate
	 */
	ODataListBinding.prototype.updateAfterCreate = function (bSkipRefresh, sGroupId) {
		var oPromise,
			oSideEffectsPromise,
			that = this;

		if (this.iCreatedContexts) { // deep create
			if (bSkipRefresh) {
				this.reset(ChangeReason.Change, true); // throw the old, transient contexts away
			} else {
				this.reset(undefined, true); // silently throw the old, transient contexts away
				// ensure that we have new contexts
				oSideEffectsPromise = this.fetchContexts(0, Infinity, 0, _GroupLock.$cached)
					.then(function () {
						that.iCurrentEnd = that.aContexts.length;
						return that.requestSideEffects(sGroupId,
							_Helper.getMissingPropertyPaths(
								that.fetchValue("", null, true).getResult(),
								that.mAggregatedQueryOptions));
					}).then(function () {
						// do not fire until requestSideEffects is finished to avoid unwanted
						// late property requests
						that._fireChange({reason : ChangeReason.Change});
					});
			}
			oPromise = SyncPromise.all([
				oSideEffectsPromise,
				asODataParentBinding.prototype.updateAfterCreate.apply(this, arguments)
			]);
		} else { // full refresh to see if the server created some
			oPromise = this.refreshInternal("", sGroupId);
		}

		return oPromise;
	};

	/**
	 * Updates the binding's system query option <code>$apply</code> based on the given data
	 * aggregation information. Its value is
	 * "groupby((&lt;dimension_1,...,dimension_N,unit_or_text_1,...,unit_or_text_K>),
	 * aggregate(&lt;measure> with &lt;method> as &lt;alias>, ...))" where the "aggregate" part is
	 * only present if measures are given and both "with" and "as" are optional. Since 1.93.0, a
	 * previous "search before data aggregation" is considered (see the
	 * <code>oAggregation.search</code> parameter of {@link #setAggregation}).
	 *
	 * @param {object[]} aAggregation
	 *   An array with objects holding the information needed for data aggregation; see also
	 *   <a href="https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData
	 *   Extension for Data Aggregation Version 4.0</a>
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
	 *   (since 1.58.0), but shared requests are not (since 1.108.0)
	 * @param {boolean} [aAggregation[].min]
	 *   Measures only: Whether the minimum value (ignoring currencies or units of measure) for this
	 *   measure is needed (since 1.55.0); filtering and sorting is supported in this case
	 *   (since 1.58.0), but shared requests are not (since 1.108.0)
	 * @param {string} [aAggregation[].with]
	 *   Measures only: The name of the method (for example "sum") used for aggregation of this
	 *   measure; see "3.1.2 Keyword with" (since 1.55.0)
	 * @param {string} [aAggregation[].as]
	 *   Measures only: The alias, that is the name of the dynamic property used for aggregation of
	 *   this measure; see "3.1.1 Keyword as" (since 1.55.0)
	 * @returns {{measureRangePromise: Promise<Object<{min:number,max:number}>>}|undefined}
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
				group : {},
				search : this.mParameters.$$aggregation && this.mParameters.$$aggregation.search
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

		this.bHasAnalyticalInfo = true;
		this.setAggregation(oAggregation);
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

	//*********************************************************************************************
	// "static" functions
	//*********************************************************************************************

	/**
	 * Calculates the filter for the given key predicate.
	 *
	 * @param {string} sPredicate The key predicate of a message target
	 * @param {object} oEntityType The metadata for the entity type
	 * @param {sap.ui.model.odata.v4.ODataMetaModel} oMetaModel The meta model
	 * @param {string} sMetaPath The meta path
	 * @returns {sap.ui.model.Filter} an {@link sap.ui.model.Filter} for the given key predicate
	 *
	 * @private
	 */
	ODataListBinding.getFilterForPredicate = function (sPredicate, oEntityType, oMetaModel,
			sMetaPath) {
		var aFilters,
			mValueByKeyOrAlias = _Parser.parseKeyPredicate(sPredicate);

		if ("" in mValueByKeyOrAlias) {
			// unnamed key e.g. {"" : ('42')} => replace it by the name of the only key property
			mValueByKeyOrAlias[oEntityType.$Key[0]] = mValueByKeyOrAlias[""];
			delete mValueByKeyOrAlias[""];
		}

		aFilters = oEntityType.$Key.map(function (vKey) {
			var sKeyOrAlias, sKeyPath;

			if (typeof vKey === "string") {
				sKeyPath = sKeyOrAlias = vKey;
			} else {
				sKeyOrAlias = Object.keys(vKey)[0]; // alias
				sKeyPath = vKey[sKeyOrAlias];
			}

			return new Filter(sKeyPath, FilterOperator.EQ,
				_Helper.parseLiteral(decodeURIComponent(mValueByKeyOrAlias[sKeyOrAlias]),
					oMetaModel.getObject(sMetaPath + "/" + sKeyPath + "/$Type"), sKeyPath));
		});

		return aFilters.length === 1 ? aFilters[0] : new Filter({and : true, filters : aFilters});
	};

	/**
	 * Returns whether the given context is created persisted or below a created persisted one.
	 *
	 * @param {sap.ui.model.Context} [oContext] - The context
	 * @returns {boolean} Whether there is a create-persisted parent context
	 *
	 * @private
	 */
	ODataListBinding.isBelowCreated = function (oContext) {
		var oBinding;

		if (!(oContext && oContext.getBinding)) {
			return false; // no V4 context
		}
		if (oContext.isTransient() === false) {
			return true;
		}
		oBinding = oContext.getBinding();

		return oBinding && oBinding.isRelative()
			&& ODataListBinding.isBelowCreated(oBinding.getContext());
	};

	return ODataListBinding;
});
