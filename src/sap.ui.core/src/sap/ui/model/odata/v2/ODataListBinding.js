/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v2.ODataListBinding
sap.ui.define([
	'sap/ui/model/Context',
	'sap/ui/model/FilterType',
	'sap/ui/model/ListBinding',
	'sap/ui/model/odata/ODataUtils',
	'sap/ui/model/odata/CountMode',
	'sap/ui/model/odata/Filter',
	'sap/ui/model/odata/OperationMode',
	'sap/ui/model/ChangeReason',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterProcessor',
	'sap/ui/model/Sorter',
	'sap/ui/model/SorterProcessor',
	"sap/base/util/uid",
	"sap/base/util/deepEqual",
	"sap/base/Log",
	"sap/base/assert",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/isEmptyObject"
],
		function(
			Context,
			FilterType,
			ListBinding,
			ODataUtils,
			CountMode,
			ODataFilter,
			OperationMode,
			ChangeReason,
			Filter,
			FilterProcessor,
			Sorter,
			SorterProcessor,
			uid,
			deepEqual,
			Log,
			assert,
			jQuery,
			isEmptyObject
		) {
	"use strict";


	/**
	 * @class
	 * List binding implementation for OData format.
	 *
	 * @param {sap.ui.model.odata.v2.ODataModel} oModel Model that this list binding belongs to
	 * @param {string} sPath Path into the model data, relative to the given <code>oContext</code>
	 * @param {sap.ui.model.Context} oContext Context that the <code>sPath</code> is based on
	 * @param {sap.ui.model.Sorter|sap.ui.model.Sorter[]} [aSorters] Initial sort order, can be either a sorter or an array of sorters
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} [aFilters] Predefined filters, can be either a filter or an array of filters
	 * @param {map} [mParameters] A map which contains additional parameters for the binding
	 * @param {string} [mParameters.expand] Value for the OData <code>$expand</code> query parameter which should be included in the request
	 * @param {string} [mParameters.select] Value for the OData <code>$select</code> query parameter which should be included in the request
	 * @param {map} [mParameters.custom] An optional map of custom query parameters. Custom parameters must not start with <code>$</code>
	 * @param {sap.ui.model.odata.CountMode} [mParameters.countMode] Defines the count mode of this binding;
	 *           if not specified, the default count mode of the <code>oModel</code> is applied
	 * @param {sap.ui.model.odata.OperationMode} [mParameters.operationMode] Defines the operation mode of this binding
	 * @param {boolean} [mParameters.faultTolerant] Turns on the fault tolerance mode, data is not reset if a back-end request returns an error
	 * @param {string} [mParameters.batchGroupId] Sets the batch group ID to be used for requests originating from this binding
	 * @param {int} [mParameters.threshold] Threshold that defines how many entries should be fetched at least
	 *                                      by the binding if <code>operationMode</code> is set to <code>Auto</code>
	 *                                      (See documentation for {@link sap.ui.model.odata.OperationMode.Auto})
	 * @param {boolean} [mParameters.usePreliminaryContext] Whether a preliminary Context will be used
	 * @public
	 * @alias sap.ui.model.odata.v2.ODataListBinding
	 * @extends sap.ui.model.ListBinding
	 */
	var ODataListBinding = ListBinding.extend("sap.ui.model.odata.v2.ODataListBinding", /** @lends sap.ui.model.odata.v2.ODataListBinding.prototype */ {

		constructor : function(oModel, sPath, oContext, aSorters, aFilters, mParameters) {
			ListBinding.apply(this, arguments);

			this.sFilterParams = null;
			this.sSortParams = null;
			this.sRangeParams = null;
			this.sCustomParams = this.oModel.createCustomParams(this.mParameters);
			this.mCustomParams = mParameters && mParameters.custom;
			this.iStartIndex = 0;
			this.iLength = 0;
			this.bPendingChange = false;
			this.aAllKeys = null;
			this.aKeys = [];
			this.sCountMode = (mParameters && mParameters.countMode) || this.oModel.sDefaultCountMode;
			this.sOperationMode = (mParameters && mParameters.operationMode) || this.oModel.sDefaultOperationMode;
			this.bCreatePreliminaryContext = (mParameters && mParameters.createPreliminaryContext) || oModel.bPreliminaryContext;
			this.bUsePreliminaryContext = (mParameters && mParameters.usePreliminaryContext) || oModel.bPreliminaryContext;
			this.bRefresh = false;
			this.bNeedsUpdate = false;
			this.bDataAvailable = false;
			this.bIgnoreSuspend = false;
			this.bPendingRefresh = false;
			this.sGroupId = undefined;
			this.sRefreshGroupId = undefined;
			this.bLengthRequested = false;
			this.bUseExtendedChangeDetection = true;
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

			// check filter integrity
			this.oModel.checkFilterOperation(this.aApplicationFilters);

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

			var bUseExpandedList = this.checkExpandedList();
			if (!bUseExpandedList) {
				this.resetData();
			}
		},

		metadata : {
			publicMethods : [
			                 "getLength"
			                 ]
		}

	});

	/**
	 * Return contexts for the list.
	 *
	 * @param {int} [iStartIndex] The start index of the requested contexts
	 * @param {int} [iLength] The requested amount of contexts
	 * @param {int} [iThreshold] The threshold value
	 * @return {sap.ui.model.Context[]} The array of contexts for each row of the bound list
	 * @protected
	 */
	ODataListBinding.prototype.getContexts = function(iStartIndex, iLength, iThreshold) {

		if (this.bInitial) {
			return [];
		}

		// OperationMode.Auto: handle synchronized count to check what the actual internal operation mode should be
		// but only when using CountMode.Request or Both.
		if (!this.bLengthFinal && this.sOperationMode == OperationMode.Auto && (this.sCountMode == CountMode.Request || this.sCountMode == CountMode.Both)) {
			if (!this.bLengthRequested) {
				this._getLength();
				this.bLengthRequested = true;
			}
			return [];
		}

		//get length
		if (!this.bLengthFinal && !this.bPendingRequest && !this.bLengthRequested) {
			this._getLength();
			this.bLengthRequested = true;
		}

		//this.bInitialized = true;
		this.iLastLength = iLength;
		this.iLastStartIndex = iStartIndex;
		this.iLastThreshold = iThreshold;

		//	Set default values if startindex, threshold or length are not defined
		if (!iStartIndex) {
			iStartIndex = 0;
		}
		if (!iLength) {
			iLength = this.oModel.iSizeLimit;
			if (this.bLengthFinal && this.iLength < iLength) {
				iLength = this.iLength;
			}
		}
		if (!iThreshold) {
			iThreshold = 0;
		}

		// re-set the threshold in OperationMode.Auto
		// between binding-treshold and the threshold given as an argument, the bigger one will be taken
		if (this.sOperationMode == OperationMode.Auto) {
			if (this.iThreshold >= 0) {
				iThreshold = Math.max(this.iThreshold, iThreshold);
			}
		}

		var bLoadContexts = true,
		aContexts = this._getContexts(iStartIndex, iLength),
		aContextData = [],
		oMissingSection;

		if (this.useClientMode()) {
			if (!this.aAllKeys && !this.bPendingRequest && this.oModel.getServiceMetadata()) {
				this.loadData();
				aContexts.dataRequested = true;
			}
		} else {
			oMissingSection = this.calculateSection(iStartIndex, iLength, iThreshold, aContexts);
			bLoadContexts = aContexts.length !== iLength || oMissingSection.length > 0;

			// check if metadata are already available
			if (this.oModel.getServiceMetadata()) {
				// If rows are missing send a request
				if (!this.bPendingRequest && oMissingSection.length > 0 && bLoadContexts) {
					this.loadData(oMissingSection.startIndex, oMissingSection.length);
					aContexts.dataRequested = true;
				}
			}
		}

		if (this.bRefresh) {
			this.bRefresh = false;
		} else {
			// Do not create context data and diff in case of refresh, only if real data has been received
			// The current behaviour is wrong and makes diff detection useless for OData in case of refresh
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
			this.aLastContextData = aContextData.slice(0);
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
	 * @private
	 */
	ODataListBinding.prototype.getEntryKey = function(oContext) {
		return oContext.getPath();
	};

	/**
	 * Returns the entry data as required for change detection/diff.
	 *
	 * This is a JSON serialization of the entity, in case select/expand were used with only the selected/expanded parts.
	 *
	 * @private
	 */
	ODataListBinding.prototype.getEntryData = function(oContext) {
		return JSON.stringify(oContext.getObject(this.mParameters));
	};

	/**
	 * Return contexts for the list.
	 *
	 * @param {int} [iStartIndex=0] The start index of the requested contexts
	 * @param {int} [iLength] The requested amount of contexts
	 *
	 * @return {Array} The contexts array
	 * @private
	 */
	ODataListBinding.prototype._getContexts = function(iStartIndex, iLength) {
		var aContexts = [],
		oContext,
		sKey;

		if (!iStartIndex) {
			iStartIndex = 0;
		}
		if (!iLength) {
			iLength = this.oModel.iSizeLimit;
			if (this.bLengthFinal && this.iLength < iLength) {
				iLength = this.iLength;
			}
		}

		//	Loop through known data and check whether we already have all rows loaded
		for (var i = iStartIndex; i < iStartIndex + iLength; i++) {
			sKey = this.aKeys[i];
			if (!sKey) {
				break;
			}
			oContext = this.oModel.getContext('/' + sKey, this.oModel.resolveDeep(this.sPath, this.oContext) + sKey.substr(sKey.indexOf("(")));
			aContexts.push(oContext);

		}

		return aContexts;
	};

	/**
	 * Calculates a missing section inside the binding's data array.
	 * The result is an object containing the first missing index (startIndex),
	 * and the number of missing entries (length).
	 *
	 * The given threshold is prependend and appended before/after the given iStartIndex
	 * and iLength.
	 *
	 * @param {int} iStartIndex The start index of the requested contexts
	 * @param {int} iLength The requested amount of contexts
	 * @param {int} iThreshold The threshold value
	 * @returns {object} oMissingSection The section object;
	 * @private
	 */
	ODataListBinding.prototype.calculateSection = function(iStartIndex, iLength, iThreshold) {
		// prepend threshold to start
		if (iStartIndex >= iThreshold) {
			iStartIndex -= iThreshold;
			iLength += iThreshold;
		} else {
			iLength += iStartIndex;
			iStartIndex = 0;
		}

		// append threshold to end
		iLength += iThreshold;
		if (this.bLengthFinal && iStartIndex + iLength > this.iLength) {
			iLength = this.iLength - iStartIndex;
		}

		// search start of first gap
		while (iLength && this.aKeys[iStartIndex]) {
			iStartIndex += 1;
			iLength -= 1;
		}

		// search end of last gap
		while (iLength && this.aKeys[iStartIndex + iLength - 1]) {
			iLength -= 1;
		}

		return {
			startIndex : iStartIndex,
			length : iLength
		};
	};

	/**
	 * Setter for context.
	 * @param {Object} oContext The new context object
	 */
	ODataListBinding.prototype.setContext = function(oContext) {
		var sResolvedPath,
			bCreated = oContext && oContext.bCreated,
			bForceUpdate = oContext && oContext.isRefreshForced(),
			bUpdated = oContext && oContext.isUpdated(),
			bPreliminary = oContext && oContext.isPreliminary();

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

			this.oContext = oContext;

			sResolvedPath = this.oModel.resolve(this.sPath, this.oContext);
			this.sDeepPath = this.oModel.resolveDeep(this.sPath, this.oContext);

			if (!this._checkPathType()) {
				Log.error("List Binding is not bound against a list for " + sResolvedPath);
			}


			// If path does not resolve or parent context is created, reset current list
			if (!sResolvedPath || bCreated) {
				if (this.aAllKeys || this.aKeys.length > 0 || this.iLength > 0) {
					this.aAllKeys = null;
					this.aKeys = [];
					this.iLength = 0;
					this.bLengthFinal = true;
					this._fireChange({ reason: ChangeReason.Context });
				}
				return;
			}

			// get new entity type with new context and init filters now correctly
			this._initSortersFilters();

			if (this.checkExpandedList() && !bForceUpdate) {
				// if there are pending requests e.g. previous context requested data which returns null
				// the pending requests need to be aborted such that the responded (previous) data doesn't overwrite the current one
				this.abortPendingRequest();
				this._fireChange({ reason: ChangeReason.Context });
			} else {
				this._refresh();
			}
		}
	};

	/**
	 * Check whether expanded list data is available and can be used
	 *
	 * @private
	 * @param {boolean} bSkipReloadNeeded Don't check whether reload of expanded data is needed
	 * @return {boolean} Whether expanded data is available and will be used
	 */
	ODataListBinding.prototype.checkExpandedList = function(bSkipReloadNeeded) {
		// if nested list is already available and no filters or sorters are set, use the data and don't send additional requests
		// $expand loads all associated entities, no paging parameters possible, so we can safely assume all data is available
		var bResolves = !!this.oModel.resolve(this.sPath, this.oContext),
			oRef = this.oModel._getObject(this.sPath, this.oContext);

		if (!bResolves || oRef === undefined || this.mCustomParams ||
		    (this.sOperationMode === OperationMode.Server && (this.aApplicationFilters.length > 0 || this.aFilters.length > 0 || this.aSorters.length > 0))) {
			this.bUseExpandedList = false;
			this.aExpandRefs = undefined;
			return false;
		} else {
			this.bUseExpandedList = true;
			if (Array.isArray(oRef)) {
				// For performance, only check first and last entry, whether reload is needed
				if (!bSkipReloadNeeded && (this.oModel._isReloadNeeded("/" + oRef[0], this.mParameters) || this.oModel._isReloadNeeded("/" + oRef[oRef.length - 1], this.mParameters))) {
					this.bUseExpandedList = false;
					this.aExpandRefs = undefined;
					return false;
				}
				this.aExpandRefs = oRef;
				this.aAllKeys = oRef;
				this.iLength = oRef.length;
				this.bLengthFinal = true;
				this.bDataAvailable = true;
				// ensure sorters/filters for an expanded list are initialized
				this._initSortersFilters();
				this.applyFilter();
				this.applySort();
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
		return (this.sOperationMode === OperationMode.Client ||
			this.sOperationMode === OperationMode.Auto && !this.bThresholdRejected ||
			this.sOperationMode !== OperationMode.Server && this.bUseExpandedList);
	};

	/**
	 * Load data from model.
	 *
	 * @param {int} iStartIndex The start index
	 * @param {int} iLength The count of data to be requested
	 * Load list data from the server
	 * @private
	 */
	ODataListBinding.prototype.loadData = function(iStartIndex, iLength) {

		var that = this,
		bInlineCountRequested = false,
		sGuid = uid(),
		sGroupId;

		// create range parameters and store start index for sort/filter requests
		if (iStartIndex || iLength) {
			this.sRangeParams = "$skip=" + iStartIndex + "&$top=" + iLength;
			this.iStartIndex = iStartIndex;
		} else {
			iStartIndex = this.iStartIndex;
		}

		// create the request url
		// $skip/$top and are excluded for OperationMode.Client and Auto if the threshold was sufficient
		var aParams = [];
		if (this.sRangeParams && !this.useClientMode()) {
			aParams.push(this.sRangeParams);
		}
		if (this.sSortParams) {
			aParams.push(this.sSortParams);
		}
		// When in OperationMode.Auto, the filters are excluded and applied clientside,
		// except when the threshold was rejected, and the binding will internally run in Server Mode
		if (this.sFilterParams && !this.useClientMode()) {
			aParams.push(this.sFilterParams);
		}
		if (this.sCustomParams) {
			aParams.push(this.sCustomParams);
		}
		if (this.sCountMode == CountMode.InlineRepeat ||
			!this.bLengthFinal &&
			(this.sCountMode === CountMode.Inline ||
			 this.sCountMode === CountMode.Both)) {
			aParams.push("$inlinecount=allpages");
			bInlineCountRequested = true;
		}

		function fnSuccess(oData) {

			// update iLength (only when the inline count was requested and is available)
			if (bInlineCountRequested && oData.__count !== undefined) {
				that.iLength = parseInt(oData.__count);
				that.bLengthFinal = true;

				// in the OpertionMode.Auto, we check if the count is LE than the given threshold (which also was requested!)
				if (that.sOperationMode == OperationMode.Auto) {
					if (that.iLength <= that.mParameters.threshold) {
						//the requested data is enough to satisfy the threshold
						that.bThresholdRejected = false;
					} else {
						that.bThresholdRejected = true;

						//clean up successful request
						delete that.mRequestHandles[sGuid];
						that.bPendingRequest = false;

						// If request is originating from this binding, change must be fired afterwards
						that.bNeedsUpdate = true;

						// return since we can't do anything here anymore,
						// we have to trigger the loading again, this time with application filters
						return;
					}
				}
			}

			if (that.useClientMode()) {
				// For clients mode, store all keys separately and set length to final
				that.aKeys = [];
				jQuery.each(oData.results, function(i, entry) {
					that.aKeys[i] = that.oModel._getKey(entry);
				});
				that.updateExpandedList(that.aKeys);
				that.aAllKeys = that.aKeys.slice();
				that.iLength = that.aKeys.length;
				that.bLengthFinal = true;
				that.applyFilter();
				that.applySort();
			} else {
				// For server mode, update data and or length dependent on the current result
				if (oData.results.length > 0) {
					// Collecting contexts, after the $inlinecount was evaluated, so we do not have to clear it again when
					// the Auto modes initial threshold <> count check failed.
					jQuery.each(oData.results, function(i, entry) {
						that.aKeys[iStartIndex + i] = that.oModel._getKey(entry);
					});

					// if we got data and the results + startindex is larger than the
					// length we just apply this value to the length
					if (that.iLength < iStartIndex + oData.results.length) {
						that.iLength = iStartIndex + oData.results.length;
						that.bLengthFinal = false;
					}

					// if less entries are returned than have been requested
					// set length accordingly
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
			}

			delete that.mRequestHandles[sGuid];
			that.bPendingRequest = false;

			// If request is originating from this binding, change must be fired afterwards
			that.bNeedsUpdate = true;
			that.bIgnoreSuspend = true;

			//register datareceived call as  callAfterUpdate
			that.oModel.callAfterUpdate(function() {
				that.fireDataReceived({data: oData});
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

		var sPath = this.sPath;

		if (this.isRelative()){
			sPath = this.oModel.resolve(this.sPath, this.oContext);
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
			this.mRequestHandles[sGuid] = this.oModel.read(this.sPath, {
				_refresh: this.bRefresh,
				context: this.oContext,
				groupId: sGroupId,
				urlParameters: aParams,
				success: fnSuccess,
				error: fnError,
				canonicalRequest: this.bCanonicalRequest
			});
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
		// If length is not final and larger than zero, add some additional length to enable
		// scrolling/paging for controls that only do this if more items are available
		if (this.bLengthFinal || this.iLength == 0) {
			return this.iLength;
		} else {
			var iAdditionalLength = this.iLastThreshold || this.iLastLength || 10;
			return this.iLength + iAdditionalLength;
		}
	};

	/**
	 * Return the length of the list.
	 *
	 * @private
	 */
	ODataListBinding.prototype._getLength = function() {
		var that = this;
		var sGroupId;

		if (this.sCountMode !== CountMode.Request && this.sCountMode !== CountMode.Both) {
			return;
		}

		// create a request object for the data request
		// In OperationMode.Auto we explicitly omitt the filters for the count,
		// filters will be applied afterwards on the client if count comes under the threshold
		var aParams = [];
		if (this.sFilterParams && this.sOperationMode != OperationMode.Auto) {
			aParams.push(this.sFilterParams);
		}

		// use only custom params for count and not expand,select params
		if (this.mParameters && this.mParameters.custom) {
			var oCust = { custom: {}};
			jQuery.each(this.mParameters.custom, function (sParam, oValue) {
				oCust.custom[sParam] = oValue;
			});
			aParams.push(this.oModel.createCustomParams(oCust));
		}

		function _handleSuccess(oData) {
			that.iLength = parseInt(oData);
			that.bLengthFinal = true;
			that.bLengthRequested = true;
			that.oCountHandle = null;

			// in the OpertionMode.Auto, we check if the count is LE than the given threshold and set the client operation flag accordingly
			if (that.sOperationMode == OperationMode.Auto) {
				if (that.iLength <= that.mParameters.threshold) {
					that.bThresholdRejected = false;
				} else {
					that.bThresholdRejected = true;
				}
				// fire change because of synchronized $count
				that._fireChange({reason: ChangeReason.Change});
			}
		}

		function _handleError(oError) {
			delete that.mRequestHandles[sPath];
			var sErrorMsg = "Request for $count failed: " + oError.message;
			if (oError.response){
				sErrorMsg += ", " + oError.response.statusCode + ", " + oError.response.statusText + ", " + oError.response.body;
			}
			Log.warning(sErrorMsg);
		}

		// Use context and check for relative binding
		var sPath = this.oModel.resolve(this.sPath, this.oContext);

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
	 * Refreshes the binding, check whether the model data has been changed and fire change event
	 * if this is the case. For server side models this should refetch the data from the server.
	 * To update a control, even if no data has been changed, e.g. to reset a control after failed
	 * validation, use the parameter <code>bForceUpdate</code>.
	 *
	 * @param {boolean} [bForceUpdate] Update the bound control even if no data has been changed
	 * @param {string} [sGroupId] The group Id for the refresh
	 *
	 * @public
	 */
	ODataListBinding.prototype.refresh = function(bForceUpdate, sGroupId) {
		if (typeof bForceUpdate === "string") {
			sGroupId = bForceUpdate;
			bForceUpdate = false;
		}
		this.sRefreshGroupId = sGroupId;
		this._refresh(bForceUpdate);
		this.sRefreshGroupId = undefined;
	};

	/**
	 * @private
	 */
	ODataListBinding.prototype._refresh = function(bForceUpdate, mChangedEntities, mEntityTypes) {
		var bChangeDetected = false,
			bCreatedRelative = this.isRelative() && this.oContext && this.oContext.bCreated;

		if (bCreatedRelative) {
			return;
		}

		this.bPendingRefresh = false;

		if (!bForceUpdate) {
			if (mEntityTypes){
				var sResolvedPath = this.oModel.resolve(this.sPath, this.oContext);
				if (sResolvedPath) {
					var oEntityType = this.oModel.oMetadata._getEntityTypeByPath(sResolvedPath);
					if (oEntityType && (oEntityType.entityType in mEntityTypes)) {
						bChangeDetected = true;
					}
				}
			}
			if (mChangedEntities && !bChangeDetected) {
				jQuery.each(this.aKeys, function(i, sKey) {
					if (sKey in mChangedEntities) {
						bChangeDetected = true;
						return false;
					}
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
			this.abortPendingRequest(true);
			this.resetData();
			this._fireRefresh({reason: ChangeReason.Refresh});
		}
	};

	/**
	 * fireRefresh
	 *
	 * @param {map} mParameters Map of event parameters
	 * @private
	 */
	ODataListBinding.prototype._fireRefresh = function(mParameters) {
		if (this.oModel.resolve(this.sPath, this.oContext)) {
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
		var sPath = this.oModel.resolve(this.sPath, this.oContext);

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
		var bCreatedRelative = this.isRelative() && this.oContext && this.oContext.bCreated;
		if (this.oModel.oMetadata && this.oModel.oMetadata.isLoaded() && this.bInitial && !bCreatedRelative) {

			if (!this._checkPathType()) {
				Log.error("List Binding is not bound against a list for " + this.oModel.resolve(this.sPath, this.oContext));
			}

			this.bInitial = false;
			this._initSortersFilters();
			if (!this.bSuspended) {
				if (this.bDataAvailable) {
					this._fireChange({reason: ChangeReason.Change});
				} else {
					this._fireRefresh({reason: ChangeReason.Refresh});
				}
			}
		}
		return this;
	};

	/**
	 * Check whether this Binding would provide new values and in case it changed,
	 * inform interested parties about this.
	 *
	 * @param {boolean} bForceUpdate Force control update
	 * @param {object} mChangedEntities Map of changed entities
	 * @private
	 */
	ODataListBinding.prototype.checkUpdate = function(bForceUpdate, mChangedEntities) {
		var bChangeReason = this.sChangeReason ? this.sChangeReason : ChangeReason.Change,
				bChangeDetected = false,
				oCurrentData,
				that = this,
				aOldRefs;

		if ((this.bSuspended && !this.bIgnoreSuspend && !bForceUpdate) || this.bPendingRequest) {
			return;
		}

		if (this.bInitial) {
			if (this.oContext && this.oContext.isUpdated()) {
				this.initialize(); // If context changed from created to persisted we need to initialize the binding...
			}
			return;
		}

		this.bIgnoreSuspend = false;

		if (!bForceUpdate && !this.bNeedsUpdate) {

			// check if expanded data has been changed
			aOldRefs = this.aExpandRefs;


			var aLastKeys = this.aKeys.slice();
			var bExpandedList = this.checkExpandedList(true);

			// apply sorting and filtering again, as the newly set entities may have changed in clientmode
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
					//iterate over keys from before and after filtering as new keys match the filter or existing keys match not anymore
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
				var aContexts = this._getContexts(this.iLastStartIndex, this.iLastLength, this.iLastThreshold);
				if (this.aLastContexts.length !== aContexts.length) {
					bChangeDetected = true;
				} else {
					jQuery.each(this.aLastContextData, function(iIndex, oLastData) {
						oCurrentData = that.getContextData(aContexts[iIndex]);
						// Compare whether last data is completely contained in current data
						if (oLastData !== oCurrentData) {
							bChangeDetected = true;
							return false;
						}
					});
				}
			}
		}
		if (bForceUpdate || bChangeDetected || this.bNeedsUpdate) {
			this.bNeedsUpdate = false;
			this._fireChange({reason: bChangeReason});
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
		this.bLengthFinal = false;
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
			jQuery.each(this.mRequestHandles, function(sPath, oRequestHandle){
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
	 * @return {string} URL which can be used for downloading
	 * @since 1.24
	 * @public
	 */
	ODataListBinding.prototype.getDownloadUrl = function(sFormat) {
		var aParams = [],
			sPath;

		if (sFormat) {
			aParams.push("$format=" + encodeURIComponent(sFormat));
		}
		if (this.sSortParams) {
			aParams.push(this.sSortParams);
		}
		if (this.sFilterParams) {
			aParams.push(this.sFilterParams);
		}
		if (this.sCustomParams) {
			aParams.push(this.sCustomParams);
		}

		sPath = this.oModel.resolve(this.sPath,this.oContext);

		if (sPath) {
			return this.oModel._createRequestUrl(sPath, null, aParams);
		}
	};

	/**
	 * Sorts the list.
	 *
	 * @param {sap.ui.model.Sorter|sap.ui.model.Sorter[]} aSorters A new sorter or an array of sorters which define the sort order
	 * @param {boolean} [bReturnSuccess=false] Whether the success indicator should be returned instead of <code>this</code>
	 * @return {sap.ui.model.ListBinding} Reference to <code>this</code> to facilitate method chaining or the success indicator
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
					// If no sorters are defined, restore initial sort order by calling applyFilter
					if (aSorters.length == 0) {
						this.applyFilter();
					} else {
						this.applySort();
					}
					this._fireChange({reason: ChangeReason.Sort});
				} else {
					this.sChangeReason = ChangeReason.Sort;
				}
			} else {
				// Only reset the keys, length usually doesn't change when sorting
				this.aKeys = [];
				this.abortPendingRequest(false);
				this.sChangeReason = ChangeReason.Sort;
				this._fireRefresh({reason : this.sChangeReason});
			}
			// TODO remove this if the sort event gets removed which is now deprecated
			this._fireSort({sorter: aSorters});
			bSuccess = true;
		}

		if (bReturnSuccess) {
			return bSuccess;
		} else {
			return this;
		}
	};

	/**
	 * Sets the comparator for each sorter/filter in the array according to the
	 * Edm type of the sort/filter property.
	 * @param bSort Whether a comparator usable for sorting should be returned, where comparison with null returns a valid result.
	 * @private
	 */
	ODataListBinding.prototype.addComparators = function(aEntries, bSort) {
		var oPropertyMetadata, sType,
			oEntityType = this.oEntityType,
			fnCompare;

		if (!oEntityType) {
			Log.warning("Cannot determine sort/filter comparators, as entitytype of the collection is unkown!");
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
	 * The OData comparators return "NaN" for comparisons containing null values. While this is a valid result when used for filtering,
	 * for sorting the null values need to be put in order, so the comparator must return either -1 or 1 instead, to have null sorted
	 * at the top in ascending order and on the bottom in descending order.
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
	 * Does normalize the filter values according to the given Edm type. This is necessary for comparators
	 * to work as expected, even if the wrong JavaScript type is passed to the filter (string vs number)
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
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} aFilters Single filter or array of filter objects
	 * @param {sap.ui.model.FilterType} [sFilterType=Control] Type of the filter which should be adjusted. If it is not given, type <code>Control</code> is assumed
	 * @param {boolean} [bReturnSuccess=false] Whether the success indicator should be returned instead of <code>this</code>
	 * @return {sap.ui.model.ListBinding} Reference to <code>this</code> to facilitate method chaining or a boolean success indicator
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
		this.oModel.checkFilterOperation(aFilters);

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

		this.convertFilters();
		this.oCombinedFilter = FilterProcessor.combineFilters(this.aFilters, this.aApplicationFilters);

		if (!this.useClientMode()) {
			this.createFilterParams(this.oCombinedFilter);
		}

		if (!this.bInitial) {
			this.addComparators(this.aFilters);
			this.addComparators(this.aApplicationFilters);

			if (this.useClientMode()) {
				// apply clientside filters/sorters only if data is available
				if (this.aAllKeys) {
					this.applyFilter();
					this.applySort();
					this._fireChange({reason: ChangeReason.Filter});
				} else {
					this.sChangeReason = ChangeReason.Filter;
				}
			} else {
				this.resetData();
				this.abortPendingRequest(true);
				this.sChangeReason = ChangeReason.Filter;
				this._fireRefresh({reason: this.sChangeReason});
			}
			// TODO remove this if the filter event gets removed which is now deprecated
			if (sFilterType === FilterType.Application) {
				this._fireFilter({filters: this.aApplicationFilters});
			} else {
				this._fireFilter({filters: this.aFilters});
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
	 * Convert sap.ui.model.odata.Filter to sap.ui.model.Filter
	 *
	 * @private
	 */
	ODataListBinding.prototype.convertFilters = function() {
		this.aFilters = this.aFilters.map(function(oFilter) {
			return oFilter instanceof ODataFilter ? oFilter.convert() : oFilter;
		});
		this.aApplicationFilters = this.aApplicationFilters.map(function(oFilter) {
			return oFilter instanceof ODataFilter ? oFilter.convert() : oFilter;
		});
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
		var sResolvedPath = this.oModel.resolve(this.sPath, this.oContext);
		if (!sResolvedPath) {
			return;
		}
		this.oEntityType = this._getEntityType();
		this.addComparators(this.aSorters, true);
		this.addComparators(this.aFilters);
		this.addComparators(this.aApplicationFilters);
		this.convertFilters();
		this.oCombinedFilter = FilterProcessor.combineFilters(this.aFilters, this.aApplicationFilters);

		if (!this.useClientMode()) {
			this.createSortParams(this.aSorters);
			this.createFilterParams(this.oCombinedFilter);
		}
	};

	ODataListBinding.prototype._getEntityType = function(){
		var sResolvedPath = this.oModel.resolve(this.sPath, this.oContext);

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
	ODataListBinding.prototype.checkDataState = function(mPaths) {
		var oDataState = this.getDataState();
		ListBinding.prototype.checkDataState.apply(this, arguments);
		if (this.oModel){
			oDataState.setModelMessages(this.oModel.getMessagesByPath(this.sDeepPath, true));
			ListBinding.prototype._fireDateStateChange.call(this, oDataState);
		}
	};

	return ODataListBinding;
});