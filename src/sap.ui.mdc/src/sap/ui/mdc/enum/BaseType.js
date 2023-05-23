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
	 * @private
	 * @ui5-restricted sap.fe
	 * @experimental As of version 1.74.0
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.74.0
	 * @alias sap.ui.mdc.enum.BaseType
	 */
	var BaseType = {
		/**
		 * Data type represents a string
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 */
		String: "String",

		/**
		 * Data type represents a number.
		 * (This can be integer, float or any other numeric type.)
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 */
		Numeric: "Numeric",

		/**
		 * Data type represents a Boolean
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 */
		Boolean: "Boolean",

		/**
		 * Data type represents a date
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 */
		Date: "Date",

		/**
		 * Data type represents a time
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 */
		Time: "Time",

		/**
		 * Data type represents a date with time
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 */
		DateTime: "DateTime",

		/**
		 * Data type represents a unit.
		 * A composite type with a number and a unit part is used.
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 */
		Unit: "Unit"
	};

	return BaseType;

}, /* bExport= */ true);
