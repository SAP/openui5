/*!
 * ${copyright}
 */

// Provides control sap.m.IconTabBarSelectList.
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	"sap/ui/core/Core",
	'sap/ui/core/delegate/ItemNavigation',
	'./IconTabBarDragAndDropUtil',
	'./IconTabBarSelectListRenderer',
	"sap/ui/thirdparty/jquery"
], function(
	library,
	Control,
	Core,
	ItemNavigation,
	IconTabBarDragAndDropUtil,
	IconTabBarSelectListRenderer,
	jQuery
) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.m.IconTabBarSelectList</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new control.
	 *
	 * @class
	 * The <code>sap.m.IconTabBarSelectList</code> displays a list of items that allows the user to select an item.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.42.0
	 * @alias sap.m.IconTabBarSelectList
	 * @ui5-metamodel This control will also be described in the UI5 (legacy) design time meta model.
	 */
	var IconTabBarSelectList = Control.extend("sap.m.IconTabBarSelectList", /** @lends sap.m.IconTabBarSelectList.prototype */ { metadata: {
		library: "sap.m",
		aggregations : {
			/**
			 * The items displayed in the list.
			 */
			items : {type : "sap.m.IconTabFilter", multiple : true, singularName : "item", dnd : true}
		},
		events: {
			/**
			 * This event is fired when the selection has changed.
			 *
			 * <b>Note: </b> The selection can be changed by pressing a non-selected item,
			 * via keyboard and after the Enter or Space key is pressed.
			 */
			selectionChange: {
				parameters: {
					/**
					 * The selected item.
					 */
					selectedItem: { type: "sap.m.IconTabFilter" }
				}
			}
		}
	}});

	/**
	 * Initializes the control.
	 * @private
	 * @override
	 */
	IconTabBarSelectList.prototype.init = function () {
		this._oItemNavigation = new ItemNavigation();
		this._oItemNavigation.setCycling(false);
		this.addEventDelegate(this._oItemNavigation);
		this._oItemNavigation.setPageSize(10);
		this._oIconTabHeader = null;
	};

	/**
	 * Clears the control dependencies.
	 * @private
	 */
	IconTabBarSelectList.prototype.exit = function () {
		this._oItemNavigation.destroy();
		this._oItemNavigation = null;
		this._oIconTabHeader = null;
	};

	/**
	 * Called before the control is rendered.
	 *
	 * @private
	 */
	IconTabBarSelectList.prototype.onBeforeRendering = function () {
		if (!this._oIconTabHeader) {
			return;
		}
		this._setsDragAndConfiguration();
	};

	/**
	 * Called after the control is rendered.
	 *
	 * @private
	 */
	IconTabBarSelectList.prototype.onAfterRendering = function () {
		this._initItemNavigation();
	};

	/**
	 * Sets or remove Drag and Drop configuration.
	 * @private
	 */
	IconTabBarSelectList.prototype._setsDragAndConfiguration = function () {
		if (!this._oIconTabHeader.getEnableTabReordering() && this.getDragDropConfig().length) {
			//Destroying Drag&Drop aggregation
			this.destroyDragDropConfig();
		} else if (this._oIconTabHeader.getEnableTabReordering() && !this.getDragDropConfig().length) {
			IconTabBarDragAndDropUtil.setDragDropAggregations(this, "Vertical");
		}
	};

	/**
	 * Initialize item navigation
	 * @private
	 */
	IconTabBarSelectList.prototype._initItemNavigation = function () {
		var aItems = this.getItems(),
			aDomRefs = [],
			oPrevSelectedItem = this._oIconTabHeader.oSelectedItem,
			iSelectedDomIndex = -1,
			oItem,
			i;

		for (i = 0; i < aItems.length; i++) {
			oItem = aItems[i];

			if (oItem.isA("sap.m.IconTabFilter")) {
				var aChildren = oItem._getAllSubFiltersDomRefs();
				aDomRefs = aDomRefs.concat(oItem.getDomRef(), aChildren);
			}

			if (oPrevSelectedItem && this.getSelectedItem() && this.getSelectedItem()._getRealTab() === oPrevSelectedItem) {
				iSelectedDomIndex = i;
			}
		}

		if (oPrevSelectedItem && aDomRefs.indexOf(oPrevSelectedItem.getDomRef()) !== -1) {
			iSelectedDomIndex = aDomRefs.indexOf(oPrevSelectedItem.getDomRef());
		}

		//Reinitialize the ItemNavigation after rendering
		this._oItemNavigation.setRootDomRef(this.getDomRef())
			.setItemDomRefs(aDomRefs)
			.setSelectedIndex(iSelectedDomIndex);
	};

	/**
	 * Returns all the items aggregations marked as visible.
	 * @private
	 * @returns {Array} Array of visible items.
	 */
	IconTabBarSelectList.prototype.getVisibleItems = function () {
		return this.getItems().filter(function (oItem) {
			return oItem.getVisible();
		});
	};

	IconTabBarSelectList.prototype.setSelectedItem = function (item) {
		this._selectedItem = item;
	};

	IconTabBarSelectList.prototype.getSelectedItem = function () {
		return this._selectedItem;
	};

	/**
	 * Handles tap event.
	 * @private
	 */
	IconTabBarSelectList.prototype.ontap = function (oEvent) {
		var $target = jQuery(oEvent.target);

		if (!$target.hasClass("sapMITBSelectItem")) {
			$target = $target.parent(".sapMITBSelectItem");
		}

		var oFilter = Core.byId($target[0].id);

		if (!oFilter || this._oIconTabHeader._isUnselectable(oFilter)) {
			return;
		}

		oEvent.preventDefault();

		if (oFilter != this.getSelectedItem()) {
			this.fireSelectionChange({
				selectedItem: oFilter
			});
		}

	};

	IconTabBarSelectList.prototype.onsapenter = IconTabBarSelectList.prototype.ontap;
	IconTabBarSelectList.prototype.onsapspace = IconTabBarSelectList.prototype.ontap;

	/**
	 * Checks if only an icon should be rendered.
	 * @private
	 * @returns {boolean} Flag indicating if all items are without text or count.
	 */
	IconTabBarSelectList.prototype.checkIconOnly = function () {
		var aItems = this.getVisibleItems();

		this._bIconOnly = aItems.every(function (oItem) {
			return !oItem.getText() && !oItem.getCount();
		});

		return this._bIconOnly;
	};

	/* =========================================================== */
	/*           start: tab drag-drop                              */
	/* =========================================================== */

	/**
	 * Handles drop event for drag &  drop functionality
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	IconTabBarSelectList.prototype._handleDragAndDrop = function (oEvent) {
		var oDropPosition = oEvent.getParameter("dropPosition"),
			oDraggedControl = oEvent.getParameter("draggedControl"),
			oDroppedControl = oEvent.getParameter("droppedControl");

		IconTabBarDragAndDropUtil.handleDrop(this._oIconTabHeader, oDropPosition, oDraggedControl._getRealTab(), oDroppedControl._getRealTab(), true);
		this._oIconTabHeader._setItemsForStrip();
		this._oIconTabHeader._initItemNavigation();
		this._oIconTabHeader._setSelectListItems();
		this._initItemNavigation();
		oDraggedControl.$().focus();
	};

	/* =========================================================== */
	/*           start: tab keyboard handling - drag-drop          */
	/* =========================================================== */

	/**
	 * Handle keyboard drag&drop
	 * Ctrl + Home
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	IconTabBarSelectList.prototype.ondragrearranging = function (oEvent) {
		if (!this._oIconTabHeader.getEnableTabReordering()) {
			return;
		}
		var oTabToBeMoved = oEvent.srcControl,
			iKeyCode = oEvent.keyCode;

		IconTabBarDragAndDropUtil.moveItem.call(this, oTabToBeMoved, iKeyCode);
		this._initItemNavigation();
		oTabToBeMoved.$().focus();

		this._oIconTabHeader._moveTab(oTabToBeMoved._getRealTab(), iKeyCode);
	};

	/**
	 * Moves tab on first position
	 * Ctrl + Home
	 * @param {jQuery.Event} oEvent
	 */
	IconTabBarSelectList.prototype.onsaphomemodifiers = IconTabBarSelectList.prototype.ondragrearranging;

	/**
	 * Move focused tab of IconTabHeader to last position
	 * Ctrl + End
	 * @param {jQuery.Event} oEvent
	 */
	IconTabBarSelectList.prototype.onsapendmodifiers = IconTabBarSelectList.prototype.ondragrearranging;

	/**
	 * Moves tab for Drag&Drop keyboard handling
	 * Ctrl + Left Right || Ctrl + Arrow Up
	 * @param {jQuery.Event} oEvent
	 */
	IconTabBarSelectList.prototype.onsapincreasemodifiers = IconTabBarSelectList.prototype.ondragrearranging;

	/**
	 * Moves tab for Drag&Drop keyboard handling
	 * Ctrl + Left Arrow || Ctrl + Arrow Down
	 * @param {jQuery.Event} oEvent
	 */
	IconTabBarSelectList.prototype.onsapdecreasemodifiers = IconTabBarSelectList.prototype.ondragrearranging;

	/* =========================================================== */
	/*           end: tab keyboard handling - drag-drop            */
	/* =========================================================== */
	/* =========================================================== */
	/*           end: tab drag-drop		                           */
	/* =========================================================== */

	return IconTabBarSelectList;
});