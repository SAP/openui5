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

	// shortcut for sap.ui.core.ItemSelectionMode
	var ItemSelectionMode = coreLibrary.ItemSelectionMode;

	/**
	 * Constructor for a new MenuItemGroup element.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Group item to be used inside a menu. Represents a collection of menu items that can have the same selection mode
	 * (e.g. {@link sap.ui.core.ItemSelectionMode.None}, {@link sap.ui.core.ItemSelectionMode.SingleSelect}, or {@link sap.ui.unified.ItemSelectionMode.MultiSelect}).
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
	var MenuItemGroup = Element.extend("sap.m.MenuItemGroup", /** @lends sap.m.MenuItemGroup.prototype */ {
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
	 * Override of the default setter that also ensures single selection if necessary.
	 * @public
	 * @param {string} sSelectionMode item selection mode to be set
	 * @param {boolean} bSuppressInvalidate Whether to suppress the invalidation of the control
	 * @returns {this} <code>this</code> to allow method chaining
	 */
	MenuItemGroup.prototype.setItemSelectionMode = function(sSelectionMode, bSuppressInvalidate) {
		const oVisualControl = this._getVisualControl();

		this.setProperty("itemSelectionMode", sSelectionMode, bSuppressInvalidate);
		oVisualControl && oVisualControl.setProperty("itemSelectionMode", sSelectionMode, bSuppressInvalidate);
		if (sSelectionMode === ItemSelectionMode.SingleSelect) {
			this._ensureSingleSelection();
		}

		return this;
	};

	/**
	 * Adds an item to <code>items</code> aggregation.
	 * @override
	 * @param {sap.m.IMenuItem} oItem Menu item to be added
	 * @param {boolean} bSuppressInvalidate Whether to suppress the invalidation of the control
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 */
	MenuItemGroup.prototype.addItem = function(oItem, bSuppressInvalidate){
		return this._addOrInsertItem(oItem, undefined, bSuppressInvalidate);
	};

	/**
	 * Inserts an item to the specified position in <code>items</code> aggregation.
	 * @override
	 * @param {sap.m.IMenuItem} oItem Menu item to be added
	 * @param {int} iIndex Index at which the item should be inserted
	 * @param {boolean} bSuppressInvalidate Whether to suppress the invalidation of the control
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 */
	MenuItemGroup.prototype.insertItem = function(oItem, iIndex, bSuppressInvalidate) {
		if (iIndex === undefined) {
			iIndex = this.getItems().length;
		}

		return this._addOrInsertItem(oItem, iIndex, bSuppressInvalidate);
	};

	/**
	 * Removes an item from <code>items</code> aggregation.
	 * @override
	 * @param {int | string | sap.m.IMenuItem} vItem Menu item to be removed (as index, ID or object)
	 * @param {boolean} bSuppressInvalidate Whether to suppress the invalidation of the control
	 * @public
	 * @returns {sap.m.IMenuItem | null} the removed object, or <code>null</code> if there are no items to remove
	 */
	MenuItemGroup.prototype.removeItem = function(vItem, bSuppressInvalidate) {
		const oItem = this._findItemObject(vItem);
		var oVisualControl,
			oVisualParent,
			oParentMenuItemVisualControl,
			oRes;

		if (!oItem) {
			return null;
		}

		oVisualControl = this._findVisualControlObject(oItem._getVisualControl());
		oParentMenuItemVisualControl = this._findParentMenuItemVisualControl(oItem);

		if (oVisualControl) {
			oVisualParent = oVisualControl.getParent();
			oVisualParent && oVisualParent.removeItem(oVisualControl);
		}

		oRes = this.removeAggregation("items", oItem, bSuppressInvalidate);

		if (oVisualControl && !bSuppressInvalidate) {
			oParentMenuItemVisualControl && oParentMenuItemVisualControl.invalidate();

			if (Device.system.phone) {
				const oParentNavContainer = oVisualParent.getParent().getParent();
				!oVisualParent.getItems().length && oParentNavContainer.back();
			} else {
				const oGroupMenu = oVisualParent.getParent();
				oGroupMenu && !oGroupMenu._getItems().length && oGroupMenu.close();
			}
		}

		return oRes;
	};

	/**
	 * Removes all items from <code>items</code> aggregation.
	 * @override
	 * @param {boolean} bSuppressInvalidate Whether to suppress the invalidation of the control
	 * @public
	 * @returns {array | null} array containing the removed items, or <code>null</code> if there are no items to remove
	 */
	MenuItemGroup.prototype.removeAllItems = function(bSuppressInvalidate){
		const aItems = this.getItems();

		if (!aItems.length) {
			return null;
		}

		const bIsPhone = Device.system.phone,
			oVisualControl = bIsPhone ? this._findVisualControlObject(aItems[0]._getVisualControl()) : this._getVisualControl();

		if (bIsPhone) {
			const oParentMenuItemVisualControl = this._findParentMenuItemVisualControl(aItems[0]),
				oVisualParent = oVisualControl && oVisualControl.getParent();

			if (oVisualParent) {
				const oParentNavContainer = oVisualParent.getParent().getParent();
				aItems.forEach((oItem) => oVisualParent.removeItem(oItem._getVisualControl(), bSuppressInvalidate));
				!bSuppressInvalidate && !oVisualParent.getItems().length && oParentNavContainer.back();
			}
			!bSuppressInvalidate && oParentMenuItemVisualControl && oParentMenuItemVisualControl.invalidate();
		} else if (oVisualControl) {
			oVisualControl.removeAllItems(bSuppressInvalidate);
		}

		return this.removeAllAggregation("items", bSuppressInvalidate);
	};

	/**
	 * Destroys all items from <code>items</code> aggregation.
	 * @override
	 * @param {boolean} bSuppressInvalidate Whether to suppress the invalidation of the control
	 * @public
	 * @returns {this} <code>this</code> to allow method chaining
	 */
	MenuItemGroup.prototype.destroyItems = function(bSuppressInvalidate) {
		const aItems = this.getItems(),
			bIsPhone = Device.system.phone;
		var oVisualControl;

		if (!aItems.length) {
			return this;
		}

		if (bIsPhone) {
			let	oVisualParent,
				oVisualContainer;

			aItems.forEach((oItem) => {
				var oVisualControl = this._findVisualControlObject(oItem._getVisualControl());

				if (oVisualControl) {
					oVisualParent = oVisualControl.getParent();
					oVisualContainer = Element.getElementById(oItem._sVisualParent).getParent();
					oVisualControl.destroy(bSuppressInvalidate);
				}
			});
			!bSuppressInvalidate && oVisualParent && !oVisualParent.getItems().length && oVisualContainer.back() && oVisualContainer.invalidate();
		} else {
			oVisualControl = this._getVisualControl();
			oVisualControl && oVisualControl.destroyItems(bSuppressInvalidate);
		}

		this.destroyAggregation("items", bSuppressInvalidate);

		return this;
	};

	/**
	 * Adds or inserts an item in <code>items</code> aggregation.
	 * @param {sap.m.IMenuItem} oItem Menu item to be added
	 * @param {int} iIndex Index at which the item should be inserted
	 * @param {boolean} bSuppressInvalidate Whether to suppress the invalidation of the control
	 * @returns {this} <code>this</code> to allow method chaining
	 * @private
	 */
	MenuItemGroup.prototype._addOrInsertItem = function(oItem, iIndex, bSuppressInvalidate) {
		const bSelected = oItem.getSelected && oItem.getSelected();

		oItem.setAssociation("_group", this);

		// in case of SingleSelect mode, clear the selection of the other items to ensure that only one item is selected.
		if (bSelected && this.getItemSelectionMode() === ItemSelectionMode.SingleSelect) {
			this._clearSelectedItems();
		}

		this._addOrInsertVisualItem(oItem, iIndex);

		if (iIndex === undefined) {
			return this.addAggregation("items", oItem, bSuppressInvalidate);
		}
		return this.insertAggregation("items", oItem, iIndex, bSuppressInvalidate);
	};

	/**
	 * Adds or inserts the visual item.
	 * @private
	 * @param {sap.m.IMenuItem} oItem item to be added or inserted
	 * @param {int} iIndex Index at which the item should be inserted
	 */
	MenuItemGroup.prototype._addOrInsertVisualItem = function(oItem, iIndex) {
		const oGroupParent = this.getParent(),
			oParentMenu = this._getParentMenu();

		if (!oParentMenu) {
			return;
		}

		if (Device.system.phone && oGroupParent) {
			const oPageControl = oGroupParent.isA("sap.m.Menu") ? oGroupParent._getVisualParent() : Element.getElementById(oGroupParent._getVisualChild());
			if (!oPageControl) {
				return;
			}

			const sGroupId = this.getId(),
				iGroupItemsCount = this.getItems().length,
				iNewItemIndex = this._findGroupFirstIndex(sGroupId),
				oVisualControl = oGroupParent._getVisualControl && oGroupParent._getVisualControl(),
				oParentVisualItem = oVisualControl && this._findVisualControlObject(oVisualControl);

			if (iIndex === undefined || iIndex > iGroupItemsCount) {
				iIndex = iGroupItemsCount;
			}

			oParentMenu._addListItemFromItem(oItem, oPageControl, iNewItemIndex + iIndex);
			oParentVisualItem && oParentVisualItem.invalidate();
		} else {
			oParentMenu._addVisualMenuItemFromItem(oItem, this._getVisualControl(), iIndex);
		}
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
	 * Returns the index of the first item of the specified group.
	 * @private
	 * @param {string} sId ID of the group
	 * @returns {int} the index of the first item of the specified group
	 */
	MenuItemGroup.prototype._findGroupFirstIndex = function(sId) {
		const oParent = this.getParent(),
			aMenuItems = oParent.getItems();
		let	iGroupFirstIndex = 0;

		for (let i = 0; i < aMenuItems.length; i++) {
			const oItem = aMenuItems[i];
			if (oItem.getId() === sId) {
				break;
			} else if (oParent._isMenuItemGroup(oItem)) {
				iGroupFirstIndex += oItem.getItems().length;
			} else {
				iGroupFirstIndex++;
			}
		}

		return iGroupFirstIndex;
	};

	/**
	 * Returns the item as object from the <code>items</code> aggregation.
	 * @private
	 * @param {int | string | sap.m.MenuItem} vItem item to be found (it can be index, ID, or item object)
	 * @returns {sap.m.MenuItem} The item object
	 */
	MenuItemGroup.prototype._findItemObject = function(vItem) {
		if (typeof vItem === "number") {
			return this.getItems()[vItem];
		} else if (typeof vItem === "string") {
			return this.getItems().find((oItem) => oItem.getId() === vItem);
		} else {
			return vItem;
		}
	};

	/**
	 * Returns the visual control that represents the item as object.
	 * @private
	 * @param {string | sap.ui.unified.MenuItem | sap.m.MenuListItem} vItem item to be found (it can be index, ID, or item object)
	 * @returns {sap.ui.unified.MenuItem | sap.m.MenuListItem} The visual control that represents the item
	 */
	MenuItemGroup.prototype._findVisualControlObject = function(vItem) {
		if (typeof vItem === "string") {
			return Element.getElementById(vItem);
		} else {
			return vItem;
		}
	};

	/**
	 * Returns the visual control that represents the parent menu item of the given menu item.
	 * @private
	 * @param {sap.m.MenuItem} oItem the menu item which parent menu item visual control should be found.
	 * @returns {sap.ui.unified.MenuItem | sap.m.MenuListItem} The visual control of the parent menu item of the given menu item
	 */
	MenuItemGroup.prototype._findParentMenuItemVisualControl = function(oItem) {
		const oGroupParent = this._findVisualControlObject(this.getParent());

		return oGroupParent && oGroupParent.isA("sap.m.MenuItem") ? this._findVisualControlObject(oGroupParent._getVisualControl()) : null;
	};

	/**
	 * Sets <code>selected</code> property of all items in the group to <code>false</code>.
	 * @private
	 * @param {string} sGroup a key of the group which items selection state should be cleared if necessary
	 */
	MenuItemGroup.prototype._clearSelectedItems = function() {
		this.getItems().forEach((oItem) => oItem.setSelected && oItem.setSelected(false));
	};

	/**
	 * Returns visual child of the control (unified MenuItemGroup).
	 * @private
	 * @returns {sap.ui.unified.MenuItemGroup} The unified MenuItemGroup
	 */
	MenuItemGroup.prototype._getVisualControl = function() {
		return this._oUnifiedGroup;
	};

	/**
	 * Sets visual child of the control (unified MenuItemGroup).
	 * @private
	 * @param {sap.ui.unified.MenuItemGroup} oControl The unified MenuItemGroup to be set
	 */
	MenuItemGroup.prototype._setVisualControl = function(oControl) {
		this._oUnifiedGroup = oControl;
	};

	/**
	 * Sets parent Menu of the control.
	 * @private
	 * @param {sap.m.Menu} oMenu The Menu to be set as parent
	 */
	MenuItemGroup.prototype._setParentMenu = function(oMenu) {
		this.setAssociation("_menu", oMenu);
	};

	/**
	 * Returns the parent Menu of the control.
	 * @private
	 * @returns {sap.m.Menu} The parent Menu
	 */
	MenuItemGroup.prototype._getParentMenu = function() {
		return Element.getElementById(this.getAssociation("_menu"));
	};

	/**
	 * Ensures that only one item is selected in the group (if there were any selected items).
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