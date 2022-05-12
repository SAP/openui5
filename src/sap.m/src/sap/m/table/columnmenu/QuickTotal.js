/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/table/columnmenu/QuickActionBase",
	"sap/m/HBox",
	"sap/m/ToggleButton"
], function (
	QuickActionBase,
	HBox,
	ToggleButton
) {
	"use strict";

	/**
	 * Constructor for a new QuickTotal.
	 *
	 * @param {string} [sId] ID for the new QuickTotal, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new QuickTotal
	 *
	 * @class
	 * Quick action - total
	 *
	 * @extends sap.m.table.columnmenu.QuickActionBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 *
	 * @alias sap.m.table.columnmenu.QuickTotal
	 */
	var QuickTotal = QuickActionBase.extend("sap.m.table.columnmenu.QuickTotal", {
		metadata: {
			library: "sap.m",
			aggregations: {
				/**
				 * Defines the totalable properties and the initial state.
				 */
				items: { type: "sap.m.table.columnmenu.QuickTotalItem", multiple: true }
			},
			events: {
				/**
				 * Fires the change event.
				 */
				change: {
					parameters: {
						/**
						 * The key of the property.
						 */
						key: { type: "string" },
						/**
						 * The new value.
						 */
						totaled: { type: "boolean" }
					}
				}
			}
		}
	});

	QuickTotal.prototype.exit = function() {
		this.destroyContent();
	};

	QuickTotal.prototype.getLabel = function() {
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		return oBundle.getText("table.COLUMNMENU_QUICK_TOTAL");
	};

	QuickTotal.prototype.getContent = function() {
		if (!this._aContent) {
			this._aContent = this.createContent(this.getItems());
			this._aContent.forEach(function(oItem) {
				this.addDependent(oItem);
			}.bind(this));
		}

		return this._aContent;
	};

	QuickTotal.prototype.addItem = function(oItem) {
		this.destroyContent();
		return this.addAggregation("items", oItem);
	};

	QuickTotal.prototype.insertItem = function(oItem, iIndex) {
		this.destroyContent();
		return this.insertAggregation("items", oItem, iIndex);
	};

	QuickTotal.prototype.removeItem = function(oItem) {
		this.destroyContent();
		return this.removeAggregation("items", oItem);
	};

	QuickTotal.prototype.removeAllItems = function() {
		this.destroyContent();
		return this.removeAllAggregation("items");
	};

	QuickTotal.prototype.destroyItems = function() {
		this.destroyContent();
		return this.destroyAggregation("items");
	};

	QuickTotal.prototype.createContent = function(aItems) {
		return aItems.map(function(oItem) {
			return new ToggleButton({
				text: oItem.getLabel(),
				pressed: oItem.getTotaled(),
				press: [oItem, this.onChange, this]
			});
		}, this);
	};

	QuickTotal.prototype.destroyContent = function() {
		if (this._aContent) {
			this._aContent.forEach(function (oContent) {
				oContent.destroy();
			});
			delete this._aContent;
		}
	};

	QuickTotal.prototype._updateContent = function() {
		var aItems = this.getItems();
		var aContent = this.getContent();
		var oItem, oButton;

		for (var i = 0; i < aItems.length; i++) {
			oItem = aItems[i];
			oButton = aContent[i];
			if (!oButton) {
				oButton = new ToggleButton({press: [oItem, this.onChange, this]});
			}
			oButton.setText(oItem.getLabel());
			oButton.setPressed(oItem.getTotaled());
		}

		for (var i = aItems.length; i < aContent.length; i++) {
			aContent[i].destroy();
		}
	};

	QuickTotal.prototype.onChange = function(oEvent, oItem) {
		oItem.setProperty("totaled", oEvent.getParameters().pressed, true);
		this.fireChange({item: oItem});
		this.getMenu().close();
	};

	return QuickTotal;
});