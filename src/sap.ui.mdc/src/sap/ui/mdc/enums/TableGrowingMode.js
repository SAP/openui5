/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 * Growing mode of the table.
	 *
	 * @enum {string}
	 * @alias sap.ui.mdc.enums.TableGrowingMode
	 * @since 1.115
	 * @public
	 */
	const TableGrowingMode = {
		/**
		 * A fixed number of rows is shown
		 *
		 * @public
		 */
		None: "None",
		/**
		 * A More button is shown with which the user can request to load more rows
		 *
		 * @public
		 */
		Basic: "Basic",
		/**
		 * Either the user requests to load more rows by scrolling down, or the More button is displayed if no scrolling is required because the
		 * table is fully visible
		 *
		 * @public
		 */
		Scroll: "Scroll"
	};

	DataType.registerEnum("sap.ui.mdc.enums.TableGrowingMode", TableGrowingMode);

	return TableGrowingMode;

});