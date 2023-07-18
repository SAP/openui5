/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.mdc.enum.BaseType
sap.ui.define(function() {
	"use strict";


	/**
	 * Enumeration of the possible basic data types
	 *
	 * In {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.MultiValueField MultiValueField},
	 * and {@link sap.ui.mdc.FilterField FilterField}, different data types can be used. These data types might
	 * be model-dependent. To handle them model-independently, basic types are used internally.
	 *
	 * @enum {string}
	 * @since 1.74.0
	 * @alias sap.ui.mdc.enum.BaseType
	 * @private
	 * @ui5-restricted sap.fe
	 * @deprecated since 1.115.0 - please see {@link sap.ui.mdc.enums.BaseType}
	 */
	var BaseType = {
		/**
		 * Data type represents a string
		 * @public
		 */
		String: "String",

		/**
		 * Data type represents a number.
		 * (This can be integer, float or any other numeric type.)
		 * @public
		 */
		Numeric: "Numeric",

		/**
		 * Data type represents a Boolean
		 * @public
		 */
		Boolean: "Boolean",

		/**
		 * Data type represents a date
		 * @public
		 */
		Date: "Date",

		/**
		 * Data type represents a time
		 * @public
		 */
		Time: "Time",

		/**
		 * Data type represents a date with time
		 * @public
		 */
		DateTime: "DateTime",

		/**
		 * Data type represents a unit.
		 * A composite type with a number and a unit part is used.
		 * @public
		 */
		Unit: "Unit"
	};

	return BaseType;

}, /* bExport= */ true);
