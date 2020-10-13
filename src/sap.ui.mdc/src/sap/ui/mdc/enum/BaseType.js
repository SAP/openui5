/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.mdc.enum.BaseType
sap.ui.define(function() {
	"use strict";


	/**
	 * Enumeration of the possible basic data types
	 *
	 * In <code>Field</code> and <code>FilterField</code> different data types can be used. This data types might
	 * be model dependent. To handle them model independent internally basic types are used.
	 *
	 * @enum {string}
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.74.0
	 * @alias sap.ui.mdc.enum.BaseType
	 */
	var BaseType = {
		/**
		 * Data type represents a string
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		String: "String",

		/**
		 * Data type represents a number.
		 * (This can be integer, float or any other numeric type.)
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Numeric: "Numeric",

		/**
		 * Data type represents a boolean
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Boolean: "Boolean",

		/**
		 * Data type represents a date
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Date: "Date",

		/**
		 * Data type represents a time
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Time: "Time",

		/**
		 * Data type represents a date with time
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		DateTime: "DateTime",

		/**
		 * Data type represents a unit.
		 * This means a composite type with a number and a unit part is used.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Unit: "Unit"
	};

	return BaseType;

}, /* bExport= */ true);
