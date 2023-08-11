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

			aPanels.forEach((oPanel) => {
				oPanel.attachChange((oEvt) => {
					this.setResetButtonEnabled(true);
				});
			});

			oController.update(oTable.getPropertyHelper());
			oEngine.validateP13n(oTable, sKey, this.getContent());

			oEngine.hasChanges(oTable, sKey)
			.then((bDirty) => {
				this.setResetButtonEnabled(bDirty);
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

		this.setResetButtonEnabled(false);

		oTable.getEngine().reset(oTable, [sKey]).then(function() {
			oTable._oQuickActionContainer.updateQuickActions([sKey]);
		});
	};

	Item.prototype.destroyAggregation = function(sAggregationName) {
		if (this.getKey() === "Filter" && sAggregationName === "content") {
			return this;
		}
		return ItemBase.prototype.destroyAggregation.apply(this, arguments);
	};

	Item.prototype.getTable = function() {
		return this.getParent().getTable();
	};

	return Item;
});
