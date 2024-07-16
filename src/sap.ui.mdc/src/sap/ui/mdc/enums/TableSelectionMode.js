/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], (DataType) => {
	"use strict";

	/**
	 * Selection mode of the table.
	 *
	 * @enum {string}
	 * @alias sap.ui.mdc.enums.TableSelectionMode
	 * @since 1.115
	 * @public
	 */
	const TableSelectionMode = {
		/**
		 * No row selection available
		 *
		 * @public
		 */
		None: "None",
		/**
		 * Only one row can be selected at a time
		 *
		 * @public
		 */
		Single: "Single",
		/**
		 * Only one row can be selected at a time. The selection column is not shown. Instead, the user can press the row to select it.
		 *
		 * <b>Note:</b> If this selection mode is used, the table does not fire the <code>rowPress</code> event.
		 *
		 * @public
		 */
		SingleMaster: "SingleMaster",
		/**
		 * Multiple rows can be selected at a time
		 *
		 * @public
		 */
		Multi: "Multi"
	};

	DataType.registerEnum("sap.ui.mdc.enums.TableSelectionMode", TableSelectionMode);

	return TableSelectionMode;

});