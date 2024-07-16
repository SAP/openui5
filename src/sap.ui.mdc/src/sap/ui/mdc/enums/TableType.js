/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 * Type of the table.
	 *
	 * @enum {string}
	 * @alias sap.ui.mdc.enums.TableType
	 * @since 1.115
	 * @public
	 */
	const TableType = {
		/**
		 * Equivalent to the default configuration of {@link sap.ui.mdc.table.GridTableType}
		 *
		 * @public
		 */
		Table: "Table",
		/**
		 * Equivalent to the default configuration of {@link sap.ui.mdc.table.TreeTableType}
		 *
		 * @private
		 */
		TreeTable: "TreeTable",
		/**
		 * Equivalent to the default configuration of {@link sap.ui.mdc.table.ResponsiveTableType}
		 *
		 * @public
		 */
		ResponsiveTable: "ResponsiveTable"
	};

	DataType.registerEnum("sap.ui.mdc.enums.TableType", TableType);

	return TableType;

});