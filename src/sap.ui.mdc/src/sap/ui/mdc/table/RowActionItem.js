/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/table/RowItemActionItemBase",
	// load for availability
	"sap/ui/mdc/enums/TableRowActionType"
], (
	RowItemActionItemBase,
	TableRowActionType
) => {
	"use strict";

	/**
	 * Constructor for new RowActionItem.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The <code>RowActionItem</code> control represents a action for a row.
	 * This control can only be used in the context of <code>sap.ui.mdc.Table</code> control to define row actions.
	 *
	 * <b>Note:</b> A custom <code>text</code> or <code>icon</code> cannot be set when the table type is
	 * {@link sap.ui.mdc.table.ResponsiveTableType ResponsiveTable}.
	 *
	 * <b>Note:</b> If the table type is {@link sap.ui.mdc.table.GridTableType GridTable}, the <code>press</code> event is fired when a row
	 * action item is pressed. If the table type is {@link sap.ui.mdc.table.ResponsiveTableType ResponsiveTable}, the <code>press</code> event
	 * and the table's <code>rowPress</code> event are fired when a row with a row action item is pressed.
	 * @extends sap.ui.mdc.table.RowItemActionItemBase
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.mdc.table.RowActionItem
	 */
	const RowActionItem = RowItemActionItemBase.extend("sap.ui.mdc.table.RowActionItem", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Type of the row action item.
				 *
				 * Setting the type ensures default values for the properties <code>icon</code> and <code>text</code>. If an icon or text is set
				 * explicitly, this setting is used.
				 */
				type: {type: "sap.ui.mdc.enums.TableRowActionType", defaultValue: TableRowActionType.Custom}
			}
		}
	});

	return RowActionItem;
});
