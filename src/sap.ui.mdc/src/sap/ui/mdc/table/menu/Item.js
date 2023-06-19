/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/Device",
	"sap/m/table/columnmenu/Item"
], function(
	Core,
	Device,
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
		var oColumn = Core.byId(this.getParent().getAssociation("column"));
		var oEngine = oTable.getEngine();
		var sKey = this.getKey();
		var oController = oEngine.getController(oTable, sKey);

		if (sKey === "Filter") {
			var aFilterableProperties = oTable.getPropertyHelper().getProperty(oColumn.getPropertyKey()).getFilterableProperties();
			var aPropertyNames = aFilterableProperties.map(function(oProperty) {
				return oProperty.name;
			});
			oTable.getInbuiltFilter().setVisibleFields(aPropertyNames);
		}

		return oTable.getEngine().uimanager.create(oTable, [sKey]).then(function(aPanels) {
			if (!Device.system.phone) {
				aPanels[0].setProperty("_useFixedWidth", true);
			}

			this.setContent(aPanels[0]);
			this.setLabel(oController.getUISettings().title);

			oController.update(oTable.getPropertyHelper());
			oEngine.validateP13n(oTable, sKey, this.getContent());

			this.changeButtonSettings({
				reset: {visible: true}
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
		var sKey = this.getKey();

		oTable.getEngine().reset(oTable, [sKey]).then(function() {
			oTable._oQuickActionContainer.updateQuickActions([sKey]);
		});
	};

	Item.prototype.destroyContent = function() {
		// The AdaptationFilterBar must not be destroyed! A new one cannot be created.
		if (this.getKey() === "Filter") {
			return this;
		}
		return this.destroyAggregation("content");
	};

	Item.prototype.getTable = function() {
		return this.getParent().getTable();
	};

	return Item;
});
