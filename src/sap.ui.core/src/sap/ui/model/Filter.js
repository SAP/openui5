/*!
 * ${copyright}
 */

// Provides a filter for list bindings
sap.ui.define(['jquery.sap.global', './FilterOperator', 'sap/ui/core/util/UnicodeNormalizer'],
	function(jQuery, FilterOperator, UnicodeNormalizer) {
	"use strict";


	/**
	 * Constructor for Filter
	 * You can either pass an object with the filter parameters or use the function arguments
	 * 
	 * Using object:
	 * new sap.ui.model.Filter({
	 *   path: "...",
	 *   operator: "...",
	 *   value1: "...",
	 *   value2: "..."
	 * })
	 * 
	 * OR:
	 * new sap.ui.model.Filter({
	 *   path: "...",
	 *   test: function(oValue) {
	 *   }
	 * })
	 *
	 * OR:
	 * new sap.ui.model.Filter({
	 *   filters: [...],
	 *   and: true|false
	 * })
	 * 
	 * You can only pass sPath, sOperator and their values OR sPath, fnTest OR aFilters and bAnd. You will get an error if you define an invalid combination of filters parameters.
	 * 
	 * Using arguments:
	 * new sap.ui.model.Filter(sPath, sOperator, oValue1, oValue2);
	 * OR
	 * new sap.ui.model.Filter(sPath, fnTest);
	 * OR
	 * new sap.ui.model.Filter(aFilters, bAnd);
	 * 
	 * aFilters is an array of other instances of sap.ui.model.Filter. If bAnd is set all filters within the filter will be ANDed else they will be ORed.
	 *
	 * @class
	 * Filter for the list binding
	 *
	 * @param {object} oFilterInfo the filter info object
	 * @param {string} oFilterInfo.path the binding path for this filter
	 * @param {function} oFilterInfo.test function which is used to filter the items which should return a boolean value to indicate whether the current item is preserved
	 * @param {sap.ui.model.FilterOperator} oFilterInfo.operator operator used for the filter
	 * @param {object} oFilterInfo.value1 first value to use for filter
	 * @param {object} [oFilterInfo.value2=null] second value to use for filter
	 * @param {array} oFilterInfo.filters array of filters on which logical conjunction is applied
	 * @param {boolean} oFilterInfo.and indicates whether an "and" logical conjunction is applied on the filters. If it's set to false, an "or" conjunction is applied
	 * @public
	 * @alias sap.ui.model.Filter
	 */
	var Filter = sap.ui.base.Object.extend("sap.ui.model.Filter", /** @lends sap.ui.model.Filter.prototype */ {
		constructor : function(sPath, sOperator, oValue1, oValue2){
			//There are two different ways of specifying a filter
			//If can be passed in only one object or defined with parameters
			if (typeof sPath === "object" && !jQuery.isArray(sPath)) {
				var oFilterData = sPath;
				this.sPath = oFilterData.path;
				this.sOperator = oFilterData.operator;
				this.oValue1 = oFilterData.value1;
				this.oValue2 = oFilterData.value2;
				this.aFilters = oFilterData.filters || oFilterData.aFilters;
				this.bAnd = oFilterData.and || oFilterData.bAnd;
				this.fnTest = oFilterData.test;
			} else {
				//If parameters are used we have to check whether a regular or a multi filter is specified
				if (jQuery.isArray(sPath)) {
					this.aFilters = sPath;
				} else {
					this.sPath = sPath;
				}
				if (jQuery.type(sOperator) === "boolean") {
					this.bAnd = sOperator;
				} else if (jQuery.type(sOperator) === "function" ) {
					this.fnTest = sOperator;
				} else {
					this.sOperator = sOperator;
				}
				this.oValue1 = oValue1;
				this.oValue2 = oValue2;
			}
			this.oValue1 = this._normalizeValue(this.oValue1);
			this.oValue2 = this._normalizeValue(this.oValue2);
			if (jQuery.isArray(this.aFilters) && !this.sPath && !this.sOperator && !this.oValue1 && !this.oValue2) {
				this._bMultiFilter = true;
				jQuery.each(this.aFilters, function(iIndex, oFilter) {
					if (!(oFilter instanceof Filter)) {
						jQuery.sap.log.error("Filter in Aggregation of Multi filter has to be instance of sap.ui.model.Filter");
					}
				});
			} else if (!this.aFilters && this.sPath !== undefined && ((this.sOperator && this.oValue1 !== undefined) || this.fnTest)) {
				this._bMultiFilter = false;
			} else {
				jQuery.sap.log.error("Wrong parameters defined for filter.");
			}
		}
	
	});
	
	/**
	 * Normalizes the filtered value if it is a String and the function is defined.
	 *
	 * @param {object} oValue the value to be filtered.
	 * @private
	 */
	Filter.prototype._normalizeValue = function(oValue) {
		if (typeof oValue === "string" && String.prototype.normalize != undefined) {
			oValue = oValue.normalize();
		}
		return oValue;
	};

	return Filter;

}, /* bExport= */ true);
