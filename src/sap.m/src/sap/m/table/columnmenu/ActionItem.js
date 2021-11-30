/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/table/columnmenu/ItemBase"
], function(
	ItemBase
) {
	"use strict";

	/**
	 * Constructor for a new ActionItem.
	 *
	 * @param {string} [sId] ID for the new ActionItem, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new ActionItem
	 *
	 * @class
	 * The ActionItem serves as a menu action item for the sap.m.table.columnmenu.Menu.
	 * It can be used to specify control- and application-specific items which should solely serve as actions.
	 *
	 * @extends sap.m.table.columnmenu.ItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 *
	 * @alias sap.m.table.columnmenu.ActionItem
	 */
	var ActionItem = ItemBase.extend("sap.m.table.columnmenu.ActionItem", {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Defines the label, which should be used for the buttons.
				 */
				label: {type: "string"},
				/**
				 * Defines the icon for the menu item.
				 */
				icon: {type: "sap.ui.core.URI"}
			},
			events: {
				/**
				 * This event will be fired, when the action was pressed.
				 */
				press: {}
			}
		}
	});

	/**
	 * @override
	 */
	ActionItem.prototype.onPress = function (oEvent) {
		oEvent.preventDefault();
		this.firePress();
	};

	ActionItem.prototype.getContent = function () {
		return null;
	};

	return ActionItem;
});