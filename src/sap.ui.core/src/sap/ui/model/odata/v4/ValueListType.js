/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.model.odata.v4.ValueListType
sap.ui.define(function () {
	"use strict";

	// noinspection UnnecessaryLocalVariableJS
	/**
	 * Specifies the value list type of a property.
	 *
	 * @alias sap.ui.model.odata.v4.ValueListType
	 * @enum {string}
	 * @public
	 * @readonly
	 * @since 1.45.0
	 *
	 * @see sap.ui.model.odata.v4.ODataMetaModel#getValueListType
	 */
	var ValueListType = { // keep the var for JSDoc generation
		/**
		 * There is no value list.
		 *
		 * @constant
		 * @public
		 * @since 1.45.0
		 */
		None : "None",

		/**
		 * There is one enumeration of fixed values.
		 *
		 * @constant
		 * @public
		 * @since 1.45.0
		 */
		Fixed : "Fixed",

		/**
		 * There is a dynamic value list with multiple queries including selection criteria.
		 *
		 * @constant
		 * @public
		 * @since 1.45.0
		 */
		Standard : "Standard"
	};

	return ValueListType;
}, /* bExport= */ true);
