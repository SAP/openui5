/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/m/table/columnmenu/Item"
], function(
	Core,
	ItemBase
) {
	"use strict";

	var Item = ItemBase.extend("sap.ui.mdc.table.menu.Item", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				key: {type: "string"}
			}
		}
	});

	Item.prototype.initializeContent = function() {
		var oTable = this.getTable();
		var oEngine = oTable.getEngine();
		var sKey = this.getKey();
		var oController = oEngine.getController(oTable, sKey);

		return oTable.getEngine().uimanager.create(oTable, [sKey]).then(function(oDialog) {
			var oContent = oDialog.removeContent(0);
			oDialog.destroy();

			this.setContent(oContent);
			this.setLabel(oController.getUISettings().title);

			oController.update(oTable.getPropertyHelper());
			oEngine.validateP13n(oTable, sKey, this.getContent());

			this.changeButtonSettings({
				reset: {visible: oController.getResetEnabled()}
			});
		}.bind(this));
	};

	Item.prototype.onPress = function() {
		var oTable = this.getTable();
		oTable.getEngine().getController(oTable, this.getKey()).update(oTable.getPropertyHelper());
	};

	Item.prototype.onConfirm = function() {
		var oTable = this.getTable();
		oTable.getEngine().handleP13n(oTable, [this.getKey()]);
	};

	Item.prototype.onReset = function() {
		var oTable = this.getTable();
		var oColumn = Core.byId(this.getMenu().getParent().sId.replace('-innerColumn', ''));

		oTable.getEngine().reset(oTable, [this.getKey()]).then(function() {
			oTable._oQuickActionContainer.initializeQuickActions(oColumn);
			oTable._oColumnHeaderMenu._oPopover.invalidate();
		});
	};

	Item.prototype.destroyContent = function() {
		// The AdaptationFilterBar must not be destroyed! A new one cannot be created.
		if (this.getKey() !== "Filter") {
			return this;
		}
		return this.destroyAggregation("content");
	};

	Item.prototype.getTable = function() {
		return this.getParent().getTable();
	};

	return Item;
});
