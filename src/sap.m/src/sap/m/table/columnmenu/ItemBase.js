/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/table/columnmenu/Entry"
], function(
	Entry
) {
	"use strict";

	/**
	 * Constructor for a new <code>ItemBase</code>.
	 *
	 * @param {string} [sId] ID for the new <code>ItemBase</code>, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new <code>ItemBase</code>
	 *
	 * @class
	 * The <code>ItemBase</code> class is used as a base class for menu items for the <code>sap.m.table.columnmenu.Menu</code>.
	 * This faceless class can be used to specify control- and application-specific menu items.
	 *
	 * @extends sap.m.table.columnmenu.Entry
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.110
	 *
	 * @alias sap.m.table.columnmenu.ItemBase
	 */
	var ItemBase = Entry.extend("sap.m.table.columnmenu.ItemBase", {

		metadata: {
			"abstract": true,
			library: "sap.m"
		}
	});

	ItemBase.prototype.init = function () {
		this._oButtonSettings = {
			reset: {visible: true, enabled: true},
			confirm: {visible: true, enabled: true},
			cancel: {visible: true, enabled: true}
		};
	};

	/**
	 * Retrieves the effective items of the item.
	 *
	 * This method allows subclasses to return composition of other items, if they contain multiple items or controls.
	 * @returns {sap.m.table.columnmenu.ItemBase[]} A composition of effective items
	 *
	 * @protected
	 */
	ItemBase.prototype.getEffectiveItems = function() {
		return this.getVisible() ? [this] : [];
	};

	/**
	 * Retrieves the icon specified for an item.
	 *
	 * @returns {sap.ui.core.URI} The specified icon
	 *
	 * @protected
	 */
	ItemBase.prototype.getIcon = function() {
		if (this.getMetadata().hasProperty("icon")) {
			return this.getProperty("icon");
		}
		throw new Error(this + " does not implement #getIcon");
	};

	/**
	 * Event handler for a press event.
	 *
	 * @param {jQuery.Event} oEvent The event
	 *
	 * @protected
	 */
	ItemBase.prototype.onPress = function (oEvent) {
	};

	/**
	 * Event handler for a back event.
	 *
	 * @param {jQuery.Event} oEvent The event
	 *
	 * @protected
	 */
	ItemBase.prototype.onBack = function (oEvent) {
	};

	/**
	 * Event handler for a confirm event.
	 *
	 * @param {jQuery.Event} oEvent The event
	 *
	 * @protected
	 */
	ItemBase.prototype.onConfirm = function (oEvent) {
	};

	/**
	 * Event handler for a cancel event.
	 *
	 * @param {jQuery.Event} oEvent The event
	 *
	 * @protected
	 */
	ItemBase.prototype.onCancel = function (oEvent) {
	};

	/**
	 * Event handler for a reset event.
	 *
	 * @param {jQuery.Event} oEvent The event
	 *
	 * @protected
	 */
	ItemBase.prototype.onReset = function (oEvent) {
	};

	/**
	 * Retrieves the button settings.
	 *
	 * @returns {object} The button settings
	 *
	 * @protected
	 */
	ItemBase.prototype.getButtonSettings = function () {
		return this._oButtonSettings;
	};

	/**
	 * Changes the button settings of an item.
	 *
	 * @param {object} oButtonSettings Object containing button settings
	 *
	 * @protected
	 */
	ItemBase.prototype.changeButtonSettings = function (oButtonSettings) {
		Object.keys(oButtonSettings).forEach(function (sButtonKey) {
			if (this._oButtonSettings.hasOwnProperty(sButtonKey)) {
				Object.keys(oButtonSettings[sButtonKey]).forEach(function (sSettingKey) {
					this._oButtonSettings[sButtonKey][sSettingKey] = oButtonSettings[sButtonKey][sSettingKey];
				}, this);
			}
		}, this);
		this.getMenu() && this.getMenu()._updateButtonState(this);
	};

	ItemBase.prototype.setVisible = function (bVisible) {
		if (this.getVisible() == bVisible) {
			return this;
		}

		this.setProperty("visible", bVisible);
		this.getMenu() && this.getMenu()._setItemVisibility(this, bVisible);
		return this;
	};

    return ItemBase;
});