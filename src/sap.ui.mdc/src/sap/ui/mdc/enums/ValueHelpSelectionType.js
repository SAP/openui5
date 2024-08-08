/*!
 * ${copyright}
 */

// Provides enumeration sap.ui.mdc.enums.ValueHelpSelectionType
sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";


	/**
	 * Enumeration of the possible selection types in {@link sap.ui.mdc.ValueHelp ValueHelp}
	 *
	 * @enum {string}
	 * @public
	 * @since 1.115
	 * @alias sap.ui.mdc.enums.ValueHelpSelectionType
	 */
	const ValueHelpSelectionType = {
		/**
		 * The given conditions are set and replace the existing ones.
		 */
		Set: "Set",

		/**
		 * The given conditions are just added to the existing ones, if they don't already exist.
		 */
		Add: "Add",

		/**
		 * The given conditions are removed.
		 */
		Remove: "Remove"
	};

	DataType.registerEnum("sap.ui.mdc.enums.ValueHelpSelectionType", ValueHelpSelectionType);

	return ValueHelpSelectionType;

});