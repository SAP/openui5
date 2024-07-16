/*!
 * ${copyright}
 */
/*eslint-disable max-len */
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/each",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterType",
	"sap/ui/model/ListBinding",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/Sorter",
	"sap/ui/model/SorterProcessor"
], function (Log, each, ChangeReason, Filter, FilterType, ListBinding, FilterProcessor, Sorter,
		SorterProcessor) {
	"use strict";

	/**
	 * Creates a new ClientListBinding.
	 *
	 * This constructor should only be called by subclasses or model implementations, not by application or control code.
	 * Such code should use {@link sap.ui.model.Model#bindList Model#bindList} on the corresponding model implementation instead.
	 *
	 * @param {sap.ui.model.Model} oModel Model instance that this binding is created for and that it belongs to
	 * @param {string} sPath Binding path to be used for this binding, syntax depends on the concrete subclass
	 * @param {sap.ui.model.Context} oContext Binding context relative to which a relative binding path will be resolved
	 * @param {sap.ui.model.Sorter[]|sap.ui.model.Sorter} [aSorters=[]]
	 *   The sorters used initially; call {@link #sort} to replace them
	 * @param {sap.ui.model.Filter[]|sap.ui.model.Filter} [aFilters=[]]
	 *   The filters to be used initially with type {@link sap.ui.model.FilterType.Application}; call {@link #filter} to
	 *   replace them
	 * @param {object} [mParameters] Map of optional parameters as defined by subclasses; this class does not introduce any own parameters
	 * @throws {Error} If one of the filters uses an operator that is not supported by the underlying model
	 *   implementation or if the {@link sap.ui.model.Filter.NONE} filter instance is contained in <code>aFilters</code>
	 *   together with other filters
	 *
	 * @class
	 * List binding implementation for client models.
	 *
	 * @alias sap.ui.model.ClientListBinding
	 * @extends sap.ui.model.ListBinding
	 * @protected
	 */
	var ClientListBinding = ListBinding.extend("sap.ui.model.ClientListBinding", /** @lends sap.ui.model.ClientListBinding.prototype */ {

		constructor : function(oModel, sPath, oContext, aSorters, aFilters, mParameters){
			ListBinding.apply(this, arguments);

			this.mNormalizeCache = {};
			this.oModel.checkFilter(this.aApplicationFilters);
			this.oCombinedFilter = FilterProcessor.combineFilters(this.aFilters, this.aApplicationFilters);
			this.bIgnoreSuspend = false;
			// the serialized context data for the contexts returned by the last call of getContexts
			// if extended change detection is enabled
			this.aLastContextData = undefined;
			// the contexts returned by the last call of getContexts if extended change detection is
			// enabled
			this.aLastContexts = undefined;
			// if this.bUseExtendedChangeDetection is true it is the end index calculated from the
			// defaulted values of the given iStartIndex and iLength from the last call of
			// getContexts
			this.iLastEndIndex = undefined;
			// the defaulted value of the given iLength from the last call of getContexts with
			// bKeepCurrent !== true
			this.iLastLength = undefined;
			// the defaulted value of the given iStartIndex from the last call of getContexts with
			// bKeepCurrent !== true
			this.iLastStartIndex = undefined;
			this.update();
		},

		metadata : {}

	});

	/**
	 * Return contexts for the list or a specified subset of contexts
	 * @param {int} [iStartIndex=0] the startIndex where to start the retrieval of contexts
	 * @param {int} [iLength=length of the list] determines how many contexts to retrieve beginning from the start index.
	 * Default is the whole list length.
	 *
	 * @return {Array} the contexts array
	 * @private
	 */
	ClientListBinding.prototype._getContexts = function(iStartIndex, iLength) {
		if (!iStartIndex) {
			iStartIndex = 0;
		}
		if (!iLength) {
			iLength = Math.min(this.iLength, this.oModel.iSizeLimit);
		}

		var iEndIndex = Math.min(iStartIndex + iLength, this.aIndices.length),
		oContext,
		aContexts = [],
		sPrefix = this.getResolvedPath();

		if (sPrefix && !sPrefix.endsWith("/")) {
			sPrefix += "/";
		}

		for (var i = iStartIndex; i < iEndIndex; i++) {
			oContext = this.oModel.getContext(sPrefix + this.aIndices[i]);
			aContexts.push(oContext);
		}

		return aContexts;
	};

	/**
	 * This helper function must be called only by {@link #getContexts}. It updates
	 * <code>iLastStartIndex</code> and <code>iLastLength</code> of the current instance with the
	 * given start index and length. If <code>bKeepCurrent</code> is set, throw an error if keeping
	 * current contexts untouched is not supported, otherwise don't update
	 * <code>iLastStartIndex</code> and <code>iLastLength</code>.
	 *
	 * @param {int} [iStartIndex]
	 *   The start index
	 * @param {int} [iLength]
	 *   The length
	 * @param {int} [iMaximumPrefetchSize]
	 *   Must not be used
	 * @param {boolean} [bKeepCurrent]
	 *   Whether the result of {@link #getCurrentContexts} keeps untouched
	 * @throws {Error}
	 *   If extended change detection is enabled and <code>bKeepCurrent</code> is set, or if
	 *   <code>iMaximumPrefetchSize</code> and <code>bKeepCurrent</code> are set
	 *
	 * @private
	 */
	 ClientListBinding.prototype._updateLastStartAndLength = function (iStartIndex, iLength,
			iMaximumPrefetchSize, bKeepCurrent) {
		if (bKeepCurrent) {
			this._checkKeepCurrentSupported(iMaximumPrefetchSize);
		} else {
			this.iLastStartIndex = iStartIndex;
			this.iLastLength = iLength;
		}
	};

	/**
	 * Returns an array of binding contexts for the bound target list.
	 *
	 * In case of extended change detection, the context array may have an additional
	 * <code>diff</code> property, see
	 * {@link topic:7cdff73f308b4b10bdf7d83b7aba72e7 documentation on extended change detection} for
	 * details.
	 *
	 * <strong>Note:</strong>The public usage of this method is deprecated, as calls from outside of
	 * controls will lead to unexpected side effects. To avoid this, use
	 * {@link sap.ui.model.ListBinding.prototype.getCurrentContexts} instead.
	 *
	 * @param {int} [iStartIndex=0]
	 *   The start index where to start the retrieval of contexts
	 * @param {int} [iLength=length of the list]
	 *   Determines how many contexts to retrieve beginning from the start index; default is the
	 *   whole list length up to the model's size limit; see {@link sap.ui.model.Model#setSizeLimit}
	 * @param {int} [iMaximumPrefetchSize]
	 *   Must not be used
	 * @param {boolean} [bKeepCurrent]
	 *   Whether this call keeps the result of {@link #getCurrentContexts} untouched; since 1.102.0.
	 * @return {sap.ui.model.Context[]}
	 *   The array of contexts for each row of the bound list
	 * @throws {Error}
	 *   If <code>bKeepCurrent</code> is set and extended change detection is enabled or
	 *   <code>iMaximumPrefetchSize</code> is set
	 *
	 * @protected
	 */
	 ClientListBinding.prototype.getContexts = function (iStartIndex, iLength, iMaximumPrefetchSize,
			bKeepCurrent) {
		var aContextData, aContexts;

		// Do not update last start and length with the defaulted values as #checkUpdate would only
		// check in this range for changes. For controls that want to show all data the range must
		// not be limited.
		this._updateLastStartAndLength(iStartIndex, iLength, iMaximumPrefetchSize, bKeepCurrent);
		iStartIndex = iStartIndex || 0;
		iLength = iLength || Math.min(this.iLength, this.oModel.iSizeLimit);
		aContexts = this._getContexts(iStartIndex, iLength);
		if (this.bUseExtendedChangeDetection) {
			aContextData = [];
			// Use try/catch to detect issues with getting context data
			try {
				for (var i = 0; i < aContexts.length; i++) {
					aContextData.push(this.getContextData(aContexts[i]));
				}
				if (this.aLastContextData && iStartIndex < this.iLastEndIndex) {
					aContexts.diff = this.diffData(this.aLastContextData, aContextData);
				}
				this.iLastEndIndex = iStartIndex + iLength;
				this.aLastContextData = aContextData;
				this.aLastContexts = aContexts.slice(0);
			} catch (oError) {
				this.aLastContextData = undefined;
				this.aLastContexts = undefined;
				this.bUseExtendedChangeDetection = false;
				Log.warning(
					"Disabled extended change detection for binding path '" + this.getResolvedPath()
						+ "'; context data could not be serialized",
					oError, this.getMetadata().getName());
			}
		}

		return aContexts;
	};

	// documented in sap.ui.model.ListBinding#getCurrentContexts
	ClientListBinding.prototype.getCurrentContexts = function() {
		if (this.bUseExtendedChangeDetection) {
			return this.aLastContexts || [];
		} else {
			return this.getContexts(this.iLastStartIndex, this.iLastLength);
		}
	};

	/*
	 * @see sap.ui.model.ListBinding#getAllCurrentContexts
	 */
	ClientListBinding.prototype.getAllCurrentContexts = function () {
		return this._getContexts(0, Infinity);
	};

	/**
	 * Setter for context
	 * @param {Object} oContext the new context object
	 */
	ClientListBinding.prototype.setContext = function(oContext) {
		if (this.oContext != oContext) {
			this.oContext = oContext;
			if (this.isRelative()) {
				this.update();
				this._fireChange({reason: ChangeReason.Context});
			}
		}
	};

	/*
	 * @see sap.ui.model.ListBinding.prototype.getLength
	 */
	ClientListBinding.prototype.getLength = function() {
		return this.iLength;
	};

	/**
	 * Return the length of the list
	 *
	 * @return {int} the length
	 */
	ClientListBinding.prototype._getLength = function() {
		return this.aIndices.length;
	};

	/**
	 * Get indices of the list
	 */
	ClientListBinding.prototype.updateIndices = function(){
		this.aIndices = [];
		for (var i = 0; i < this.oList.length; i++) {
			this.aIndices.push(i);
		}

	};

	/*
	 * @see sap.ui.model.ListBinding.prototype.sort
	 */
	ClientListBinding.prototype.sort = function(aSorters){
		if (this.bSuspended) {
			this.checkUpdate(true);
		}
		if (!aSorters) {
			this.aSorters = null;
			this.updateIndices();
			this.applyFilter();
		} else {
			if (aSorters instanceof Sorter) {
				aSorters = [aSorters];
			}
			this.aSorters = aSorters;
			this.applySort();
		}

		this.bIgnoreSuspend = true;

		this._fireChange({reason: ChangeReason.Sort});
		this.bIgnoreSuspend = false;

		return this;
	};

	/**
	 * Sorts the list
	 * @private
	 */
	ClientListBinding.prototype.applySort = function(){
		var that = this;

		if (!this.aSorters || this.aSorters.length == 0) {
			return;
		}

		this.aIndices = SorterProcessor.apply(this.aIndices, this.aSorters, function(vRef, sPath) {
			return that.oModel.getProperty(sPath, that.oList[vRef]);
		});
	};

	/**
	 * Applies a new set of filters to the list represented by this binding.
	 *
	 * See {@link sap.ui.model.ListBinding#filter ListBinding#filter} for a more detailed
	 * description of list filtering.
	 *
	 * When no <code>sFilterType</code> is given, any previously configured application
	 * filters are cleared and the given filters are used as control filters
	 *
	 * @param {sap.ui.model.Filter[]|sap.ui.model.Filter} [aFilters=[]]
	 *   The filters to use; in case of type {@link sap.ui.model.FilterType.Application} this replaces the filters given
	 *   in {@link sap.ui.model.ClientModel#bindList}; a falsy value is treated as an empty array and thus removes all
	 *   filters of the specified type
	 * @param {sap.ui.model.FilterType} [sFilterType]
	 *   The type of the filter to replace; if no type is given, all filters previously configured with type
	 *   {@link sap.ui.model.FilterType.Application} are cleared, and the given filters are used as filters of type
	 *   {@link sap.ui.model.FilterType.Control}
	 * @returns {this} returns <code>this</code> to facilitate method chaining
	 * @throws {Error} If one of the filters uses an operator that is not supported by the underlying model
	 *   implementation or if the {@link sap.ui.model.Filter.NONE} filter instance is contained in
	 *   <code>aFilters</code> together with other filters
	 *
	 * @public
	 */
	ClientListBinding.prototype.filter = function(aFilters, sFilterType){
		this.oModel.checkFilter(aFilters);

		if (this.bSuspended) {
			this.checkUpdate(true);
		}
		this.updateIndices();
		if (aFilters instanceof Filter) {
			aFilters = [aFilters];
		}
		if (sFilterType == FilterType.Application) {
			this.aApplicationFilters = aFilters || [];
		} else if (sFilterType == FilterType.Control) {
			this.aFilters = aFilters || [];
		} else {
			//Previous behaviour
			this.aFilters = aFilters || [];
			this.aApplicationFilters = [];
		}

		this.oCombinedFilter = FilterProcessor.combineFilters(this.aFilters, this.aApplicationFilters);

		if (this.aFilters.length === 0 && this.aApplicationFilters.length === 0) {
			this.iLength = this._getLength();
		} else {
			this.applyFilter();
		}
		this.applySort();

		this.bIgnoreSuspend = true;

		this._fireChange({reason: ChangeReason.Filter});
		this.bIgnoreSuspend = false;

		return this;
	};

	/**
	 * Filters the list
	 * Filters are first grouped according to their binding path.
	 * All filters belonging to a group are ORed and after that the
	 * results of all groups are ANDed.
	 * Usually this means, all filters applied to a single table column
	 * are ORed, while filters on different table columns are ANDed.
	 * Multiple MultiFilters are ORed.
	 *
	 * @private
	 */
	ClientListBinding.prototype.applyFilter = function(){
		var that = this;

		this.aIndices = FilterProcessor.apply(this.aIndices, this.oCombinedFilter, function(vRef, sPath) {
			return that.oModel.getProperty(sPath, that.oList[vRef]);
		}, this.mNormalizeCache);

		this.iLength = this.aIndices.length;
	};

	/*
	 * @see sap.ui.model.ListBinding.prototype.getDistinctValues
	 */
	ClientListBinding.prototype.getDistinctValues = function(sPath){
		var aResult = [],
			oMap = {},
			sValue,
			that = this;
		each(this.oList, function(i, oContext) {
			sValue = that.oModel.getProperty(sPath, oContext);
			if (!oMap[sValue]) {
				oMap[sValue] = true;
				aResult.push(sValue);
			}
		});
		return aResult;
	};


	return ClientListBinding;

});