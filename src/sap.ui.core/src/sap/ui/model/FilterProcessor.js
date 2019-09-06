/*!
 * ${copyright}
 */

sap.ui.define(['./Filter', 'sap/base/Log', 'sap/ui/Device'],
	function(Filter, Log, Device) {
	"use strict";

	// only use unorm and apply polyfill if needed and when not in a mobile browser
	// String.prototype.normalize is not available in IE nor in Android webview
	// As this functionality is used for filtering user input:
	//  Special characters which require normalization are a rare case for a mobile device keyboard, hence the mobile check
	if (!String.prototype.normalize && !Device.browser.mobile) {
		var NormalizePolyfill = sap.ui.requireSync('sap/base/strings/NormalizePolyfill');
		NormalizePolyfill.apply();
	}

	/**
	 * Helper class for processing of filter objects
	 *
	 * @alias module:sap/ui/model/FilterProcessor
	 * @namespace
	 * @public
	 * @since 1.71
	 */
	var FilterProcessor = {};


	/**
	 * Groups filters according to their path and combines filters on the same path using "OR" and filters on
	 * different paths using "AND", all multi-filters contained are ANDed.
	 *
	 * @param {sap.ui.model.Filter[]} aFilters the filters to be grouped
	 * @return {sap.ui.model.Filter} Single Filter containing all filters of the array combined or undefined
	 * @public
	 * @since 1.71
	 * @static
	 */
	FilterProcessor.groupFilters = function(aFilters) {
		var sCurPath, mSamePath = {}, aResult = [];

		function getFilter(aFilters, bAnd) {
			if (aFilters.length === 1) {
				return aFilters[0];
			}
			if (aFilters.length > 1) {
				return new Filter(aFilters, bAnd);
			}
			return undefined;
		}

		if (!aFilters || aFilters.length === 0) {
			return undefined;
		}
		// No need for grouping if only a single filter is contained
		if (aFilters.length === 1) {
			return aFilters[0];
		}
		// Collect filters on same path, make sure to keep order as before for compatibility with tests
		aFilters.forEach(function(oFilter) {
			if (oFilter.aFilters || oFilter.sVariable) { // multi/lambda filter
				sCurPath = "__multiFilter";
			} else {
				sCurPath = oFilter.sPath;
			}
			if (!mSamePath[sCurPath]) {
				mSamePath[sCurPath] = [];
			}
			mSamePath[sCurPath].push(oFilter);
		});
		// Create ORed multifilters for all filter groups
		for (var sPath in mSamePath) {
			aResult.push(getFilter(mSamePath[sPath], sPath === "__multiFilter")); // multi filters are ANDed
		}

		return getFilter(aResult, true); //AND
	};

	/**
	 * Combines control filters and application filters using AND and returns the resulting filter
	 *
	 * @param {sap.ui.model.Filter[]} aFilters control filters
	 * @param {sap.ui.model.Filter[]} aApplicationFilters application filters
	 * @return {sap.ui.model.Filter} Single Filter containing all filters of the array combined or undefined
	 * @private
	 * @since 1.58
	 * @static
	 */
	FilterProcessor.combineFilters = function(aFilters, aApplicationFilters) {
		var oGroupedFilter, oGroupedApplicationFilter, oFilter, aCombinedFilters = [];

		oGroupedFilter = this.groupFilters(aFilters);
		oGroupedApplicationFilter = this.groupFilters(aApplicationFilters);

		if (oGroupedFilter) {
			aCombinedFilters.push(oGroupedFilter);
		}
		if (oGroupedApplicationFilter) {
			aCombinedFilters.push(oGroupedApplicationFilter);
		}
		if (aCombinedFilters.length === 1) {
			oFilter = aCombinedFilters[0];
		} else if (aCombinedFilters.length > 1) {
			oFilter = new Filter(aCombinedFilters, true); //AND
		}

		return oFilter;
	};

	/**
	 * Filters the list
	 * In case an array of filters is passed, filters will be grouped using groupFilters
	 *
	 * @param {array} aData the data array to be filtered
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} vFilter the filter or array of filters
	 * @param {function} fnGetValue the method to get the actual value to filter on
	 * @return {array} a new array instance containing the filtered data set
	 * @private
	 * @static
	 */
	FilterProcessor.apply = function(aData, vFilter, fnGetValue){
		var oFilter = Array.isArray(vFilter) ? this.groupFilters(vFilter) : vFilter,
			aFiltered,
			that = this;

		if (!aData) {
			return [];
		} else if (!oFilter) {
			return aData.slice();
		}

		aFiltered = aData.filter(function(vRef) {
			return that._evaluateFilter(oFilter, vRef, fnGetValue);
		});

		return aFiltered;
	};

	/**
	 * Evaluates the result of a single filter by calling the corresponding
	 * filter function and returning the result.
	 *
	 * @param {sap.ui.model.Filter} oFilter the filter object
	 * @param {object} vRef the reference to the list entry
	 * @param {function} fnGetValue the function to get the value from the list entry
	 * @return {boolean} whether the filter matches or not
	 * @private
	 * @static
	 */
	FilterProcessor._evaluateFilter = function(oFilter, vRef, fnGetValue){
		var oValue, fnTest;
		if (oFilter.aFilters) {
			return this._evaluateMultiFilter(oFilter, vRef, fnGetValue);
		}
		oValue = fnGetValue(vRef, oFilter.sPath);
		fnTest = this.getFilterFunction(oFilter);
		if (!oFilter.fnCompare || oFilter.bCaseSensitive !== undefined) {
			oValue = this.normalizeFilterValue(oValue, oFilter.bCaseSensitive);
		}
		if (oValue !== undefined && fnTest(oValue)) {
			return true;
		}
		return false;
	};

	/**
	 * Evaluates the result of a multi filter, by evaluating contained
	 * filters. Depending on the type (AND/OR) not all contained filters need
	 * to be evaluated.
	 *
	 * @param {sap.ui.model.Filter} oMultiFilter the filter object
	 * @param {object} vRef the reference to the list entry
	 * @param {function} fnGetValue the function to get the value from the list entry
	 * @return {boolean} whether the filter matches or not
	 * @private
	 * @static
	 */
	FilterProcessor._evaluateMultiFilter = function(oMultiFilter, vRef, fnGetValue){
		var that = this,
			bAnd = !!oMultiFilter.bAnd,
			aFilters = oMultiFilter.aFilters,
			oFilter,
			bMatch,
			bResult = bAnd;

		for (var i = 0; i < aFilters.length; i++) {
			oFilter = aFilters[i];
			bMatch = that._evaluateFilter(oFilter, vRef, fnGetValue);
			if (bAnd) {
				// if operator is AND, first non matching filter breaks
				if (!bMatch) {
					bResult = false;
					break;
				}
			} else {
				// if operator is OR, first matching filter breaks
				if (bMatch) {
					bResult = true;
					break;
				}
			}
		}
		return bResult;
	};

	/**
	 * Normalize filter value
	 *
	 * @private
	 * @static
	 */
	FilterProcessor.normalizeFilterValue = function(oValue, bCaseSensitive){
		if (typeof oValue == "string") {
			if (bCaseSensitive === undefined) {
				bCaseSensitive = false;
			}
			if (!bCaseSensitive) {
				// Internet Explorer and Edge cannot uppercase properly on composed characters
				if (String.prototype.normalize && (Device.browser.msie || Device.browser.edge)) {
					oValue = oValue.normalize("NFKD");
				}
				oValue = oValue.toUpperCase();
			}

			// use canonical composition as recommended by W3C
			// http://www.w3.org/TR/2012/WD-charmod-norm-20120501/#sec-ChoiceNFC
			if (String.prototype.normalize) {
				oValue = oValue.normalize("NFC");
			}
			return oValue;
		}
		if (oValue instanceof Date) {
			return oValue.getTime();
		}
		return oValue;
	};

	/**
	 * Provides a JS filter function for the given filter
	 * @private
	 * @static
	 */
	FilterProcessor.getFilterFunction = function(oFilter){
		if (oFilter.fnTest) {
			return oFilter.fnTest;
		}
		var oValue1 = oFilter.oValue1,
			oValue2 = oFilter.oValue2,
			fnCompare = oFilter.fnCompare || Filter.defaultComparator;

		if (!oFilter.fnCompare || oFilter.bCaseSensitive !== undefined) {
			oValue1 = oValue1 ? this.normalizeFilterValue(oValue1, oFilter.bCaseSensitive) : oValue1;
			oValue2 = oValue2 ? this.normalizeFilterValue(oValue2, oFilter.bCaseSensitive) : oValue2;
		}

		var fnContains = function(value) {
			if (value == null) {
				return false;
			}
			if (typeof value != "string") {
				throw new Error("Only \"String\" values are supported for the FilterOperator: \"Contains\".");
			}
			return value.indexOf(oValue1) != -1;
		};

		var fnStartsWith = function(value) {
			if (value == null) {
				return false;
			}
			if (typeof value != "string") {
				throw new Error("Only \"String\" values are supported for the FilterOperator: \"StartsWith\".");
			}
			return value.indexOf(oValue1) == 0;
		};

		var fnEndsWith = function(value) {
			if (value == null) {
				return false;
			}
			if (typeof value != "string") {
				throw new Error("Only \"String\" values are supported for the FilterOperator: \"EndsWith\".");
			}
			var iPos = value.lastIndexOf(oValue1);
			if (iPos == -1) {
				return false;
			}
			return iPos == value.length - oValue1.length;
		};

		var fnBetween = function(value) {
			return (fnCompare(value, oValue1) >= 0) && (fnCompare(value, oValue2) <= 0);
		};

		switch (oFilter.sOperator) {
			case "EQ":
				oFilter.fnTest = function(value) { return fnCompare(value, oValue1) === 0; }; break;
			case "NE":
				oFilter.fnTest = function(value) { return fnCompare(value, oValue1) !== 0; }; break;
			case "LT":
				oFilter.fnTest = function(value) { return fnCompare(value, oValue1) < 0; }; break;
			case "LE":
				oFilter.fnTest = function(value) { return fnCompare(value, oValue1) <= 0; }; break;
			case "GT":
				oFilter.fnTest = function(value) { return fnCompare(value, oValue1) > 0; }; break;
			case "GE":
				oFilter.fnTest = function(value) { return fnCompare(value, oValue1) >= 0; }; break;
			case "BT":
				oFilter.fnTest = fnBetween; break;
			case "NB":
				oFilter.fnTest = function(value) {
					return !fnBetween(value);
				};
				break;
			case "Contains":
				oFilter.fnTest = fnContains; break;
			case "NotContains":
				oFilter.fnTest = function (value) {
					return !fnContains(value);
				};
				break;
			case "StartsWith":
				oFilter.fnTest = fnStartsWith; break;
			case "NotStartsWith":
				oFilter.fnTest = function(value) {
					return !fnStartsWith(value);
				};
				break;
			case "EndsWith":
				oFilter.fnTest = fnEndsWith; break;
			case "NotEndsWith":
				oFilter.fnTest = function(value) {
					return !fnEndsWith(value);
				};
				break;
			default:
				Log.error("The filter operator \"" + oFilter.sOperator + "\" is unknown, filter will be ignored.");
				oFilter.fnTest = function(value) { return true; };
		}
		return oFilter.fnTest;
	};

	return FilterProcessor;

});