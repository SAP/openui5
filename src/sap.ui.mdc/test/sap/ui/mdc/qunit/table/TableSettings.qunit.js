/* global QUnit */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/table/RowSettings"
], function(Core, XMLView, JSONModel, RowSettings) {
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

	var oModel = new JSONModel({
		items: [
			{
				description: "item 1"
			},
			{
				description: "item 2"
			}
		]
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
						+ ' id="myTable--column0" header="column 0" dataProperty="column0"><m:Text text="{description}" id="myTable--text0"'
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
		var done = assert.async(),
			that = this;

		// Create GridTable without any settings
		createView("GridTableType").then(function(oView) {
			that.oView = oView;
			that.oTable = that.oView.byId('myTable');

			assert.ok(that.oTable);
			that.oTable.initialized().then(function() {
				that.oTable._oTable.attachEventOnce("rowsUpdated", function() {
					// Check default values for settings
					assert.equal(that.oTable._oTable.getBinding("rows").getLength(), 2, "The table contains 2 rows");
					assert.equal(that.oTable.getRowSettings(), null, "No row settings defined");

					var oSettings = that.oTable._oTable.getRows()[0].getAggregation("_settings");
					assert.equal(oSettings.getNavigated(), false, "Navigated is false by default");
					assert.equal(oSettings.getHighlight(), "None", "No highlight by default");
					assert.equal(oSettings.getHighlightText(), "", "No highlight text by default");

					// Set fixed bound values for settings
					var oTableRowSettings = new RowSettings();
					oTableRowSettings.setNavigated(true);
					oTableRowSettings.setHighlight("Error");
					that.oTable.setRowSettings(oTableRowSettings);
					Core.applyChanges();

					oSettings = that.oTable._oTable.getRows()[0].getAggregation("_settings");
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

					done();
				});
			});
		});
	});

	QUnit.test("GridTable with settings in XML", function(assert) {
		var done = assert.async(),
			that = this;

		// Create GridTable with settings
		createView("GridTableType", "navigated='true' highlight='Warning'").then(function(oView) {
			that.oView = oView;
			that.oTable = that.oView.byId('myTable');

			assert.ok(that.oTable);
			that.oTable.initialized().then(function() {
				that.oTable._oTable.attachEventOnce("rowsUpdated", function() {
					// Check default values for settings
					assert.equal(that.oTable._oTable.getBinding("rows").getLength(), 2, "The table contains 2 rows");
					assert.ok(that.oTable.getRowSettings() != null, "Row settings defined");

					var oSettings = that.oTable._oTable.getRows()[0].getAggregation("_settings");
					assert.equal(oSettings.getNavigated(), true, "Navigated is true from XML view");
					assert.equal(oSettings.getHighlight(), "Warning", "Highlight is Warning from XML view");
					assert.equal(oSettings.getHighlightText(), "", "No highlight text by default");

					// Set calculated values for settings
					var oTableRowSettings = new RowSettings();
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

					done();
				});
			});
		});
	});

	QUnit.test("ResponsiveTable without settings", function(assert) {
		var done = assert.async(),
			that = this;

		// Create GridTable without any settings
		createView("ResponsiveTableType").then(function(oView) {
			that.oView = oView;
			that.oTable = that.oView.byId('myTable');

			assert.ok(that.oTable);
			that.oTable.initialized().then(function() {
				setTimeout(function() {
					// Check default values for settings
					assert.equal(that.oTable._oTable.getItems().length, 2, "The table contains 2 rows");
					assert.equal(that.oTable.getRowSettings(), null, "No row settings defined");

					var oItem = that.oTable._oTable.getItems()[0];
					assert.equal(oItem.getNavigated(), false, "Navigated is false by default");
					assert.equal(oItem.getHighlight(), "None", "No highlight by default");
					assert.equal(oItem.getHighlightText(), "", "No highlight text by default");

					// Set fixed bound values for settings
					var oTableRowSettings = new RowSettings();
					oTableRowSettings.setNavigated(true);
					oTableRowSettings.setHighlight("Error");
					that.oTable.setRowSettings(oTableRowSettings);
					Core.applyChanges();

					that.oTable.awaitPropertyHelper().then(function() {
						oItem = that.oTable._oTable.getItems()[0];
						assert.equal(oItem.getNavigated(), true, "Fixed value for navigated");
						assert.equal(oItem.getHighlight(), "Error", "Fixed value for highlight");

						// Set calculated values for settings
						oTableRowSettings = new RowSettings();
						oTableRowSettings.bindProperty("navigated", {path: 'description', type : 'sap.ui.model.type.Boolean', formatter: formatNavigated});
						oTableRowSettings.bindProperty("highlight", {path: 'description', formatter: formatHighlight});
						that.oTable.setRowSettings(oTableRowSettings);
						Core.applyChanges();

						that.oTable.awaitPropertyHelper().then(function() {
							oItem = that.oTable._oTable.getItems()[0];
							assert.equal(oItem.getNavigated(), true, "Calculated value for navigated 1");
							assert.equal(oItem.getHighlight(), "Warning", "Calculated value for highlight 1");

							oItem = that.oTable._oTable.getItems()[1];
							assert.equal(oItem.getNavigated(), false, "Calculated value for navigated 2");
							assert.equal(oItem.getHighlight(), "Information", "Calculated value for highlight 2");

							done();
						});
					});
				}, 0);
			});
		});
	});

	QUnit.test("ResponsiveTable with settings in XML", function(assert) {
		var done = assert.async(),
			that = this;

		// Create GridTable with settings
		createView("ResponsiveTableType", "navigated='true' highlight='Warning'").then(function(oView) {
			that.oView = oView;
			that.oTable = that.oView.byId('myTable');

			assert.ok(that.oTable);
			that.oTable.initialized().then(function() {
				that.oTable.initialized().then(function() {
					that.oTable.awaitPropertyHelper().then(function() {
						// Check default values for settings
						assert.equal(that.oTable._oTable.getItems().length, 2, "The table contains 2 rows");
						assert.ok(that.oTable.getRowSettings() != null, "Row settings defined");

						var oItem = that.oTable._oTable.getItems()[0];
						assert.equal(oItem.getNavigated(), true, "Navigated is true from XML view");
						assert.equal(oItem.getHighlight(), "Warning", "Highlight is Warning from XML view");
						assert.equal(oItem.getHighlightText(), "", "No highlight text by default");

						 // Set calculated values for settings
						var oTableRowSettings = new RowSettings();
						oTableRowSettings.bindProperty("navigated", {path: 'description', type : 'sap.ui.model.type.Boolean', formatter: formatNavigated});
						oTableRowSettings.bindProperty("highlight", {path: 'description', formatter: formatHighlight});
						that.oTable.setRowSettings(oTableRowSettings);
						Core.applyChanges();

						 that.oTable.awaitPropertyHelper().then(function() {
							oItem = that.oTable._oTable.getItems()[0];
							assert.equal(oItem.getNavigated(), true, "Calculated value for navigated 1");
							assert.equal(oItem.getHighlight(), "Warning", "Calculated value for highlight 1");

							oItem = that.oTable._oTable.getItems()[1];
							assert.equal(oItem.getNavigated(), false, "Calculated value for navigated 2");
							assert.equal(oItem.getHighlight(), "Information", "Calculated value for highlight 2");

							done();
						 });
					});
				});
			});
		});
	});
});