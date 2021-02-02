/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/p13n/Engine", "../../QUnitUtils",   "sap/ui/mdc/Chart", "sap/m/Button", "sap/ui/mdc/chart/DimensionItem", "sap/ui/mdc/chart/MeasureItem"
], function (Engine, MDCQUnitUtils,  Chart, Button,Dimension, Measure) {
	"use strict";
	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

	QUnit.module("Controller API tests showUI Chart", {
		setLiveMode: function(sController, bLiveMode) {
            Engine.getInstance().getController(this.oChart, sController).getLiveMode = function() {
                return bLiveMode;
            };
        },
		beforeEach: function () {
			//mock delegate data
			var aPropertyInfos = [
				{
					"name": "item1",
					"label": "Item 1"
				}, {
					"name": "item2",
					"label": "Item 2"
				}
			];

			this.bModuleRunning = true;
			return this.createTestObjects(aPropertyInfos);
		},
		afterEach: function () {
			this.bModuleRunning = false;
			this.oChart.destroy();

			if (this.oController) {
				this.oController.destroy();
			}
		},
		createTestObjects: function(aPropertyInfos) {
			this.oChart = new Chart("TestChart", {
				p13nMode: ['Item', 'Sort'],
				items: [
					new Dimension("item1",{
						header:"item1",
						key:"item1"
					}),
					new Measure("item2",{
						header:"item2",
						key:"item2"
					})
				]
			});

			this.bModuleRunning = true;

			MDCQUnitUtils.stubPropertyInfos(this.oChart, aPropertyInfos);
		},
		destroyTestObjects: function() {
			this.oChart.destroy();
			MDCQUnitUtils.restorePropertyInfos(this.oChart);
		}
	});

	QUnit.test("Check 'Engine' subcontroller registration", function(assert) {
        assert.ok(Engine.getInstance().getController(this.oChart, "Item"), "ChartItemController has been registered");
        assert.ok(Engine.getInstance().getController(this.oChart, "Sort"), "SortController has been registered");
	});

	QUnit.test("use ChartItemPanel", function (assert) {
		var done = assert.async();
		this.setLiveMode("Item", true);
		Engine.getInstance().showUI(this.oChart, "Item", new Button()).then(function(oP13nControl){

			//check container
			assert.ok(oP13nControl, "Container has been created");
			assert.ok(oP13nControl.isA("sap.m.ResponsivePopover"));
			assert.equal(oP13nControl.getTitle(), oResourceBundle.getText("chart.PERSONALIZATION_DIALOG_TITLE"), "Correct title has been set");
			assert.ok(Engine.getInstance()._hasActiveP13n(this.oChart),"dialog is open");

			//check inner panel
			var oInnerTable = oP13nControl.getContent()[0]._oListControl;
			assert.ok(oP13nControl.getContent()[0].isA("sap.ui.mdc.p13n.panels.ChartItemPanel"), "Correct panel created");
			assert.ok(oInnerTable, "Inner Table has been created");
			var oPropertyHelper = Engine.getInstance()._getRegistryEntry(this.oChart).helper;
			assert.equal(oInnerTable.getItems().length, oPropertyHelper.getProperties().length, "correct amount of items has been set");
			assert.equal(oInnerTable.getItems()[0].getCells()[2].getSelectedKey(), "category", "Correct role selected");
			done();
		}.bind(this));
	});

	QUnit.test("use 'createChanges' to create changes for a different role", function(assert){
		var done = assert.async();

		var aP13nData = [
			{name:"item1", role: "series"}
		];

		Engine.getInstance().createChanges({
			control: this.oChart,
			state: aP13nData,
			key: "Item",
			suppressAppliance: true
		}).then(function(aChanges){
			assert.ok(aChanges, "changes created");
			assert.equal(aChanges.length, 2, "two change created");
			assert.equal(aChanges[0].changeSpecificData.changeType, "removeItem", "one 'removeItem' change created");
			assert.equal(aChanges[1].changeSpecificData.changeType, "addItem", "one 'addItem' change created");
			assert.equal(aChanges[1].changeSpecificData.content.role, "series", "Role has been changed in 'addItem' change");
			done();
		});
	});

	QUnit.test("use ChartItemPanel - getCurrentState returns different 'role'", function (assert) {
		var done = assert.async();

		this.oChart.getItems()[0].setRole("series");

		Engine.getInstance().showUI(this.oChart, "Item").then(function(oP13nControl){

			var oInnerTable = oP13nControl.getContent()[0]._oListControl;
			assert.equal(oInnerTable.getItems()[0].getCells()[2].getSelectedKey(), "series", "Correct role selected");

			done();
		});
	});

	QUnit.test("check sorting in Chart", function (assert) {
		var done = assert.async();
		var oBtn = new Button();
		this.setLiveMode("Sort", true);

		this.oChart.setSortConditions({
			sorters: [
				{name: "item1", descending: true}
			]
		});

		Engine.getInstance().showUI(this.oChart, "Sort", oBtn).then(function(oP13nControl){

			//check container
			assert.ok(oP13nControl, "Container has been created");
			assert.ok(oP13nControl.isA("sap.m.ResponsivePopover"));
			assert.equal(oP13nControl.getTitle(), "Sort", "Correct title has been set");

			//check inner panel
			var oInnerTable = oP13nControl.getContent()[0]._oListControl;
			assert.ok(oP13nControl.getContent()[0].isA("sap.ui.mdc.p13n.panels.SortPanel"), "Correct panel created");
			assert.ok(oInnerTable, "Inner Table has been created");
			assert.equal(oInnerTable.getItems()[0].getSelected(), true, "Correct sorter in the dialog");
			assert.equal(oInnerTable.getItems()[1].getSelected(), false, "Correct sorter in the dialog");
			assert.equal(oInnerTable.getItems()[0].getCells()[1].getSelectedItem().getText(), "Descending", "Correct sorter in the dialog");
			done();
		});
	});

});