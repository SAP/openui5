/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides enumeration sap.ui.model.FilterOperator
jQuery.sap.declare("sap.ui.model.FilterOperator");

/**
* @class
* Operators for the Filter.
*
* @static
* @public
*/
sap.ui.model.FilterOperator = {
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
		EndsWith: "EndsWith"
};