/*!
 * ${copyright}
 */
/*eslint-disable max-len */
//Provides class sap.ui.model.odata.v2.ODataListBinding
sap.ui.define([
	"sap/base/assert",
	"sap/base/Log",
	"sap/base/util/deepEqual",
	"sap/base/util/each",
	"sap/base/util/isEmptyObject",
	"sap/base/util/uid",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Context",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/FilterType",
	"sap/ui/model/ListBinding",
	"sap/ui/model/Sorter",
	"sap/ui/model/SorterProcessor",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/OperationMode"
], function(assert, Log, deepEqual, each, isEmptyObject, uid, ChangeReason, Context, Filter, FilterOperator, FilterProcessor, FilterType, ListBinding, Sorter, SorterProcessor, CountMode, ODataUtils, OperationMode) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v2.ODataListBinding",
		aCreateParametersAllowlist = ["changeSetId", "error", "expand", "groupId", "inactive",
			"success"];

	/**
	 * @class
	 * List binding for an OData V2 model.
	 *
	 * @param {sap.ui.model.odata.v2.ODataModel} oModel The OData V2 model
	 * @param {string} sPath The binding path in the model
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path.
	 * @param {sap.ui.model.Sorter[]|sap.ui.model.Sorter} [aSorters=[]]
	 *   The sorters used initially; call {@link #sort} to replace them
	 * @param {sap.ui.model.Filter[]|sap.ui.model.Filter} [aFilters=[]]
	 *   The filters to be used initially with type {@link sap.ui.model.FilterType.Application}; call {@link #filter} to
	 *   replace them
	 * @param {object} [mParameters] A map which contains additional parameters for the binding.
	 * @param {sap.ui.model.odata.CountMode} [mParameters.countMode]
	 *   Defines the count mode of the binding; if not specified, the default count mode of the
	 *   <code>oModel</code> is applied.
	 * @param {string} [mParameters.createdEntitiesKey=""]
	 *   A key used in combination with the resolved path of the binding to identify the entities
	 *   created by the binding's {@link #create} method.
	 *
	 *   <b>Note:</b> Different controls or control aggregation bindings to the same collection must
	 *   have different <code>createdEntitiesKey</code> values.
	 * @param {Object<string,string>} [mParameters.custom]
	 *   An optional map of custom query parameters. Custom parameters must not start with
	 *   <code>$</code>.
	 * @param {string} [mParameters.expand]
	 *   Value for the OData <code>$expand</code> query option parameter which is included in the
	 *   data request after URL encoding of the given value.
	 * @param {boolean} [mParameters.faultTolerant]
	 *   Turns on the fault tolerance mode, data is not reset if a back-end request returns an
	 *   error.
	 * @param {string} [mParameters.groupId]
	 *   The group id to be used for requests originating from the binding
	 * @param {sap.ui.model.odata.OperationMode} [mParameters.operationMode]
	 *   The operation mode of the binding
	 * @param {string} [mParameters.select]
	 *   Value for the OData <code>$select</code> query option parameter which is included in the
	 *   data request after URL encoding of the given value.
	 * @param {boolean} [mParameters.transitionMessagesOnly]
	 *   Whether the list binding only requests transition messages from the back end. If messages
	 *   for entities of this collection need to be updated, use
	 *   {@link sap.ui.model.odata.v2.ODataModel#read} on the parent entity corresponding to the
	 *   list binding's context, with the parameter <code>updateAggregatedMessages</code> set to
	 *   <code>true</code>.
	 * @param {boolean} [mParameters.usePreliminaryContext]
	 *   Whether a preliminary context is used. When set to <code>true</code>, the model can
	 *   bundle the OData calls for dependent bindings into fewer $batch requests. For more
	 *   information, see
	 *   {@link topic:6c47b2b39db9404582994070ec3d57a2#loio62149734b5c24507868e722fe87a75db
	 *   Optimizing Dependent Bindings}.
	 * @param {string} [mParameters.batchGroupId]
	 *   <b>Deprecated</b>, use <code>groupId</code> instead. Sets the batch group id to be used for
	 *   requests originating from the binding.
	 * @param {int} [mParameters.threshold]
	 *   Deprecated since 1.102.0, as {@link sap.ui.model.odata.OperationMode.Auto} is deprecated;
	 *   the threshold that defines how many entries should be fetched at least by the binding if
	 *   <code>operationMode</code> is set to <code>Auto</code>.
	 * @throws {Error} If one of the filters uses an operator that is not supported by the underlying model
	 *   implementation or if the {@link sap.ui.model.Filter.NONE} filter instance is contained in
	 *   <code>aFilters</code> together with other filters
	 * @public
	 * @alias sap.ui.model.odata.v2.ODataListBinding
	 * @extends sap.ui.model.ListBinding
	 */
	var ODataListBinding = ListBinding.extend("sap.ui.model.odata.v2.ODataListBinding", /** @lends sap.ui.model.odata.v2.ODataListBinding.prototype */ {

		constructor : function(oModel, sPath, oContext, aSorters, aFilters, mParameters) {
			ListBinding.apply(this, arguments);

			this.sFilterParams = null;
			this.sSortParams = null;
			this.sCustomParams = this.oModel.createCustomParams(this.mParameters);
			this.mCustomParams = mParameters && mParameters.custom;
			this.iLength = 0;
			this.bPendingChange = false;
			this.aAllKeys = null;
			this.aKeys = [];
			this.sCountMode = (mParameters && mParameters.countMode) || this.oModel.sDefaultCountMode;
			this.sOperationMode = (mParameters && mParameters.operationMode) || this.oModel.sDefaultOperationMode;
			this.bUsePreliminaryContext = (mParameters && mParameters.usePreliminaryContext) || oModel.bPreliminaryContext;
			// avoid data request if the binding receives a preliminary context on construction, but does not use it
			if (!this.bUsePreliminaryContext && oContext && oContext.isPreliminary && oContext.isPreliminary()) {
				this.oContext = oContext = undefined;
			}
			this.bRefresh = false;
			this.bNeedsUpdate = false;
			this.bDataAvailable = false;
			this.bIgnoreSuspend = false;
			this.bPendingRefresh = false;
			this.sGroupId = undefined;
			this.sRefreshGroupId = undefined;
			this.bLengthRequested = false;
			this.bUseExtendedChangeDetection = false;
			this.bFaultTolerant = mParameters && mParameters.faultTolerant;
			this.bLengthFinal = false;
			this.iLastEndIndex = 0;
			this.aLastContexts = null;
			this.aLastContextData = null;
			this.bInitial = true;
			this.mRequestHandles = {};
			this.oCountHandle = null;
			this.bSkipDataEvents = false;
			this.bUseExpandedList = false;
			this.oCombinedFilter = null;
			this.sDeepPath = oModel.resolveDeep(sPath, oContext);
			this.bCanonicalRequest = mParameters && mParameters.bCanonicalRequest;
			this.mNormalizeCache = {};
			this.bTransitionMessagesOnly = !!(mParameters
				&& mParameters.transitionMessagesOnly);
			this.sCreatedEntitiesKey = mParameters && mParameters.createdEntitiesKey || "";
			this.oCreatedPersistedToRemove = new Set();
			// whether persisted, created contexts are removed after successful GET for a binding refresh
			this.bRemovePersistedCreatedAfterRefresh = false;

			// check filter integrity
			this.oModel.checkFilter(this.aApplicationFilters);

			if (mParameters && (mParameters.batchGroupId || mParameters.groupId)) {
				this.sGroupId = mParameters.groupId || mParameters.batchGroupId;
			}

			this.iThreshold = (mParameters && mParameters.threshold) || 0;

			// flag to check if the threshold was rejected after a count was issued
			this.bThresholdRejected = false;
			if (this.sCountMode == CountMode.None) {
				// In CountMode.None, the threshold is implicitly rejected
				this.bThresholdRejected = true;
			}

			if (!this.checkExpandedList()) {
				this._removePersistedCreatedContexts();
				this.resetData();
			}

			this._reassignCreateActivate();
		},

		metadata : {}

	});

	/**
	 * The 'createActivate' event is fired when a property is changed on a context in an 'inactive'
	 * state (see {@link #create}). The context then changes its state to 'transient'. Since
	 * 1.113.0, this default behavior can be prevented by calling
	 * {@link sap.ui.base.Event#preventDefault}. The context will then remain in the 'inactive'
	 * state.
	 *
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.model.odata.v2.ODataListBinding} oEvent.getSource This binding
	 * @param {sap.ui.model.odata.v2.Context} oEvent.getParameters.context The affected context
	 *
	 * @event sap.ui.model.odata.v2.ODataListBinding#createActivate
	 * @public
	 * @since 1.98.0
	 */

	/**
	 * Attach event handler <code>fnFunction</code> to the 'createActivate' event of this binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 *
	 * @public
	 * @since 1.98.0
	 */
	ODataListBinding.prototype.attachCreateActivate = function (fnFunction, oListener) {
	   this.attachEvent("createActivate", fnFunction, oListener);
   };

	/**
	 * Detach event handler <code>fnFunction</code> from the 'createActivate' event of this binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 *
	 * @public
	 * @since 1.98.0
	 */
	ODataListBinding.prototype.detachCreateActivate = function (fnFunction, oListener) {
		this.detachEvent("createActivate", fnFunction, oListener);
	};

	/**
	 * This helper function must be called only by {@link #getContexts}. It updates
	 * <code>iLastStartIndex</code>, <code>iLastLength</code> and
	 * <code>iLastMaximumPrefetchSize</code> with the given start index, length and maximum prefetch
	 * size. If <code>bKeepCurrent</code> is set, throw an error if keeping
	 * current contexts untouched is not supported, otherwise don't update
	 * <code>iLastStartIndex</code>, <code>iLastLength</code> and
	 * <code>iLastMaximumPrefetchSize</code>.
	 *
	 * @param {int} [iStartIndex]
	 *   The start index
	 * @param {int} [iLength]
	 *   The length
	 * @param {int} [iMaximumPrefetchSize]
	 *   The maximum number of contexts to read before and after the given range
	 * @param {boolean} [bKeepCurrent]
	 *   Whether the result of {@link #getCurrentContexts} keeps untouched
	 * @throws {Error}
	 *   If extended change detection is enabled and <code>bKeepCurrent</code> is set, or if
	 *   <code>iMaximumPrefetchSize</code> and <code>bKeepCurrent</code> are set
	 *
	 * @private
	 */
	ODataListBinding.prototype._updateLastStartAndLength = function (iStartIndex, iLength,
		   iMaximumPrefetchSize, bKeepCurrent) {
	   if (bKeepCurrent) {
		   this._checkKeepCurrentSupported(iMaximumPrefetchSize);
	   } else {
		   this.iLastStartIndex = iStartIndex;
		   this.iLastLength = iLength;
		   this.iLastMaximumPrefetchSize = iMaximumPrefetchSize;
	   }
   };

	/**
	 * Returns all current contexts of this list binding in no special order. Just like
	 * {@link #getCurrentContexts}, this method does not request any data from a back end and does
	 * not change the binding's state. In contrast to {@link #getCurrentContexts}, it does not only
	 * return those contexts that were last requested by a control, but all contexts that are
	 * currently available in the binding.
	 *
	 * @returns {sap.ui.model.odata.v2.Context[]}
	 *   All current contexts of this list binding, in no special order
	 *
	 * @public
	 * @since 1.98.0
	 */
	ODataListBinding.prototype.getAllCurrentContexts = function () {
		var aContexts = this._getCreatedContexts(),
			that = this;

		this.aKeys.forEach(function (sKey) {
			aContexts.push(that.oModel.getContext("/" + sKey));
		});

		return aContexts;
	};

	/**
	 * Returns the context at the given index.
	 *
	 * @param {number} iIndex The index of the context
	 *
	 * @returns {sap.ui.model.odata.v2.Context|undefined}
	 *   The context at the given index or <code>undefined</code> if no context exists at the given index
	 *
	 * @private
	 * @ui5-restricted sap.ui.table
	 */
	ODataListBinding.prototype.getContextByIndex = function (iIndex) {
		return this._getContexts(iIndex, 1)[0];
	};

	/**
	 * Return contexts for the list.
	 *
	 * @param {int} [iStartIndex=0]
	 *   The index where to start the retrieval of contexts
	 * @param {int} [iLength]
	 *   The number of contexts to retrieve beginning from the start index; defaults to the model's
	 *   size limit, see {@link sap.ui.model.Model#setSizeLimit}, or to the binding's final length
	 * @param {int} [iMaximumPrefetchSize=0]
	 *   The maximum number of contexts to read before and after the given range; with this,
	 *   controls can prefetch data that is likely to be needed soon, e.g. when scrolling down in a
	 *   table
	 * @param {boolean} [bKeepCurrent]
	 *   Whether this call keeps the result of {@link #getCurrentContexts} untouched; since 1.102.0.
	 * @return {sap.ui.model.odata.v2.Context[]}
	 *   The array of already available contexts with the first entry containing the context for
	 *   <code>iStartIndex</code>
	 * @throws {Error}
	 *   If extended change detection is enabled and <code>bKeepCurrent</code> is set, or if
	 *   <code>iMaximumPrefetchSize</code> and <code>bKeepCurrent</code> are set
	 *
	 * @protected
	 */
	ODataListBinding.prototype.getContexts = function(iStartIndex, iLength, iMaximumPrefetchSize,
			bKeepCurrent) {
		var aContexts, aContextData, oSkipAndTop;

		if (this.bInitial) {
			return [];
		}

		//get length
		if (!this.bLengthFinal && !this.bPendingRequest && !this.bLengthRequested) {
			this._getLength();
			this.bLengthRequested = true;
		}

		//this.bInitialized = true;
		this._updateLastStartAndLength(iStartIndex, iLength, iMaximumPrefetchSize, bKeepCurrent);
		if (!iStartIndex) {
			iStartIndex = 0;
		}
		if (!iLength) {
			iLength = this._getMaximumLength();
		}
		if (!iMaximumPrefetchSize) {
			iMaximumPrefetchSize = 0;
		}

		aContexts = this._getContexts(iStartIndex, iLength);
		if (this.oCombinedFilter === Filter.NONE || this._hasTransientParentContext()) {
			// skip #loadData
		} else if (this.useClientMode()) {
			if (!this.aAllKeys && !this.bPendingRequest && this.oModel.getServiceMetadata()) {
				this.loadData();
				aContexts.dataRequested = true;
			}
		} else {
			oSkipAndTop = this._getSkipAndTop(iStartIndex, iLength, iMaximumPrefetchSize);
			// check if metadata are already available
			if (this.oModel.getServiceMetadata()) {
				// If rows are missing send a request
				if (!this.bPendingRequest && oSkipAndTop) {
					this.loadData(oSkipAndTop.skip, oSkipAndTop.top);
					aContexts.dataRequested = true;
				}
			}
		}
		// Do not return created contexts at end if data request is pending
		if (this.isFirstCreateAtEnd()
				&& this.bPendingRequest
				&& aContexts.length && aContexts[0].isTransient() !== undefined) {
			aContexts.length = 0; // only reset length => still keep properties like dataRequested
		}
		if (this.bRefresh) {
			this.bRefresh = false;
			// if we do not need to load data after a refresh event (e.g. we have enough created
			// contexts) we need to fire a change event to fulfill the contract that after a refresh
			// event a change event is triggered when the data is available.
			if (!aContexts.dataRequested && aContexts.length > 0) {
				this._fireChange({reason : ChangeReason.Change});
			}
		} else if (!bKeepCurrent) {
			// Do not create context data and diff in case of refresh, only if real data has been received
			// The current behaviour is wrong and makes diff detection useless for OData in case of refresh
			aContextData = [];
			for (var i = 0; i < aContexts.length; i++) {
				aContextData.push(this.getContextData(aContexts[i]));
			}
			if (this.bUseExtendedChangeDetection) {
				//Check diff
				if (this.aLastContexts && iStartIndex < this.iLastEndIndex) {
					aContexts.diff = this.diffData(this.aLastContextData, aContextData);
				}
			}

			this.iLastEndIndex = iStartIndex + iLength;
			this.aLastContexts = aContexts.slice(0);
			this.aLastContextData = aContextData;
		}

		return aContexts;
	};

	ODataListBinding.prototype.getCurrentContexts = function() {
		return this.aLastContexts || [];
	};

	/**
	 * Returns the entry key for the given context.
	 *
	 * As in OData all entities have a unique ID in the URL, the path of the
	 * context is suitable here.
	 *
	 * @param {sap.ui.model.Context} oContext The context
	 * @returns {string} The entry key for the given context
	 *
	 * @private
	 */
	ODataListBinding.prototype.getEntryKey = function(oContext) {
		return oContext.getPath();
	};

	/**
	 * Returns the entry data as required for change detection/diff.
	 *
	 * This is a JSON serialization of the entity, in case select/expand were used with only the
	 * selected/expanded parts.
	 *
	 * @param {sap.ui.model.Context} oContext
	 *   The context
	 * @returns {any}
	 *   The value for the given context or <code>undefined</code> if data or entity type
	 *   cannot be found or if not all selected properties are available
	 *
	 * @private
	 */
	ODataListBinding.prototype.getEntryData = function(oContext) {
		return JSON.stringify(oContext.getObject(this.mParameters));
	};

	/**
	 * Returns contexts for the list without gaps.
	 *
	 * @param {number} [iStartIndex=0]
	 *   The start index of the requested contexts
	 * @param {number} [iLength]
	 *   The requested amount of contexts
	 * @return {sap.ui.model.odata.v2.Context[]}
	 *   The available contexts for the given range; if there is no context for an index in this
	 *   range, the succeeding indexes are not considered so that the returned array has no gaps
	 *
	 * @private
	 */
	ODataListBinding.prototype._getContexts = function (iStartIndex, iLength) {
		var oContext, i, iEndIndex, sKey,
			bAtEnd = this.isFirstCreateAtEnd(),
			aContexts = [],
			aCreatedContexts = this._getCreatedContexts(),
			iCreated = aCreatedContexts.length,
			sDeepPath = this.oModel.resolveDeep(this.sPath, this.oContext);

		if (!iStartIndex) {
			iStartIndex = 0;
		}
		if (!iLength) {
			iLength = this._getMaximumLength();
		}
		iEndIndex = iStartIndex + iLength;
		for (i = iStartIndex; i < iEndIndex; i += 1) {
			if (!bAtEnd && i < iCreated) { // creation area at the start
				oContext = aCreatedContexts[i];
			} else if (bAtEnd && i >= this.iLength) { // creation area at the end
				if (i - this.iLength >= iCreated) {
					break;
				}
				oContext = aCreatedContexts[i - this.iLength];
			} else { // backend contexts
				sKey = this.aKeys[bAtEnd ? i : i - iCreated];
				if (!sKey) {
					break; // avoid gaps
				}
				oContext = this.oModel.getContext('/' + sKey,
					sDeepPath + sKey.substr(sKey.indexOf("(")));
			}
			aContexts.push(oContext);
		}

		return aContexts;
	};

	/**
	 * Setter for context.
	 *
	 * Entities that have been created via {@link #create} and saved in the back end are removed
	 * from the creation rows area and inserted at the right position based on the current filters
	 * and sorters.
	 *
	 * @param {Object} oContext
	 *   The new context object
	 * @throws {Error}
	 *   If the context was changed and this binding has transient contexts; see {@link #create} and
	 *   {@link sap.ui.model.odata.v2.Context#isTransient}
	 */
	ODataListBinding.prototype.setContext = function (oContext) {
		var bHadNonTransientContext, sResolvedPath,
			bForceUpdate = oContext && oContext.isRefreshForced(),
			bPreliminary = oContext && oContext.isPreliminary(),
			bUpdated = oContext && oContext.isUpdated();

		// If binding is initial or not a relative binding, nothing to do here
		if (this.bInitial || !this.isRelative()) {
			return;
		}
		// If context is preliminary and usePreliminary is not set, exit here
		if (bPreliminary && !this.bUsePreliminaryContext) {
			return;
		}
		if (bUpdated && this.bUsePreliminaryContext && this.oContext === oContext) {
			this._fireChange({ reason: ChangeReason.Context });

			return;
		}
		if (Context.hasChanged(this.oContext, oContext)) {
			bHadNonTransientContext = this.isResolved()
				&& !this._hasTransientParentWithoutSubContexts();
			this.oContext = oContext;
			sResolvedPath = this.getResolvedPath(); // resolved path with the new context
			this.sDeepPath = this.oModel.resolveDeep(this.sPath, this.oContext);
			if (!this._checkPathType()) {
				Log.error("List Binding is not bound against a list for " + sResolvedPath, undefined, sClassName);
			}
			// ensure that data state is updated with each change of the context
			this.checkDataState();
			if (!sResolvedPath || this._hasTransientParentWithoutSubContexts()) {
				this.aAllKeys = null;
				this.aKeys = [];
				this.iLength = 0;
				this.bLengthFinal = true;
				this.abortPendingRequest();
				if (bHadNonTransientContext) {
					this._fireChange({reason : ChangeReason.Context});
				}

				return;
			}
			// get new entity type with new context and init filters now correctly
			this._initSortersFilters();
			if (this.checkExpandedList() && !bForceUpdate) {
				// if there are pending requests e.g. previous context requested data which returns
				// null the pending requests need to be aborted such that the responded (previous)
				// data doesn't overwrite the current one
				this.abortPendingRequest();
				this._fireChange({reason : ChangeReason.Context});
			} else {
				this._removePersistedCreatedContexts();
				this._refresh();
			}
		}
	};

	/**
	 * In side-effects scenarios, iterates all created persisted contexts of this list binding and
	 * removes those entities (with its context, pending changes, messages, ...) which are not
	 * included in the latest back-end response for an expanded list. If this list binding is
	 * suspended, the affected entity keys are temporarily stored to remove those entities later
	 * after the list binding has been resumed.
	 *
	 * @returns {boolean}
	 *   Whether created persisted contexts have been removed
	 *
	 * @private
	 */
	ODataListBinding.prototype._cleanupCreatedPersisted = function () {
		var bCreatedPersistedRemoved = false,
			aList = this.oModel._getObject(this.sPath, this.oContext),
			that = this;

		function removeItem(sEntityKey) {
			that.oModel._discardEntityChanges(sEntityKey, true);
			bCreatedPersistedRemoved = true;
		}

		if (this.oCreatedPersistedToRemove.size && !this.bSuspended) {
			this.oCreatedPersistedToRemove.forEach(removeItem);
			this.oCreatedPersistedToRemove.clear();
		}
		if (aList && aList.sideEffects) {
			this._getCreatedPersistedContexts().forEach(function (oContext) {
				var sEntityKey = that.oModel.getKey(oContext);

				if (!aList.includes(sEntityKey)) { // entity has been deleted on the server
					if (that.bSuspended) {
						that.oCreatedPersistedToRemove.add(sEntityKey);
					} else {
						removeItem(sEntityKey);
					}
				}
			});
		}

		return bCreatedPersistedRemoved;
	};

	/**
	 * Checks whether expanded list data is available and can be used.
	 *
	 * @param {boolean} bSkipReloadNeeded
	 *   Don't check whether reload of expanded data is needed
	 * @return {boolean}
	 *   Whether expanded data is available and is used
	 *
	 * @private
	 */
	ODataListBinding.prototype.checkExpandedList = function(bSkipReloadNeeded) {
		// if nested list is already available and no filters or sorters are set, use the data and
		// don't send additional requests
		// $expand loads all associated entities, no paging parameters possible, so we can safely
		// assume all data is available
		var aCreatedPersistedKeys,
			aList = this.oModel._getObject(this.sPath, this.oContext),
			bOldUseExpandedList = this.bUseExpandedList,
			that = this;

		if (!this.isResolved() || aList === undefined || !this._isExpandedListUsable()) {
			this.bUseExpandedList = false;
			this.aExpandRefs = undefined;

			return false;
		} else {
			this.bUseExpandedList = true;
			if (Array.isArray(aList)) {
				// For performance, only check first and last entry, whether reload is needed
				if (!bSkipReloadNeeded
						&& (this.oModel._isReloadNeeded("/" + aList[0], this.mParameters)
							|| this.oModel._isReloadNeeded("/" + aList[aList.length - 1],
								this.mParameters))) {
					this.bUseExpandedList = false;
					this.aExpandRefs = undefined;
					return false;
				}
				this.aExpandRefs = aList;
				if (aList.sideEffects) {
					aCreatedPersistedKeys = this._getCreatedPersistedContexts()
						.map(function (oContext) {
							return that.oModel.getKey(oContext);
						});
					if (aCreatedPersistedKeys.length) {
						aList = aList.filter(function (sEntityKey) {
							return !aCreatedPersistedKeys.includes(sEntityKey);
						});
					}
				}
				this.aAllKeys = aList;
				this.iLength = aList.length;
				this.bLengthFinal = true;
				this.bDataAvailable = true;
				// ensure sorters/filters for an expanded list are initialized
				this._initSortersFilters();
				this.applyFilter();
				this.applySort();
				if (this.aExpandRefs.sideEffects && !bOldUseExpandedList) {
					// don't switch expanded list mode if data is read via a side effect
					this.aExpandRefs = undefined;
					this.bUseExpandedList = false;

					return this.bUseExpandedList;
				}
			} else { // means that expanded data has no data available e.g. for 0..n relations
				this.aExpandRefs = undefined;
				this.aAllKeys = null;
				this.aKeys = [];
				this.iLength = 0;
				this.bLengthFinal = true;
				this.bDataAvailable = true;
			}
			return true;
		}
	};

	/**
	 * In case the list is currently based on expanded data, update the original data array
	 * if new data has been loaded
	 *
	 * @private
	 * @param {array} aKeys the new key array
	 */
	ODataListBinding.prototype.updateExpandedList = function(aKeys) {
		if (this.aExpandRefs) {
			// update each entity within the array to update the model data
			for (var i = 0; i < aKeys.length; i++) {
				this.aExpandRefs[i] = aKeys[i];
			}
			this.aExpandRefs.length = aKeys.length;
		}
	};

	/**
	 * Check whether client mode is active. This is either the case if it has
	 * been explicitly activated by the application, it has been detected
	 * that all data is available or expanded data is available.
	 *
	 * @private
	 * @return {boolean} Whether clientmode should be used
	 */
	ODataListBinding.prototype.useClientMode = function() {
		return this.sOperationMode === OperationMode.Client ||
			false ||
			this.sOperationMode !== OperationMode.Server && this.bUseExpandedList;
	};

	/**
	 * Adds the $filter query option to the given array of URL parameters if needed.
	 * The application/control filters, as stored in <code>this.sFilterParams</code> are considered
	 * only if the given <code>bUseFilterParams</code> is set. The exclude filter for created
	 * persisted entities is always considered to avoid duplicates or a wrong count.
	 *
	 * @param {string[]} aURLParams The array of URL parameters
	 * @param {boolean} bUseFilterParams Whether to consider <code>this.sFilterParams</code>
	 *
	 * @private
	 */
	ODataListBinding.prototype._addFilterQueryOption = function (aURLParams, bUseFilterParams) {
		var sExcludeFilter = this._getCreatedPersistedExcludeFilter();

		if (this.sFilterParams && bUseFilterParams) {
			if (sExcludeFilter) {
				// this.sFilterParams starts with $filter=, so slice it
				aURLParams.push("$filter=(" + this.sFilterParams.slice(8) + ")%20and%20"
					+ sExcludeFilter);
			} else {
				aURLParams.push(this.sFilterParams);
			}
		} else if (sExcludeFilter) {
			aURLParams.push("$filter=" + sExcludeFilter);
		}
	};

	/**
	 * Gets the created and persisted contexts of this list binding.
	 *
	 * @returns {sap.ui.model.odata.v2.Context[]} The created and persisted contexts
	 *
	 * @private
	 */
	ODataListBinding.prototype._getCreatedPersistedContexts = function () {
		return this._getCreatedContexts().filter(function (oContext) {
			return !oContext.isTransient();
		});
	};

	/**
	 * Gets the exclude filter for the created and persisted contexts of this list binding.
	 *
	 * @returns {string|undefined} The exclude filter or <code>undefined</code> if there are no
	 *   created and persisted contexts in the cache.
	 *
	 * @private
	 */
	ODataListBinding.prototype._getCreatedPersistedExcludeFilter = function () {
		var sExcludeFilter, aExcludeFilters,
			aCreatedPersistedContexts = this._getCreatedPersistedContexts(),
			that = this;

		if (aCreatedPersistedContexts.length > 0) {
			aExcludeFilters = aCreatedPersistedContexts.map(function (oContext) {
				var sPath = oContext.getPath();

				return that._getFilterForPredicate(sPath.slice(sPath.indexOf("(")));
			});
			sExcludeFilter = "not("
				+ ODataUtils._createFilterParams(aExcludeFilters.length === 1
						? aExcludeFilters[0]
						: new Filter({filters : aExcludeFilters}),
					this.oModel.oMetadata, this.oEntityType)
				+ ")";
		}

		return sExcludeFilter;
	};

	/**
	 * Load data for the given range from server.
	 *
	 * @param {int} [iStartIndex] The start index
	 * @param {int} [iLength] The amount of data to be requested
	 * @private
	 */
	ODataListBinding.prototype.loadData = function(iStartIndex, iLength) {
		var sGroupId, oReadParameters,
			sGuid = uid(),
			bInlineCountRequested = false,
			iLimit = this.oModel.iSizeLimit,
			sPath = this.sPath,
			bRemovePersistedCreatedAfterRefresh = this.bRemovePersistedCreatedAfterRefresh,
			aResultPages = [],
			bUseClientMode = this.useClientMode(),
			that = this;

		function getUrlParameters() {
			var aParameters = [];
			// create range parameters and store start index for sort/filter requests
			if (iLength) {
				aParameters.push("$skip=" + iStartIndex + "&$top=" + iLength);
			} else {
				// For OperationMode.Client and OperationMode.Auto (if the threshold was sufficient)
				// loadData is called without iStartIndex and iLength, try reading all data without
				// $skip and $top
				iStartIndex = 0;
			}
			if (that.sSortParams) {
				aParameters.push(that.sSortParams);
			}
			that._addFilterQueryOption(aParameters, !bUseClientMode);
			if (that.sCustomParams) {
				aParameters.push(that.sCustomParams);
			}
			if (that.sCountMode == CountMode.InlineRepeat
					|| !that.bLengthFinal
						&& (that.sCountMode === CountMode.Inline)) {
				aParameters.push("$inlinecount=allpages");
				bInlineCountRequested = true;
			} else {
				bInlineCountRequested = false;
			}

			return aParameters;
		}

		function fnSuccess(oData) {
			// update iLength (only when the inline count was requested and is available)
			if (bInlineCountRequested && oData.__count !== undefined) {
				that.iLength = parseInt(oData.__count);
				that.bLengthFinal = true;
			}

			if (bUseClientMode) {
				// For clients mode, store all keys separately and set length to final
				if (!iStartIndex) {
					that.aKeys = [];
				}
				each(oData.results, function(i, entry) {
					that.aKeys[iStartIndex + i] = that.oModel._getKey(entry);
				});
				aResultPages.push(oData.results);
				if (oData.__next && that.aKeys.length < iLimit /*first request may return enough*/) {
					// continue reading
					iStartIndex = that.aKeys.length;
					iLength = iLimit - iStartIndex; // read up to model size limit
					oReadParameters.urlParameters = getUrlParameters();
					that.mRequestHandles[sGuid] = that.oModel.read(that.sPath, oReadParameters);

					return;
				}
				that.updateExpandedList(that.aKeys);
				that.aAllKeys = that.aKeys.slice();
				that.iLength = that.aKeys.length;
				that.bLengthFinal = true;
				that.applyFilter();
				that.applySort();
				// For server mode, update data and or length dependent on the current result
			} else if (oData.results.length > 0) {
				// Collecting contexts, after the <code>$inlinecount</code> was evaluated, so we do
				// not have to clear it again when Auto modes initial threshold <> count check
				// failed.
				each(oData.results, function(i, entry) {
					that.aKeys[iStartIndex + i] = that.oModel._getKey(entry);
				});

				// if we got data and the results + startindex is larger than the
				// length we just apply this value to the length
				if (that.iLength < iStartIndex + oData.results.length) {
					that.iLength = iStartIndex + oData.results.length;
					that.bLengthFinal = false;
				}

				// if less entries are returned than have been requested set length accordingly
				if (!oData.__next && (oData.results.length < iLength || iLength === undefined)) {
					that.iLength = iStartIndex + oData.results.length;
					that.bLengthFinal = true;
				}
			} else {
				// In fault tolerance mode, if an empty array and next link is returned,
				// finalize the length accordingly
				if (that.bFaultTolerant && oData.__next) {
					that.iLength = iStartIndex;
					that.bLengthFinal = true;
				}

				// check if there are any results at all...
				if (iStartIndex === 0) {
					that.iLength = 0;
					that.aKeys = [];
					that.bLengthFinal = true;
				}

				// if next requested page has no results, and startindex = actual length
				// we could set lengthFinal true as we know the length.
				if (iStartIndex === that.iLength) {
					that.bLengthFinal = true;
				}
			}

			delete that.mRequestHandles[sGuid];
			that.bPendingRequest = false;

			// If request is originating from this binding, change must be fired afterwards
			that.bNeedsUpdate = true;
			that.bIgnoreSuspend = true;

			if (bRemovePersistedCreatedAfterRefresh) {
				that._removePersistedCreatedContexts();
			}

			that.oModel.callAfterUpdate(function () {
				if (aResultPages.length > 1) {
					that.fireDataReceived({
						data: {
							__count: String(that.iLength),
							results: Array.prototype.concat.apply([], aResultPages)
						}
					});
				} else {
					that.fireDataReceived({data: oData});
				}
			});
		}

		function fnError(oError) {
			var bAborted = oError.statusCode == 0;
			delete that.mRequestHandles[sGuid];
			that.bPendingRequest = false;
			if (that.bFaultTolerant) {
				// In case of fault tolerance, don't reset data, but keep the already loaded
				// data and set the length to final to prevent further requests
				that.iLength = that.aKeys.length;
				that.bLengthFinal = true;
				that.bDataAvailable = true;
			} else if (!bAborted) {
				// reset data and trigger update
				that.aKeys = [];
				that.aAllKeys = [];
				that.iLength = 0;
				that.bLengthFinal = true;
				that.bDataAvailable = true;
				that._fireChange({reason: ChangeReason.Change});
			}

			if (!that.bSkipDataEvents) {
				that.fireDataReceived();
			}
		}

		if (this.isRelative()){
			sPath = this.getResolvedPath();
		}
		if (sPath) {
			// Execute the request and use the metadata if available
			this.bPendingRequest = true;
			if (!this.bSkipDataEvents) {
				this.fireDataRequested();
			}
			this.bSkipDataEvents = false;
			//if load is triggered by a refresh we have to check the refreshGroup
			sGroupId = this.sRefreshGroupId ? this.sRefreshGroupId : this.sGroupId;
			oReadParameters = {
				headers: this.bTransitionMessagesOnly
					? {"sap-messages" : "transientOnly"}
					: undefined,
				context: this.oContext,
				groupId: sGroupId,
				urlParameters: getUrlParameters(),
				success: fnSuccess,
				error: fnError,
				canonicalRequest: this.bCanonicalRequest,
				updateAggregatedMessages: this.bRefresh
			};
			this.mRequestHandles[sGuid] = this.oModel.read(this.sPath, oReadParameters);
		}
	};

	ODataListBinding.prototype.isLengthFinal = function() {
		return this.bLengthFinal;
	};

	/**
	 * Return the length of the list.
	 *
	 * In case the final length is unknown (e.g. when searching on a large dataset), this will
	 * return an estimated length.
	 *
	 * @return {int} The length
	 * @public
	 */
	ODataListBinding.prototype.getLength = function() {
		var iResult = this.iLength + this._getCreatedContexts().length;

		if (this.bLengthFinal || this.iLength === 0) {
			return iResult;
		}

		// If length is not final and larger than zero, add some additional length to enable
		// scrolling/paging for controls that only do this if more items are available
		return iResult + (this.iLastMaximumPrefetchSize || this.iLastLength || 10);
	};

	/**
	 * Return the length of the list.
	 *
	 * @private
	 */
	ODataListBinding.prototype._getLength = function() {
		var sGroupId, sPath,
			aParams = [],
			that = this;

		if (this.sCountMode !== CountMode.Request) {
			return;
		}

		this._addFilterQueryOption(aParams, true);
		// use only custom params for count and not expand,select params
		if (this.mParameters && this.mParameters.custom) {
			var oCust = { custom: {}};
			each(this.mParameters.custom, function (sParam, oValue) {
				oCust.custom[sParam] = oValue;
			});
			aParams.push(this.oModel.createCustomParams(oCust));
		}

		function _handleSuccess(oData) {
			that.iLength = parseInt(oData);
			that.bLengthFinal = true;
			that.bLengthRequested = true;
			that.oCountHandle = null;
		}

		function _handleError(oError) {
			delete that.mRequestHandles[sPath];
			var sErrorMsg = "Request for $count failed: " + oError.message;
			if (oError.response){
				sErrorMsg += ", " + oError.response.statusCode + ", " + oError.response.statusText + ", " + oError.response.body;
			}
			Log.warning(sErrorMsg, undefined, sClassName);
		}

		// Use context and check for relative binding
		sPath = this.getResolvedPath();

		// Only send request, if path is defined
		if (sPath) {
			// execute the request and use the metadata if available
			//if load is triggered by a refresh we have to check the refreshGroup
			sGroupId = this.sRefreshGroupId ? this.sRefreshGroupId : this.sGroupId;
			this.oCountHandle = this.oModel.read(this.sPath + "/$count", {
				context: this.oContext,
				withCredentials: this.oModel.bWithCredentials,
				groupId: sGroupId,
				urlParameters:aParams,
				success: _handleSuccess,
				error: _handleError,
				canonicalRequest: this.bCanonicalRequest
			});
		}
	};

	/**
	 * Gets the maximum length based on the final length, the number of created entities and the
	 * model's size limit.
	 *
	 * @returns {number}
	 *   The maximum length
	 *
	 * @private
	 */
	ODataListBinding.prototype._getMaximumLength = function () {
		var iLength = this.oModel.iSizeLimit;

		if (this.bLengthFinal) {
			iLength = Math.min(iLength, this.iLength + this._getCreatedContexts().length);
		}

		return iLength;
	};

	/**
	 * Refreshes the binding, check whether the model data has been changed and fire change event
	 * if this is the case. For server side models this should refetch the data from the server.
	 * To update a control, even if no data has been changed, e.g. to reset a control after failed
	 * validation, use the parameter <code>bForceUpdate</code>.
	 *
	 * Entities that have been created via {@link #create} and saved in the back end are removed
	 * from the creation rows area and inserted at the right position based on the current filters
	 * and sorters.
	 *
	 * @param {boolean} [bForceUpdate] Update the bound control even if no data has been changed
	 * @param {string} [sGroupId] The group Id for the refresh
	 * @ui5-omissible-params bForceUpdate
	 *
	 * @public
	 */
	ODataListBinding.prototype.refresh = function(bForceUpdate, sGroupId) {
		if (typeof bForceUpdate === "string") {
			sGroupId = bForceUpdate;
			bForceUpdate = false;
		}
		this._removePersistedCreatedContexts();
		this.sRefreshGroupId = sGroupId;
		this.bRemovePersistedCreatedAfterRefresh = true;
		this._refresh(bForceUpdate);
		this.sRefreshGroupId = undefined;
		this.bRemovePersistedCreatedAfterRefresh = false;
	};

	/**
	 * Refreshes the binding.
	 *
	 * @param {boolean} [bForceUpdate] Whether an update should be forced
	 * @param {object} [mChangedEntities] A map of changed entities
	 * @param {object} [mEntityTypes] A map of entity types
	 *
	 * @private
	 */
	ODataListBinding.prototype._refresh = function(bForceUpdate, mChangedEntities, mEntityTypes) {
		var oEntityType, sResolvedPath,
			bChangeDetected = false;

		if (this._hasTransientParentWithoutSubContexts()) {
			return;
		}
		if (!bForceUpdate) {
			if (mEntityTypes){
				sResolvedPath = this.getResolvedPath();
				if (sResolvedPath) {
					oEntityType = this.oModel.oMetadata._getEntityTypeByPath(sResolvedPath);
					if (oEntityType && (oEntityType.entityType in mEntityTypes)) {
						bChangeDetected = true;
					}
				}
			}
			if (mChangedEntities && !bChangeDetected) {
				each(this.aKeys, function(i, sKey) {
					if (sKey in mChangedEntities) {
						bChangeDetected = true;

						return false;
					}

					return true;
				});
			}
			if (!mChangedEntities && !mEntityTypes) { // default
				bChangeDetected = true;
			}
		}
		if (bForceUpdate || bChangeDetected) {
			if (this.bSuspended && !this.bIgnoreSuspend && !bForceUpdate) {
				this.bPendingRefresh = true;

				return;
			}
			this.bPendingRefresh = false;
			this.abortPendingRequest(true);
			this.resetData();
			this._fireRefresh({reason : ChangeReason.Refresh});
		}
	};

	/**
	 * fireRefresh
	 *
	 * @param {object} mParameters Map of event parameters
	 * @private
	 */
	ODataListBinding.prototype._fireRefresh = function(mParameters) {
		if (this.getResolvedPath()) {
			this.bRefresh = true;
			this.fireEvent("refresh", mParameters);
		}
	};

	/**
	 * Retrieves the type from the path and checks whether or not the resolved path relates to a list type
	 * (multiplicity * or if it matches an entityset)
	 *
	 * @returns {boolean} whether or not the type matches a list
	 * @private
	 */
	ODataListBinding.prototype._checkPathType = function () {
		var sPath = this.getResolvedPath();

		if (sPath) {
			if (!this._mPathType || !this._mPathType[sPath]) {
				this._mPathType = {};

				var iIndex = sPath.lastIndexOf("/");
				var oTypeSet, oEntityType;
				if (iIndex > 1) {
					oEntityType = this.oModel.oMetadata._getEntityTypeByPath(sPath.substring(0, iIndex));

					if (oEntityType) {
						oTypeSet = this.oModel.oMetadata._getEntityAssociationEnd(oEntityType, sPath.substring(iIndex + 1));
						//multiplicity can only be one of the following:
						// 0..1 at most one
						// 1    exactly one
						// *    one or more
						if (oTypeSet && oTypeSet.multiplicity === "*") {
							this._mPathType[sPath] = true;
						}
					}
				} else if (iIndex === 0) {
					var oMatchingSet, sName = sPath.substring(1);
					oMatchingSet = this.oModel.oMetadata._findEntitySetByName(sName);
					if (oMatchingSet) {
						this._mPathType[sPath] = true;
					} else {
						var aFunctionImports = this.oModel.oMetadata._getFunctionImportMetadataByName(sName);
						for (var i = 0; i < aFunctionImports.length; i++) {
							var oFunctionImport = aFunctionImports[i];
							if (oFunctionImport.entitySet) {
								oMatchingSet = this.oModel.oMetadata._findEntitySetByName(oFunctionImport.entitySet);
								if (oMatchingSet) {
									this._mPathType[sPath] = true;
								}
							}
						}
					}
				}
			}
			return !!this._mPathType[sPath];
		}
		return true;
	};

	/**
	 * Initialize binding.
	 *
	 * Fires a change if data is already available ($expand) or a refresh.
	 * If metadata is not yet available, do nothing, method will be called again when
	 * metadata is loaded.
	 *
	 * @returns {sap.ui.model.odata.v2.ODataListBinding} oBinding The binding instance
	 * @public
	 */
	ODataListBinding.prototype.initialize = function() {
		if (this.oModel.oMetadata && this.oModel.oMetadata.isLoaded() && this.bInitial
				&& !this._hasTransientParentWithoutSubContexts()) {
			if (!this._checkPathType()) {
				Log.error("List Binding is not bound against a list for " + this.getResolvedPath(), undefined,
					sClassName);
			}
			this.bInitial = false;
			this._initSortersFilters();
			if (!this.bSuspended) {
				if (this.bDataAvailable) {
					this._fireChange({reason: ChangeReason.Change});
				} else {
					this.resetData();
					this._fireRefresh({reason: ChangeReason.Refresh});
				}
			}
			// ensure that data state is updated after initialization
			this.checkDataState();
		}

		return this;
	};

	/**
	 * Check whether this Binding would provide new values and in case it changed,
	 * inform interested parties about this.
	 *
	 * @param {boolean} [bForceUpdate] Force control update
	 * @param {object} mChangedEntities Map of changed entities
	 * @private
	 */
	ODataListBinding.prototype.checkUpdate = function (bForceUpdate, mChangedEntities) {
		var aContexts, oCurrentData, bExpandedList, aLastKeys, aOldRefs,
			bChangeDetected = false,
			sChangeReason = this.sChangeReason ? this.sChangeReason : ChangeReason.Change,
			bCreatedPersistedRemoved = this._cleanupCreatedPersisted(),
			that = this;

		if ((this.bSuspended && !this.bIgnoreSuspend && !bForceUpdate) || this.bPendingRequest) {
			return;
		}

		if (this.bInitial) {
			if (this.oContext && this.oContext.isUpdated()) {
				// If context changed from created to persisted we need to initialize the binding
				this.initialize();
			}
			return;
		}

		this.bIgnoreSuspend = false;
		if (!bForceUpdate && !this.bNeedsUpdate) {
			// check if expanded data has been changed
			aOldRefs = this.aExpandRefs;

			aLastKeys = this.aKeys.slice();
			bExpandedList = this.checkExpandedList(true);

			// apply sorting and filtering again, as the newly set entities may have changed in
			// clientmode
			if (!bExpandedList && this.useClientMode()) {
				this.applyFilter();
				this.applySort();
			}
			if (!deepEqual(aOldRefs, this.aExpandRefs)) {
				bChangeDetected = true;
			} else if (mChangedEntities) {
				// Performance Optimization: if the length differs, we definitely have a change
				if (this.aKeys.length !== aLastKeys.length) {
					bChangeDetected = true;
				} else {
					//iterate over keys from before and after filtering as new keys match the filter
					// or existing keys match not anymore
					for (var sKey in mChangedEntities) {
						if (this.aKeys.indexOf(sKey) > -1 || aLastKeys.indexOf(sKey) > -1) {
							bChangeDetected = true;
							break;
						}
					}
				}
			} else {
				bChangeDetected = true;
			}
			if (bChangeDetected && this.aLastContexts) {
				// Reset bChangeDetected and compare actual data of entries
				bChangeDetected = false;
				//Get contexts for visible area and compare with stored contexts
				aContexts = this._getContexts(this.iLastStartIndex, this.iLastLength);
				if (this.aLastContexts.length !== aContexts.length) {
					bChangeDetected = true;
				} else {
					each(this.aLastContextData, function(iIndex, oLastData) {
						oCurrentData = that.getContextData(aContexts[iIndex]);
						// Compare whether last data is completely contained in current data
						if (oLastData !== oCurrentData) {
							bChangeDetected = true;
							return false;
						}

						return true;
					});
				}
			}
		}
		if (bForceUpdate || bChangeDetected || this.bNeedsUpdate || bCreatedPersistedRemoved) {
			this.bNeedsUpdate = false;
			this._fireChange({reason: sChangeReason});
		}
		this.sChangeReason = undefined;
	};

	/**
	 * Resets the current list data and length.
	 *
	 * @private
	 */
	ODataListBinding.prototype.resetData = function() {
		this.aKeys = [];
		this.aAllKeys = null;
		this.iLength = 0;
		this.bLengthFinal = this.oCombinedFilter === Filter.NONE || this._hasTransientParentContext()
			|| !this.isResolved();
		this.sChangeReason = undefined;
		this.bDataAvailable = false;
		this.bLengthRequested = false;

		this.bThresholdRejected = false;
		// In CountMode.None, the threshold is implicitly rejected
		if (this.sCountMode == CountMode.None) {
			this.bThresholdRejected = true;
		}
	};


	/**
	 * Aborts the current pending request (if any).
	 *
	 * This can be called if we are sure that the data from the current request is no longer relevant,
	 * e.g. when filtering/sorting is triggered or the context is changed.
	 *
	 * @param {boolean} [bAbortCountRequest] Also abort the count request
	 * @private
	 */
	ODataListBinding.prototype.abortPendingRequest = function(bAbortCountRequest) {
		if (!isEmptyObject(this.mRequestHandles)) {
			this.bSkipDataEvents = true;
			each(this.mRequestHandles, function(sPath, oRequestHandle){
				oRequestHandle.abort();
			});
			if (bAbortCountRequest && this.oCountHandle) {
				this.oCountHandle.abort();
			}
			this.mRequestHandles = {};
			this.bPendingRequest = false;
		}
	};

	/**
	 * Get a download URL with the specified format considering the
	 * sort/filter/custom parameters.
	 *
	 * @param {string} sFormat Value for the $format Parameter
	 * @return {string|null} URL which can be used for downloading; <code>null</code> if this binding uses
	 *   {@link sap.ui.model.Filter.NONE}
	 *
	 * @since 1.24
	 * @public
	 */
	ODataListBinding.prototype.getDownloadUrl = function(sFormat) {
		var aParams = [],
			sPath;

		if (this.oCombinedFilter === Filter.NONE) {
			return null;
		}
		if (sFormat) {
			aParams.push("$format=" + encodeURIComponent(sFormat));
		}
		if (this.sSortParams) {
			aParams.push(this.sSortParams);
		} else if (this.aSorters.length && this.useClientMode()) {
			aParams.push(ODataUtils.createSortParams(this.aSorters));
		}
		if (this.sFilterParams) {
			aParams.push(this.sFilterParams);
		} else if (this.oCombinedFilter && this.useClientMode()) {
			aParams.push(ODataUtils.createFilterParams(this.oCombinedFilter, this.oModel.oMetadata,
				this.oEntityType));
		}
		if (this.sCustomParams) {
			aParams.push(this.sCustomParams);
		}

		sPath = this.getResolvedPath();

		return sPath && this.oModel._createRequestUrl(sPath, null, aParams);
	};

	/**
	 * Appends the keys of a list binding's created persisted contexts to its <code>aAllKeys</code>.
	 * Afterwards, the created persisted contexts are removed from the creation rows area.
	 *
	 * Note that this must only be used in <code>OperationMode.Client</code> as this mode expects
	 * that <code>aAllKeys</code> knows the complete collection from server.
	 *
	 * @returns {boolean} Whether created persisted entries have been processed
	 *
	 * @private
	 */
	ODataListBinding.prototype._moveCreatedPersistedToAllKeys = function () {
		var that = this,
			aCreatedPersistedKeys = this._getCreatedPersistedContexts().map(function (oContext) {
				return that.oModel.getKey(oContext);
			});

		if (aCreatedPersistedKeys.length) {
			this.aAllKeys = this.aAllKeys.concat(aCreatedPersistedKeys);
			this._removePersistedCreatedContexts();

			return true;
		}

		return false;
	};

	/**
	 * Sorts the list.
	 *
	 * Entities that have been created via {@link #create} and saved in the back end are removed
	 * from the creation rows area and inserted at the right position based on the current filters
	 * and sorters.
	 *
	 * @param {sap.ui.model.Sorter[]|sap.ui.model.Sorter} [aSorters=[]]
	 *   The sorters to use; they replace the sorters given in {@link sap.ui.model.odata.v2.ODataModel#bindList}; a
	 *   falsy value is treated as an empty array and thus removes all sorters
	 * @param {boolean} [bReturnSuccess=false]
	 *   Whether the success indicator should be returned instead of <code>this</code>
	 * @return {this}
	 *   Reference to <code>this</code> to facilitate method chaining or the success indicator
	 * @public
	 */
	ODataListBinding.prototype.sort = function(aSorters, bReturnSuccess) {

		var bSuccess = false;

		this.bIgnoreSuspend = true;

		if (!aSorters) {
			aSorters = [];
		}

		if (aSorters instanceof Sorter) {
			aSorters = [aSorters];
		}

		this.aSorters = aSorters;

		if (!this.useClientMode()) {
			this.createSortParams(aSorters);
		}

		if (!this.bInitial) {
			this.addComparators(aSorters, true);
			if (this.useClientMode()) {
				// apply clientside sorters only if data is available
				if (this.aAllKeys) {
					if (this._moveCreatedPersistedToAllKeys() || !aSorters.length) {
						this.applyFilter();
					}
					this.applySort();
					this._fireChange({reason: ChangeReason.Sort});
				} else {
					this.sChangeReason = ChangeReason.Sort;
				}
			} else {
				// when removing the persisted created entries from the cache we break the invariant
				// that the number of entries (read from server) does not change when sorting. So
				// we need to update the length we received from the server
				this.iLength += this._removePersistedCreatedContexts().length;
				// Only reset the keys, length usually doesn't change when sorting
				// therefore #resetData is not required
				this.aKeys = [];
				this.abortPendingRequest(false);
				this.sChangeReason = ChangeReason.Sort;
				this._fireRefresh({reason : this.sChangeReason});
			}
			bSuccess = true;
		}

		if (bReturnSuccess) {
			return bSuccess;
		} else {
			return this;
		}
	};

	/**
	 * Sets the comparator for each sorter/filter in the array according to the Edm type of the
	 * sort/filter property.
	 *
	 * @param {object[]} aEntries
	 *   Array of sorters/filters
	 * @param {boolean} bSort
	 *   Whether a comparator usable for sorting should be returned, where comparison with null
	 *   returns a valid result
	 *
	 * @private
	 */
	ODataListBinding.prototype.addComparators = function(aEntries, bSort) {
		var oPropertyMetadata, sType,
			oEntityType = this.oEntityType,
			fnCompare;

		if (!oEntityType) {
			Log.warning("Cannot determine sort/filter comparators, as entity type of the collection is unknown!",
				undefined, sClassName);
			return;
		}
		aEntries.forEach(function(oEntry) {
			// Recurse to nested filters
			if (oEntry.aFilters) {
				this.addComparators(oEntry.aFilters);
			} else if (!oEntry.fnCompare) {
				oPropertyMetadata = this.oModel.oMetadata._getPropertyMetadata(oEntityType, oEntry.sPath);
				sType = oPropertyMetadata && oPropertyMetadata.type;
				assert(oPropertyMetadata, "PropertyType for property " + oEntry.sPath + " of EntityType " + oEntityType.name + " not found!");
				fnCompare = ODataUtils.getComparator(sType);
				if (bSort) {
					oEntry.fnCompare = getSortComparator(fnCompare);
				} else {
					oEntry.fnCompare = fnCompare;
					normalizeFilterValues(sType, oEntry);
				}
			}
		}.bind(this));
	};

	/**
	 * Creates a comparator usable for sorting.
	 *
	 * The OData comparators return "NaN" for comparisons containing null values. While this is a
	 * valid result when used for filtering, for sorting the null values need to be put in order, so
	 * the comparator must return either -1 or 1 instead, to have null sorted at the top in
	 * ascending order and on the bottom in descending order.
	 *
	 * @param {function} fnCompare Function to compare two values with
	 * @returns {function} The sort comparator
	 *
	 * @private
	 */
	function getSortComparator(fnCompare) {
		return function(vValue1, vValue2) {
			if (vValue1 === vValue2) {
				return 0;
			}
			if (vValue1 === null) {
				return -1;
			}
			if (vValue2 === null) {
				return 1;
			}
			return fnCompare(vValue1, vValue2);
		};
	}

	/**
	 * Does normalize the filter values according to the given Edm type. This is necessary for
	 * comparators to work as expected, even if the wrong JavaScript type is passed to the filter
	 * (string vs number).
	 *
	 * @param {string} sType The Edm type
	 * @param {object} oFilter The filter
	 *
	 * @private
	 */
	function normalizeFilterValues(sType, oFilter) {
		switch (sType) {
			case "Edm.Decimal":
			case "Edm.Int64":
				if (typeof oFilter.oValue1 == "number") {
					oFilter.oValue1 = oFilter.oValue1.toString();
				}
				if (typeof oFilter.oValue2 == "number") {
					oFilter.oValue2 = oFilter.oValue2.toString();
				}
				break;
			case "Edm.Byte":
			case "Edm.Int16":
			case "Edm.Int32":
			case "Edm.SByte":
				if (typeof oFilter.oValue1 == "string") {
					oFilter.oValue1 = parseInt(oFilter.oValue1);
				}
				if (typeof oFilter.oValue2 == "string") {
					oFilter.oValue2 = parseInt(oFilter.oValue2);
				}
				break;
			case "Edm.Float":
			case "Edm.Single":
			case "Edm.Double":
				if (typeof oFilter.oValue1 == "string") {
					oFilter.oValue1 = parseFloat(oFilter.oValue1);
				}
				if (typeof oFilter.oValue2 == "string") {
					oFilter.oValue2 = parseFloat(oFilter.oValue2);
				}
				break;
			default:
				// Nothing to do
		}
	}

	ODataListBinding.prototype.applySort = function() {
		var that = this,
			oContext;

		this.aKeys = SorterProcessor.apply(this.aKeys, this.aSorters, function(vRef, sPath) {
			oContext = that.oModel.getContext('/' + vRef);
			return that.oModel.getProperty(sPath, oContext);
		});
	};


	ODataListBinding.prototype.createSortParams = function(aSorters) {
		this.sSortParams = ODataUtils.createSortParams(aSorters);
	};

	/**
	 * Filters the list.
	 *
	 * When using <code>sap.ui.model.Filter</code> the filters are first grouped according to their binding path.
	 * All filters belonging to the same group are combined with OR and after that the
	 * results of all groups are combined with AND.
	 * Usually this means, all filters applied to a single table column
	 * are combined with OR, while filters on different table columns are combined with AND.
	 * Please note that a custom filter function is only supported with operation mode <code>sap.ui.model.odata.OperationMode.Client</code>.
	 *
	 * Entities that have been created via {@link #create} and saved in the back end are removed
	 * from the creation rows area and inserted at the right position based on the current filters
	 * and sorters.
	 *
	 * @param {sap.ui.model.Filter[]|sap.ui.model.Filter} [aFilters=[]]
	 *   The filters to use; in case of type {@link sap.ui.model.FilterType.Application} this replaces the filters given
	 *   in {@link sap.ui.model.odata.v2.ODataModel#bindList}; a falsy value is treated as an empty array and thus
	 *   removes all filters of the specified type
	 * @param {sap.ui.model.FilterType} [sFilterType=sap.ui.model.FilterType.Control]
	 *   The type of the filter to replace
	 * @param {boolean} [bReturnSuccess=false] Whether the success indicator should be returned instead of <code>this</code>
	 * @return {this} Reference to <code>this</code> to facilitate method chaining or a boolean success indicator
	 * @throws {Error} If one of the filters uses an operator that is not supported by the underlying model
	 *   implementation or if the {@link sap.ui.model.Filter.NONE} filter instance is contained in
	 *   <code>aFilters</code> together with other filters
	 *
	 * @public
	 */
	ODataListBinding.prototype.filter = function(aFilters, sFilterType, bReturnSuccess) {
		var bSuccess = false;

		this.bIgnoreSuspend = true;

		if (!aFilters) {
			aFilters = [];
		}

		if (aFilters instanceof Filter) {
			aFilters = [aFilters];
		}

		// check filter integrity
		this.oModel.checkFilter(aFilters);

		if (sFilterType === FilterType.Application) {
			this.aApplicationFilters = aFilters;
		} else {
			this.aFilters = aFilters;
		}

		if (!this.aFilters || !Array.isArray(this.aFilters)) {
			this.aFilters = [];
		}
		if (!this.aApplicationFilters || !Array.isArray(this.aApplicationFilters)) {
			this.aApplicationFilters = [];
		}
		this.oCombinedFilter = FilterProcessor.combineFilters(this.aFilters, this.aApplicationFilters);

		if (!this.useClientMode() && this.oCombinedFilter !== Filter.NONE) {
			this.createFilterParams(this.oCombinedFilter);
		}

		if (!this.bInitial) {
			if (this.oCombinedFilter !== Filter.NONE) {
				this.addComparators(this.aFilters);
				this.addComparators(this.aApplicationFilters);
			}

			if (this.useClientMode()) {
				// apply clientside filters/sorters only if data is available
				if (this.aAllKeys) {
					this._moveCreatedPersistedToAllKeys();
					this.applyFilter();
					this.applySort();
					this._fireChange({reason: ChangeReason.Filter});
				} else {
					this.sChangeReason = ChangeReason.Filter;
				}
			} else {
				this._removePersistedCreatedContexts();
				this.resetData();
				this.abortPendingRequest(true);
				this.sChangeReason = ChangeReason.Filter;
				this._fireRefresh({reason: this.sChangeReason});
			}
			bSuccess = true;
		}

		if (bReturnSuccess) {
			return bSuccess;
		} else {
			return this;
		}
	};

	ODataListBinding.prototype.applyFilter = function() {
		var that = this,
			oContext;

		this.oCombinedFilter = FilterProcessor.combineFilters(this.aFilters, this.aApplicationFilters);
		this.aKeys = FilterProcessor.apply(this.aAllKeys, this.oCombinedFilter, function(vRef, sPath) {
			oContext = that.oModel.getContext('/' + vRef);
			return that.oModel.getProperty(sPath, oContext);
		}, this.mNormalizeCache);
		this.iLength = this.aKeys.length;
	};

	ODataListBinding.prototype.createFilterParams = function(oFilter) {
		this.sFilterParams = ODataUtils.createFilterParams(oFilter, this.oModel.oMetadata, this.oEntityType);
	};

	ODataListBinding.prototype._initSortersFilters = function(){
		// if path could not be resolved entity type cannot be retrieved and
		// also filters/sorters don't need to be set
		var sResolvedPath = this.getResolvedPath();
		if (!sResolvedPath) {
			return;
		}
		this.oEntityType = this._getEntityType();
		this.addComparators(this.aSorters, true);
		this.addComparators(this.aFilters);
		this.addComparators(this.aApplicationFilters);
		this.oCombinedFilter = FilterProcessor.combineFilters(this.aFilters, this.aApplicationFilters);

		if (!this.useClientMode()) {
			this.createSortParams(this.aSorters);
			this.createFilterParams(this.oCombinedFilter);
		}
	};

	ODataListBinding.prototype._getEntityType = function(){
		var sResolvedPath = this.getResolvedPath();

		if (sResolvedPath) {
			var oEntityType = this.oModel.oMetadata._getEntityTypeByPath(sResolvedPath);
			assert(oEntityType, "EntityType for path " + sResolvedPath + " could not be found!");
			return oEntityType;

		}
		return undefined;
	};

	ODataListBinding.prototype.resume = function() {
		this.bIgnoreSuspend = false;
		this.bSuspended = false;
		if (this.bPendingRefresh) {
			// _refresh detected a change (or was forced) but did
			//	not refresh due to active suspension
			this._refresh();
		} else {
			this.checkUpdate();
		}
	};

	ODataListBinding.prototype.suspend = function() {
		if (this.bInitial) {
			this.bPendingRefresh = true;
		}
		ListBinding.prototype.suspend.apply(this, arguments);
	};

	/** @inheritdoc */
	ODataListBinding.prototype._checkDataStateMessages = function(oDataState, sResolvedPath) {
		if (sResolvedPath) {
			oDataState.setModelMessages(this.oModel.getMessagesByPath(this.sDeepPath, true));
		}
	};

	/**
	 * Returns a {@link sap.ui.model.Filter} object for the given key predicate of the collection
	 * referenced by this binding.
	 *
	 * @param {string} sPredicate
	 *   The valid key predicate, for example ('42') or (SalesOrderID='42',ItemPosition='10')
	 * @returns {sap.ui.model.Filter}
	 *   A {@link sap.ui.model.Filter} representing the entry for the given key predicate
	 *
	 * @private
	 */
	ODataListBinding.prototype._getFilterForPredicate = function (sPredicate) {
		var aFilters = [],
			aKeyValuePairs = sPredicate.slice(1, -1).split(","),
			that = this;

		aKeyValuePairs.forEach(function (sKeyValue) {
			var aKeyAndValue = sKeyValue.split("="),
				sKey = aKeyAndValue[0],
				vValue = aKeyAndValue[1];

			if (aKeyAndValue.length === 1) { // name of key property missing
				vValue = sKey;
				sKey = that.oModel.oMetadata.getKeyPropertyNamesByPath(that.sDeepPath)[0];
			}
			aFilters.push(new Filter(sKey, FilterOperator.EQ,
				ODataUtils.parseValue(decodeURIComponent(vValue))));
		});
		if (aFilters.length === 1) {
			return aFilters[0];
		}

		return new Filter({
			and : true,
			filters : aFilters
		});
	};

	/**
	 * Creates a new entity for this binding's collection via
	 * {@link sap.ui.model.odata.v2.ODataModel#createEntry} using the parameters given in
	 * <code>mParameters</code> and inserts it at the list position specified by the
	 * <code>bAtEnd</code> parameter. See
	 * {@link topic:6c47b2b39db9404582994070ec3d57a2#loio4c4cd99af9b14e08bb72470cc7cabff4 Creating
	 * Entities documentation} for comprehensive information on the topic.
	 *
	 * Note: This method requires that the model metadata has been loaded; see
	 * {@link sap.ui.model.odata.v2.ODataModel#metadataLoaded}.
	 *
	 * Since 1.108.0, this method supports deep create, which means it may be called if this
	 * binding's context is transient. The restrictions specified for
	 * {@link sap.ui.model.odata.v2.ODataModel#createEntry} regarding deep create apply.
	 *
	 * @param {object} [oInitialData={}]
	 *   The initial data for the created entity; see the <code>mParameters.properties</code>
	 *   parameter of {@link sap.ui.model.odata.v2.ODataModel#createEntry}
	 * @param {boolean} [bAtEnd=false]
	 *   Whether the entity is inserted at the end of the list. The first insertion determines the
	 *   overall position of created contexts within the list. Every succeeding insertion is
	 *   relative to the created contexts within this list. Note: the order of created contexts in
	 *   the binding does not necessarily correspond to the order of the resulting back end creation
	 *   requests.
	 * @param {object} [mParameters]
	 *   A map of parameters as specified for {@link sap.ui.model.odata.v2.ODataModel#createEntry},
	 *   where only the subset given below is supported. In case of deep create, <b>none</b> of the
	 *   parameters in <code>mParameters</code> must be set.
	 * @param {string} [mParameters.changeSetId]
	 *   The ID of the <code>ChangeSet</code> that this request should belong to
	 * @param {function} [mParameters.error]
	 *   The error callback function
	 * @param {string} [mParameters.expand]
	 *   A comma-separated list of navigation properties to be expanded for the newly created
	 *   entity; see {@link sap.ui.model.odata.v2.ODataModel#createEntry}; <b>Note:</b> if no expand
	 *   parameter is given, the expand parameter of this binding is used; see
	 *   {@link sap.ui.model.odata.v2.ODataModel#bindList}
	 * @param {string} [mParameters.groupId]
	 *   The ID of a request group; requests belonging to the same group will be bundled in one
	 *   batch request
	 * @param {boolean} [mParameters.inactive]
	 *   Whether the created context is inactive. An inactive context will only be sent to the
	 *   server when it has become active after a property update. From then on it behaves like any
	 *   other created context.<br>
	 *   When a property update happens on an inactive context, the
	 *   {@link sap.ui.model.odata.v2.ODataListBinding#event:createActivate 'createActivate'} event
	 *   is fired, and the context becomes active, unless the event handler prevents this. While
	 *   inactive, the context does not count as a
	 *   {@link sap.ui.model.odata.v2.ODataModel#hasPendingChanges pending change} and does not
	 *   contribute to the {@link #getCount count}.
	 * @param {function} [mParameters.success]
	 *   The success callback function
	 * @returns {sap.ui.model.odata.v2.Context}
	 *   The context representing the created entity
	 * @throws {Error}
	 *   If
	 *   <ul>
	 *   <li>a relative binding is unresolved,</li>
	 *   <li>the binding's context is transient and any parameter is set in
	 *     <code>mParameters</code>,</li>
	 *   <li><code>bAtEnd</code> is truthy and the binding's length is not final,</li>
	 *   <li>the collection data has been read via <code>$expand</code> together with the parent
	 *     entity,</li>
	 *   <li>the metadata is not yet available,</li>
	 *   <li>there are unsupported parameters in the given parameters map.</li>
	 *   </ul>
	 *   See {@link sap.ui.model.odata.v2.ODataModel#createEntry} for additional errors thrown.
	 *
	 * @public
	 * @since 1.98.0
	 */
	ODataListBinding.prototype.create = function (oInitialData, bAtEnd, mParameters) {
		var oCreatedContext, oCreatedContextsCache, sResolvedPath,
			mCreateParameters = {
				context : this.oContext,
				properties : oInitialData
			},
			bCreationAreaAtEnd = this.isFirstCreateAtEnd();

		bAtEnd = !!bAtEnd;
		if (bCreationAreaAtEnd === undefined) {
			bCreationAreaAtEnd = bAtEnd;
		}
		if (bCreationAreaAtEnd && !this.bLengthFinal) {
			throw new Error("Must know the final length to create at the end");
		}
		Object.keys(mParameters || {}).forEach(function (sParameterKey) {
			if (!aCreateParametersAllowlist.includes(sParameterKey)) {
				throw new Error("Parameter '" + sParameterKey + "' is not supported");
			}
		});
		if (this.bUseExpandedList) {
			throw new Error("The collection has been read via $expand while reading the parent"
				+ " entity");
		}
		if (!this.oModel.oMetadata.isLoaded()) {
			throw new Error("Metadata is not loaded");
		}

		sResolvedPath = this.getResolvedPath();
		oCreatedContextsCache = this.oModel._getCreatedContextsCache();
		Object.assign(mCreateParameters, mParameters);
		if (!this._hasTransientParentContext()) {
			mCreateParameters.refreshAfterChange = false;
			if (!("expand" in mCreateParameters) && this.mParameters) {
				mCreateParameters.expand = this.mParameters.expand;
			}
		}
		oCreatedContext = this.oModel.createEntry(this.sPath, mCreateParameters);
		oCreatedContextsCache.addContext(oCreatedContext, sResolvedPath,
			this.sCreatedEntitiesKey, bAtEnd);
		if (mCreateParameters.inactive) {
			oCreatedContext.fetchActivationStarted()
				.then(this.fireCreateActivate.bind(this, oCreatedContext))
				.catch(this.oModel.getReporter(sClassName));
		}
		this._fireChange({reason : ChangeReason.Add});

		return oCreatedContext;
	};

	/**
	 * Requests a {@link sap.ui.model.Filter} object which can be used to filter the list binding by
	 * entries with model messages. With the filter callback, you can define if a message is
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
	 *   messages, except in the following cases:
	 *   <ul>
	 *     <li> If only transient entries have messages, it resolves with {@link sap.ui.model.Filter.NONE}
	 *     <li> If the binding is not resolved or if there is no message for any entry, it resolves with
	 *     <code>null</code>
	 *   </ul>
	 *
	 * @protected
	 * @since 1.77.0
	 */
	ODataListBinding.prototype.requestFilterForMessages = function (fnFilter) {
		var sDeepPath = this.sDeepPath,
			oFilter = null,
			aFilters = [],
			aPredicateSet = new Set(),
			sResolvedPath = this.getResolvedPath(),
			bTransientMatched = false,
			that = this;

		function isNonTransientTarget(sFullTarget) {
			return aCreatedContextDeepPaths
				.every((sCreatedContextDeepPath) => !sFullTarget.startsWith(sCreatedContextDeepPath));
		}

		if (!sResolvedPath) {
			return Promise.resolve(null);
		}

		const aCreatedContextDeepPaths = this._getCreatedContexts()
			.map((oCreatedContext) => oCreatedContext.getDeepPath());
		this.oModel.getMessagesByPath(sDeepPath, true).forEach(function (oMessage) {
			var sPredicate;

			if (!fnFilter || fnFilter(oMessage)) {
				// this.oModel.getMessagesByPath returns only messages with full target starting with deep path
				oMessage.aFullTargets.forEach(function (sFullTarget) {
					if (sFullTarget.startsWith(sDeepPath)) {
						if (isNonTransientTarget(sFullTarget)) {
							sPredicate = sFullTarget.slice(sDeepPath.length).split("/")[0];
							if (sPredicate) {
								aPredicateSet.add(sPredicate);
							}
						} else {
							bTransientMatched = true;
						}
					}
				});
			}
		});
		aPredicateSet.forEach(function (sPredicate) {
			aFilters.push(that._getFilterForPredicate(sPredicate));
		});

		if (aFilters.length === 1) {
			oFilter = aFilters[0];
		} else if (aFilters.length > 1) {
			oFilter = new Filter({filters : aFilters});
		} else if (bTransientMatched) {
			oFilter = Filter.NONE;
		} // else oFilter = null

		return Promise.resolve(oFilter);
	};

	/**
	 * Returns whether the overall position of created entries is at the end of the list; this is
	 * determined by the first call to {@link sap.ui.model.odata.v2.ODataListBinding#create}.
	 *
	 * @returns {boolean|undefined}
	 *   Whether the overall position of created contexts is at the end, or <code>undefined</code>
	 *   if there are no created contexts
	 *
	 * @public
	 * @since 1.98.0
	 */
	ODataListBinding.prototype.isFirstCreateAtEnd = function () {
		return this.oModel._getCreatedContextsCache()
			.isAtEnd(this.getResolvedPath(), this.sCreatedEntitiesKey);
	};

	/**
	 * Gets the array of contexts for created entities, created via {@link #create}.
	 *
	 * @returns {sap.ui.model.odata.v2.Context[]} The array of contexts for created entities
	 *
	 * @private
	 */
	ODataListBinding.prototype._getCreatedContexts = function () {
		return this.oModel._getCreatedContextsCache()
			.getContexts(this.getResolvedPath(), this.sCreatedEntitiesKey);
	};

	/**
	 * Gets an object with the values for system query options $skip and $top based on the given
	 * start index (from control point of view), length and maximum prefetch size. The number of
	 * entities created via {@link #create} is considered for the <code>$skip</code> value if
	 * created at the beginning, but it is not considered for the <code>$top</code> value.
	 *
	 * @param {number} iStartIndex The start index from control point of view
	 * @param {number} iLength The length
	 * @param {number} iMaximumPrefetchSize
	 *   The maximum number of contexts to read before and after the given range
	 * @returns {object}
	 *   An object containing the properties <code>skip</code> and <code>top</code>; the values
	 *   correspond to the system query options <code>$skip</code> and <code>$top</code>.
	 *   <code>undefined</code>, if no read is required.
	 *
	 * @private
	 */
	ODataListBinding.prototype._getSkipAndTop = function (iStartIndex, iLength,
			iMaximumPrefetchSize) {
		var oInterval, aIntervals,
			aCreatedContexts = this._getCreatedContexts(),
			bFirstCreateAtStart = this.isFirstCreateAtEnd() === false,
			aKeys = bFirstCreateAtStart && this.aKeys.length
				? aCreatedContexts.concat(this.aKeys)
				: this.aKeys,
			iLimit = this.bLengthFinal ? this.iLength : undefined;

		if (bFirstCreateAtStart && iLimit) {
			// when adding the created contexts to aKeys the final length has to be increased too
			iLimit += aCreatedContexts.length;
		}

		aIntervals = ODataUtils._getReadIntervals(aKeys, iStartIndex, iLength, iMaximumPrefetchSize, iLimit);
		oInterval = ODataUtils._mergeIntervals(aIntervals);

		if (oInterval && bFirstCreateAtStart && this.aKeys.length) {
			oInterval.start -= aCreatedContexts.length;
			oInterval.end -= aCreatedContexts.length;
		}

		return oInterval && {skip : oInterval.start, top : oInterval.end - oInterval.start};
	};

	/**
	 * Removes and returns the persisted created entities for this binding.
	 *
	 * @returns {sap.ui.model.odata.v2.Context[]}
	 *   An array of persisted contexts that have been removed from the created contexts cache
	 *
	 * @private
	 */
	ODataListBinding.prototype._removePersistedCreatedContexts = function () {
	   return this.oModel._getCreatedContextsCache()
		   .removePersistedContexts(this.getResolvedPath(), this.sCreatedEntitiesKey);
   };

	/**
	 * Returns the count of active entries in the list if the list length is final, otherwise
	 * <code>undefined</code>. Contrary to {#getLength}, this method does not consider inactive
	 * entries which are created via {#create}.
	 *
	 * @returns {number|undefined} The count of entries
	 *
	 * @public
	 * @see #create
	 * @see #getLength
	 * @see #isLengthFinal
	 * @see sap.ui.model.odata.v2.Context#isInactive
	 * @since 1.98.0
	 */
	ODataListBinding.prototype.getCount = function () {
	   if (!this.isLengthFinal()) {
		   return undefined;
	   }

	   return this.getLength() - this._getCreatedContexts().filter(function (oContext) {
			   return oContext.isInactive();
		   }).length;
   };

	/**
	 * Returns whether this binding is relative and has a transient parent context.
	 *
	 * @returns {boolean} Whether this binding is relative and has a transient parent context
	 *
	 * @private
	 */
	ODataListBinding.prototype._hasTransientParentContext = function () {
		return this.isRelative()
			&& !!(this.oContext && this.oContext.isTransient && this.oContext.isTransient());
	};

	/**
	 * Returns whether this binding is relative and has a transient parent context which has no
	 * sub-contexts for this binding.
	 *
	 * @returns {boolean}
	 *   Whether this binding is relative and has a transient parent context which has no
	 *   sub-contexts for this binding
	 *
	 * @private
	 */
	ODataListBinding.prototype._hasTransientParentWithoutSubContexts = function () {
	   return this._hasTransientParentContext() && !this._getCreatedContexts().length;
   };

	/**
	 * Returns whether this list binding uses the expanded list data.
	 *
	 * @returns {boolean} Whether this list binding uses the expanded list data
	 *
	 * @private
	 */
	ODataListBinding.prototype._isExpandedListUsable = function () {
		if (this.mCustomParams
			|| (this.sOperationMode === OperationMode.Server
				&& (this.aApplicationFilters.length > 0 || this.aFilters.length > 0
					|| this.aSorters.length > 0))) {
			return false;
		}
		return true;
	};

	/**
	 * Refreshes a list binding if the list binding's entity type is contained in
	 * <code>oAffectedEntityTypes</code> and if the list binding is not using the expanded list
	 * data.
	 *
	 * @param {Set<object>} oAffectedEntityTypes
	 *   Set of entity types that are affected by side-effects requests
	 * @param {string} [sGroupId]
	 *   The ID of a request group
	 * @returns {boolean}
	 *   Whether the list binding is affected by the side effect
	 *
	 * @private
	 */
	ODataListBinding.prototype._refreshForSideEffects = function (oAffectedEntityTypes, sGroupId) {
		var bIsAffected = !this._hasTransientParentContext() && oAffectedEntityTypes.has(this.oEntityType);

		if (bIsAffected && !this._isExpandedListUsable()) {
			this.sRefreshGroupId = sGroupId;
			this._refresh();
			this.sRefreshGroupId = undefined;
		}
		return bIsAffected;
	};

	/**
	 * Assigns the "createActivate"-event to all already existing inactive contexts which belong to
	 * this binding.
	 *
	 * @private
	 */
	ODataListBinding.prototype._reassignCreateActivate = function () {
		var that = this;

		this._getCreatedContexts().forEach(function (oContext) {
			if (oContext.isInactive()) {
				oContext.fetchActivationStarted()
					.then(that.fireCreateActivate.bind(that, oContext))
					.catch(that.oModel.getReporter(sClassName));
			}
		});
	};

	/**
	 * Fires the 'createActivate' event and deactivates the given context in case the application's event handler
	 * calls <code>preventDefault</code> on the event.
	 *
	 * @param {sap.ui.model.odata.v2.Context} oContext
	 *   The context which is activated
	 *
	 * @private
	 */
	ODataListBinding.prototype.fireCreateActivate = function (oContext) {
		if (!this.bIsBeingDestroyed) {
			if (this.fireEvent("createActivate", {context : oContext}, /*bAllowPreventDefault*/true)) {
				oContext.finishActivation();
				this._fireChange({reason : ChangeReason.Change});
			} else {
				oContext.cancelActivation();
				oContext.fetchActivationStarted()
					.then(this.fireCreateActivate.bind(this, oContext))
					.catch(this.oModel.getReporter(sClassName));
			}
		}
	};

	return ODataListBinding;
});