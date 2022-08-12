/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/table/columnmenu/QuickActionBase",
	"sap/m/ToggleButton",
	"sap/m/library"
], function (
	QuickActionBase,
	ToggleButton,
	library
) {
	"use strict";

	/**
	 * Constructor for a new QuickGroup.
	 *
	 * @param {string} [sId] ID for the new QuickGroup, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new QuickGroup
	 *
	 * @class
	 * Quick action - group
	 *
	 * @extends sap.m.table.columnmenu.QuickActionBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 *
	 * @alias sap.m.table.columnmenu.QuickGroup
	 */
	var QuickGroup = QuickActionBase.extend("sap.m.table.columnmenu.QuickGroup", {
		metadata: {
			library: "sap.m",
			aggregations: {
				/**
				 * The groupable properties and the initial state.
				 */
				items: { type: "sap.m.table.columnmenu.QuickGroupItem", multiple: true }
			},
			events: {
				/**
				 * Fires the change event.
				 */
				change: {
					parameters: {
						/**
						 * The key of the property to be grouped.
						 */
						key: { type: "string" },
						/**
						 * The new grouped state.
						 */
						grouped: { type: "boolean" }
					}
				}
			}
		}
	});

	QuickGroup.prototype.exit = function() {
		this.destroyContent();
	};

	QuickGroup.prototype.getLabel = function() {
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		return oBundle.getText("table.COLUMNMENU_QUICK_GROUP");
	};

	QuickGroup.prototype.getContent = function() {
		if (!this._aContent) {
			this._aContent = this.createContent(this.getItems());
			this._aContent.forEach(function(oItem) {
				this.addDependent(oItem);
			}.bind(this));
		}

		return this._aContent;
	};

	QuickGroup.prototype.addItem = function(oItem) {
		this.destroyContent();
		return this.addAggregation("items", oItem);
	};

	QuickGroup.prototype.insertItem = function(oItem, iIndex) {
		this.destroyContent();
		return this.insertAggregation("items", oItem, iIndex);
	};

	QuickGroup.prototype.removeItem = function(oItem) {
		this.destroyContent();
		return this.removeAggregation("items", oItem);
	};

	QuickGroup.prototype.removeAllItems = function() {
		this.destroyContent();
		return this.removeAllAggregation("items");
	};

	QuickGroup.prototype.destroyItems = function() {
		this.destroyContent();
		return this.destroyAggregation("items");
	};

	QuickGroup.prototype.createContent = function(aItems) {
		return aItems.map(function(oItem) {
			return new ToggleButton({
				text: oItem.getLabel(),
				pressed: oItem.getGrouped(),
				press: [oItem, this.onChange, this]
			});
		}, this);
	};

	QuickGroup.prototype.destroyContent = function() {
		if (this._aContent) {
			this._aContent.forEach(function (oContent) {
				oContent.destroy();
			});
			delete this._aContent;
		}
	};

	QuickGroup.prototype._updateContent = function() {
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
			oButton.setPressed(oItem.getGrouped());
		}

		for (var i = aItems.length; i < aContent.length; i++) {
			aContent[i].destroy();
		}
	};

	QuickGroup.prototype.onChange = function(oEvent, oItem) {
		oItem.setProperty("grouped", oEvent.getParameters().pressed, true);
		this.fireChange({item: oItem});
		this.getMenu().close();
	};

	QuickGroup.prototype.getCategory = function() {
		return library.table.columnmenu.Category.Group;
	};

	return QuickGroup;
});