/*!
 * ${copyright}
 */

// Provides control sap.m.IconTabBarSelectList.
sap.ui.define([
	'jquery.sap.global',
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/delegate/ItemNavigation',
	'./IconTabBarDragAndDropUtil',
	'./IconTabBarSelectListRenderer',
	'sap/ui/core/dnd/DragInfo',
	'sap/ui/core/dnd/DropInfo'
],
	function(jQuery, library, Control, ItemNavigation, IconTabBarDragAndDropUtil, IconTabBarSelectListRenderer, DragInfo, DropInfo) {
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
		var IconTabBarSelectList = Control.extend("sap.m.IconTabBarSelectList", /** @lends sap.m.IconTabBarSelectList.prototype */ {
			metadata: {
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
			}
		});

		/**
		 * Initializes the control.
		 * @private
		 * @override
		 */
		IconTabBarSelectList.prototype.init = function () {
			this._itemNavigation = new ItemNavigation();
			this._itemNavigation.setCycling(false);
			this.addEventDelegate(this._itemNavigation);

			this._itemNavigation.setPageSize(10);
		};

		/**
		 * Clears the control dependencies.
		 * @private
		 */
		IconTabBarSelectList.prototype.exit = function () {
			if (this._itemNavigation) {
				this._itemNavigation.destroy();
				this._itemNavigation = null;
			}
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
		IconTabBarSelectList.prototype._setsDragAndConfiguration = function() {
			if (!this._iconTabHeader.getEnableTabReordering() && this.getDragDropConfig().length) {
				//Destroying Drag&Drop aggregation
				this.destroyDragDropConfig();
			} else if (this._iconTabHeader.getEnableTabReordering() && !this.getDragDropConfig().length) {
				IconTabBarDragAndDropUtil.setDragDropAggregations(this, DragInfo, DropInfo, "Vertical");
			}
		};

		/**
		 * Called before the control is rendered.
		 *
		 * @private
		 */
		IconTabBarSelectList.prototype.onBeforeRendering = function () {
			if (!this._iconTabHeader) {
				return;
			}

			this._setsDragAndConfiguration();
		};

		/**
		 * Initialize item navigation
		 * @private
		 */
		IconTabBarSelectList.prototype._initItemNavigation = function() {
			var item,
				items = this.getItems(),
				domRefs = [];

			for (var i = 0; i < items.length; i++) {
				item = items[i];
				domRefs.push(item.getDomRef());
			}

			this._itemNavigation.setRootDomRef(this.getDomRef());
			this._itemNavigation.setItemDomRefs(domRefs);
		};

		/**
		 * Returns all the items aggregations marked as visible.
		 *
		 * @private
		 */
		IconTabBarSelectList.prototype.getVisibleItems = function() {
			var items = this.getItems(),
				visibleItems = [],
				item;

			for (var i = 0; i < items.length; i++) {
				item = items[i];

				if (item.getVisible()) {
					visibleItems.push(item);
				}
			}

			return visibleItems;
		};

		IconTabBarSelectList.prototype.setSelectedItem = function (item) {
			if (this._selectedItem) {
				this._deselectItem(this._selectedItem);
			}

			if (item) {
				this._selectItem(item);
			}

			this._selectedItem = item;
		};

		IconTabBarSelectList.prototype.getSelectedItem = function () {
			return this._selectedItem;
		};

		/**
		 * Deselects an item.
		 * @private
		 */
		IconTabBarSelectList.prototype._deselectItem = function(item) {
			var $item = item.$();
			if ($item) {
				$item.removeClass('sapMITBSelectItemSelected');
				$item.removeAttr('aria-selected');
			}
		};

		/**
		 * Selects an item.
		 * @private
		 */
		IconTabBarSelectList.prototype._selectItem = function(item) {
			var $item = item.$();
			if ($item) {
				$item.addClass('sapMITBSelectItemSelected');
				$item.attr('aria-selected', true);
			}
		};

		/**
		 * Handles tap event.
		 * @private
		 */
		IconTabBarSelectList.prototype.ontap = function (event) {

			var $target = jQuery(event.target);

			if (!$target.hasClass('sapMITBSelectItem')) {
				$target = $target.parent(".sapMITBSelectItem");
			}

			var source = sap.ui.getCore().byId($target[0].id);
			if (source && source.getEnabled()) {

				event.preventDefault();

				if (source != this.getSelectedItem()) {
					this._selectItem(source);
					this.fireSelectionChange({
						selectedItem: source
					});
				}
			}

			if (this._iconTabHeader) {
				this._iconTabHeader._closeOverflow();
			}
		};

		IconTabBarSelectList.prototype.onsapenter = IconTabBarSelectList.prototype.ontap;
		IconTabBarSelectList.prototype.onsapspace = IconTabBarSelectList.prototype.ontap;

		/**
		 * Checks if only an icon should be rendered.
		 * @private
		 */
		IconTabBarSelectList.prototype.checkIconOnly = function (items) {
			var item,
				length = items.length;

			for (var i = 0; i < length; i++) {

				item = items[i];

				if (item.getText() || item.getCount()) {
					return false;
				}
			}

			return true;
		};

		/* =========================================================== */
		/*           start: tab drag-drop		                       */
		/* =========================================================== */

		/**
		 * Handles drop event for drag &  drop functionality
		 * @param {jQuery.Event} oEvent
		 * @private
		 */
		IconTabBarSelectList.prototype._handleDragAndDrop = function (oEvent) {
			var oDropPosition = oEvent.getParameter("dropPosition"),
				oDraggedControl = oEvent.getParameter("draggedControl"),
				oDroppedControl = oEvent.getParameter("droppedControl"),
				bDraggedHeaderItem = oDraggedControl.getParent().getMetadata().getName() === "sap.m.IconTabHeader",
				oDragDropItemsFromList;

				if (bDraggedHeaderItem) {
					oDragDropItemsFromList = IconTabBarDragAndDropUtil.getDraggedDroppedItemsFromList(this.getAggregation("items"), oDraggedControl, oDroppedControl);
					this._handleDropOfListAndHeaderItems(oDropPosition, oDragDropItemsFromList.oDraggedControlFromList, oDragDropItemsFromList.oDroppedControlFromList, oDraggedControl, oDroppedControl._tabFilter);
				} else {
					this._handleDropOfListAndHeaderItems(oDropPosition,oDraggedControl, oDroppedControl, oDraggedControl._tabFilter, oDroppedControl._tabFilter);
				}

			this._initItemNavigation();
			oDraggedControl.$().focus();
		};

		/**
		 * Handle drag and drop in overflow list and header
		 * @private
		 */
		IconTabBarSelectList.prototype._handleDropOfListAndHeaderItems = function (oDropPosition, oDraggedControl, oDroppedControl, oDragControlHeader, oDropControlHeader, bIgnoreRTL) {
			//Handle Drop event for sap.m.IconTabBarSelectList
			IconTabBarDragAndDropUtil.handleDrop(this, oDropPosition, oDraggedControl, oDroppedControl, true);

			//Handle Drop event for sap.m.IconTabHeader
			IconTabBarDragAndDropUtil.handleDrop(this._iconTabHeader, oDropPosition, oDragControlHeader, oDropControlHeader, true);
			this._iconTabHeader._initItemNavigation();
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
			if (!this._iconTabHeader.getEnableTabReordering()) {
				return;
			}
			var oTabToBeMoved = oEvent.srcControl,
				iKeyCode = oEvent.keyCode;

			IconTabBarDragAndDropUtil.moveItem.call(this, oTabToBeMoved, iKeyCode);
			this._initItemNavigation();
			oTabToBeMoved.$().focus();

			this._iconTabHeader._moveTab(oTabToBeMoved._tabFilter, iKeyCode);
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