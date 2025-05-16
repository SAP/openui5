/*!
 * ${copyright}
 */

sap.ui.define([
	"../utils/Personalization",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/ui/core/Element",
	"sap/ui/core/Lib"
], (
	PersonalizationUtils,
	Menu,
	MenuItem,
	Element,
	Lib
) => {
	"use strict";

	/**
	 * Constructor for a new <code>GroupHeaderRowContextMenu</code>.
	 *
	 * @class
	 * @extends sap.ui.core.Element
	 * @implements sap.ui.core.IContextMenu
	 * @author SAP SE
	 * @private
	 * @alias sap.ui.mdc.table.menus.GroupHeaderRowContextMenu
	 */
	const GroupHeaderRowContextMenu = Element.extend("sap.ui.mdc.table.menus.GroupHeaderRowContextMenu", {
		metadata: {
			library: "sap.ui.mdc",
			interfaces: ["sap.ui.core.IContextMenu"],
			aggregations: {
				menu: {type: "sap.m.Menu", multiple: false}
			}
		}
	});

	GroupHeaderRowContextMenu.prototype.invalidate = function() {
		// Do not invalidate the parent.
	};

	/**
	 * Opens the context menu.
	 *
	 * @param {jQuery.Event | {left: float, top: float, offsetX: float, offsetY: float}} oEvent
	 *   An <code>oncontextmenu</code> event object or an object with properties left, top, offsetX, offsetY
	 * @param {sap.ui.core.Element | HTMLElement} oOpenerRef
	 *   The element which will get the focus back again after the menu was closed
	 */
	GroupHeaderRowContextMenu.prototype.openAsContextMenu = function(oEvent, oOpenerRef) {
		this.getMenu()?.openAsContextMenu(oEvent, oOpenerRef);
	};

	// Not part of the IContextMenu interface, but required by the GridTable to close the menu on scroll.
	GroupHeaderRowContextMenu.prototype.close = function() {
		this.getMenu()?.close();
	};

	/**
	 * Initializes the content of the context menu.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table for which the context menu is opened.
	 * @param {object} mSettings Initialization settings.
	 * @param {int} mSettings.groupLevel Group level of the row for which the context menu is opened.
	 */
	GroupHeaderRowContextMenu.prototype.initContent = function(oTable, mSettings) {
		this._iGroupLevel = mSettings.groupLevel;

		if (!this.getMenu()) {
			this.setMenu(new Menu({
				items: [
					this._createUngroupItem(oTable)
				]
			}));
		}
	};

	/**
	 * Whether the menu is empty. The table needs to know if the default browser context menu should be opened instead of this empty context menu.
	 *
	 * @returns {boolean} Whether the context menu is empty.
	 */
	GroupHeaderRowContextMenu.prototype.isEmpty = function() {
		return !this.getMenu()?.getItems().some((oItem) => oItem.getVisible());
	};

	GroupHeaderRowContextMenu.prototype._createUngroupItem = function(oTable) {
		const oResourceBundle = Lib.getResourceBundleFor("sap.ui.mdc");

		return new MenuItem({
			text: oResourceBundle.getText("table.TBL_UNGROUP"),
			visible: "{$sap.ui.mdc.Table>/@custom/activeP13nModes/Group}",
			items: [
				new MenuItem({
					text: oResourceBundle.getText("table.TBL_UNGROUP_LEVEL"),
					press: () => {
						const aGroupedPropertyKeys = oTable._getGroupedProperties().map((mGroupLevel) => mGroupLevel.name);
						const sGroupLevelKey = aGroupedPropertyKeys[this._iGroupLevel - 1];

						PersonalizationUtils.createGroupChange(oTable, {
							propertyKey: sGroupLevelKey
						});
					}
				}),
				new MenuItem({
					text: oResourceBundle.getText("table.TBL_UNGROUP_ALL"),
					press: () => {
						PersonalizationUtils.createClearGroupsChange(oTable);
					}
				})
			]
		});
	};

	return GroupHeaderRowContextMenu;
});