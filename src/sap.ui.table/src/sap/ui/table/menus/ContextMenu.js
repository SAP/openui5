/*!
 * ${copyright}
 */

sap.ui.define([
	"../utils/TableUtils",
	"sap/ui/core/Element",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem"
], function(
	TableUtils,
	Element,
	Menu,
	MenuItem
) {
	"use strict";

	/**
	 * Constructor for a new ContextMenu to be used in the context of rows. For column context menus, see ColumnHeaderMenuAdapter concept.
	 *
	 * @class
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @alias sap.ui.table.menus.ContextMenu
	 */
	const ContextMenu = Element.extend("sap.ui.table.menus.ContextMenu", {
		metadata: {
			library: "sap.ui.table",
			aggregations: {
				menu: {type: "sap.ui.unified.Menu", multiple: false}
			}
		}
	});

	ContextMenu.prototype.init = function() {
		Element.prototype.init.apply(this, arguments);
		this.oCellFilterMenuItem = null;
	};

	ContextMenu.prototype.exit = function() {
		Element.prototype.exit.apply(this, arguments);
		delete this.oCellFilterMenuItem;
	};

	ContextMenu.prototype.invalidate = function() {
		// Invalidation must not bubble up to the table. The table would close the menu after rendering.
	};

	/**
	 * Opens the context menu.
	 *
	 * @param {jQuery.Event | {left: float, top: float, offsetX: float, offsetY: float}} oEvent
	 *   An <code>oncontextmenu</code> event object or an object with properties left, top, offsetX, offsetY
	 * @param {sap.ui.core.Element | HTMLElement} oOpenerRef
	 *   The element which will get the focus back again after the menu was closed
	 */
	ContextMenu.prototype.open = function(oEvent, oOpenerRef) {
		this.getMenu().openAsContextMenu(oEvent, oOpenerRef);
	};

	/**
	 * Closes the context menu.
	 * Used by the table to auto-close the context menu on scroll.
	 */
	ContextMenu.prototype.close = function() {
		this.getMenu()?.close();
	};

	/**
	 * Gets the parent table.
	 *
	 * @returns {sap.ui.table.Table|null} The instance of the table or <code>null</code>.
	 */
	ContextMenu.prototype.getTable = function() {
		const oParent = this.getParent();
		return TableUtils.isA(oParent, "sap.ui.table.Table") ? oParent : null;
	};

	/**
	 * Initializes the content of the context menu.
	 *
	 * @param {sap.ui.table.Row} oRow The row instance
	 * @param {sap.ui.table.Column} [oColumn] The column instance
	 */
	ContextMenu.prototype.initContent = function(oRow, oColumn) {
		if (!this.getMenu()) {
			this.setMenu(new Menu());
		}

		this._initMenuItems(oRow, oColumn);
	};

	/**
	 * If the menu is empty, the default browser context menu should be opened.
	 * Returning <code>false</code> tells the table to not open this menu and to not call preventDefault on the original browser event.
	 *
	 * @returns {boolean} Whether the context menu is empty.
	 */
	ContextMenu.prototype.isEmpty = function() {
		return !this.getMenu()?.getItems().some((oItem) => oItem.getVisible());
	};

	ContextMenu.prototype._initMenuItems = function(oRow, oColumn) {
		const oMenu = this.getMenu();
		const oTable = this.getTable();

		if (oTable.getEnableCellFilter() && oColumn?.isFilterableByMenu() && !oRow.isGroupHeader() && !oRow.isSummary()) {
			if (!this.oCellFilterMenuItem) {
				this.oCellFilterMenuItem = new MenuItem({
					text: TableUtils.getResourceText("TBL_FILTER")
				});
				oMenu.insertItem(this.oCellFilterMenuItem, 0);
			}

			this.oCellFilterMenuItem.detachSelect(onCellFilterSelect, this);
			this.oCellFilterMenuItem.attachSelect({row: oRow, column: oColumn}, onCellFilterSelect, this);
			this.oCellFilterMenuItem.setVisible(true);
		} else {
			this.oCellFilterMenuItem?.setVisible(false);
		}
	};

	function onCellFilterSelect(oEvent, {row: oRow, column: oColumn}) {
		const oTable = this.getTable();
		const oRowContext = TableUtils.getBindingContextOfRow(oRow);
		const sFilterProperty = oColumn.getFilterProperty();
		let sFilterValue = oRowContext.getProperty(sFilterProperty);

		if (sFilterValue != null && typeof sFilterValue !== "string") {
			sFilterValue = sFilterValue.toString();
		}

		if (oTable.getEnableCustomFilter()) {
			oTable.fireCustomFilter({
				column: oColumn,
				value: sFilterValue
			});
		} else {
			oTable.filter(oColumn, sFilterValue);
		}
	}

	ContextMenu.prototype.onLocalizationChanged = function(oEvent) {
		if ("language" in oEvent.changes) {
			this.destroyMenu();
		}
	};

	return ContextMenu;
});