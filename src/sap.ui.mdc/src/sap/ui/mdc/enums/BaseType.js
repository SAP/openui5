/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.mdc.enums.BaseType
sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
	"use strict";


	/**
	 * Enumeration of the possible basic data types
	 *
	 * In {@link sap.ui.mdc.Field Field}, {@link sap.ui.mdc.MultiValueField MultiValueField},
	 * and {@link sap.ui.mdc.FilterField FilterField}, different data types can be used. These data types might
	 * be model-dependent. To handle them model-independently, basic types are used internally.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.115
	 * @alias sap.ui.mdc.enums.BaseType
	 */
	const BaseType = {
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

	DataType.registerEnum("sap.ui.mdc.enums.BaseType", BaseType);

	return BaseType;

}, /* bExport= */ true);
