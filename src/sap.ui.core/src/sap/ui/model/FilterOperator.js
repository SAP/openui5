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
			 *
			 * Used to filter all entries between the given boundaries.
			 * The filter result contains the boundaries, but no entries before or further.
			 * The order of the entries in the filter results is based on their occurrence in the input list.
			 *
			 * <b>Note, when used on strings:</b>
			 * The String comparison is based on lexicographical ordering.
			 * Characters are ranked in their alphabetical order.
			 * Words with the same preceding substring are ordered based on their length
			 * e.g. "Chris" comes before "Christian".
			 *
			 * The filtering includes the right boundary, but no strings further in the lexicographical ordering.
			 * e.g. between "A" and "C" includes the string "C", but not "Chris".
			 *
			 * @example
			 * <b>Numbers</b>
			 * [7, 1, 4, 3, 6, 5, 2, 8]
			 * between 4 and 6
			 * result: [4, 6, 5]
			 *
			 * @public
			 */
			BT: "BT",

			/**
			 * FilterOperator "Not Between"
			 *
			 * Used to filter all entries, which are not between the given boundaries.
			 * The filter result does not contains the boundaries, but only entries outside of the boundaries.
			 * The order of the entries in the filter results is based on their occurrence in the input list.
			 *
			 * <b>Note, when used on strings:</b>
			 * The String comparison is based on lexicographical ordering.
			 * Characters are ranked in their alphabetical order.
			 * Words with the same preceding substring are ordered based on their length
			 * e.g. "Chris" comes before "Christian".
			 *
			 * @example
			 * <b>Numbers</b>
			 * [7, 1, 4, 3, 6, 5, 2, 8]
			 * not between 4 and 6
			 * result: [7, 1, 3, 2, 8]
			 *
			 * @since 1.58.0
			 * @public
			 */
			NB: "NB",

			/**
			 * FilterOperator contains
			 * @public
			 */
			Contains: "Contains",

			/**
			 * FilterOperator not contains
			 *
			 * @since 1.58.0
			 * @public
			 */
			NotContains: "NotContains",

			/**
			 * FilterOperator starts with
			 *
			 * @public
			 */
			StartsWith: "StartsWith",

			/**
			 * FilterOperator not starts with
			 *
			 * @since 1.58.0
			 * @public
			 */
			NotStartsWith: "NotStartsWith",

			/**
			 * FilterOperator ends with
			 *
			 * @public
			 */
			EndsWith: "EndsWith",

			/**
			 * FilterOperator not ends with
			 *
			 * @since 1.58.0
			 * @public
			 */
			NotEndsWith: "NotEndsWith",

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
