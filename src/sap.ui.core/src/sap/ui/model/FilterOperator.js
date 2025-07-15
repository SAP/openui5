/*!
 * ${copyright}
 */
/*eslint-disable max-len */
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
			 * Used to filter a list based on filter criteria that are defined in a nested filter for dependent
			 * subitems. <code>All</code> returns a list of all items for which it is <b>true</b> that all dependent
			 * subitems match the filter criteria of the nested filter. This means that <b>every</b> dependent subitem
			 * matches the filter criteria.
			 *
			 * This filter operator is only supported in OData V4 models.
			 *
			 * @example <caption>Retrieve all individuals whose trips are all named "Walldorf":</caption>
			 * new Filter({
			 *   path: "Trips",
			 *   operator: FilterOperator.All,
			 *   variable: "trip",
			 *   condition: new Filter({ path: "trip/Name", operator: FilterOperator.EQ, value1: "Walldorf" })
			 * });
			 *
			 * @since 1.48.0
			 * @public
			 */
			All: "All",

			/**
			 * Used to filter a list based on filter criteria that are defined in a nested filter for dependent
			 * subitems. <code>NotAll</code> returns a list of all items for which it is <b>false</b> that all
			 * dependent subitems match the filter criteria of the nested filter. This means that <b>at least one</b>
			 * dependent subitem does not match the filter criteria.
			 *
			 * This filter operator is only supported in OData V4 models.
			 *
			 * @example <caption>Retrieve all individuals whose trips do not all have the name "Walldorf":</caption>
			 * new Filter({
			 *   path: "Trips",
			 *   operator: FilterOperator.NotAll,
			 *   variable: "trip",
			 *   condition: new Filter({ path: "trip/Name", operator: FilterOperator.EQ, value1: "Walldorf" })
			 * });
			 *
			 * @since 1.139.0
			 * @public
			 */
			NotAll: "NotAll",

			/**
			 * Used to filter a list based on filter criteria that are defined in a nested filter for dependent
			 * subitems. <code>Any</code> returns a list of all items for which <b>at least one</b> dependent subitem
			 * matches the filter criteria of the nested filter.
			 *
			 * This filter operator is only supported in OData V4 models.
			 *
			 * @example <caption>Retrieve all individuals who have at least one trip:</caption>
			 * new Filter({
			 *   path: "Trips",
			 *   operator: FilterOperator.Any
			 * });
			 *
			 * @example <caption>Retrieve all individuals who have at least one trip with a budget exceeding 1000:</caption>
			 * new Filter({
			 *   path: "Trips",
			 *   operator: FilterOperator.Any,
			 *   variable: "trip",
			 *   condition: new Filter({ path: "trip/Budget", operator: FilterOperator.GT, value1: 1000 })
			 * });
			 *
			 * @since 1.48.0
			 * @public
			 */
			Any: "Any",

			/**
			 * Used to filter a list based on filter criteria that are defined in a nested filter for dependent
			 * subitems. <code>NotAny</code> returns a list of all items for which <b>none</b> of the dependent
			 * subitems match the filter criteria of the nested filter. If no filter condition is given,
			 * <code>NotAny</code> returns all items that do not have any dependent subitems (i.e., for which the
			 * collection is empty).
			 *
			 * This filter operator is only supported in OData V4 models.
			 *
			 * @example <caption>Retrieve all individuals who have no trips at all (the result of any() is empty):</caption>
			 * new Filter({
			 *   path: "Trips",
			 *   operator: FilterOperator.NotAny
			 * });
			 *
			 * @example <caption>Retrieve all individuals who have no trips with the status "Rejected":</caption>
			 * new Filter({
			 *   path: "Trips",
			 *   operator: FilterOperator.NotAny,
			 *   variable: "trip",
			 *   condition: new Filter({ path: "trip/Status", operator: FilterOperator.EQ, value1: "Rejected" })
			 * });
			 *
			 * @since 1.139.0
			 * @public
			 */
			NotAny: "NotAny"
	};

	return FilterOperator;

}, /* bExport= */ true);
