/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.MenuItemGroup.
sap.ui.define([
	'sap/ui/core/Element',
	'sap/ui/core/library'
], function(
	Element,
	coreLibrary
) {
	"use strict";

	// shortcut for sap.ui.core.ItemSelectionMode
	var ItemSelectionMode = coreLibrary.ItemSelectionMode;

	/**
	 * Constructor for a new MenuItemGroup element.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Group item to be used inside a menu. A menu items group represents a collection of menu items that can have the same selection mode
	 * (e.g. {@link sap.ui.core.ItemSelectionMode.None}, {@link sap.ui.core.ItemSelectionMode.SingleSelect}, or {@link sap.ui.unified.ItemSelectionMode.MultiSelect}).
	 * @extends sap.ui.core.Element
	 * @implements sap.ui.unified.IMenuItem
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.127.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.unified.MenuItemGroup
	 */
	var MenuItemGroup = Element.extend("sap.ui.unified.MenuItemGroup", /** @lends sap.ui.unified.MenuItemGroup.prototype */ {
		metadata : {
			interfaces: [
				"sap.ui.unified.IMenuItem"
			],
				library : "sap.ui.unified",
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
				items : {type : "sap.ui.unified.IMenuItem", multiple : true, singularName : "item"}

			}
		}
	});

	/**
	 * Override of the default setter that also ensures single selection if necessary.
	 *
	 * @param {string} sSelectionMode item selection mode to be set
	 * @param {boolean} bSuppressInvalidate Whether to suppress the invalidation of the control
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 */
	MenuItemGroup.prototype.setItemSelectionMode = function(sSelectionMode, bSuppressInvalidate) {
		this.setProperty("itemSelectionMode", sSelectionMode, bSuppressInvalidate);
		if (sSelectionMode === ItemSelectionMode.SingleSelect) {
			this._ensureSingleSelection();
		}

		return this;
	};

	/**
	 * Override of the default setter that adds a group reference to the item's <code>group</code> association.
	 *
	 * @param {sap.ui.unified.IMenuItem} oItem Menu item to be added
	 * @param {boolean} bSuppressInvalidate Whether to suppress the invalidation of the control
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 */
	MenuItemGroup.prototype.addItem = function(oItem, bSuppressInvalidate){
		this._addOrInsertItem(oItem, undefined, bSuppressInvalidate);

		return this;
	};

	/**
	 * Override of the default setter that adds a group reference to the item's <code>group</code> association.
	 *
	 * @param {sap.ui.unified.IMenuItem} oItem Menu item to be added
	 * @param {int} iIndex Index at which the item should be inserted
	 * @param {boolean} bSuppressInvalidate Whether to suppress the invalidation of the control
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 */
	MenuItemGroup.prototype.insertItem = function(oItem, iIndex, bSuppressInvalidate) {
		if (iIndex === undefined) {
			iIndex = this.getItems().length;
		}

		this._addOrInsertItem(oItem, iIndex, bSuppressInvalidate);

		return this;
	};

	/**
	 * Removes an item from <code>items</code> aggregation.
	 * @override
	 * @param {int | string | sap.ui.unified.IMenuItem} vItem Menu item to be removed (as index, ID or object)
	 * @param {boolean} bSuppressInvalidate Whether to suppress the invalidation of the control
	 * @public
	 * @returns {sap.ui.unified.IMenuItem | null} the removed object, or <code>null</code> if there are no items to remove
	 */
	MenuItemGroup.prototype.removeItem = function(vItem, bSuppressInvalidate) {
		const oRes = this.removeAggregation("items", vItem, bSuppressInvalidate);

		!bSuppressInvalidate && this._invalidateParentControls();

		return oRes;
	};

	/**
	 * Removes all items from <code>items</code> aggregation.
	 * @override
	 * @param {boolean} bSuppressInvalidate Whether to suppress the invalidation of the control
	 * @public
	 * @returns {array | null} array containing the removed items, or null if there are no items to remove
	 */
	MenuItemGroup.prototype.removeAllItems = function(bSuppressInvalidate) {
		const aItems = this.removeAllAggregation("items", bSuppressInvalidate);

		!bSuppressInvalidate && this._invalidateParentControls();

		return aItems;
	};

	/**
	 * Destroys all items from <code>items</code> aggregation.
	 * @override
	 * @param {boolean} bSuppressInvalidate Whether to suppress the invalidation of the control
	 * @public
	 * @returns {this} <code>this</code> to allow method chaining
	 */
	MenuItemGroup.prototype.destroyItems = function(bSuppressInvalidate) {
		this.destroyAggregation("items", bSuppressInvalidate);
		!bSuppressInvalidate && this._invalidateParentControls();

		return this;
	};

	/**
	 * Invalidate the parent controls if there are no items in the group.
	 * @private
	 */
	MenuItemGroup.prototype._invalidateParentControls = function() {
		const oGroupMenu = this.getParent();

		if (oGroupMenu && !oGroupMenu._getItems().length) {
			const oGroupMenuParent = oGroupMenu.getParent();
			oGroupMenuParent && oGroupMenuParent.invalidate();
			oGroupMenu.close();
		}
	};

	/**
	 * Adds or inserts an item in <code>items</code> aggregation.
	 * @param {sap.ui.unified.IMenuItem} oItem Menu item to be added
	 * @param {int} iIndex Index at which the item should be inserted
	 * @param {boolean} bSuppressInvalidate Whether to suppress the invalidation of the control
	 * @private
	 */
	MenuItemGroup.prototype._addOrInsertItem = function(oItem, iIndex, bSuppressInvalidate) {
		const bSelected = oItem.getSelected && oItem.getSelected(),
			iItemsCount = this.getItems().length;

		oItem.setAssociation("_group", this);

		// in case of SingleSelect mode, clear the selection of the other items to ensure that only one item is selected.
		if (bSelected && this.getItemSelectionMode() === ItemSelectionMode.SingleSelect) {
			this._clearSelectedItems();
		}

		iIndex === undefined ? this.addAggregation("items", oItem, bSuppressInvalidate) : this.insertAggregation("items", oItem, iIndex, bSuppressInvalidate);

		if (iItemsCount > 0) {
			return;
		}

		const oGroupMenu = this.getParent();
		if (oGroupMenu) {
			const oGroupMenuParent = oGroupMenu.getParent();
			oGroupMenuParent && oGroupMenuParent.invalidate();
			oGroupMenu.invalidate();
		}
	};

	/**
	 * Sets <code>selected</code> property of all items in the group to <code>false</code>.
	 * @param {string} sGroup a key of the group which items selection state should be cleared if necessary.
	 * @private
	 */
	MenuItemGroup.prototype._clearSelectedItems = function() {
		this.getItems().forEach((oItem) => oItem.setSelected && oItem.setSelected(false));
	};

	/**
	 * Ensures that only one item is selected in the group (if there were any selected items).
	 * @private
	 */
	MenuItemGroup.prototype._ensureSingleSelection = function() {
		var aItems = this.getItems(),
			aSelectedItems = aItems.map((item) => item.getSelected()),
			iSelectedItemIndex = aSelectedItems.lastIndexOf(true);

		this._clearSelectedItems();
		if (iSelectedItemIndex !== -1) {
			aItems[iSelectedItemIndex].setSelected(true);
		}
	};

	return MenuItemGroup;

});