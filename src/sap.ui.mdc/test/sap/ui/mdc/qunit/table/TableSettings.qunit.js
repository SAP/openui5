/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/table/RowSettings",
	"sap/ui/mdc/table/RowActionItem",
	"sap/ui/mdc/enums/TableRowAction"
], function(Core, XMLView, JSONModel, RowSettings, RowActionItem, TableRowAction) {
	'use strict';

	function formatNavigated(sDescription) {
		return sDescription === "item 1";
	}

	function formatHighlight(sDescription) {
		if (sDescription === "item 1") {
			return "Warning";
		} else {
			return "Information";
		}
	}

	const oModel = new JSONModel({
		items: [
			{
				description: "item 1",
				type: "Navigation"
			},
			{
				description: "item 2",
				type: "Navigation"
			}
		],
		description: "item test",
		type: "Navigation"
	});

	function createView(sType, sSettings) {
		if (sSettings) {
			sSettings = "<rowSettings><mdcTable:RowSettings " + sSettings + "/></rowSettings>";
		} else {
			sSettings = "";
		}

		return XMLView.create({
			definition: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table"><Table'
						+ ' id="myTable" delegate="\{\'name\': \'test-resources/sap/ui/mdc/delegates/TableDelegate\', \'payload\': \{'
						+ ' \'collectionName\': \'items\' \} \}"><type><mdcTable:' + sType + '/></type>' + sSettings + '<columns><mdcTable:Column'
						+ ' id="myTable--column0" header="column 0" propertyKey="column0"><m:Text text="{description}" id="myTable--text0"'
						+ ' /></mdcTable:Column></columns></Table></mvc:View>'
		}).then(function(oView) {
			oView.setModel(oModel);
			oView.placeAt("qunit-fixture");
			Core.applyChanges();
			return oView;
		});
	}

	QUnit.module("RowSettings unit tests", {
		afterEach: function() {
			if (this.oView) {
				this.oTable = null;
				this.oView.destroy();
				this.oView = null;
			}
		}
	});

	QUnit.test("GridTable without settings in XML", function(assert) {
		const that = this;

		return createView("GridTableType").then(function(oView) {
			that.oView = oView;
			that.oTable = that.oView.byId('myTable');

			return that.oTable.initialized();
		}).then(function() {
			return new Promise(function(resolve) {
				that.oTable._oTable.attachEventOnce("rowsUpdated", function() {
					// Check default values for settings
					assert.equal(that.oTable._oTable.getBinding("rows").getLength(), 2, "The table contains 2 rows");
					assert.equal(that.oTable.getRowSettings(), null, "No row settings defined");

					assert.equal(that.oTable._oTable.getRows()[0].getAggregation("_settings"), null, "No inner row settings defined");

					// Set fixed bound values for settings
					let oTableRowSettings = new RowSettings();
					oTableRowSettings.setNavigated(true);
					oTableRowSettings.setHighlight("Error");
					that.oTable.setRowSettings(oTableRowSettings);
					Core.applyChanges();

					let oSettings = that.oTable._oTable.getRows()[0].getAggregation("_settings");
					assert.equal(oSettings.getNavigated(), true, "Fixed value for navigated");
					assert.equal(oSettings.getHighlight(), "Error", "Fixed value for highlight");

					// Set calculated values for settings
					oTableRowSettings = new RowSettings();
					oTableRowSettings.bindProperty("navigated", {path: 'description', type : 'sap.ui.model.type.Boolean', formatter: formatNavigated});
					oTableRowSettings.bindProperty("highlight", {path: 'description', formatter: formatHighlight});
					that.oTable.setRowSettings(oTableRowSettings);
					Core.applyChanges();

					oSettings = that.oTable._oTable.getRows()[0].getAggregation("_settings");
					assert.equal(oSettings.getNavigated(), true, "Calculated value for navigated 1");
					assert.equal(oSettings.getHighlight(), "Warning", "Calculated value for highlight 1");

					oSettings = that.oTable._oTable.getRows()[1].getAggregation("_settings");
					assert.equal(oSettings.getNavigated(), false, "Calculated value for navigated 2");
					assert.equal(oSettings.getHighlight(), "Information", "Calculated value for highlight 2");

					resolve();
				});
			});
		});
	});

	QUnit.test("GridTable with settings in XML", function(assert) {
		const that = this;

		return createView("GridTableType", "navigated='true' highlight='Warning'").then(function(oView) {
			that.oView = oView;
			that.oTable = that.oView.byId('myTable');

			return that.oTable.initialized();
		}).then(function() {
			return new Promise(function(resolve) {
				that.oTable._oTable.attachEventOnce("rowsUpdated", function() {
					// Check default values for settings
					assert.equal(that.oTable._oTable.getBinding("rows").getLength(), 2, "The table contains 2 rows");
					assert.ok(that.oTable.getRowSettings() != null, "Row settings defined");

					let oSettings = that.oTable._oTable.getRows()[0].getAggregation("_settings");
					assert.equal(oSettings.getNavigated(), true, "Navigated is true from XML view");
					assert.equal(oSettings.getHighlight(), "Warning", "Highlight is Warning from XML view");
					assert.equal(oSettings.getHighlightText(), "", "No highlight text by default");

					// Set calculated values for settings
					const oTableRowSettings = new RowSettings();
					oTableRowSettings.bindProperty("navigated", {path: 'description', type : 'sap.ui.model.type.Boolean', formatter: formatNavigated});
					oTableRowSettings.bindProperty("highlight", {path: 'description', formatter: formatHighlight});
					that.oTable.setRowSettings(oTableRowSettings);
					Core.applyChanges();

					oSettings = that.oTable._oTable.getRows()[0].getAggregation("_settings");
					assert.equal(oSettings.getNavigated(), true, "Calculated value for navigated 1");
					assert.equal(oSettings.getHighlight(), "Warning", "Calculated value for highlight 1");

					oSettings = that.oTable._oTable.getRows()[1].getAggregation("_settings");
					assert.equal(oSettings.getNavigated(), false, "Calculated value for navigated 2");
					assert.equal(oSettings.getHighlight(), "Information", "Calculated value for highlight 2");

					resolve();
				});
			});
		});
	});

	QUnit.test("GridTable with row actions in settings", function(assert) {
		let iCalled = 0;
		const that = this;
		const oTest = {
			getBindingContext: function () {}
		};

		function testOnFirePress(oEvent) {
			iCalled++;
		}

		sinon.stub(oTest, "getBindingContext").returns(1);

		return createView("GridTableType").then(function(oView) {
			that.oView = oView;
			that.oTable = that.oView.byId("myTable");

			return that.oTable.initialized();
		}).then(function() {
			// One RowActionItem
			let oRowSettings = new RowSettings({
				rowActions: [new RowActionItem({type: "Navigation"})]
			});
			oRowSettings.getRowActions()[0].attachEvent("press", testOnFirePress, this);
			that.oTable.setRowSettings(oRowSettings);
			Core.applyChanges();

			assert.equal(that.oTable.getRowSettings().getRowActions().length, 1, "The row settings contain 1 row action");
			let oRowActionItems = that.oTable._oTable.getRowActionTemplate().getItems();
			assert.equal(oRowActionItems.length, 1, "The table has row action template with one row action item");
			assert.equal(oRowActionItems[0].getType(), TableRowAction.Navigation, "Row action item is of type navigation");
			oRowActionItems[0].firePress({item: oRowActionItems[0], row: oTest});
			assert.equal(iCalled, 1, "Event was fired once");
			iCalled = 0;

			// No RowActions
			oRowSettings = new RowSettings();
			that.oTable.setRowSettings(oRowSettings);
			Core.applyChanges();

			assert.equal(that.oTable.getRowSettings().getRowActions().length, 0, "The row settings contain no row actions");
			assert.notOk(that.oTable._oTable.getRowActionTemplate(), "The table has no row action template");

			// Two RowActionItems with both pressed
			oRowSettings = new RowSettings({
				rowActions: [
					new RowActionItem({text: "Test1", type: "Navigation"}),
					new RowActionItem({text: "Test2", type: "Navigation"})
				]
			});
			oRowSettings.getRowActions()[0].attachEvent("press", testOnFirePress, this);
			oRowSettings.getRowActions()[1].attachEvent("press", testOnFirePress, this);
			that.oTable.setRowSettings(oRowSettings);
			Core.applyChanges();

			assert.equal(that.oTable.getRowSettings().getRowActions().length, 2, "The row settings contain 2 row action");
			oRowActionItems = that.oTable._oTable.getRowActionTemplate().getItems();
			assert.equal(oRowActionItems.length, 2, "The table has row action template with two row action items");
			assert.equal(oRowActionItems[0].getType(), TableRowAction.Navigation, "Row action item is of type navigation");
			assert.equal(oRowActionItems[0].getText(), "Test1", "Row action item has text 'Test1'");
			assert.equal(oRowActionItems[1].getType(), TableRowAction.Navigation, "Row action item is of type navigation");
			assert.equal(oRowActionItems[1].getText(), "Test2", "Row action item has text 'Test2'");
			oRowActionItems[0].firePress({item: oRowActionItems[0], row: oTest});
			oRowActionItems[1].firePress({item: oRowActionItems[1], row: oTest});
			assert.equal(iCalled, 2, "Event was fired twice");
			iCalled = 0;

			// Two RowActionItems with only one pressed
			oRowSettings.getRowActions()[0].detachEvent("press", testOnFirePress, this);
			that.oTable.setRowSettings(oRowSettings);
			Core.applyChanges();

			oRowActionItems = that.oTable._oTable.getRowActionTemplate().getItems();
			oRowActionItems[0].firePress({item: oRowActionItems[0], row: oTest});
			oRowActionItems[1].firePress({item: oRowActionItems[1], row: oTest});
			assert.equal(iCalled, 1, "Event was only fired once");
			iCalled = 0;

			// Bound properties
			oRowSettings = new RowSettings({
				rowActions: [new RowActionItem({text: "{/description}", type: "{/type}"})]
			});
			oRowSettings.getRowActions()[0].attachEvent("press", testOnFirePress, this);
			that.oTable.setRowSettings(oRowSettings);
			Core.applyChanges();

			oRowActionItems = that.oTable._oTable.getRowActionTemplate().getItems();
			that.oTable._oTable.getRowActionTemplate().setModel(oModel);
			assert.equal(oRowActionItems[0].getType(), TableRowAction.Navigation, "Row action item is of type navigation");
			assert.equal(oRowActionItems[0].getText(), "item test", "Row action item has text 'item test'");
			oRowActionItems[0].firePress({item: oRowActionItems[0], row: oTest});
			assert.equal(iCalled, 1, "Event was fired once");
			iCalled = 0;

			// Bound RowActionItems
			const oRowActionTemplate = new RowActionItem({
				type: "{path: 'type'}",
				text: "{path: 'description'}"
			});
			oRowActionTemplate.attachEvent("press", testOnFirePress);
			oRowActionTemplate.bindProperty("visible", {
				path: "description",
				type: "sap.ui.model.type.Boolean",
				formatter: formatNavigated
			});
			oRowSettings = new RowSettings();
			oRowSettings.bindAggregation("rowActions", {
				path: "/items",
				template: oRowActionTemplate,
				templateShareable: false
			});
			that.oTable.setRowSettings(oRowSettings);
			Core.applyChanges();

			return new Promise(function(resolve) {
				that.oTable._oTable.attachEventOnce("rowsUpdated", function() {
					oRowActionItems = that.oTable._oTable.getRows()[0].getAggregation("_rowAction").getItems();
					assert.equal(oRowActionItems.length, 2, "The table has row action template with one row action item");
					assert.equal(oRowActionItems[0].getType(), TableRowAction.Navigation, "Row action item is of type navigation");
					assert.equal(oRowActionItems[0].getText(), "item 1", "Row action item has text 'item 1'");
					assert.equal(oRowActionItems[1].getType(), TableRowAction.Navigation, "Row action item is of type navigation");
					assert.equal(oRowActionItems[1].getText(), "item 2", "Row action item has text 'item 2'");

					oRowActionItems[0].firePress({item: oRowActionItems[0], row: oTest});
					oRowActionItems[1].firePress({item: oRowActionItems[1], row: oTest});
					assert.equal(iCalled, 2, "Event was fired twice");
					iCalled = 0;

					resolve();
				});
			});
		});
	});

	QUnit.test("ResponsiveTable without settings", function(assert) {
		const that = this;

		return createView("ResponsiveTableType").then(function(oView) {
			that.oView = oView;
			that.oTable = that.oView.byId('myTable');

			return that.oTable.initialized();
		}).then(function() {
			// Check default values for settings
			assert.equal(that.oTable._oTable.getItems().length, 2, "The table contains 2 rows");
			assert.equal(that.oTable.getRowSettings(), null, "No row settings defined");

			let oItem = that.oTable._oTable.getItems()[0];
			assert.equal(oItem.getNavigated(), false, "Navigated is false by default");
			assert.equal(oItem.getHighlight(), "None", "No highlight by default");
			assert.equal(oItem.getHighlightText(), "", "No highlight text by default");

			// Set fixed bound values for settings
			let oTableRowSettings = new RowSettings();
			oTableRowSettings.setNavigated(true);
			oTableRowSettings.setHighlight("Error");
			that.oTable.setRowSettings(oTableRowSettings);
			Core.applyChanges();

			oItem = that.oTable._oTable.getItems()[0];
			assert.equal(oItem.getNavigated(), true, "Fixed value for navigated");
			assert.equal(oItem.getHighlight(), "Error", "Fixed value for highlight");

			// Set calculated values for settings
			oTableRowSettings = new RowSettings();
			oTableRowSettings.bindProperty("navigated", {path: 'description', type : 'sap.ui.model.type.Boolean', formatter: formatNavigated});
			oTableRowSettings.bindProperty("highlight", {path: 'description', formatter: formatHighlight});
			that.oTable.setRowSettings(oTableRowSettings);
			Core.applyChanges();

			oItem = that.oTable._oTable.getItems()[0];
			assert.equal(oItem.getNavigated(), true, "Calculated value for navigated 1");
			assert.equal(oItem.getHighlight(), "Warning", "Calculated value for highlight 1");

			oItem = that.oTable._oTable.getItems()[1];
			assert.equal(oItem.getNavigated(), false, "Calculated value for navigated 2");
			assert.equal(oItem.getHighlight(), "Information", "Calculated value for highlight 2");
		});
	});

	QUnit.test("ResponsiveTable with settings in XML", function(assert) {
		const that = this;

		return createView("ResponsiveTableType", "navigated='true' highlight='Warning'").then(function(oView) {
			that.oView = oView;
			that.oTable = that.oView.byId('myTable');

			return that.oTable.initialized();
		}).then(function() {
			// Check default values for settings
			assert.equal(that.oTable._oTable.getItems().length, 2, "The table contains 2 rows");
			assert.ok(that.oTable.getRowSettings() != null, "Row settings defined");

			let oItem = that.oTable._oTable.getItems()[0];
			assert.equal(oItem.getNavigated(), true, "Navigated is true from XML view");
			assert.equal(oItem.getHighlight(), "Warning", "Highlight is Warning from XML view");
			assert.equal(oItem.getHighlightText(), "", "No highlight text by default");

			 // Set calculated values for settings
			const oTableRowSettings = new RowSettings();
			oTableRowSettings.bindProperty("navigated", {path: 'description', type : 'sap.ui.model.type.Boolean', formatter: formatNavigated});
			oTableRowSettings.bindProperty("highlight", {path: 'description', formatter: formatHighlight});
			that.oTable.setRowSettings(oTableRowSettings);
			Core.applyChanges();

			oItem = that.oTable._oTable.getItems()[0];
			assert.equal(oItem.getNavigated(), true, "Calculated value for navigated 1");
			assert.equal(oItem.getHighlight(), "Warning", "Calculated value for highlight 1");

			oItem = that.oTable._oTable.getItems()[1];
			assert.equal(oItem.getNavigated(), false, "Calculated value for navigated 2");
			assert.equal(oItem.getHighlight(), "Information", "Calculated value for highlight 2");
		});
	});

	QUnit.test("ResponsiveTable with row actions in settings", function(assert) {
		let iCalled = 0;
		const that = this;
		let oFireRowPressSpy;

		function testOnFirePress(oEvent) {
			iCalled++;
		}

		return createView("ResponsiveTableType").then(function(oView) {
			that.oView = oView;
			that.oTable = that.oView.byId("myTable");
			oFireRowPressSpy = sinon.spy(that.oTable, "fireRowPress");

			return that.oTable.initialized();
		}).then(function() {
			let oRowSettings = new RowSettings({
				rowActions: [new RowActionItem({type: "Navigation"})]
			});
			let oItems;

			oRowSettings.getRowActions()[0].attachEvent("press", testOnFirePress);
			that.oTable.setRowSettings(oRowSettings);
			Core.applyChanges();

			assert.equal(that.oTable.getRowSettings().getRowActions().length, 1, "The row settings contain 1 row action");
			oItems = that.oTable._oTable.getItems();
			assert.equal(oItems[0].getType(), "Navigation", "The first table row is of type navigation");
			assert.equal(oItems[1].getType(), "Navigation", "The second table row is of type navigation");
			that.oTable._oTable.fireItemPress({listItem: oItems[0]});
			assert.equal(iCalled, 1, "Event was fired");
			iCalled = 0;

			oRowSettings = new RowSettings();
			that.oTable.setRowSettings(oRowSettings);
			Core.applyChanges();

			assert.equal(that.oTable.getRowSettings().getRowActions().length, 0, "The row settings contain none row action");
			oItems = that.oTable._oTable.getItems();
			assert.equal(oItems[0].getType(), "Inactive", "The first table row is of type navigation");
			assert.equal(oItems[1].getType(), "Inactive", "The second table row is of type navigation");

			// Bound RowActionItems
			const oRowActionTemplate = new RowActionItem({
				type: "{path: 'type'}",
				text: "{path: 'description'}"
			});
			oRowActionTemplate.bindProperty("visible", {
				path: "description",
				type: "sap.ui.model.type.Boolean",
				formatter: formatNavigated
			});
			oRowActionTemplate.attachEvent("press", testOnFirePress);
			oRowSettings = new RowSettings();
			oRowSettings.bindAggregation("rowActions", {
				path: "/items",
				template: oRowActionTemplate,
				templateShareable: false
			});
			that.oTable.setRowSettings(oRowSettings);
			Core.applyChanges();

			oFireRowPressSpy.restore();
			oItems = that.oTable._oTable.getItems();

			assert.equal(oItems[0].getType(), "Navigation", "The first table row is of type navigation");
			assert.equal(oItems[1].getType(), "Inactive", "The second table row is inactive");

			that.oTable._oTable.fireItemPress({listItem: oItems[0]});
			assert.ok(oFireRowPressSpy.calledOnce, "Row was pressed");
			assert.equal(iCalled, 1, "RowActionItem<Navigation> was pressed only once");
			iCalled = 0;

			that.oTable._oTable.fireItemPress({listItem: oItems[1]});
			assert.ok(oFireRowPressSpy.calledOnce, "Inactive Row was not pressed");
			assert.equal(iCalled, 0, "RowActionItem<Navigation> was pressed not pressed");

			oFireRowPressSpy.restore();
		});
	});
});