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
	 * Constructor for a new <code>Item</code>.
	 *
	 * @param {string} [sId] ID for the new <code>Item</code>, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new <code>Item</code>
	 *
	 * @class
	 * The <code>Item</code> class is used for menu items for the <code>sap.m.table.columnmenu.Menu</code>.
	 * It can be used to specify control- and application-specific menu items.
	 *
	 * @extends sap.m.table.columnmenu.ItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.110
	 *
	 * @alias sap.m.table.columnmenu.Item
	 */
	var Item = ItemBase.extend("sap.m.table.columnmenu.Item", {

		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Defines the label that is used for the item.
				 */
				label: {type: "string"},
				/**
				 * Defines the icon for the item.
				 */
				icon: {type: "sap.ui.core.URI"},
				/**
				 * Defines whether the Reset button is shown when navigating to the item.
				 */
				showResetButton: {type: "boolean", defaultValue: true},
				/**
				 * Defines whether the Reset button is enabled when navigating to the item.
				 */
				resetButtonEnabled: {type: "boolean", defaultValue: true},
				/**
				 * Defines whether the Confirm button is shown when navigating to the item.
				 */
				showConfirmButton: {type: "boolean", defaultValue: true},
				/**
				 * Defines whether the Cancel button is shown when navigating to the item.
				 */
				showCancelButton: {type: "boolean", defaultValue: true}
			},
			defaultAggregation : "content",
			aggregations: {
				/**
				 * Defines the content that is shown when navigating to the item.
				 */
				content: {type: "sap.ui.core.Control", multiple: false}
			},
			events: {
				/**
				 * This event is fired when the Reset button is pressed.
				 */
				reset: {},
				/**
				 * This event is fired when the Confirm button is pressed.
				 */
				confirm: {
					allowPreventDefault: true
				},
				/**
				 * This event is fired when the Cancel button is pressed.
				 */
				cancel: {
					allowPreventDefault: true
				}
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

	/**
	 * @inheritDoc
	 */
	Item.prototype.onConfirm = function (oEvent) {
		if (!this.fireConfirm()) {
			oEvent.preventDefault();
		}
	};

	/**
	 * @inheritDoc
	 */
	Item.prototype.onCancel = function (oEvent) {
		if (!this.fireCancel()) {
			oEvent.preventDefault();
		}
	};

	/**
	 * @inheritDoc
	 */
	Item.prototype.onReset = function (oEvent) {
		this.fireReset();
	};

	return Item;
});