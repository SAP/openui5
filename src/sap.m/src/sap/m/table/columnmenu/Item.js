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
	 * Constructor for a new Item.
	 *
	 * @param {string} [sId] ID for the new Item, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new Item
	 *
	 * @class
	 * This Item serves as a menu item for the sap.m.table.columnmenu.Menu.
	 * It can be used to specify control- and application-specific items.
	 *
	 * @extends sap.m.table.columnmenu.ItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 *
	 * @alias sap.m.table.columnmenu.Item
	 */
	var Item = ItemBase.extend("sap.m.table.columnmenu.Item", {
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
				icon: {type: "sap.ui.core.URI"},
				/**
				 * Defines whether the reset button should be shown, when navigating to the item.
				 */
				showResetButton: {type: "boolean", defaultValue: true},
				/**
				 * Defines whether the reset button should be enabled, when navigating to the item.
				 */
				resetButtonEnabled: {type: "boolean", defaultValue: true},
				/**
				 * Defines whether the confirm button should be shown, when navigating to the item.
				 */
				showConfirmButton: {type: "boolean", defaultValue: true},
				/**
				 * Defines whether the cancel button should be shown, when navigating to the item.
				 */
				showCancelButton: {type: "boolean", defaultValue: true}
			},
			aggregations: {
				/**
				 * Defines the content, which should be shown when navigating to the item.
				 */
				content: {type: "sap.ui.core.Control", multiple: false}
			},
			events: {
				/**
				 * This event will be fired, when the reset button was pressed.
				 */
				reset: {},
				/**
				 * This event will be fired, when the confirm button was pressed.
				 */
				confirm: {},
				/**
				 * This event will be fired, when the cancel button was pressed.
				 */
				cancel: {}
			}
		}
	});

	/**
	 * @override
	 */
	Item.prototype.setShowResetButton = function (bShowResetButton) {
		this.setProperty("showResetButton", bShowResetButton);
		this.changeButtonSettings({
			reset: {visible: bShowResetButton}
		});
		return this;
	};

	/**
	 * @override
	 */
	Item.prototype.setResetButtonEnabled = function (bResetButtonEnabled) {
		this.setProperty("resetButtonEnabled", bResetButtonEnabled);
		this.changeButtonSettings({
			reset: {enabled: bResetButtonEnabled}
		});
		return this;
	};

	/**
	 * @override
	 */
	Item.prototype.setShowConfirmButton = function (bShowConfirmButton) {
		this.setProperty("showConfirmButton", bShowConfirmButton);
		this.changeButtonSettings({
			confirm: {visible: bShowConfirmButton}
		});
		return this;
	};

	/**
	 * @override
	 */
	Item.prototype.setShowCancelButton = function (bShowCancelButton) {
		this.setProperty("showCancelButton", bShowCancelButton);
		this.changeButtonSettings({
			cancel: {visible: bShowCancelButton}
		});
		return this;
	};

	return Item;
});