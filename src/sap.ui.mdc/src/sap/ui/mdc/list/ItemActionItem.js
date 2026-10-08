/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/table/RowItemActionItemBase",
	// load for availability
	"sap/ui/mdc/enums/ListActionType"
], (
	RowItemActionItemBase,
	ListActionType
) => {
	"use strict";

	/**
	 * Constructor for new ItemActionItem.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The <code>ItemActionItem</code> control represents an action for a list item.
	 * This control can only be used in the context of <code>sap.ui.mdc.List</code> control to define item actions.
	 * @extends sap.ui.mdc.table.RowItemActionItemBase
	 *
	 * @ui5-restricted sap.fe
	 * @since 1.153
	 * @alias sap.ui.mdc.list.ItemActionItem
	 */
	const ItemActionItem = RowItemActionItemBase.extend("sap.ui.mdc.list.ItemActionItem", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Type of the item action.
				 *
				 * Setting the type ensures default values for the properties <code>icon</code> and <code>text</code>.
				 * If an icon or text is set explicitly, this setting is used.
				 */
				type: {type: "sap.ui.mdc.enums.ListActionType", defaultValue: ListActionType.Custom}
			}
		}
	});

	return ItemActionItem;
});
