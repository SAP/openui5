/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/table/ColumnMenuEntry"
], function(
	ColumnMenuEntry
) {
	"use strict";

	/**
	 * Constructor for a new ItemBase.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The ItemBase control serves as a base class for menu items for the sap.m.table.ColumnMenu.
	 * This base class is faceless and should be inherited by controls, which intend to be menu items
	 * for the sap.m.table.ColumnMenu.
	 *
	 * @extends sap.m.table.ColumnMenuEntry
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 *
	 * @alias sap.m.table.ItemBase
	 */
	var ItemBase = ColumnMenuEntry.extend("sap.m.table.ItemBase", {
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
	 * This method can be used to retrieve the effective items of the item.
	 *
	 * This method allows subclasses to return composition of other items, if they contain multiple items or controls.
	 * @returns {Array<sap.m.table.ItemBase>} A composition of effective items
	 *
	 * @protected
	 */
	ItemBase.prototype.getEffectiveItems = function() {
		return [this];
	};

	/**
	 * This method can be used to retrieve the set icon for a item.
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
	 * This method can be used as an event handler for a press event.
	 *
	 * @param {jQuery.Event} oEvent The emitted event
	 *
	 * @protected
	 */
	ItemBase.prototype.onPress = function (oEvent) {
	};

	/**
	 * This method can be used as an event handler for a back event.
	 *
	 * @param {jQuery.Event} oEvent The emitted event
	 *
	 * @protected
	 */
	ItemBase.prototype.onBack = function (oEvent) {
	};

	/**
	 * This method can be used as an event handler for a confirm event.
	 *
	 * @param {jQuery.Event} oEvent The emitted event
	 *
	 * @protected
	 */
	ItemBase.prototype.onConfirm = function (oEvent) {
	};

	/**
	 * This method can be used as an event handler for a cancel event.
	 *
	 * @param {jQuery.Event} oEvent The emitted event
	 *
	 * @protected
	 */
	ItemBase.prototype.onCancel = function (oEvent) {
	};

	/**
	 * This method can be used as an event handler for a reset event.
	 *
	 * @param {jQuery.Event} oEvent The emitted event
	 *
	 * @protected
	 */
	ItemBase.prototype.onReset = function (oEvent) {
	};

	/**
	 * This method can be used to retrieve the button settings.
	 *
	 * @protected
	 */
	ItemBase.prototype.getButtonSettings = function () {
		return this._oButtonSettings;
	};

	/**
	 * This method can be used to change the button settings of an item.
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

    return ItemBase;
});