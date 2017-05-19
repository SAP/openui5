/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.model.FilterOperator
sap.ui.define(function() {
	"use strict";


	/**
	* Operators for the Filter.
	*
	* @enum {string}
	* @public
	* @alias sap.ui.model.FilterOperator
	*/
	var FilterOperator = {
			/**
			 * FilterOperator equals
			 * @public
			 */
			EQ: "EQ",

			/**
			 * FilterOperator not equals
			 * @public
			 */
			NE: "NE",

			/**
			 * FilterOperator less than
			 * @public
			 */
			LT: "LT",

			/**
			 * FilterOperator less or equals
			 * @public
			 */
			LE: "LE",

			/**
			 * FilterOperator greater than
			 * @public
			 */
			GT: "GT",

			/**
			 * FilterOperator greater or equals
			 * @public
			 */
			GE: "GE",

			/**
			 * FilterOperator between
			 * When used on strings, the BT operator might not behave intuitively. For example,
			 * when filtering a list of Names with BT "A", "B", all Names starting with "A" will be
			 * included as well as the name "B" itself, but no other name starting with "B".
			 * @public
			 */
			BT: "BT",

			/**
			 * FilterOperator contains
			 * @public
			 */
			Contains: "Contains",

			/**
			 * FilterOperator starts with
			 * @public
			 */
			StartsWith: "StartsWith",

			/**
			 * FilterOperator ends with
			 * @public
			 */
			EndsWith: "EndsWith",

			/**
			 * Used to filter a list based on filter criteria that are defined in a nested filter for dependent subitems.
			 * <code>All</code> returns a list of those items for which <b>all</b> dependent subitems match the filter criteria of the nested filter.
			 * For example, a list of customers can be filtered by filter criteria that are applied to the list of orders the customer placed in the past.
			 * The filter returns a list of those customers that <b>always</b> ordered a specific product.
			 *
			 * This filter operator is only supported in OData V4 models.
			 *
			 * @since 1.48.0
			 * @public
			 */
			All: "All",

			/**
			 * Used to filter a list based on filter criteria that are defined in a nested filter for dependent subitems.
			 * <code>Any</code> returns a list of those items for which <b>at least one</b> dependent subitem matches the filter criteria of the nested filter.
			 * For example, a list of customers can be filtered by filter criteria that are applied to the list of orders the customer placed in the past.
			 * The filter returns a list of those customers that <b>at least once</b> ordered a specific product.
			 *
			 * This filter operator is only supported in OData V4 models.
			 *
			 * @since 1.48.0
			 * @public
			 */
			Any: "Any"
	};

	return FilterOperator;

}, /* bExport= */ true);
