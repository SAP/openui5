/*!
 * ${copyright}
 */

// Provides the JSON model implementation of a list binding
sap.ui.define(['jquery.sap.global', './FilterType', './ListBinding'],
	function(jQuery, FilterType, ListBinding) {
	"use strict";


	
	/**
	 *
	 * @class
	 * List binding implementation for client models
	 *
	 * @param {sap.ui.model.Model} oModel
	 * @param {string} sPath
	 * @param {sap.ui.model.Context} oContext
	 * @param {sap.ui.model.Sorter|sap.ui.model.Sorter[]} [aSorters] initial sort order (can be either a sorter or an array of sorters)
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} [aFilters] predefined filter/s (can be either a filter or an array of filters)
	 * @param {object} [mParameters]
	 * 
	 * @alias sap.ui.model.ClientListBinding
	 * @extends sap.ui.model.ListBinding
	 */
	var ClientListBinding = ListBinding.extend("sap.ui.model.ClientListBinding", /** @lends sap.ui.model.ClientListBinding.prototype */ {
	
		constructor : function(oModel, sPath, oContext, aSorters, aFilters, mParameters){
			ListBinding.apply(this, arguments);
			this.bIgnoreSuspend = false;
			this.update();
		},
	
		metadata : {
			publicMethods : [
				"getLength"
			]
		}
	
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
		sPrefix = this.oModel.resolve(this.sPath, this.oContext);
		
		if (sPrefix && !jQuery.sap.endsWith(sPrefix, "/")) {
			sPrefix += "/";
		}
	
		for (var i = iStartIndex; i < iEndIndex; i++) {
			oContext = this.oModel.getContext(sPrefix + this.aIndices[i]);
			aContexts.push(oContext);
		}
		
		return aContexts;
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
				this._fireChange({reason: sap.ui.model.ChangeReason.Context});
			}
		}
	};
	
	/**
	 * @see sap.ui.model.ListBinding.prototype.getLength
	 *
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
	
	/**
	 * @see sap.ui.model.ListBinding.prototype.sort
	 *
	 */
	ClientListBinding.prototype.sort = function(aSorters){
		if (!aSorters) {
			this.aSorters = null;
			this.updateIndices();
			this.applyFilter();
		} else {
			if (aSorters instanceof sap.ui.model.Sorter) {
				aSorters = [aSorters];
			}
			this.aSorters = aSorters;
			this.applySort();
		}
		
		this.bIgnoreSuspend = true;
		
		this._fireChange({reason: sap.ui.model.ChangeReason.Sort});
		// TODO remove this if the sorter event gets removed which is deprecated
		this._fireSort({sorter: aSorters});
		this.bIgnoreSuspend = false;
		
		return this;
	};
	
	/**
	 * Sorts the list
	 * @private
	 */
	ClientListBinding.prototype.applySort = function(){
		var that = this,
			aSortValues = [],
			aCompareFunctions = [],
			oValue,
			oSorter;
	
		if (!this.aSorters || this.aSorters.length == 0) {
			return;
		}
		
		function fnCompare(a, b) {
			if (b == null) {
				return -1;
			}
			if (a == null) {
				return 1;
			}
			if (typeof a == "string" && typeof b == "string") {
				return a.localeCompare(b);
			}
			if (a < b) {
				return -1;
			}
			if (a > b) {
				return 1;
			}
			return 0;
		}
		
		for (var j = 0; j < this.aSorters.length; j++) {
			oSorter = this.aSorters[j];
			aCompareFunctions[j] = oSorter.fnCompare;
			
			if (!aCompareFunctions[j]) {
				aCompareFunctions[j] = fnCompare;
			}
			/*eslint-disable no-loop-func */
			jQuery.each(this.aIndices, function(i, iIndex) {
				oValue = that.oModel.getProperty(oSorter.sPath, that.oList[iIndex]);
				if (typeof oValue == "string") {
					oValue = oValue.toLocaleUpperCase();
				}
				if (!aSortValues[j]) {
					aSortValues[j] = [];
				}
				aSortValues[j][iIndex] = oValue;
			});
			/*eslint-enable no-loop-func */
		}
	
		this.aIndices.sort(function(a, b) {
			var valueA = aSortValues[0][a],
				valueB = aSortValues[0][b];
			
			return that._applySortCompare(a, b, valueA, valueB, aSortValues, aCompareFunctions, 0);
		});
	};
	
	ClientListBinding.prototype._applySortCompare = function(a, b, valueA, valueB, aSortValues, aCompareFunctions, iDepth){
		var oSorter = this.aSorters[iDepth],
			fnCompare = aCompareFunctions[iDepth],
			returnValue;
	
		returnValue = fnCompare(valueA, valueB);
		if (oSorter.bDescending) {
			returnValue = -returnValue;
		}
		if (returnValue == 0 && this.aSorters[iDepth + 1]) {
			valueA = aSortValues[iDepth + 1][a];
			valueB = aSortValues[iDepth + 1][b];
			returnValue = this._applySortCompare(a, b, valueA, valueB, aSortValues, aCompareFunctions, iDepth + 1);
		}
		return returnValue;
	};
	
	/**
	 * Filters the list.
	 * 
	 * Filters are first grouped according to their binding path.
	 * All filters belonging to a group are ORed and after that the
	 * results of all groups are ANDed.
	 * Usually this means, all filters applied to a single table column
	 * are ORed, while filters on different table columns are ANDed.
	 * 
	 * @param {sap.ui.model.Filter[]} aFilters Array of filter objects
	 * @param {sap.ui.model.FilterType} sFilterType Type of the filter which should be adjusted, if it is not given, the standard behaviour applies
	 * @return {sap.ui.model.ListBinding} returns <code>this</code> to facilitate method chaining 
	 * 
	 * @public
	 */
	ClientListBinding.prototype.filter = function(aFilters, sFilterType){
		this.updateIndices();
		if (aFilters instanceof sap.ui.model.Filter) {
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
		aFilters = this.aFilters.concat(this.aApplicationFilters);
		if (aFilters.length == 0) {
			this.aFilters = [];
			this.aApplicationFilters = [];
			this.iLength = this._getLength();
		} else {
			this.applyFilter();
		}
		this.applySort();
		
		this.bIgnoreSuspend = true;
		
		this._fireChange({reason: sap.ui.model.ChangeReason.Filter});
		// TODO remove this if the filter event gets removed which is deprecated
		if (sFilterType == FilterType.Application) {
			this._fireFilter({filters: this.aApplicationFilters});
		} else {
			this._fireFilter({filters: this.aFilters});
		}
		this.bIgnoreSuspend = false;
		
		return this;
	};
	
	/**
	 * Normalize filter value
	 * 
	 * @private
	 */
	ClientListBinding.prototype.normalizeFilterValue = function(oValue){
		if (typeof oValue == "string") {
			return oValue.toUpperCase();
		}
		if (oValue instanceof Date) {
			return oValue.getTime();
		}
		return oValue;
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
		if (!this.aFilters) {
			return;
		}
		var that = this,
			oFilterGroups = {},
			aFilterGroup,
			aFiltered = [],
			bGroupFiltered = false,
			bFiltered = true,
			aFilters = this.aFilters.concat(this.aApplicationFilters);
	
		jQuery.each(aFilters, function(j, oFilter) {
			if (oFilter.sPath !== undefined) {
				aFilterGroup = oFilterGroups[oFilter.sPath];
				if (!aFilterGroup) {
					aFilterGroup = oFilterGroups[oFilter.sPath] = [];
				}
			} else {
				aFilterGroup = oFilterGroups["__multiFilter"];
				if (!aFilterGroup) {
					aFilterGroup = oFilterGroups["__multiFilter"] = [];
				}
			}
			aFilterGroup.push(oFilter);
		});
		jQuery.each(this.aIndices, function(i, iIndex) {
			bFiltered = true;
			jQuery.each(oFilterGroups, function(sPath, aFilterGroup) {
				if (sPath !== "__multiFilter") {
					var oValue = that.oModel.getProperty(sPath, that.oList[iIndex]);
					oValue = that.normalizeFilterValue(oValue);
					bGroupFiltered = false;
					jQuery.each(aFilterGroup, function(j, oFilter) {
						var fnTest = that.getFilterFunction(oFilter);
						if (oValue != undefined && fnTest(oValue)) {
							bGroupFiltered = true;
							return false;
						}
					});
				} else {
					bGroupFiltered = false;
					jQuery.each(aFilterGroup, function(j, oFilter) {
						bGroupFiltered = that._resolveMultiFilter(oFilter, iIndex);
						if (bGroupFiltered) {
							return false;
						}
					});
				}
				if (!bGroupFiltered) {
					bFiltered = false;
					return false;
				}
			});
			if (bFiltered) {
				aFiltered.push(iIndex);
			}
		});
		this.aIndices = aFiltered;
		this.iLength = aFiltered.length;
	};
	
	/**
	 * Resolve the client list binding and check if an index matches
	 *
	 * @private
	 */
	ClientListBinding.prototype._resolveMultiFilter = function(oMultiFilter, iIndex){
		var that = this,
			bMatched = false,
			aFilters = oMultiFilter.aFilters;
		
		if (aFilters) {
			jQuery.each(aFilters, function(i, oFilter) {
				var bLocalMatch = false;
				if (oFilter._bMultiFilter) {
					bLocalMatch = that._resolveMultiFilter(oFilter, iIndex);
				} else if (oFilter.sPath !== undefined) {
					var oValue = that.oModel.getProperty(oFilter.sPath, that.oList[iIndex]);
					oValue = that.normalizeFilterValue(oValue);
					var fnTest = that.getFilterFunction(oFilter);
					if (oValue != undefined && fnTest(oValue)) {
						bLocalMatch = true;
					}
				}
				if (bLocalMatch && oMultiFilter.bAnd) {
					bMatched = true;
				} else if (!bLocalMatch && oMultiFilter.bAnd) {
					bMatched = false;
					return false;
				} else if (bLocalMatch) {
					bMatched = true;
					return false;
				}
			});
		}
		
		return bMatched;
	};
	
	/**
	 * Provides a JS filter function for the given filter
	 */
	ClientListBinding.prototype.getFilterFunction = function(oFilter){
		if (oFilter.fnTest) {
			return oFilter.fnTest;
		}
		var oValue1 = this.normalizeFilterValue(oFilter.oValue1),
			oValue2 = this.normalizeFilterValue(oFilter.oValue2);
	
		switch (oFilter.sOperator) {
			case "EQ":
				oFilter.fnTest = function(value) { return value == oValue1; }; break;
			case "NE":
				oFilter.fnTest = function(value) { return value != oValue1; }; break;
			case "LT":
				oFilter.fnTest = function(value) { return value < oValue1; }; break;
			case "LE":
				oFilter.fnTest = function(value) { return value <= oValue1; }; break;
			case "GT":
				oFilter.fnTest = function(value) { return value > oValue1; }; break;
			case "GE":
				oFilter.fnTest = function(value) { return value >= oValue1; }; break;
			case "BT":
				oFilter.fnTest = function(value) { return (value >= oValue1) && (value <= oValue2); }; break;
			case "Contains":
				oFilter.fnTest = function(value) {
					if (typeof value != "string") {
						throw new Error("Only \"String\" values are supported for the FilterOperator: \"Contains\".");
					}
					return value.indexOf(oValue1) != -1;
				};
				break;
			case "StartsWith":
				oFilter.fnTest = function(value) {
					if (typeof value != "string") {
						throw new Error("Only \"String\" values are supported for the FilterOperator: \"StartsWith\".");
					}
					return value.indexOf(oValue1) == 0;
				};
				break;
			case "EndsWith":
				oFilter.fnTest = function(value) {
					if (typeof value != "string") {
						throw new Error("Only \"String\" values are supported for the FilterOperator: \"EndsWith\".");
					}
					var iPos = value.lastIndexOf(oValue1);
					if (iPos == -1) {
						return false;
					}
					return iPos == value.length - new String(oFilter.oValue1).length;
				};
				break;
			default:
				oFilter.fnTest = function(value) { return true; };
		}
		return oFilter.fnTest;
	};
	
	/**
	 * Get distinct values
	 *
	 * @param {String} sPath
	 *
	 * @protected
	 */
	ClientListBinding.prototype.getDistinctValues = function(sPath){
		var aResult = [],
			oMap = {},
			sValue,
			that = this;
		jQuery.each(this.oList, function(i, oContext) {
			sValue = that.oModel.getProperty(sPath, oContext);
			if (!oMap[sValue]) {
				oMap[sValue] = true;
				aResult.push(sValue);
			}
		});
		return aResult;
	};
	

	return ClientListBinding;

}, /* bExport= */ true);
