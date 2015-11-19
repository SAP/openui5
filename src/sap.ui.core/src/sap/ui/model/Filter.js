/*!
 * ${copyright}
 */

// Provides a filter for list bindings
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object', './FilterOperator', 'sap/ui/Device'],
	function(jQuery, BaseObject, FilterOperator, Device) {
	"use strict";


	/**
	 * Constructor for Filter.
	 *
	 * One can either pass a single object literal with the filter parameters or use the individual constructor arguments.
	 * No matter which variant is used, only certain combinations of parameters are supported
	 * (the following list uses the names from the object literal):
	 * <ul>
	 * <li>A <code>path</code>, <code>operator</code> and one or two values (<code>value1</code>, <code>value2</code>), depending on the operator</li>
	 * <li>A <code>path</code> and a custom filter function <code>test</code></li>
	 * <li>An array of other filters named <code>filters</code> and a Boolean flag <code>and</code> that specifies whether to combine
	 *     the filters with an AND (<code>true</code>) or an OR (<code>false</code>) operator.</li>
	 * </ul>
	 * An error will be logged to the console if an invalid combination of parameters is provided.
	 *
	 * @example <caption>Using an object with a path, an operator and one or two values</caption>
	 *
	 *   new sap.ui.model.Filter({
	 *     path: "...",
	 *     operator: "...",
	 *     value1: "...",
	 *     value2: "..."
	 *   })
	 *
	 * @example <caption>Using a path and a custom filter function:</caption>
	 *
	 *   new sap.ui.model.Filter({
	 *     path: "...",
	 *     test: function(oValue) {
	 *     }
	 *   })
	 *
	 * @example <caption>Combining a list of filters either with AND or OR</caption>
	 *
	 *   new sap.ui.model.Filter({
	 *     filters: [...],
	 *     and: true|false
	 *   })
	 *
	 * @example <caption>Same as above, but using individual constructor arguments</caption>
	 *
	 *     new sap.ui.model.Filter(sPath, sOperator, oValue1, oValue2);
	 *   OR
	 *     new sap.ui.model.Filter(sPath, fnTest);
	 *   OR
	 *     new sap.ui.model.Filter(aFilters, bAnd);
	 *
	 * @class
	 * Filter for the list binding.
	 *
	 * @param {object|string|sap.ui.model.Filter[]} vFilterInfo Filter info object or a path or an array of filters
	 * @param {string} vFilterInfo.path Binding path for this filter
	 * @param {function} vFilterInfo.test Function which is used to filter the items and which should return a Boolean value to indicate whether the current item passes the filter
	 * @param {sap.ui.model.FilterOperator} vFilterInfo.operator Operator used for the filter
	 * @param {object} vFilterInfo.value1 First value to use with the given filter operator
	 * @param {object} [vFilterInfo.value2=null] Second value to use with the filter operator (only for some operators)
	 * @param {sap.ui.model.Filter[]} vFilterInfo.filters Array of filters on which logical conjunction is applied
	 * @param {boolean} vFilterInfo.and Indicates whether an "AND" logical conjunction is applied on the filters. If it's set to <code>false</code>, an "OR" conjunction is applied
	 * @param {sap.ui.model.FilterOperator|function|boolean} [vOperator] Either a filter operator or a custom filter function or a Boolean flag that defines how to combine multiple filters
	 * @param {any} [oValue1] First value to use with the given filter operator
	 * @param {any} [oValue2] Second value to use with the given filter operator (only for some operators)
	 * @public
	 * @alias sap.ui.model.Filter
	 */
	var Filter = BaseObject.extend("sap.ui.model.Filter", /** @lends sap.ui.model.Filter.prototype */ {
		constructor : function(vFilterInfo, vOperator, oValue1, oValue2){
			//There are two different ways of specifying a filter
			//It can be passed in only one object or defined with parameters
			if (typeof vFilterInfo === "object" && !jQuery.isArray(vFilterInfo)) {
				this.sPath = vFilterInfo.path;
				this.sOperator = vFilterInfo.operator;
				this.oValue1 = vFilterInfo.value1;
				this.oValue2 = vFilterInfo.value2;
				this.aFilters = vFilterInfo.filters || vFilterInfo.aFilters; // support legacy name 'aFilters' (intentionally not documented)
				this.bAnd = vFilterInfo.and || vFilterInfo.bAnd; // support legacy name 'bAnd' (intentionally not documented)
				this.fnTest = vFilterInfo.test;
			} else {
				//If parameters are used we have to check whether a regular or a multi filter is specified
				if (jQuery.isArray(vFilterInfo)) {
					this.aFilters = vFilterInfo;
				} else {
					this.sPath = vFilterInfo;
				}
				if (jQuery.type(vOperator) === "boolean") {
					this.bAnd = vOperator;
				} else if (jQuery.type(vOperator) === "function" ) {
					this.fnTest = vOperator;
				} else {
					this.sOperator = vOperator;
				}
				this.oValue1 = oValue1;
				this.oValue2 = oValue2;
			}
			// apply normalize polyfill to non mobile browsers when it is a string filter
			if (!String.prototype.normalize && typeof this.oValue1 == "string" && !Device.browser.mobile) {
				jQuery.sap.require("jquery.sap.unicode");
			}
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

	return Filter;

});
