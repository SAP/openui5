/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 * Mode of a selection plugin.
	 *
	 * @enum {string}
	 * @alias sap.ui.table.plugins.SelectionMode
	 * @private
	 */
	const SelectionMode = {
		/**
		 * Only one row can be selected at a time.
		 *
		 * @public
		 */
		Single: "Single",

		/**
		 * Multiple rows can be selected.
		 *
		 * @public
		 */
		MultiToggle: "MultiToggle"
	};

	DataType.registerEnum("sap.ui.table.plugins.SelectionMode", SelectionMode);

	return SelectionMode;
});