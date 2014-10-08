/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.model.FilterOperator
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	* @class
	* Operators for the Filter.
	*
	* @static
	* @public
	* @name sap.ui.model.FilterOperator
	*/
	var FilterOperator = {
			/**
			 * FilterOperator equals
			 * @name sap.ui.model.FilterOperator#EQ
			 * @public
			 */
			EQ: "EQ",
	
			/**
			 * FilterOperator not equals
			 * @name sap.ui.model.FilterOperator#NE
			 * @public
			 */
			NE: "NE",
	
			/**
			 * FilterOperator less than
			 * @name sap.ui.model.FilterOperator#LT
			 * @public
			 */
			LT: "LT",
	
			/**
			 * FilterOperator less or equals
			 * @name sap.ui.model.FilterOperator#LE
			 * @public
			 */
			LE: "LE",
	
			/**
			 * FilterOperator greater than
			 * @name sap.ui.model.FilterOperator#GT
			 * @public
			 */
			GT: "GT",
	
			/**
			 * FilterOperator greater or equals
			 * @name sap.ui.model.FilterOperator#GE
			 * @public
			 */
			GE: "GE",
	
			/**
			 * FilterOperator between.
			 * When used on strings, the BT operator might not behave intuitively. For example, 
			 * when filtering a list of Names with BT "A", "B", all Names starting with "A" will be 
			 * included as well as the name "B" itself, but no other name starting with "B".
			 * @name sap.ui.model.FilterOperator#BT
			 * @public
			 */
			BT: "BT",
	
			/**
			 * FilterOperator contains
			 * @name sap.ui.model.FilterOperator#Contains
			 * @public
			 */
			Contains: "Contains",
	
			/**
			 * FilterOperator starts with
			 * @name sap.ui.model.FilterOperator#StartsWith
			 * @public
			 */
			StartsWith: "StartsWith",
	
			/**
			 * FilterOperator ends with
			 * @name sap.ui.model.FilterOperator#EndsWith
			 * @public
			 */
			EndsWith: "EndsWith"
	};

	return FilterOperator;

}, /* bExport= */ true);
