/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 * Row count mode of the table.
	 *
	 * @enum {string}
	 * @alias sap.ui.mdc.enums.TableRowCountMode
	 * @since 1.115
	 * @public
	 */
	const TableRowCountMode = {
		/**
		 * The table automatically fills the height of the surrounding container
		 *
		 * @public
		 */
		Auto: "Auto",
		/**
		 * A fixed number of rows is shown
		 *
		 * @public
		 */
		Fixed: "Fixed",
		/**
		 * The user can change the number of displayed rows by dragging a resizer
		 *
		 * @public
		 * @since 1.130
		 */
		Interactive: "Interactive"
	};

	DataType.registerEnum("sap.ui.mdc.enums.TableRowCountMode", TableRowCountMode);

	return TableRowCountMode;

});