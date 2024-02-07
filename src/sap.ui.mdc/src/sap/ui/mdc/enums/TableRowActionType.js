/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 * Type of a table row action.
	 *
	 * @enum {string}
	 * @alias sap.ui.mdc.enums.TableRowActionType
	 * @since 1.115
	 * @public
	 */
	const TableRowActionType = {
		/**
		 * Navigation arrow (chevron) is shown
		 *
		 * @public
		 */
		Navigation: "Navigation"
	};

	DataType.registerEnum("sap.ui.mdc.enums.TableRowActionType", TableRowActionType);

	return TableRowActionType;

});