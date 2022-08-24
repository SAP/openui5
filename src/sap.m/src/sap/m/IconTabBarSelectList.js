/*!
 * ${copyright}
 */

// Provides control sap.m.IconTabBarSelectList.
sap.ui.define([
	"./library",
	"./IconTabBarDragAndDropUtil",
	"./IconTabBarSelectListRenderer",
	"sap/ui/core/Control",
	"sap/ui/core/delegate/ItemNavigation",
	"sap/ui/core/theming/Parameters",
	"sap/ui/core/library"
], function(
	library,
	IconTabBarDragAndDropUtil,
	IconTabBarSelectListRenderer,
	Control,
	ItemNavigation,
	Parameters,
	coreLibrary
) {
	"use strict";

	// shortcut for sap.ui.core.dnd.DropPosition
	var DropPosition = coreLibrary.dnd.DropPosition;

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
	 */
	var IconTabBarSelectList = Control.extend("sap.m.IconTabBarSelectList", /** @lends sap.m.IconTabBarSelectList.prototype */ { metadata: {
		library: "sap.m",
		aggregations : {
			/**
			 * The items displayed in the list.
			 */
			items : {type : "sap.m.IconTab", multiple : true, singularName : "item", dnd : true}
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
		this._oTabFilter = null;
	};

	/**
	 * Clears the control dependencies.
	 * @private
	 */
	IconTabBarSelectList.prototype.exit = function () {
		this._oItemNavigation.destroy();
		this._oItemNavigation = null;
		this._oIconTabHeader = null;
		this._oTabFilter = null;
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
		this.destroyDragDropConfig();
		this._setsDragAndConfiguration();
	};

	/**
	 * Called after the control is rendered.
	 *
	 * @private
	 */
	IconTabBarSelectList.prototype.onAfterRendering = function () {
		this._initItemNavigation();

		// notify items that they are rendered
		this.getItems().forEach(function (oItem) {
			if (oItem._onAfterParentRendering) {
				oItem._onAfterParentRendering();
			}
		});
	};

	/**
	 * Sets or remove Drag and Drop configuration.
	 * @private
	 */
	IconTabBarSelectList.prototype._setsDragAndConfiguration = function () {
		if (this._oIconTabHeader.getEnableTabReordering() && !this.getDragDropConfig().length) {
			IconTabBarDragAndDropUtil.setDragDropAggregations(this, "Vertical", this._oIconTabHeader._getDropPosition());
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

	/**
	 * Returns all IconTabFilters marked as visible.
	 * @private
	 * @returns {sap.m.IconTabFilter[]} Array of visible tab filters.
	 */
	IconTabBarSelectList.prototype.getVisibleTabFilters = function () {
		return this.getVisibleItems().filter(function (oItem) {
			return oItem.isA("sap.m.IconTabFilter");
		});
	};

	IconTabBarSelectList.prototype.setSelectedItem = function (item) {
		this._selectedItem = item;
	};

	IconTabBarSelectList.prototype.getSelectedItem = function () {
		return this._selectedItem;
	};

	/**
	 * Returns the IconTabHeader instance which holds all the TabFilters.
	 */
	IconTabBarSelectList.prototype._getIconTabHeader = function () {
		return this._oIconTabHeader;
	};

	IconTabBarSelectList.prototype._getParams = function () {
		var mParams = Object.assign({
			"_sap_m_IconTabBar_SelectListItem_PaddingLeft": "0.5rem",
			"_sap_m_IconTabBar_SelectListItem_PaddingLeftAdditional": "0"
		}, Parameters.get({
			name: [
				"_sap_m_IconTabBar_SelectListItem_PaddingLeft",
				"_sap_m_IconTabBar_SelectListItem_PaddingLeftAdditional"
			],
			callback: this.invalidate.bind(this)
		}));

		return {
			fNestedItemPaddingLeft: Number.parseFloat(mParams["_sap_m_IconTabBar_SelectListItem_PaddingLeft"]),
			fAdditionalPadding: Number.parseFloat(mParams["_sap_m_IconTabBar_SelectListItem_PaddingLeftAdditional"])
		};
	};

	/**
	 * Checks if all tabs are textOnly version.
	 * @private
	 * @returns {boolean} True if all tabs are textOnly version, otherwise false
	 */
	IconTabBarSelectList.prototype._checkTextOnly = function () {
		return this.getItems().every(function (oItem) {
			return oItem.isA('sap.m.IconTabSeparator') || !oItem.getIcon();
		});
	};

	/**
	 * Handles tap event.
	 * @private
	 */
	IconTabBarSelectList.prototype.ontap = function (oEvent) {
		var oTappedItem = oEvent.srcControl;

		if (!oTappedItem) {
			return;
		}

		if (!oTappedItem.isA("sap.m.IconTabFilter")) {
			return;
		}

		if (this._oIconTabHeader._isUnselectable(oTappedItem)) {
			return;
		}

		oEvent.preventDefault();

		if (oTappedItem != this.getSelectedItem()) {
			this.fireSelectionChange({
				selectedItem: oTappedItem
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
		this._bIconOnly = this.getVisibleTabFilters().every(function (oItem) {
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
		var sDropPosition = oEvent.getParameter("dropPosition"),
			oDraggedControl = oEvent.getParameter("draggedControl"),
			oDroppedControl = oEvent.getParameter("droppedControl"),
			oContext = oDroppedControl._getRealTab().getParent(),
			allowedNestingLevel = this._oIconTabHeader.getMaxNestingLevel();

		if (this._oTabFilter._isOverflow()) {
			oContext = this._oIconTabHeader;
		}

		if (sDropPosition === DropPosition.On) {
			oContext = oDroppedControl._getRealTab();
		}

		IconTabBarDragAndDropUtil.handleDrop(oContext, sDropPosition, oDraggedControl._getRealTab(), oDroppedControl._getRealTab(), true, allowedNestingLevel);

		this._oIconTabHeader._setItemsForStrip();
		this._oIconTabHeader._initItemNavigation();

		this._oTabFilter._setSelectListItems();
		this._initItemNavigation();

		oDroppedControl._getRealTab().getParent().$().trigger("focus");
	};

	/* =========================================================== */
	/*           start: tab keyboard handling - drag-drop          */
	/* =========================================================== */

	/**
	 * Handles keyboard drag&drop
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	IconTabBarSelectList.prototype.ondragrearranging = function (oEvent) {
		if (!this._oIconTabHeader.getEnableTabReordering()) {
			return;
		}

		var oTabToBeMoved = oEvent.srcControl,
			iKeyCode = oEvent.keyCode,
			iIndexBeforeMove = this.indexOfItem(oTabToBeMoved),
			oContext = this;

		IconTabBarDragAndDropUtil.moveItem.call(oContext, oTabToBeMoved, iKeyCode, oContext.getItems().length - 1);

		this._initItemNavigation();
		oTabToBeMoved.$().trigger("focus");

		if (iIndexBeforeMove === this.indexOfItem(oTabToBeMoved)) {
			return;
		}
		oContext = oTabToBeMoved._getRealTab().getParent();
		if (this._oTabFilter._isOverflow() && oTabToBeMoved._getRealTab()._getNestedLevel() === 1) {
			this._oIconTabHeader._moveTab(oTabToBeMoved._getRealTab(), iKeyCode, this._oIconTabHeader.getItems().length - 1);
		} else {
			IconTabBarDragAndDropUtil.moveItem.call(oContext, oTabToBeMoved._getRealTab(), iKeyCode, oContext.getItems().length - 1);
		}
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
	 * Modifier + Right Arrow || Modifier + Arrow Up
	 * @param {jQuery.Event} oEvent
	 */
	IconTabBarSelectList.prototype.onsapincreasemodifiers = IconTabBarSelectList.prototype.ondragrearranging;

	/**
	 * Moves tab for Drag&Drop keyboard handling
	 * Modifier + Left Arrow || Modifier + Arrow Down
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
