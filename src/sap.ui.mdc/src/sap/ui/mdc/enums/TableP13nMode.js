/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 * Personalization mode of the table.
	 *
	 * @enum {string}
	 * @alias sap.ui.mdc.enums.TableP13nMode
	 * @since 1.115
	 * @public
	 */
	const TableP13nMode = {
		/**
		 * Columns can be shown, hidden and reordered
		 *
		 * @public
		 */
		Column: "Column",
		/**
		 * The table can be sorted
		 *
		 * @public
		 */
		Sort: "Sort",
		/**
		 * The table can be filtered
		 *
		 * @public
		 */
		Filter: "Filter",
		/**
		 * The table can be grouped
		 *
		 * @public
		 */
		Group: "Group",
		/**
		 * The table can be aggregated
		 *
		 * @public
		 */
		Aggregate: "Aggregate"
	};

	DataType.registerEnum("sap.ui.mdc.enums.TableP13nMode", TableP13nMode);

	return TableP13nMode;

});