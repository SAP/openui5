/*!
 * ${copyright}
 */

// Provides a filter for list bindings
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object', './FilterOperator'],
	function(jQuery, BaseObject, FilterOperator) {
	"use strict";

	/**
	 * Constructor for Filter.
	 *
	 * You either pass a single object literal with the filter parameters or use the individual constructor arguments.
	 * No matter which variant is used, only certain combinations of parameters are supported
	 * (the following list uses the names from the object literal):
	 * <ul>
	 * <li>A <code>path</code>, <code>operator</code> and one or two values (<code>value1</code>, <code>value2</code>), depending on the operator</li>
	 * <li>A <code>path</code> and a custom filter function <code>test</code></li>
	 * <li>An array of other filters named <code>filters</code> and a Boolean flag <code>and</code> that specifies whether to combine
	 *     the filters with an AND (<code>true</code>) or an OR (<code>false</code>) operator.</li>
	 * </ul>
	 * An error will be logged to the console if an invalid combination of parameters is provided.
	 * Please note that a model implementation may not support a custom filter function, e.g. if the model does not perform client side filtering.
	 * It also depends on the model implementation if the filtering is case sensitive or not.
	 * See particular model documentation for details.
	 *
	 * The filter operators <code>Any</code> and <code>All</code> are only supported in V4 OData models.
	 * When creating a filter instance with these filter operators, the argument <code>variable</code> only accepts a string identifier and <code>condition</code> needs to be another filter instance.
	 *
	 * @example <caption>Using an object with a path, an operator and one or two values</caption>
	 *
	 *   sap.ui.define(['sap/ui/model/Filter', 'sap/ui/model/FilterOperator'], function(Filter, FilterOperator) {
	 *     new Filter({
	 *       path: "Price",
	 *       operator: FilterOperator.BT,
	 *       value1: 11.0,
	 *       value2: 23.0
	 *     });
	 *   });
	 *
	 * @example <caption>Using a path and a custom filter function</caption>
	 *
	 *   new sap.ui.model.Filter({
	 *     path: "Price",
	 *     test: function(oValue) {
	 *        ...
	 *     }
	 *   })
	 *
	 * @example <caption>Combining a list of filters either with AND or OR</caption>
	 *
	 *   new Filter({
	 *     filters: [
	 *       ...
	 *       new Filter({
	 *         path: 'Quantity',
	 *         operator: FilterOperator.LT,
	 *         value1: 20
	 *       }),
	 *       new Filter({
	 *         path: 'Price',
	 *         operator: FilterOperator.GT,
	 *         value1: 14.0
	 *       })
	 *       ...
	 *     ],
	 *     and: true|false
	 *   })
	 *
	 * @example <caption>The filter operators <code>Any</code> and <code>All</code> map to the OData V4 lambda operators <code>any</code> and <code>all</code>.
	 * They take a variable and another filter as parameter and evaluate it on either a collection property or a collection of entities.</caption>
	 *
	 *   // find Orders where all of the 'Items' in the order have a 'Quantity' > 100
	 *   // (assumes that Filter and FilterOperator have been declared as dependencies, see previous examples)
	 *   new Filter({
	 *     path: 'Items',
	 *     operator: FilterOperator.All,
	 *     variable: 'item',
	 *     condition: new Filter({
	 *       path: 'item/Quantity',
	 *       operator: FilterOperator.GT,
	 *       value1: 100.0
	 *     })
	 *   });
	 *
	 * @example <caption>For the filter operator <code>Any</code> either both a lambda <code>variable</code> and a <code>condition</code> have to be given or neither.</caption>
	 *   new Filter({
	 *     path: 'Items',
	 *     operator: FilterOperator.Any
	 *   });
	 *
	 * @example <caption>Legacy signature: Same as above, but using individual constructor arguments. Not supported for filter operators <code>Any</code> and <code>All</code>.</caption>
	 *
	 *     new sap.ui.model.Filter(sPath, sOperator, vValue1, vValue2);
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
	 * @param {function} vFilterInfo.comparator Function which is used to compare two values, this is used for processing of equal, less than and greater than operators
	 * @param {sap.ui.model.FilterOperator} vFilterInfo.operator Operator used for the filter
	 * @param {object} vFilterInfo.value1 First value to use with the given filter operator
	 * @param {object} [vFilterInfo.value2=null] Second value to use with the filter operator (only for some operators)
	 * @param {string} [vFilterInfo.variable] The variable used in lambda operators (<code>Any</code> and <code>All</code>)
	 * @param {sap.ui.model.Filter} [vFilterInfo.condition] A <code>Filter</code> instance which will be used as the condition for the lambda operator
	 * @param {sap.ui.model.Filter[]} vFilterInfo.filters Array of filters on which logical conjunction is applied
	 * @param {boolean} vFilterInfo.and Indicates whether an "AND" logical conjunction is applied on the filters. If it's set to <code>false</code>, an "OR" conjunction is applied
	 * @param {boolean} vFilterInfo.caseSensitive Indicates whether a string value should be compared case sensitive or not.
	 * @param {sap.ui.model.FilterOperator|function|boolean} [vOperator] Either a filter operator or a custom filter function or a Boolean flag that defines how to combine multiple filters
	 * @param {any} [vValue1] First value to use with the given filter operator
	 * @param {any} [vValue2] Second value to use with the given filter operator (only for some operators)
	 * @public
	 * @alias sap.ui.model.Filter
	 * @extends sap.ui.base.Object
	 */
	var Filter = BaseObject.extend("sap.ui.model.Filter", /** @lends sap.ui.model.Filter.prototype */ {
		constructor : function(vFilterInfo, vOperator, vValue1, vValue2){
			//There are two different ways of specifying a filter
			//It can be passed in only one object or defined with parameters
			if (typeof vFilterInfo === "object" && !Array.isArray(vFilterInfo)) {
				this.sPath = vFilterInfo.path;
				this.sOperator = vFilterInfo.operator;
				this.oValue1 = vFilterInfo.value1;
				this.oValue2 = vFilterInfo.value2;
				this.sVariable = vFilterInfo.variable;
				this.oCondition = vFilterInfo.condition;
				this.aFilters = vFilterInfo.filters || vFilterInfo.aFilters; // support legacy name 'aFilters' (intentionally not documented)
				this.bAnd = vFilterInfo.and || vFilterInfo.bAnd; // support legacy name 'bAnd' (intentionally not documented)
				this.fnTest = vFilterInfo.test;
				this.fnCompare = vFilterInfo.comparator;
				this.bCaseSensitive = !!vFilterInfo.caseSensitive;
			} else {
				//If parameters are used we have to check whether a regular or a multi filter is specified
				if (Array.isArray(vFilterInfo)) {
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
				this.oValue1 = vValue1;
				this.oValue2 = vValue2;

				if (this.sOperator === FilterOperator.Any || this.sOperator === FilterOperator.All) {
					throw new Error("The filter operators 'Any' and 'All' are only supported with the parameter object notation.");
				}
			}

			if (this.sOperator === FilterOperator.Any) {
				// for the Any operator we only have to further check the arguments if both are given
				if (this.sVariable && this.oCondition) {
					this._checkLambdaArgumentTypes();
				} else if (!this.sVariable && !this.oCondition) {
					// 'Any' accepts no arguments
				} else {
					// one argument is missing
					throw new Error("When using the filter operator 'Any', a lambda variable and a condition have to be given or neither.");
				}
			} else if (this.sOperator === FilterOperator.All) {
				this._checkLambdaArgumentTypes();
			} else {
				// multi-filters
				if (Array.isArray(this.aFilters) && !this.sPath && !this.sOperator && !this.oValue1 && !this.oValue2) {
					this._bMultiFilter = true;
					if ( !this.aFilters.every(isFilter) ) {
						jQuery.sap.log.error("Filter in Aggregation of Multi filter has to be instance of sap.ui.model.Filter");
					}
				} else if (!this.aFilters && this.sPath !== undefined && ((this.sOperator && this.oValue1 !== undefined) || this.fnTest)) {
					this._bMultiFilter = false;
				} else {
					jQuery.sap.log.error("Wrong parameters defined for filter.");
				}
			}
		}
	});

	/**
	 * Checks the types of the arguments for a lambda operator.
	 * @private
	 */
	Filter.prototype._checkLambdaArgumentTypes = function () {
		if (!this.sVariable || typeof this.sVariable !== "string") {
			throw new Error("When using the filter operators 'Any' or 'All', a string has to be given as argument 'variable'.");
		}
		if (!isFilter(this.oCondition)) {
			throw new Error("When using the filter operator 'Any' or 'All', a valid instance of sap.ui.model.Filter has to be given as argument 'condition'.");
		}
	};

	function isFilter(v) {
		return v instanceof Filter;
	}

	/**
	 * Compares two values
	 *
	 * This is the default comparator function used for clientside filtering, if no custom comparator is given in the
	 * constructor. It does compare just by using equal/less than/greater than with automatic type casting, except
	 * for null values, which are neither less or greater, and string values where localeCompare is used.
	 *
	 * The comparator method returns -1, 0, 1 for comparable values and NaN for non-comparable values.
	 *
	 * @param {any} a the first value to compare
	 * @param {any} b the second value to compare
	 * @returns {int} -1, 0, 1 or NaN depending on the compare result
	 * @public
	 */
	Filter.defaultComparator = function(a, b) {
		if (a == b) {
			return 0;
		}
		if (a == null || b == null) {
			return NaN;
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
		return NaN;
	};


	return Filter;

});
