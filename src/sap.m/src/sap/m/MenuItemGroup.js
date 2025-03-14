/*!
 * ${copyright}
 */

// Provides control sap.m.MenuItemGroup.
sap.ui.define([
	'sap/ui/core/Element',
	'sap/ui/Device',
	'sap/ui/core/library'
], function(
	Element,
	Device,
	coreLibrary
) {
	"use strict";

	// Shortcut for sap.ui.core.ItemSelectionMode
	const ItemSelectionMode = coreLibrary.ItemSelectionMode;

	/**
	 * Constructor for a new MenuItemGroup element.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Group item to be used inside a menu. Represents a collection of menu items that can have the same selection mode
	 * (e.g. {@link sap.ui.core.ItemSelectionMode.None}, {@link sap.ui.core.ItemSelectionMode.SingleSelect}, or {@link sap.ui.core.ItemSelectionMode.MultiSelect}).
	 * @extends sap.ui.core.Element
	 * @implements sap.m.IMenuItem
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.127.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.MenuItemGroup
	 */
	const MenuItemGroup = Element.extend("sap.m.MenuItemGroup", /** @lends sap.m.MenuItemGroup.prototype */ {
		metadata : {
			interfaces: [
				"sap.m.IMenuItem"
			],
				library : "sap.m",
			properties : {

				/**
				 * Defines the selection mode of the child items (e.g. <code>None</code>, <code>SingleSelect</code>, <code>MultiSelect</code>)
				 */
				itemSelectionMode : {type : "sap.ui.core.ItemSelectionMode", group : "Behavior", defaultValue : ItemSelectionMode.None}

			},
			aggregations : {

				/**
				 * The available items of the menu.
				 * <b>Note:</b> Adding MenuItemGroup as an item to the MenuItemGroup is not supported.
				 */
				items : {type : "sap.m.IMenuItem", multiple : true, singularName : "item"}

			},
			associations : {

				/**
				 * Parent menu object.
				 */
				_menu : {type : "sap.m.Menu",  visibility : "hidden"}

			}
		}
	});

	/**
	 * Sets <code>selected</code> property of all items in the group to <code>false</code>.
	 *
	 * @param {string} sGroup  The key identifier for the group whose items' selection states are to be cleared, if necessary.
	 * @private
	 */
	MenuItemGroup.prototype._clearSelectedItems = function() {
		this.getItems().forEach((oItem) => oItem.setSelected && oItem.setSelected(false));
	};

	/**
	 * Ensures that only one item remains selected in the group, provided that any items have been selected.
	 *
	 * @private
	 */
	MenuItemGroup.prototype._ensureSingleSelection = function() {
		const aItems = this.getItems(),
			aSelectedItems = aItems.map((item) => item.getSelected()),
			iSelectedItemIndex = aSelectedItems.lastIndexOf(true);

		this._clearSelectedItems();
		if (iSelectedItemIndex !== -1) {
			aItems[iSelectedItemIndex].setSelected(true);
		}
	};

	return MenuItemGroup;

});